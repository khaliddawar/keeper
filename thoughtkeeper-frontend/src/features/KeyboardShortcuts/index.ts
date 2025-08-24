/**
 * Keyboard Shortcuts System
 * Comprehensive keyboard navigation and customizable shortcuts
 */

// Core Components
export { KeyboardShortcutsProvider, useKeyboardShortcuts, useShortcuts, useShortcut } from './KeyboardShortcutsProvider';
export { ShortcutManager } from './ShortcutManager';
export { DefaultShortcuts } from './defaultShortcuts';

// UI Components
export { ShortcutTooltip, ShortcutKeys } from './components/ShortcutTooltip';
export { ShortcutHelpModal } from './components/ShortcutHelpModal';
export { ShortcutRecorder } from './components/ShortcutRecorder';

// Types
export type {
  // Core types
  KeyboardShortcut,
  ShortcutAction,
  ShortcutContext,
  ShortcutCategory,
  KeyModifier,
  ActionType,
  
  // Configuration
  ShortcutConfig,
  ShortcutCategoryConfig,
  ShortcutSequenceConfig,
  AccessibilityConfig,
  PerformanceConfig,
  
  // Management
  ShortcutManager as IShortcutManager,
  ShortcutRegistration,
  ShortcutExecutionContext,
  ShortcutCondition,
  
  // Hooks
  UseKeyboardShortcuts,
  KeyboardShortcutsContext,
  
  // UI Components
  ShortcutTooltipProps,
  ShortcutHelpModalProps,
  ShortcutRecorderProps,
  ShortcutListProps,
  ShortcutCustomizationProps,
  
  // Advanced features
  ShortcutSequence,
  ShortcutConflict,
  ConflictResolution,
  ShortcutAnalytics,
  ShortcutHelp,
  
  // Platform support
  PlatformShortcuts,
  ShortcutPlatformConfig,
  
  // Import/Export
  ShortcutExportData,
  ShortcutImportOptions,
  
  // Validation
  ValidationResult,
  
  // Events
  ShortcutEvent,
  ShortcutExecutedEvent,
  ShortcutRegisteredEvent,
  ShortcutUpdatedEvent,
  ShortcutConflictEvent,
  
  // Built-in shortcuts
  DefaultShortcuts as IDefaultShortcuts,
  
  // Error types
  ShortcutError,
  ShortcutConflictError,
  ShortcutRegistrationError,
  
  // Utility types
  ShortcutHandler,
  ShortcutOptions,
  ShortcutKeyCombo,
  ShortcutTemplate,
  ShortcutPattern,
  ShortcutMacro
} from './types';

// Utility functions
import type { KeyModifier, KeyboardShortcut, ShortcutConfig, ValidationResult, ShortcutExportData } from './types';
export const KeyboardShortcutUtils = {
  /**
   * Format shortcut for display
   */
  formatShortcut: (key: string, modifiers: KeyModifier[]): string => {
    const platform = detectPlatform();
    const parts: string[] = [];

    // Add modifiers
    for (const modifier of modifiers) {
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
    parts.push(formatKey(key));

    return parts.join(platform === 'mac' ? '' : '+');
  },

  /**
   * Parse shortcut string into components
   */
  parseShortcut: (shortcutString: string): { key: string; modifiers: KeyModifier[] } => {
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
  },

  /**
   * Validate shortcut combination
   */
  validateShortcut: (key: string, modifiers: KeyModifier[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Key validation
    if (!key || key.length === 0) {
      errors.push('Key is required');
    }

    if (key && !isValidKey(key)) {
      errors.push(`Invalid key: ${key}`);
    }

    // Modifier validation
    for (const modifier of modifiers) {
      if (!isValidModifier(modifier)) {
        errors.push(`Invalid modifier: ${modifier}`);
      }
    }

    // Accessibility suggestions
    if (modifiers.length === 0 && key.length === 1) {
      suggestions.push('Consider adding modifiers to avoid conflicts with typing');
    }

    // Platform-specific warnings
    const platform = detectPlatform();
    if (platform === 'mac' && modifiers.includes('ctrl') && !modifiers.includes('cmd')) {
      warnings.push('On Mac, Cmd is typically used instead of Ctrl');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  /**
   * Check if shortcuts conflict
   */
  checkConflict: (shortcut1: KeyboardShortcut, shortcut2: KeyboardShortcut): boolean => {
    if (shortcut1.key !== shortcut2.key) return false;
    if (!arraysEqual(shortcut1.modifiers, shortcut2.modifiers)) return false;
    
    // Check context overlap
    if (!shortcut1.context || !shortcut2.context) return true; // Global shortcuts conflict
    return shortcut1.context.some(ctx => shortcut2.context?.includes(ctx));
  },

  /**
   * Get platform-specific shortcut
   */
  getPlatformShortcut: (baseShortcut: KeyboardShortcut, platform?: 'mac' | 'windows' | 'linux'): KeyboardShortcut => {
    const currentPlatform = platform || detectPlatform();
    const shortcut = { ...baseShortcut };

    // Convert Ctrl to Cmd on Mac
    if (currentPlatform === 'mac' && shortcut.modifiers.includes('ctrl')) {
      shortcut.modifiers = shortcut.modifiers.map(mod => mod === 'ctrl' ? 'cmd' : mod);
    }

    // Convert Cmd to Ctrl on Windows/Linux
    if (currentPlatform !== 'mac' && shortcut.modifiers.includes('cmd')) {
      shortcut.modifiers = shortcut.modifiers.map(mod => mod === 'cmd' ? 'ctrl' : mod);
    }

    return shortcut;
  },

  /**
   * Create shortcut template
   */
  createShortcutTemplate: (
    id: string,
    name: string,
    shortcuts: Partial<KeyboardShortcut>[]
  ): ShortcutTemplate => ({
    id,
    name,
    description: `${name} shortcuts`,
    shortcuts,
    category: 'global',
    platform: 'all'
  }),

  /**
   * Merge shortcut configurations
   */
  mergeConfigs: (base: ShortcutConfig, override: Partial<ShortcutConfig>): ShortcutConfig => {
    return {
      ...base,
      ...override,
      shortcuts: [...base.shortcuts, ...(override.shortcuts || [])],
      categories: [...base.categories, ...(override.categories || [])],
      sequences: { ...base.sequences, ...override.sequences },
      accessibility: { ...base.accessibility, ...override.accessibility },
      performance: { ...base.performance, ...override.performance }
    };
  },

  /**
   * Export shortcuts to JSON
   */
  exportToJSON: (shortcuts: KeyboardShortcut[], config: ShortcutConfig): string => {
    const exportData: ShortcutExportData = {
      version: '1.0.0',
      platform: detectPlatform(),
      shortcuts,
      config,
      customizations: {},
      exportedAt: new Date()
    };

    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Import shortcuts from JSON
   */
  importFromJSON: (jsonString: string): ShortcutExportData => {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation
      if (!data.version || !data.shortcuts || !Array.isArray(data.shortcuts)) {
        throw new Error('Invalid shortcut data format');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to import shortcuts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate shortcut documentation
   */
  generateDocumentation: (shortcuts: KeyboardShortcut[]): string => {
    const categories = groupShortcutsByCategory(shortcuts);
    let markdown = '# Keyboard Shortcuts\n\n';

    for (const [category, categoryShortcuts] of categories) {
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      markdown += '| Shortcut | Description |\n';
      markdown += '|----------|-------------|\n';

      for (const shortcut of categoryShortcuts) {
        const formatted = KeyboardShortcutUtils.formatShortcut(shortcut.key, shortcut.modifiers);
        markdown += `| \`${formatted}\` | ${shortcut.description} |\n`;
      }

      markdown += '\n';
    }

    return markdown;
  }
};

// Constants
export const SHORTCUT_CONTEXTS = [
  'global',
  'task-list', 
  'notebook-list',
  'task-detail',
  'notebook-detail',
  'search-results',
  'modal',
  'form',
  'editor'
] as const;

export const SHORTCUT_CATEGORIES = [
  'navigation',
  'editing',
  'selection', 
  'view',
  'search',
  'tasks',
  'notebooks',
  'global',
  'accessibility',
  'advanced'
] as const;

export const DEFAULT_SHORTCUT_CONFIG: ShortcutConfig = {
  shortcuts: [],
  categories: [
    { category: 'navigation', name: 'Navigation', description: 'Moving around the app', enabled: true, order: 1 },
    { category: 'editing', name: 'Editing', description: 'Creating and editing', enabled: true, order: 2 },
    { category: 'selection', name: 'Selection', description: 'Selecting items', enabled: true, order: 3 },
    { category: 'view', name: 'View', description: 'View controls', enabled: true, order: 4 },
    { category: 'search', name: 'Search', description: 'Finding content', enabled: true, order: 5 },
    { category: 'tasks', name: 'Tasks', description: 'Task management', enabled: true, order: 6 },
    { category: 'notebooks', name: 'Notebooks', description: 'Notebook management', enabled: true, order: 7 },
    { category: 'global', name: 'Global', description: 'System shortcuts', enabled: true, order: 8 }
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
  }
};

// Utility functions (private)
function detectPlatform(): 'mac' | 'windows' | 'linux' {
  if (typeof window === 'undefined') return 'windows';
  
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('linux')) return 'linux';
  return 'windows';
}

function formatKey(key: string): string {
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

function isValidKey(key: string): boolean {
  return key.length > 0 && key.length <= 20;
}

function isValidModifier(modifier: string): boolean {
  const validModifiers = ['ctrl', 'cmd', 'alt', 'shift', 'meta'];
  return validModifiers.includes(modifier);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

function groupShortcutsByCategory(shortcuts: KeyboardShortcut[]): Map<string, KeyboardShortcut[]> {
  const groups = new Map<string, KeyboardShortcut[]>();
  
  for (const shortcut of shortcuts) {
    if (!groups.has(shortcut.category)) {
      groups.set(shortcut.category, []);
    }
    groups.get(shortcut.category)!.push(shortcut);
  }
  
  return groups;
}

// Development utilities
if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') {
  (window as any).KeyboardShortcuts = {
    KeyboardShortcutUtils,
    DEFAULT_SHORTCUT_CONFIG,
    SHORTCUT_CONTEXTS,
    SHORTCUT_CATEGORIES
  };
  
  console.log('⌨️  Keyboard shortcuts system loaded');
  console.log('  Available contexts:', SHORTCUT_CONTEXTS);
  console.log('  Available categories:', SHORTCUT_CATEGORIES);
  console.log('  🛠️  Utils available at window.KeyboardShortcuts');
}
