import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickCaptureBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isExpanded && textareaRef?.current) {
      textareaRef?.current?.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!thoughtText?.trim()) {
      setIsExpanded(false);
    }
  };

  const handleSave = async () => {
    if (!thoughtText?.trim()) return;

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Clear the input and collapse
    setThoughtText('');
    setIsExpanded(false);
    setIsSaving(false);
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' && (e?.metaKey || e?.ctrlKey)) {
      e?.preventDefault();
      handleSave();
    } else if (e?.key === 'Escape') {
      handleCollapse();
    }
  };

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block sticky top-16 z-[999] bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3">
          {!isExpanded ? (
            <button
              onClick={handleExpand}
              className="w-full flex items-center space-x-3 p-4 bg-input border border-border rounded-lg hover:bg-muted transition-micro text-left"
            >
              <Icon name="Plus" size={20} className="text-text-secondary" />
              <span className="text-text-secondary">Capture a thought...</span>
            </button>
          ) : (
            <div className="bg-card border border-border rounded-lg shadow-soft">
              <textarea
                ref={textareaRef}
                value={thoughtText}
                onChange={(e) => setThoughtText(e?.target?.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleCollapse}
                placeholder="What's on your mind?"
                className="w-full p-4 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder-text-secondary min-h-[100px]"
                rows={3}
              />
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                  <Icon name="Command" size={12} />
                  <span>⌘ + Enter to save</span>
                  <span>•</span>
                  <span>Esc to cancel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCollapse}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={!thoughtText?.trim()}
                  >
                    Save Thought
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-[999]">
        {!isExpanded ? (
          <button
            onClick={handleExpand}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-elevated flex items-center justify-center transition-micro hover:scale-105 active:scale-95"
          >
            <Icon name="Plus" size={24} />
          </button>
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-[1100]">
            <div className="w-full bg-background rounded-t-2xl animate-slide-up">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">New Thought</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCollapse}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={thoughtText}
                  onChange={(e) => setThoughtText(e?.target?.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind?"
                  className="w-full p-4 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-text-secondary min-h-[120px]"
                  rows={4}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-text-secondary">
                    Tap outside to cancel
                  </div>
                  <Button
                    variant="default"
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={!thoughtText?.trim()}
                  >
                    Save Thought
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickCaptureBar;