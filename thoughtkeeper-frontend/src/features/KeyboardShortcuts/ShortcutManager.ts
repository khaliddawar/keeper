import type {
  KeyboardShortcut,
  ShortcutManager as IShortcutManager,
  ShortcutConfig,
  ShortcutRegistration,
  ShortcutContext,
  ShortcutCategory,
  ShortcutExecutionContext,
  ShortcutEvent,
  ShortcutConflict,
  ShortcutAnalytics,
  ValidationResult,
  KeyModifier,
  ShortcutSequence
} from './types';

/**
 * Keyboard Shortcut Manager
 * Central management for keyboard shortcuts, detection, and execution
 */
export class ShortcutManager implements IShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private registrations = new Map<string, ShortcutRegistration>();
  private config: ShortcutConfig;
  private enabled = true;
  private eventListeners = new Map<string, EventListener>();
  private analytics: ShortcutAnalytics;
  private activeSequences = new Map<string, ShortcutSequence>();
  private sequenceTimeout: NodeJS.Timeout | null = null;
  private currentSequence: string[] = [];

  constructor(config?: Partial<ShortcutConfig>) {
    this.config = this.createDefaultConfig(config);
    this.analytics = this.createDefaultAnalytics();
    this.initializeEventListeners();
    this.loadFromStorage();
  }

  /**
   * Register shortcuts
   */
  register(registration: ShortcutRegistration): string {
    const id = this.generateRegistrationId(registration.namespace);
    
    // Validate shortcuts
    const validationErrors: string[] = [];
    for (const shortcut of registration.shortcuts) {
      const validation = this.validateShortcut(shortcut);
      if (!validation.isValid) {
        validationErrors.push(`${shortcut.id}: ${validation.errors.join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Shortcut registration failed:\n${validationErrors.join('\n')}`);
    }

    // Check for conflicts
    const conflicts = this.detectConflicts(registration.shortcuts);
    if (conflicts.length > 0) {
      console.warn('Shortcut conflicts detected:', conflicts);
      this.emitEvent({
        type: 'shortcut-conflict',
        conflict: conflicts[0],
        timestamp: new Date()
      });
    }

    // Register shortcuts
    this.registrations.set(id, registration);
    
    for (const shortcut of registration.shortcuts) {
      this.shortcuts.set(shortcut.id, {
        ...shortcut,
        priority: shortcut.priority || registration.priority || 0
      });
    }

    this.saveToStorage();
    this.emitEvent({
      type: 'shortcut-registered',
      shortcuts: registration.shortcuts,
      namespace: registration.namespace,
      timestamp: new Date()
    });

    return id;
  }

  /**
   * Unregister shortcuts
   */
  unregister(id: string): void {
    const registration = this.registrations.get(id);
    if (!registration) return;

    // Remove shortcuts
    for (const shortcut of registration.shortcuts) {
      this.shortcuts.delete(shortcut.id);
    }

    // Cleanup
    if (registration.cleanup) {
      registration.cleanup();
    }

    this.registrations.delete(id);
    this.saveToStorage();
  }

  /**
   * Get shortcut by ID
   */
  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Get shortcuts by context
   */
  getShortcuts(context?: ShortcutContext): KeyboardShortcut[] {
    const allShortcuts = Array.from(this.shortcuts.values());
    
    if (!context) {
      return allShortcuts;
    }

    return allShortcuts.filter(shortcut => 
      shortcut.global || 
      !shortcut.context || 
      shortcut.context.includes(context) ||
      shortcut.context.includes('global')
    );
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: ShortcutCategory): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(
      shortcut => shortcut.category === category
    );
  }

  /**
   * Update shortcut
   */
  updateShortcut(id: string, updates: Partial<KeyboardShortcut>): void {
    const existing = this.shortcuts.get(id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    const validation = this.validateShortcut(updated);
    
    if (!validation.isValid) {
      throw new Error(`Invalid shortcut update: ${validation.errors.join(', ')}`);
    }

    this.shortcuts.set(id, updated);
    this.saveToStorage();
    
    this.emitEvent({
      type: 'shortcut-updated',
      shortcutId: id,
      oldShortcut: existing,
      newShortcut: updated,
      timestamp: new Date()
    });
  }

  /**
   * Reset shortcut to default
   */
  resetShortcut(id: string): void {
    // This would typically restore from a default shortcuts definition
    // For now, we'll just ensure the shortcut exists
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      // Reset to original values (this would come from defaults)
      this.updateShortcut(id, {
        enabled: true,
        key: shortcut.key, // Would restore original key
        modifiers: shortcut.modifiers // Would restore original modifiers
      });
    }
  }

  /**
   * Enable/disable shortcut
   */
  enableShortcut(id: string, enabled: boolean): void {
    this.updateShortcut(id, { enabled });
  }

  /**
   * Execute shortcut by ID
   */
  async executeShortcut(id: string, context: ShortcutExecutionContext): Promise<void> {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.enabled) return;

    // Check conditions
    if (!this.checkConditions(shortcut, context)) return;

    const startTime = performance.now();

    try {
      if (shortcut.action.handler) {
        await shortcut.action.handler(context.event, shortcut.action.payload);
      }

      // Update analytics
      this.analytics.usage[id] = (this.analytics.usage[id] || 0) + 1;
      const duration = performance.now() - startTime;
      this.analytics.averageResponseTime = 
        (this.analytics.averageResponseTime + duration) / 2;

      this.emitEvent({
        type: 'shortcut-executed',
        shortcut,
        context,
        timestamp: new Date(),
        duration
      });

    } catch (error) {
      console.error(`Error executing shortcut ${id}:`, error);
    }
  }

  /**
   * Handle keyboard event
   */
  async handleKeyboardEvent(event: KeyboardEvent): Promise<boolean> {
    if (!this.enabled) return false;

    // Skip if in input element (unless shortcut explicitly allows it)
    if (this.isInputElement(event.target) && !this.shouldAllowInInput(event)) {
      return false;
    }

    const key = this.normalizeKey(event.key);
    const modifiers = this.extractModifiers(event);
    
    // Handle sequences
    if (this.config.sequences.enabled) {
      const sequenceHandled = this.handleSequence(key, modifiers, event);
      if (sequenceHandled) return true;
    }

    // Find matching shortcuts
    const context = this.createExecutionContext(event);
    const matchingShortcuts = this.findMatchingShortcuts(key, modifiers, context);

    if (matchingShortcuts.length === 0) return false;

    // Sort by priority and execute the highest priority shortcut
    matchingShortcuts.sort((a, b) => b.priority - a.priority);
    const shortcut = matchingShortcuts[0];

    // Handle preventDefault and stopPropagation
    if (shortcut.preventDefault) {
      event.preventDefault();
    }
    if (shortcut.stopPropagation) {
      event.stopPropagation();
    }

    await this.executeShortcut(shortcut.id, context);
    return true;
  }

  /**
   * Get/set enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveToStorage();
  }

  /**
   * Get configuration
   */
  getConfig(): ShortcutConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ShortcutConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    const platform = this.detectPlatform();

    // Add modifiers
    for (const modifier of shortcut.modifiers) {
      switch (modifier) {
        case 'ctrl':
          parts.push(platform === 'mac' ? '⌃' : 'Ctrl');
          break;
        case 'cmd':
        case 'meta':
          parts.push(platform === 'mac' ? '⌘' : 'Win');
          break;
        case 'alt':
          parts.push(platform === 'mac' ? '⌥' : 'Alt');
          break;
        case 'shift':
          parts.push(platform === 'mac' ? '⇧' : 'Shift');
          break;
      }
    }

    // Add key
    parts.push(this.formatKey(shortcut.key));

    return parts.join(platform === 'mac' ? '' : '+');
  }

  /**
   * Parse shortcut string
   */
  parseShortcut(shortcutString: string): Partial<KeyboardShortcut> {
    const parts = shortcutString.toLowerCase().split(/[\+\s]+/);
    const modifiers: KeyModifier[] = [];
    let key = '';

    for (const part of parts) {
      switch (part) {
        case 'ctrl':
        case 'control':
          modifiers.push('ctrl');
          break;
        case 'cmd':
        case 'command':
        case 'meta':
          modifiers.push('cmd');
          break;
        case 'alt':
        case 'option':
          modifiers.push('alt');
          break;
        case 'shift':
          modifiers.push('shift');
          break;
        default:
          key = part;
      }
    }

    return { key, modifiers };
  }

  /**
   * Validate shortcut
   */
  validateShortcut(shortcut: KeyboardShortcut): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields
    if (!shortcut.id) errors.push('Shortcut ID is required');
    if (!shortcut.name) errors.push('Shortcut name is required');
    if (!shortcut.key) errors.push('Shortcut key is required');
    if (!shortcut.action) errors.push('Shortcut action is required');

    // Key validation
    if (shortcut.key && !this.isValidKey(shortcut.key)) {
      errors.push(`Invalid key: ${shortcut.key}`);
    }

    // Modifier validation
    if (shortcut.modifiers) {
      for (const modifier of shortcut.modifiers) {
        if (!this.isValidModifier(modifier)) {
          errors.push(`Invalid modifier: ${modifier}`);
        }
      }
    }

    // Conflict detection
    const conflicts = this.detectConflicts([shortcut]);
    if (conflicts.length > 0) {
      warnings.push('Shortcut conflicts with existing shortcuts');
      suggestions.push('Consider using different key combination');
    }

    // Accessibility suggestions
    if (shortcut.modifiers.length === 0) {
      suggestions.push('Consider adding modifiers for better accessibility');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Private helper methods
   */
  private createDefaultConfig(overrides?: Partial<ShortcutConfig>): ShortcutConfig {
    return {
      shortcuts: [],
      categories: [
        { category: 'navigation', name: 'Navigation', description: 'Moving around the app', enabled: true, order: 1 },
        { category: 'editing', name: 'Editing', description: 'Creating and editing content', enabled: true, order: 2 },
        { category: 'selection', name: 'Selection', description: 'Selecting items', enabled: true, order: 3 },
        { category: 'view', name: 'View', description: 'Changing views and layouts', enabled: true, order: 4 },
        { category: 'search', name: 'Search', description: 'Finding content', enabled: true, order: 5 },
        { category: 'tasks', name: 'Tasks', description: 'Task management', enabled: true, order: 6 },
        { category: 'notebooks', name: 'Notebooks', description: 'Notebook management', enabled: true, order: 7 },
        { category: 'global', name: 'Global', description: 'System-wide shortcuts', enabled: true, order: 8 }
      ],
      sequences: {
        enabled: true,
        timeout: 1000,
        indicator: true,
        resetOnInvalid: true
      },
      accessibility: {
        announceShortcuts: false,
        showTooltips: true,
        highlightElements: false,
        reduceMotion: false,
        focusOutlines: true
      },
      performance: {
        debounceDelay: 0,
        maxListeners: 100,
        enableLogging: false,
        cacheShortcuts: true
      },
      ...overrides
    };
  }

  private createDefaultAnalytics(): ShortcutAnalytics {
    return {
      usage: {},
      mostUsed: [],
      leastUsed: [],
      conflicts: [],
      userCustomizations: 0,
      averageResponseTime: 0
    };
  }

  private initializeEventListeners(): void {
    const keydownHandler = (event: KeyboardEvent) => {
      this.handleKeyboardEvent(event);
    };

    document.addEventListener('keydown', keydownHandler);
    this.eventListeners.set('keydown', keydownHandler);
  }

  private generateRegistrationId(namespace: string): string {
    return `${namespace}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectConflicts(shortcuts: KeyboardShortcut[]): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    const existingShortcuts = Array.from(this.shortcuts.values());

    for (const shortcut of shortcuts) {
      const conflictingShortcuts = existingShortcuts.filter(existing => 
        existing.id !== shortcut.id &&
        existing.key === shortcut.key &&
        this.arraysEqual(existing.modifiers, shortcut.modifiers) &&
        this.contextsOverlap(existing.context, shortcut.context)
      );

      if (conflictingShortcuts.length > 0) {
        conflicts.push({
          shortcut,
          conflictsWith: conflictingShortcuts,
          severity: 'medium',
          resolution: ['change-key', 'change-modifier', 'change-context']
        });
      }
    }

    return conflicts;
  }

  private checkConditions(shortcut: KeyboardShortcut, context: ShortcutExecutionContext): boolean {
    if (!shortcut.conditions) return true;

    return shortcut.conditions.every(condition => condition.check(context));
  }

  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.getAttribute('contenteditable') === 'true' ||
      target.getAttribute('role') === 'textbox'
    );
  }

  private shouldAllowInInput(event: KeyboardEvent): boolean {
    const key = this.normalizeKey(event.key);
    const modifiers = this.extractModifiers(event);
    const context = this.createExecutionContext(event);
    
    const matchingShortcuts = this.findMatchingShortcuts(key, modifiers, context);
    return matchingShortcuts.some(shortcut => shortcut.allowInInputs);
  }

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'Escape': 'Escape',
      'Enter': 'Enter',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight'
    };

    return keyMap[key] || key.toLowerCase();
  }

  private extractModifiers(event: KeyboardEvent): KeyModifier[] {
    const modifiers: KeyModifier[] = [];
    
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.metaKey) modifiers.push('cmd');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    
    return modifiers;
  }

  private createExecutionContext(event: KeyboardEvent): ShortcutExecutionContext {
    const element = event.target as Element;
    const route = window.location.pathname;
    
    return {
      event,
      element,
      route,
      selection: {
        tasks: [], // Would be populated from selection state
        notebooks: [],
        count: 0
      },
      activeModal: null, // Would be determined from modal state
      searchActive: false, // Would be determined from search state
      editMode: false // Would be determined from edit state
    };
  }

  private findMatchingShortcuts(
    key: string, 
    modifiers: KeyModifier[], 
    context: ShortcutExecutionContext
  ): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(shortcut => {
      if (!shortcut.enabled) return false;
      if (shortcut.key !== key) return false;
      if (!this.arraysEqual(shortcut.modifiers, modifiers)) return false;
      
      // Check context
      if (shortcut.context && shortcut.context.length > 0) {
        // This would implement context checking logic
        // For now, we'll assume global shortcuts always match
        return shortcut.global || shortcut.context.includes('global');
      }
      
      return true;
    });
  }

  private handleSequence(key: string, modifiers: KeyModifier[], event: KeyboardEvent): boolean {
    // Simple sequence handling - would be expanded for full implementation
    this.currentSequence.push(key);
    
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
    
    this.sequenceTimeout = setTimeout(() => {
      this.currentSequence = [];
    }, this.config.sequences.timeout);
    
    // Check for matching sequences (placeholder)
    return false;
  }

  private arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }

  private contextsOverlap(context1?: ShortcutContext[], context2?: ShortcutContext[]): boolean {
    if (!context1 || !context2) return true; // No context means global
    return context1.some(c => context2.includes(c));
  }

  private isValidKey(key: string): boolean {
    // Basic key validation
    return key.length > 0 && key.length <= 20;
  }

  private isValidModifier(modifier: string): boolean {
    const validModifiers = ['ctrl', 'cmd', 'alt', 'shift', 'meta'];
    return validModifiers.includes(modifier);
  }

  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      'Space': '␣',
      'Enter': '↵',
      'Tab': '⇥',
      'Escape': '⎋',
      'Backspace': '⌫',
      'Delete': '⌦',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    };

    return keyMap[key] || key.toUpperCase();
  }

  private detectPlatform(): 'mac' | 'windows' | 'linux' {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'mac';
    if (platform.includes('linux')) return 'linux';
    return 'windows';
  }

  private emitEvent(event: ShortcutEvent): void {
    if (this.config.performance.enableLogging) {
      console.log('Shortcut event:', event);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        config: this.config,
        enabled: this.enabled,
        analytics: this.analytics
      };
      localStorage.setItem('thoughtkeeper_shortcuts', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save shortcuts to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('thoughtkeeper_shortcuts');
      if (data) {
        const parsed = JSON.parse(data);
        this.config = { ...this.config, ...parsed.config };
        this.enabled = parsed.enabled !== undefined ? parsed.enabled : true;
        this.analytics = { ...this.analytics, ...parsed.analytics };
      }
    } catch (error) {
      console.error('Failed to load shortcuts from storage:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear timeouts
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }

    // Remove event listeners
    for (const [event, listener] of this.eventListeners) {
      document.removeEventListener(event, listener);
    }

    // Cleanup registrations
    for (const registration of this.registrations.values()) {
      if (registration.cleanup) {
        registration.cleanup();
      }
    }

    this.shortcuts.clear();
    this.registrations.clear();
    this.eventListeners.clear();
  }
}
