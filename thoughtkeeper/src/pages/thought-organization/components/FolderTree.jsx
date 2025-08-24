import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FolderTree = ({ folders, selectedFolder, onFolderSelect, onFolderCreate, onFolderRename, onFolderDelete }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [contextMenu, setContextMenu] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded?.has(folderId)) {
      newExpanded?.delete(folderId);
    } else {
      newExpanded?.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e, folder) => {
    e?.preventDefault();
    e?.stopPropagation();
    setContextMenu({
      x: e?.clientX,
      y: e?.clientY,
      folder
    });
  };

  const handleCreateFolder = (parentId) => {
    const name = prompt('Enter folder name:');
    if (name && name?.trim()) {
      onFolderCreate(parentId, name?.trim());
    }
    setContextMenu(null);
  };

  const handleRenameFolder = (folder) => {
    setEditingFolder(folder?.id);
    setNewFolderName(folder?.name);
    setContextMenu(null);
  };

  const handleSaveRename = (folderId) => {
    if (newFolderName?.trim()) {
      onFolderRename(folderId, newFolderName?.trim());
    }
    setEditingFolder(null);
    setNewFolderName('');
  };

  const handleDeleteFolder = (folder) => {
    if (window.confirm(`Are you sure you want to delete "${folder?.name}"? This will move all thoughts to the parent folder.`)) {
      onFolderDelete(folder?.id);
    }
    setContextMenu(null);
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders?.has(folder?.id);
    const isSelected = selectedFolder === folder?.id;
    const hasChildren = folder?.children && folder?.children?.length > 0;

    return (
      <div key={folder?.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-micro hover:bg-muted ${
            isSelected ? 'bg-primary/10 text-primary' : 'text-foreground'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onFolderSelect(folder?.id)}
          onContextMenu={(e) => handleContextMenu(e, folder)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e?.stopPropagation();
                toggleFolder(folder?.id);
              }}
              className="p-1 hover:bg-muted rounded transition-micro"
            >
              <Icon
                name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                size={14}
                className="text-text-secondary"
              />
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <Icon
            name={isExpanded ? 'FolderOpen' : 'Folder'}
            size={16}
            className={isSelected ? 'text-primary' : 'text-text-secondary'}
          />
          
          {editingFolder === folder?.id ? (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e?.target?.value)}
              onBlur={() => handleSaveRename(folder?.id)}
              onKeyDown={(e) => {
                if (e?.key === 'Enter') handleSaveRename(folder?.id);
                if (e?.key === 'Escape') setEditingFolder(null);
              }}
              className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm font-medium truncate">{folder?.name}</span>
          )}
          
          <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded-full">
            {folder?.thoughtCount || 0}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder?.children?.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">Folders</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreateFolder('root')}
          >
            <Icon name="Plus" size={16} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {folders?.map(folder => renderFolder(folder))}
      </div>
      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-elevated py-2 min-w-[160px]"
            style={{
              left: contextMenu?.x,
              top: contextMenu?.y
            }}
          >
            <button
              onClick={() => handleCreateFolder(contextMenu?.folder?.id)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-micro"
            >
              <Icon name="Plus" size={14} />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => handleRenameFolder(contextMenu?.folder)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-micro"
            >
              <Icon name="Edit" size={14} />
              <span>Rename</span>
            </button>
            {contextMenu?.folder?.id !== 'root' && (
              <button
                onClick={() => handleDeleteFolder(contextMenu?.folder)}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-micro"
              >
                <Icon name="Trash2" size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FolderTree;