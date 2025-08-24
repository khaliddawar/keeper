import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TaskModal = ({ isOpen, onClose, task, onSave, notebooks = [], thoughts = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    timeEstimate: '',
    notebook: 'personal',
    tags: '',
    originalThought: '',
    progress: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        status: task?.status || 'todo',
        dueDate: task?.dueDate || '',
        timeEstimate: task?.timeEstimate || '',
        notebook: task?.notebook || 'personal',
        tags: task?.tags ? task?.tags?.join(', ') : '',
        originalThought: task?.originalThought || '',
        progress: task?.progress || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        timeEstimate: '',
        notebook: 'personal',
        tags: '',
        originalThought: '',
        progress: 0
      });
    }
  }, [task, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData?.title?.trim()) return;

    setIsSaving(true);

    const taskData = {
      ...formData,
      tags: formData?.tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag),
      id: task?.id || Date.now(),
      createdAt: task?.createdAt || new Date()?.toISOString(),
      updatedAt: new Date()?.toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(taskData);
    setIsSaving(false);
    onClose();
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const thoughtOptions = thoughts?.map(thought => ({
    value: thought?.id,
    label: thought?.title || thought?.content?.substring(0, 50) + '...'
  }));

  const notebookOptions = notebooks?.map(notebook => ({
    value: notebook?.id,
    label: notebook?.name
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-popover border border-border rounded-lg shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-popover-foreground">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <Input
            label="Task Title"
            type="text"
            placeholder="Enter task title..."
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            required
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-popover-foreground">
              Description
            </label>
            <textarea
              placeholder="Enter task description..."
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              rows={4}
              className="w-full p-3 bg-input border border-border rounded-lg text-sm text-popover-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Notebook Selection */}
          {notebookOptions?.length > 0 && (
            <Select
              label="Notebook"
              options={notebookOptions}
              value={formData?.notebook}
              onChange={(value) => handleInputChange('notebook', value)}
              description="Choose which notebook this task belongs to"
            />
          )}

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
            />
          </div>

          {/* Due Date and Time Estimate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData?.dueDate}
              onChange={(e) => handleInputChange('dueDate', e?.target?.value)}
            />
            <Input
              label="Time Estimate"
              type="text"
              placeholder="e.g., 2 hours, 30 minutes"
              value={formData?.timeEstimate}
              onChange={(e) => handleInputChange('timeEstimate', e?.target?.value)}
            />
          </div>

          {/* Progress */}
          {formData?.status === 'in-progress' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-popover-foreground">
                Progress ({formData?.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData?.progress}
                onChange={(e) => handleInputChange('progress', parseInt(e?.target?.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Tags */}
          <Input
            label="Tags"
            type="text"
            placeholder="Enter tags separated by commas..."
            value={formData?.tags}
            onChange={(e) => handleInputChange('tags', e?.target?.value)}
            description="Separate multiple tags with commas"
          />

          {/* Original Thought */}
          {thoughtOptions?.length > 0 && (
            <Select
              label="Link to Original Thought"
              options={[{ value: '', label: 'No linked thought' }, ...thoughtOptions]}
              value={formData?.originalThought}
              onChange={(value) => handleInputChange('originalThought', value)}
              description="Connect this task to an existing thought"
            />
          )}

          {/* Task Preview */}
          {formData?.title && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-popover-foreground mb-2">Task Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={
                      formData?.priority === 'high' ? 'AlertTriangle' :
                      formData?.priority === 'medium' ? 'Clock' : 'CheckCircle'
                    } 
                    size={16} 
                    className={
                      formData?.priority === 'high' ? 'text-error' :
                      formData?.priority === 'medium' ? 'text-warning' : 'text-success'
                    }
                  />
                  <span className="text-sm font-medium text-popover-foreground">
                    {formData?.title}
                  </span>
                  {formData?.notebook && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {notebooks?.find(nb => nb?.id === formData?.notebook)?.name}
                    </span>
                  )}
                </div>
                {formData?.description && (
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {formData?.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span className="capitalize">{formData?.priority} priority</span>
                  <span className="capitalize">{formData?.status?.replace('-', ' ')}</span>
                  {formData?.dueDate && (
                    <span>Due: {new Date(formData.dueDate)?.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            loading={isSaving}
            disabled={!formData?.title?.trim()}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;