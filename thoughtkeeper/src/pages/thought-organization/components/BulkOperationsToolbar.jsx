import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const BulkOperationsToolbar = ({ 
  selectedCount, 
  onMove, 
  onTag, 
  onDelete, 
  onExport, 
  onClearSelection,
  folders = []
}) => {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const folderOptions = folders?.map(folder => ({
    value: folder?.id,
    label: folder?.name
  }));

  const handleMove = (folderId) => {
    onMove(folderId);
    setShowMoveDropdown(false);
  };

  const handleAddTag = () => {
    if (newTag?.trim()) {
      onTag(newTag?.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleExport = () => {
    const formats = [
      { label: 'Export as JSON', action: () => onExport('json') },
      { label: 'Export as CSV', action: () => onExport('csv') },
      { label: 'Export as Markdown', action: () => onExport('markdown') }
    ];
    
    // Simple dropdown for export formats
    const format = window.prompt('Choose export format:\n1. JSON\n2. CSV\n3. Markdown\n\nEnter number (1-3):');
    if (format === '1') onExport('json');
    else if (format === '2') onExport('csv');
    else if (format === '3') onExport('markdown');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected thought${selectedCount > 1 ? 's' : ''}?`)) {
      onDelete();
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-elevated p-3 flex items-center space-x-2 animate-slide-up">
        {/* Selection Count */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-lg">
          <Icon name="CheckSquare" size={16} />
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {/* Move */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoveDropdown(!showMoveDropdown)}
              iconName="FolderOpen"
              iconPosition="left"
            >
              Move
            </Button>
            
            {showMoveDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoveDropdown(false)}
                />
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-popover border border-border rounded-lg shadow-elevated py-2 z-50">
                  {folderOptions?.map((folder) => (
                    <button
                      key={folder?.value}
                      onClick={() => handleMove(folder?.value)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-micro"
                    >
                      <Icon name="Folder" size={14} />
                      <span>{folder?.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tag */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagInput(!showTagInput)}
              iconName="Tag"
              iconPosition="left"
            >
              Tag
            </Button>
            
            {showTagInput && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTagInput(false)}
                />
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-popover border border-border rounded-lg shadow-elevated p-3 z-50">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter tag name..."
                      value={newTag}
                      onChange={(e) => setNewTag(e?.target?.value)}
                      onKeyDown={(e) => {
                        if (e?.key === 'Enter') handleAddTag();
                        if (e?.key === 'Escape') setShowTagInput(false);
                      }}
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTag?.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            iconName="Trash2"
            iconPosition="left"
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="ml-2"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;