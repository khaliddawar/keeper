import React, { useState, useEffect } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const NotebookManager = ({ isOpen, onClose, notebooks = [], tasks = [], onSave, onDelete }) => {
          const [editingNotebook, setEditingNotebook] = useState(null);
          const [formData, setFormData] = useState({
            name: '',
            color: '#3B82F6',
            icon: 'Book'
          });

          const availableIcons = [
            'Book', 'Briefcase', 'User', 'Heart', 'Star', 'Target',
            'TrendingUp', 'BookOpen', 'Activity', 'Lightbulb', 'Coffee',
            'Music', 'Camera', 'Gamepad', 'Home', 'Car', 'Plane',
            'ShoppingCart', 'Gift', 'Umbrella', 'Smartphone', 'Laptop'
          ];

          const availableColors = [
            '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899',
            '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#A855F7',
            '#22C55E', '#EAB308', '#F43F5E', '#8B5A2C', '#475569', '#6B7280'
          ];

          useEffect(() => {
            if (editingNotebook) {
              setFormData({
                name: editingNotebook?.name || '',
                color: editingNotebook?.color || '#3B82F6',
                icon: editingNotebook?.icon || 'Book'
              });
            } else {
              setFormData({
                name: '',
                color: '#3B82F6',
                icon: 'Book'
              });
            }
          }, [editingNotebook]);

          const handleInputChange = (field, value) => {
            setFormData(prev => ({
              ...prev,
              [field]: value
            }));
          };

          const handleSave = () => {
            if (!formData?.name?.trim()) return;

            const notebookData = {
              ...formData,
              name: formData?.name?.trim(),
              id: editingNotebook?.id
            };

            onSave(notebookData);
            setEditingNotebook(null);
            setFormData({
              name: '',
              color: '#3B82F6',
              icon: 'Book'
            });
          };

          const handleEdit = (notebook) => {
            setEditingNotebook(notebook);
          };

          const handleDelete = (notebookId) => {
            onDelete(notebookId);
          };

          const handleCancel = () => {
            setEditingNotebook(null);
            setFormData({
              name: '',
              color: '#3B82F6',
              icon: 'Book'
            });
          };

          const getNotebookTaskCount = (notebookId) => {
            return tasks?.filter(task => task?.notebook === notebookId)?.length || 0;
          };

          if (!isOpen) return null;

          return (
            <div className="fixed inset-0 z-[1100] bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-popover border border-border rounded-lg shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="text-xl font-semibold text-popover-foreground">
                      Manage Notebooks
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                      Create, edit, and organize your task notebooks
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Add New Notebook Form */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-popover-foreground mb-4">
                      {editingNotebook ? 'Edit Notebook' : 'Create New Notebook'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Input
                        label="Notebook Name"
                        type="text"
                        placeholder="Enter notebook name..."
                        value={formData?.name}
                        onChange={(e) => handleInputChange('name', e?.target?.value)}
                        required
                      />
                      
                      {/* Color Picker */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-popover-foreground">
                          Color
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {availableColors?.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleInputChange('color', color)}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                formData?.color === color ? 'border-popover-foreground' : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Icon Picker */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-popover-foreground">
                          Icon
                        </label>
                        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                          {availableIcons?.map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => handleInputChange('icon', iconName)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
                                formData?.icon === iconName 
                                  ? 'border-popover-foreground bg-muted' 
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <Icon name={iconName} size={16} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    {formData?.name && (
                      <div className="bg-background border border-border rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-popover-foreground mb-2">Preview</h4>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: formData?.color + '20' }}
                          >
                            <Icon 
                              name={formData?.icon} 
                              size={16} 
                              style={{ color: formData?.color }}
                            />
                          </div>
                          <span className="font-medium text-popover-foreground">
                            {formData?.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled={!formData?.name?.trim()}
                      >
                        {editingNotebook ? 'Update Notebook' : 'Create Notebook'}
                      </Button>
                      {editingNotebook && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Existing Notebooks List */}
                  <div>
                    <h3 className="text-lg font-medium text-popover-foreground mb-4">
                      Existing Notebooks ({notebooks?.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notebooks?.map((notebook) => {
                        const taskCount = getNotebookTaskCount(notebook?.id);
                        return (
                          <div 
                            key={notebook?.id}
                            className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: notebook?.color + '20' }}
                                >
                                  <Icon 
                                    name={notebook?.icon} 
                                    size={18} 
                                    style={{ color: notebook?.color }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium text-popover-foreground">
                                    {notebook?.name}
                                  </h4>
                                  <p className="text-sm text-text-secondary">
                                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  iconName="Edit"
                                  onClick={() => handleEdit(notebook)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  iconName="Trash2"
                                  onClick={() => handleDelete(notebook?.id)}
                                  disabled={taskCount > 0}
                                  className={taskCount > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-error'}
                                />
                              </div>
                            </div>
                            
                            {taskCount > 0 && (
                              <div className="text-xs text-text-secondary">
                                Cannot delete notebook with active tasks
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {notebooks?.length === 0 && (
                      <div className="text-center py-8">
                        <Icon name="BookOpen" size={48} className="mx-auto text-text-secondary mb-4" />
                        <h4 className="text-lg font-medium text-popover-foreground mb-2">
                          No notebooks yet
                        </h4>
                        <p className="text-text-secondary">
                          Create your first notebook to organize your tasks
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end p-6 border-t border-border">
                  <Button variant="outline" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          );
        };

        export default NotebookManager;