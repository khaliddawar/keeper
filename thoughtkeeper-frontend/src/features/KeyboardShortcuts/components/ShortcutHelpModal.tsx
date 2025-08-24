import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ShortcutHelpModalProps, ShortcutCategory } from '../types';
import { useKeyboardShortcuts } from '../KeyboardShortcutsProvider';
import { ShortcutKeys } from './ShortcutTooltip';

/**
 * Keyboard Shortcuts Help Modal
 * Displays all shortcuts in a searchable, categorized modal
 */
export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
  context,
  searchable = true,
  categorized = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { getShortcutHelp, searchShortcuts, manager } = useKeyboardShortcuts();

  const help = useMemo(() => {
    return getShortcutHelp(context);
  }, [getShortcutHelp, context]);

  const filteredShortcuts = useMemo(() => {
    let shortcuts = searchQuery 
      ? searchShortcuts(searchQuery)
      : help.categories.flatMap(cat => cat.shortcuts.map(s => s.shortcut));

    if (selectedCategory !== 'all') {
      shortcuts = shortcuts.filter(shortcut => shortcut.category === selectedCategory);
    }

    return shortcuts;
  }, [searchQuery, selectedCategory, searchShortcuts, help.categories]);

  const categorizedShortcuts = useMemo(() => {
    if (!categorized) {
      return [{
        category: 'all' as ShortcutCategory,
        name: 'All Shortcuts',
        shortcuts: filteredShortcuts.map(shortcut => ({
          shortcut,
          formatted: manager.formatShortcut(shortcut),
          example: shortcut.description
        }))
      }];
    }

    const categoryMap = new Map();
    
    for (const shortcut of filteredShortcuts) {
      if (!categoryMap.has(shortcut.category)) {
        const categoryInfo = help.categories.find(c => c.category === shortcut.category);
        categoryMap.set(shortcut.category, {
          category: shortcut.category,
          name: categoryInfo?.name || shortcut.category,
          shortcuts: []
        });
      }
      
      categoryMap.get(shortcut.category).shortcuts.push({
        shortcut,
        formatted: manager.formatShortcut(shortcut),
        example: shortcut.description
      });
    }

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categorized, filteredShortcuts, help.categories, manager]);

  const availableCategories = useMemo(() => {
    return help.categories.map(cat => ({
      value: cat.category,
      label: cat.name,
      count: cat.shortcuts.length
    }));
  }, [help.categories]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="shortcut-help-modal-overlay">
      <div ref={modalRef} className="shortcut-help-modal">
        <div className="shortcut-help-modal__header">
          <h2 className="shortcut-help-modal__title">
            Keyboard Shortcuts
            {context && (
              <span className="shortcut-help-modal__context">
                for {context.replace('-', ' ')}
              </span>
            )}
          </h2>
          
          <button
            className="shortcut-help-modal__close"
            onClick={onClose}
            aria-label="Close shortcuts help"
          >
            ✕
          </button>
        </div>

        <div className="shortcut-help-modal__content">
          {/* Search and filters */}
          <div className="shortcut-help-modal__controls">
            {searchable && (
              <div className="shortcut-help-modal__search">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shortcut-help-modal__search-input"
                />
                <span className="shortcut-help-modal__search-icon">🔍</span>
              </div>
            )}

            {categorized && (
              <div className="shortcut-help-modal__category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ShortcutCategory | 'all')}
                  className="shortcut-help-modal__category-select"
                >
                  <option value="all">All Categories ({help.totalShortcuts})</option>
                  {availableCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results summary */}
          <div className="shortcut-help-modal__summary">
            Showing {filteredShortcuts.length} of {help.totalShortcuts} shortcuts
            {context && ` (${help.contextShortcuts} relevant to current context)`}
          </div>

          {/* Shortcuts list */}
          <div className="shortcut-help-modal__shortcuts">
            {categorizedShortcuts.length === 0 ? (
              <div className="shortcut-help-modal__empty">
                <p>No shortcuts found matching your criteria.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="shortcut-help-modal__clear-search"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              categorizedShortcuts.map(category => (
                <div key={category.category} className="shortcut-help-modal__category">
                  {categorized && (
                    <h3 className="shortcut-help-modal__category-title">
                      {category.name}
                    </h3>
                  )}
                  
                  <div className="shortcut-help-modal__shortcuts-grid">
                    {category.shortcuts.map(({ shortcut, formatted }) => (
                      <div
                        key={shortcut.id}
                        className={`shortcut-help-modal__shortcut ${!shortcut.enabled ? 'shortcut-help-modal__shortcut--disabled' : ''}`}
                      >
                        <div className="shortcut-help-modal__shortcut-info">
                          <div className="shortcut-help-modal__shortcut-name">
                            {shortcut.name}
                          </div>
                          <div className="shortcut-help-modal__shortcut-description">
                            {shortcut.description}
                          </div>
                          {shortcut.context && shortcut.context.length > 0 && (
                            <div className="shortcut-help-modal__shortcut-context">
                              Available in: {shortcut.context.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="shortcut-help-modal__shortcut-keys">
                          <ShortcutKeys shortcut={formatted} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="shortcut-help-modal__footer">
          <p className="shortcut-help-modal__tip">
            💡 Press <ShortcutKeys shortcut="?" /> anytime to show this help
          </p>
        </div>
      </div>

      <style jsx>{`
        .shortcut-help-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .shortcut-help-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .shortcut-help-modal__header {
          padding: 24px 24px 16px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .shortcut-help-modal__title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .shortcut-help-modal__context {
          font-size: 0.9rem;
          font-weight: 400;
          color: #666;
          margin-left: 8px;
        }

        .shortcut-help-modal__close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .shortcut-help-modal__close:hover {
          background: #f5f5f5;
          color: #333;
        }

        .shortcut-help-modal__content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .shortcut-help-modal__controls {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .shortcut-help-modal__search {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .shortcut-help-modal__search-input {
          width: 100%;
          padding: 10px 40px 10px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .shortcut-help-modal__search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .shortcut-help-modal__search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .shortcut-help-modal__category-select {
          padding: 10px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          min-width: 180px;
        }

        .shortcut-help-modal__summary {
          padding: 12px 24px;
          background: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        .shortcut-help-modal__shortcuts {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .shortcut-help-modal__category {
          margin-bottom: 32px;
        }

        .shortcut-help-modal__category-title {
          margin: 0 0 16px;
          padding: 16px 24px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .shortcut-help-modal__shortcuts-grid {
          padding: 0 24px;
        }

        .shortcut-help-modal__shortcut {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .shortcut-help-modal__shortcut:last-child {
          border-bottom: none;
        }

        .shortcut-help-modal__shortcut--disabled {
          opacity: 0.5;
        }

        .shortcut-help-modal__shortcut-info {
          flex: 1;
        }

        .shortcut-help-modal__shortcut-name {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .shortcut-help-modal__shortcut-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .shortcut-help-modal__shortcut-context {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
          font-style: italic;
        }

        .shortcut-help-modal__shortcut-keys {
          margin-left: 16px;
          flex-shrink: 0;
        }

        .shortcut-help-modal__empty {
          padding: 60px 24px;
          text-align: center;
          color: #6b7280;
        }

        .shortcut-help-modal__clear-search {
          margin-top: 16px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .shortcut-help-modal__footer {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          background: #f9fafb;
        }

        .shortcut-help-modal__tip {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .shortcut-help-modal {
            background: #1f2937;
            color: #f9fafb;
          }

          .shortcut-help-modal__header {
            border-bottom-color: #374151;
          }

          .shortcut-help-modal__title {
            color: #f9fafb;
          }

          .shortcut-help-modal__close:hover {
            background: #374151;
            color: #f9fafb;
          }

          .shortcut-help-modal__controls {
            border-bottom-color: #374151;
          }

          .shortcut-help-modal__search-input,
          .shortcut-help-modal__category-select {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .shortcut-help-modal__search-input:focus {
            border-color: #60a5fa;
          }

          .shortcut-help-modal__summary,
          .shortcut-help-modal__footer {
            background: #111827;
            border-color: #374151;
          }

          .shortcut-help-modal__shortcut {
            border-bottom-color: #374151;
          }

          .shortcut-help-modal__shortcut-name {
            color: #f9fafb;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .shortcut-help-modal {
            margin: 10px;
            max-height: calc(100vh - 20px);
          }

          .shortcut-help-modal__controls {
            flex-direction: column;
            align-items: stretch;
          }

          .shortcut-help-modal__search {
            min-width: auto;
          }

          .shortcut-help-modal__shortcut {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .shortcut-help-modal__shortcut-keys {
            margin-left: 0;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .shortcut-help-modal__close,
          .shortcut-help-modal__search-input {
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .shortcut-help-modal {
            border: 2px solid black;
          }

          .shortcut-help-modal__shortcut {
            border-bottom: 1px solid black;
          }
        }
      `}</style>
    </div>
  );
};
