import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EditThoughtModal = ({ thought, isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
    if (thought && isOpen) {
      setContent(thought?.content || '');
      setCategory(thought?.category || '');
      setPriority(thought?.priority || '');
      setTags(thought?.tags ? thought?.tags?.join(', ') : '');
    }
  }, [thought, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef?.current) {
      textareaRef?.current?.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef?.current?.scrollHeight + 'px';
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!content?.trim()) return;

    setIsSaving(true);

    const updatedThought = {
      ...thought,
      content: content?.trim(),
      category: category || null,
      priority: priority || null,
      tags: tags ? tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag) : [],
      updatedAt: new Date()?.toISOString()
    };

    try {
      await onSave(updatedThought);
      onClose();
    } catch (error) {
      console.error('Error saving thought:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' && (e?.metaKey || e?.ctrlKey)) {
      e?.preventDefault();
      handleSave();
    } else if (e?.key === 'Escape') {
      onClose();
    }
  };

  const autoResize = () => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef?.current?.scrollHeight + 'px';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-popover border border-border rounded-lg shadow-elevated max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-medium text-popover-foreground">Edit Thought</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Thought Content */}
          <div>
            <label className="block text-sm font-medium text-popover-foreground mb-2">
              Content
            </label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e?.target?.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-popover-foreground placeholder-text-secondary min-h-[120px]"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <span>{content?.length} characters</span>
              <span>⌘ + Enter to save</span>
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-popover-foreground mb-2">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-popover-foreground mb-2">
                Priority
              </label>
              <Select
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                placeholder="Set priority"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-popover-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e?.target?.value)}
              placeholder="Add tags (comma separated)"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-popover-foreground placeholder-text-secondary"
            />
            <p className="text-xs text-text-secondary mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Metadata */}
          {thought && (
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-text-secondary space-y-1">
                <div>Created: {new Date(thought.createdAt)?.toLocaleString()}</div>
                {thought?.updatedAt && (
                  <div>Last updated: {new Date(thought.updatedAt)?.toLocaleString()}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/50">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            loading={isSaving}
            disabled={!content?.trim()}
            iconName="Save"
            iconPosition="left"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditThoughtModal;