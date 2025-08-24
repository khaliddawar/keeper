import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ShortcutManager } from './ShortcutManager';
import { DefaultShortcuts } from './defaultShortcuts';
import type {
  KeyboardShortcutsContext,
  KeyboardShortcut,
  ShortcutConfig,
  ShortcutContext,
  ShortcutHelp,
  ShortcutAnalytics,
  ShortcutExportData,
  ShortcutImportOptions,
  ValidationResult
} from './types';

/**
 * Keyboard Shortcuts Context
 */
const KeyboardShortcutsContext = createContext<KeyboardShortcutsContext | null>(null);

/**
 * Provider Props
 */
interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  config?: Partial<ShortcutConfig>;
  enableDefaults?: boolean;
  autoSave?: boolean;
}

/**
 * Keyboard Shortcuts Provider Component
 */
export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
  config,
  enableDefaults = true,
  autoSave = true
}) => {
  const managerRef = useRef<ShortcutManager | null>(null);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [enabled, setEnabledState] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<ShortcutConfig | null>(null);

  // Initialize manager
  useEffect(() => {
    const manager = new ShortcutManager(config);
    managerRef.current = manager;
    
    // Load initial state
    setShortcuts(manager.getShortcuts());
    setEnabledState(manager.isEnabled());
    setCurrentConfig(manager.getConfig());

    // Register default shortcuts if enabled
    if (enableDefaults) {
      const defaultShortcuts = new DefaultShortcuts();
      manager.register({
        shortcuts: [
          ...defaultShortcuts.getNavigationShortcuts(),
          ...defaultShortcuts.getEditingShortcuts(),
          ...defaultShortcuts.getSelectionShortcuts(),
          ...defaultShortcuts.getViewShortcuts(),
          ...defaultShortcuts.getSearchShortcuts(),
          ...defaultShortcuts.getTaskShortcuts(),
          ...defaultShortcuts.getNotebookShortcuts(),
          ...defaultShortcuts.getGlobalShortcuts()
        ],
        namespace: 'default',
        priority: 0,
        enabled: true
      });
    }

    // Cleanup on unmount
    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, [config, enableDefaults]);

  // Auto-save configuration changes
  useEffect(() => {
    if (autoSave && managerRef.current) {
      // Auto-save is handled internally by ShortcutManager
    }
  }, [autoSave, currentConfig]);

  /**
   * Register shortcuts
   */
  const registerShortcuts = useCallback((newShortcuts: KeyboardShortcut[], namespace = 'custom'): string => {
    if (!managerRef.current) throw new Error('ShortcutManager not initialized');

    const registrationId = managerRef.current.register({
      shortcuts: newShortcuts,
      namespace,
      priority: 10, // Custom shortcuts get higher priority
      enabled: true
    });

    // Update state
    setShortcuts(managerRef.current.getShortcuts());
    
    return registrationId;
  }, []);

  /**
   * Unregister shortcuts
   */
  const unregisterShortcuts = useCallback((registrationId: string): void => {
    if (!managerRef.current) return;

    managerRef.current.unregister(registrationId);
    setShortcuts(managerRef.current.getShortcuts());
  }, []);

  /**
   * Update shortcut
   */
  const updateShortcut = useCallback((id: string, updates: Partial<KeyboardShortcut>): void => {
    if (!managerRef.current) return;

    managerRef.current.updateShortcut(id, updates);
    setShortcuts(managerRef.current.getShortcuts());
  }, []);

  /**
   * Reset shortcut
   */
  const resetShortcut = useCallback((id: string): void => {
    if (!managerRef.current) return;

    managerRef.current.resetShortcut(id);
    setShortcuts(managerRef.current.getShortcuts());
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((configUpdates: Partial<ShortcutConfig>): void => {
    if (!managerRef.current) return;

    managerRef.current.updateConfig(configUpdates);
    setCurrentConfig(managerRef.current.getConfig());
  }, []);

  /**
   * Reset configuration
   */
  const resetConfig = useCallback((): void => {
    if (!managerRef.current) return;

    const defaultConfig = new ShortcutManager().getConfig();
    managerRef.current.updateConfig(defaultConfig);
    setCurrentConfig(managerRef.current.getConfig());
  }, []);

  /**
   * Set enabled state
   */
  const setEnabled = useCallback((newEnabled: boolean): void => {
    if (!managerRef.current) return;

    managerRef.current.setEnabled(newEnabled);
    setEnabledState(newEnabled);
  }, []);

  /**
   * Get shortcuts for context
   */
  const getShortcutsForContext = useCallback((context: ShortcutContext): KeyboardShortcut[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getShortcuts(context);
  }, []);

  /**
   * Search shortcuts
   */
  const searchShortcuts = useCallback((query: string): KeyboardShortcut[] => {
    if (!managerRef.current) return [];

    const allShortcuts = managerRef.current.getShortcuts();
    const lowercaseQuery = query.toLowerCase();

    return allShortcuts.filter(shortcut =>
      shortcut.name.toLowerCase().includes(lowercaseQuery) ||
      shortcut.description.toLowerCase().includes(lowercaseQuery) ||
      shortcut.category.toLowerCase().includes(lowercaseQuery) ||
      managerRef.current!.formatShortcut(shortcut).toLowerCase().includes(lowercaseQuery)
    );
  }, []);

  /**
   * Get shortcut help
   */
  const getShortcutHelp = useCallback((context?: ShortcutContext): ShortcutHelp => {
    if (!managerRef.current || !currentConfig) {
      return { categories: [], totalShortcuts: 0, contextShortcuts: 0 };
    }

    const relevantShortcuts = context 
      ? managerRef.current.getShortcuts(context)
      : managerRef.current.getShortcuts();

    const categories = currentConfig.categories
      .filter(cat => cat.enabled)
      .sort((a, b) => a.order - b.order)
      .map(category => {
        const categoryShortcuts = relevantShortcuts
          .filter(shortcut => shortcut.category === category.category && shortcut.enabled)
          .map(shortcut => ({
            shortcut,
            formatted: managerRef.current!.formatShortcut(shortcut),
            example: generateShortcutExample(shortcut)
          }));

        return {
          category: category.category,
          name: category.name,
          shortcuts: categoryShortcuts
        };
      })
      .filter(category => category.shortcuts.length > 0);

    return {
      categories,
      totalShortcuts: managerRef.current.getShortcuts().length,
      contextShortcuts: relevantShortcuts.length
    };
  }, [currentConfig]);

  /**
   * Get analytics
   */
  const getAnalytics = useCallback((): ShortcutAnalytics => {
    if (!managerRef.current) {
      return {
        usage: {},
        mostUsed: [],
        leastUsed: [],
        conflicts: [],
        userCustomizations: 0,
        averageResponseTime: 0
      };
    }

    // This would be implemented in the ShortcutManager
    // For now, return basic analytics
    const allShortcuts = managerRef.current.getShortcuts();
    return {
      usage: {},
      mostUsed: allShortcuts.slice(0, 10),
      leastUsed: allShortcuts.slice(-10),
      conflicts: [],
      userCustomizations: allShortcuts.filter(s => s.customizable).length,
      averageResponseTime: 0
    };
  }, []);

  /**
   * Export shortcuts
   */
  const exportShortcuts = useCallback((): ShortcutExportData => {
    if (!managerRef.current || !currentConfig) {
      throw new Error('Cannot export shortcuts: manager not initialized');
    }

    return {
      version: '1.0.0',
      platform: navigator.platform,
      shortcuts: managerRef.current.getShortcuts(),
      config: currentConfig,
      customizations: {}, // Would track user customizations
      exportedAt: new Date()
    };
  }, [currentConfig]);

  /**
   * Import shortcuts
   */
  const importShortcuts = useCallback(async (
    data: ShortcutExportData, 
    options: ShortcutImportOptions
  ): Promise<ValidationResult> => {
    if (!managerRef.current) {
      throw new Error('Cannot import shortcuts: manager not initialized');
    }

    try {
      // Validate import data
      if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
        return {
          isValid: false,
          errors: ['Invalid shortcut data format'],
          warnings: [],
          suggestions: []
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validate each shortcut
      for (const shortcut of data.shortcuts) {
        const validation = managerRef.current.validateShortcut(shortcut);
        if (!validation.isValid) {
          errors.push(`Invalid shortcut ${shortcut.name}: ${validation.errors.join(', ')}`);
        }
        warnings.push(...validation.warnings);
        suggestions.push(...validation.suggestions);
      }

      if (errors.length > 0 && options.validateShortcuts) {
        return { isValid: false, errors, warnings, suggestions };
      }

      // Import shortcuts based on merge strategy
      switch (options.mergeStrategy) {
        case 'replace':
          // Clear existing and add new
          // This would require a way to clear all shortcuts
          warnings.push('Replace strategy not fully implemented');
          break;
          
        case 'merge':
          // Update existing, add new
          for (const shortcut of data.shortcuts) {
            const existing = managerRef.current.getShortcut(shortcut.id);
            if (existing) {
              if (options.conflictResolution === 'overwrite') {
                managerRef.current.updateShortcut(shortcut.id, shortcut);
              } else if (options.conflictResolution === 'skip') {
                continue;
              }
            } else {
              // Register as new shortcut
              registerShortcuts([shortcut], 'imported');
            }
          }
          break;
          
        case 'append':
          // Add all as new
          registerShortcuts(data.shortcuts, 'imported');
          break;
      }

      // Update configuration if provided
      if (data.config && options.preserveCustomizations) {
        managerRef.current.updateConfig(data.config);
      }

      setShortcuts(managerRef.current.getShortcuts());
      setCurrentConfig(managerRef.current.getConfig());

      return {
        isValid: true,
        errors: [],
        warnings,
        suggestions
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        warnings: [],
        suggestions: ['Check the file format and try again']
      };
    }
  }, [registerShortcuts]);

  // Create context value
  const contextValue: KeyboardShortcutsContext = {
    manager: managerRef.current!,
    enabled,
    shortcuts,
    config: currentConfig!,
    registerShortcuts,
    unregisterShortcuts,
    updateShortcut,
    resetShortcut,
    updateConfig,
    resetConfig,
    getShortcutsForContext,
    searchShortcuts,
    getShortcutHelp,
    getAnalytics,
    exportShortcuts,
    importShortcuts
  };

  // Don't render until manager is initialized
  if (!managerRef.current || !currentConfig) {
    return null;
  }

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

/**
 * Hook to use keyboard shortcuts
 */
export const useKeyboardShortcuts = (): KeyboardShortcutsContext => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

/**
 * Hook for registering shortcuts with automatic cleanup
 */
export const useShortcuts = (shortcuts: KeyboardShortcut[], namespace = 'component'): void => {
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcuts();
  const registrationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (shortcuts.length > 0) {
      registrationIdRef.current = registerShortcuts(shortcuts, namespace);
    }

    return () => {
      if (registrationIdRef.current) {
        unregisterShortcuts(registrationIdRef.current);
      }
    };
  }, [shortcuts, namespace, registerShortcuts, unregisterShortcuts]);
};

/**
 * Hook for individual shortcut registration
 */
export const useShortcut = (
  shortcut: KeyboardShortcut,
  enabled = true
): void => {
  const enabledShortcuts = enabled ? [shortcut] : [];
  useShortcuts(enabledShortcuts, `shortcut-${shortcut.id}`);
};

/**
 * Utility functions
 */
function generateShortcutExample(shortcut: KeyboardShortcut): string {
  // Generate contextual examples for shortcuts
  switch (shortcut.category) {
    case 'navigation':
      return 'Navigate between sections';
    case 'editing':
      return 'Create or edit items';
    case 'selection':
      return 'Select multiple items';
    case 'search':
      return 'Search for content';
    case 'tasks':
      return 'Manage tasks quickly';
    case 'notebooks':
      return 'Manage notebooks';
    default:
      return shortcut.description;
  }
}

/**
 * Development utilities
 */
if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') {
  (window as any).KeyboardShortcuts = {
    useKeyboardShortcuts,
    useShortcuts,
    useShortcut
  };
  
  console.log('⌨️  Keyboard shortcuts system loaded');
  console.log('  🛠️  Hooks available at window.KeyboardShortcuts');
}
