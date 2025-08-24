import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const QuickCaptureInput = ({ onSave, isLoading = false }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [tags, setTags] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const categoryOptions = [
    { value: '', label: 'No category' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'ideas', label: 'Ideas' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'project', label: 'Project' }
  ];

  const priorityOptions = [
    { value: '', label: 'No priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  useEffect(() => {
    setCharCount(content?.length);
  }, [content]);

  useEffect(() => {
    if (isExpanded && textareaRef?.current) {
      textareaRef?.current?.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!content?.trim()) {
      setIsExpanded(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setContent('');
    setCategory('');
    setPriority('');
    setTags('');
    setCharCount(0);
  };

  const handleSave = async () => {
    if (!content?.trim()) return;

    const thoughtData = {
      content: content?.trim(),
      category: category || null,
      priority: priority || null,
      tags: tags ? tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag) : [],
      createdAt: new Date()?.toISOString(),
      id: Date.now() + Math.random()
    };

    await onSave(thoughtData);
    resetForm();
    setIsExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' && (e?.metaKey || e?.ctrlKey)) {
      e?.preventDefault();
      handleSave();
    } else if (e?.key === 'Escape') {
      handleCollapse();
    }
  };

  const autoResize = () => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef?.current?.scrollHeight + 'px';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-soft">
      {!isExpanded ? (
        <button
          onClick={handleExpand}
          className="w-full flex items-center space-x-3 p-4 text-left hover:bg-muted transition-micro"
        >
          <Icon name="Plus" size={20} className="text-text-secondary" />
          <span className="text-text-secondary">What's on your mind? Capture a thought...</span>
        </button>
      ) : (
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e?.target?.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleCollapse}
            placeholder="What's on your mind?"
            className="w-full p-4 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder-text-secondary min-h-[100px]"
            rows={3}
          />
          
          {/* Expanded Options */}
          <div className="px-4 pb-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
              />
              <Select
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                placeholder="Set priority"
              />
            </div>
            
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e?.target?.value)}
              placeholder="Add tags (comma separated)"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
            <div className="flex items-center space-x-4 text-xs text-text-secondary">
              <div className="flex items-center space-x-1">
                <Icon name="Type" size={12} />
                <span>{charCount} characters</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <Icon name="Command" size={12} />
                <span>⌘ + Enter to save</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapse}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                loading={isLoading}
                disabled={!content?.trim()}
                iconName="Save"
                iconPosition="left"
              >
                Save Thought
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCaptureInput;