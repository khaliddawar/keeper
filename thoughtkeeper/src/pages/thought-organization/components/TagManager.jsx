import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TagManager = ({ 
  isVisible, 
  onClose, 
  availableTags = [], 
  onTagCreate, 
  onTagRename, 
  onTagDelete, 
  onTagMerge 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const filteredTags = availableTags?.filter(tag =>
    tag?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleCreateTag = () => {
    if (newTagName?.trim()) {
      onTagCreate(newTagName?.trim());
      setNewTagName('');
    }
  };

  const handleStartEdit = (tag) => {
    setEditingTag(tag?.id);
    setEditTagName(tag?.name);
  };

  const handleSaveEdit = () => {
    if (editTagName?.trim() && editingTag) {
      onTagRename(editingTag, editTagName?.trim());
      setEditingTag(null);
      setEditTagName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName('');
  };

  const handleDeleteTag = (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all thoughts.')) {
      onTagDelete(tagId);
    }
  };

  const handleTagSelect = (tagId, selected) => {
    if (selected) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags?.filter(id => id !== tagId));
    }
  };

  const handleMergeTags = () => {
    if (selectedTags?.length < 2) {
      alert('Please select at least 2 tags to merge.');
      return;
    }
    
    const targetTag = window.prompt('Enter the name for the merged tag:');
    if (targetTag && targetTag?.trim()) {
      onTagMerge(selectedTags, targetTag?.trim());
      setSelectedTags([]);
    }
  };

  const getTagColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-gray-100 text-gray-800'
    ];
    return colors?.[index % colors?.length];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black bg-opacity-50 animate-fade-in">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-popover border border-border rounded-lg shadow-elevated animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Tag Manager</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Create New Tag */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Create New Tag</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e?.target?.value)}
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter') handleCreateTag();
                  }}
                  className="flex-1"
                />
                <Button
                  variant="default"
                  onClick={handleCreateTag}
                  disabled={!newTagName?.trim()}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create
                </Button>
              </div>
            </div>

            {/* Search Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Manage Existing Tags</h3>
              <Input
                type="search"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
              />
            </div>

            {/* Bulk Actions */}
            {selectedTags?.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="text-sm text-primary font-medium">
                  {selectedTags?.length} tags selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMergeTags}
                    disabled={selectedTags?.length < 2}
                    iconName="Merge"
                    iconPosition="left"
                  >
                    Merge Tags
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Tags List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTags?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Tag" size={48} className="text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary">
                    {searchTerm ? 'No tags found matching your search.' : 'No tags created yet.'}
                  </p>
                </div>
              ) : (
                filteredTags?.map((tag, index) => (
                  <div
                    key={tag?.id}
                    className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:shadow-soft transition-micro"
                  >
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedTags?.includes(tag?.id)}
                      onChange={(e) => handleTagSelect(tag?.id, e?.target?.checked)}
                      className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                    />

                    {/* Tag Display */}
                    <div className="flex-1 flex items-center space-x-3">
                      {editingTag === tag?.id ? (
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            type="text"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e?.target?.value)}
                            onKeyDown={(e) => {
                              if (e?.key === 'Enter') handleSaveEdit();
                              if (e?.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            iconName="Check"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            iconName="X"
                          />
                        </div>
                      ) : (
                        <>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(index)}`}>
                            #{tag?.name}
                          </span>
                          <span className="text-sm text-text-secondary">
                            {tag?.count} thought{tag?.count !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {editingTag !== tag?.id && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(tag)}
                          className="w-8 h-8"
                        >
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTag(tag?.id)}
                          className="w-8 h-8 text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {availableTags?.length} total tags
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManager;