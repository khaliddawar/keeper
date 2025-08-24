import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import QuickCaptureBar from '../../components/ui/QuickCaptureBar';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';

// Import components
import FolderTree from './components/FolderTree';
import ThoughtGrid from './components/ThoughtGrid';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import FilterSidebar from './components/FilterSidebar';
import TagManager from './components/TagManager';

const ThoughtOrganization = () => {
  const navigate = useNavigate();
  const { notifications, showSuccess, showError, showInfo } = useNotifications();

  // State management
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [selectedThoughts, setSelectedThoughts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showMobileFolders, setShowMobileFolders] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    sortBy: 'created-desc',
    searchTerm: '',
    tags: [],
    priorities: [],
    isActionable: null,
    hasAttachments: false
  });

  // Mock data
  const [folders] = useState([
    {
      id: 'root',
      name: 'All Thoughts',
      thoughtCount: 24,
      children: [
        {
          id: 'work',
          name: 'Work',
          thoughtCount: 12,
          children: [
            { id: 'projects', name: 'Projects', thoughtCount: 8 },
            { id: 'meetings', name: 'Meetings', thoughtCount: 4 }
          ]
        },
        {
          id: 'personal',
          name: 'Personal',
          thoughtCount: 8,
          children: [
            { id: 'ideas', name: 'Ideas', thoughtCount: 5 },
            { id: 'goals', name: 'Goals', thoughtCount: 3 }
          ]
        },
        { id: 'archive', name: 'Archive', thoughtCount: 4 }
      ]
    }
  ]);

  const [thoughts] = useState([
    {
      id: 1,
      content: `New product feature idea: Implement a smart notification system that learns from user behavior and only sends notifications when they're most likely to be engaged.\n\nKey considerations:\n- Machine learning algorithm to analyze user patterns\n- Time-based preferences\n- Context-aware notifications\n- User feedback integration`,
      tags: ['product', 'features', 'notifications', 'ml'],
      priority: 'high',
      isActionable: true,
      createdAt: '2025-08-17T10:30:00Z',
      modifiedAt: '2025-08-17T14:15:00Z',
      folderId: 'projects'
    },
    {
      id: 2,
      content: `Team meeting notes from quarterly review:\n\n- Q3 performance exceeded expectations by 15%\n- Need to hire 2 more developers for the mobile team\n- Budget approved for new design tools\n- Next sprint planning scheduled for Friday`,
      tags: ['meeting', 'quarterly', 'team', 'planning'],
      priority: 'medium',
      isActionable: true,
      createdAt: '2025-08-16T09:00:00Z',
      modifiedAt: '2025-08-16T09:00:00Z',
      folderId: 'meetings'
    },
    {
      id: 3,
      content: `Weekend hiking trip planning:\n\nResearching local trails for the upcoming weekend adventure. Found some interesting options:\n- Blue Ridge Trail (moderate difficulty, 8 miles)\n- Sunset Peak (challenging, 12 miles with great views)\n- River Valley Loop (easy, 4 miles, family-friendly)`,
      tags: ['personal', 'hiking', 'weekend', 'planning'],
      priority: 'low',
      isActionable: false,
      createdAt: '2025-08-15T18:45:00Z',
      modifiedAt: '2025-08-15T18:45:00Z',
      folderId: 'personal'
    },
    {
      id: 4,
      content: `Book recommendation from Sarah: "Atomic Habits" by James Clear. She mentioned it has great insights on building sustainable habits and breaking bad ones. Should add this to my reading list for next month.`,
      tags: ['books', 'recommendations', 'habits', 'personal-development'],
      priority: 'low',
      isActionable: true,
      createdAt: '2025-08-14T16:20:00Z',
      modifiedAt: '2025-08-14T16:20:00Z',
      folderId: 'ideas'
    },
    {
      id: 5,
      content: `Client feedback on the new dashboard design:\n\n"The new interface is much more intuitive, but we'd like to see more customization options for the widgets. Also, the color scheme could be more accessible for colorblind users."\n\nAction items:\n- Research accessibility guidelines\n- Design widget customization UI\n- Test with colorblind users`,
      tags: ['client', 'feedback', 'design', 'accessibility', 'dashboard'],
      priority: 'high',
      isActionable: true,
      createdAt: '2025-08-13T11:30:00Z',
      modifiedAt: '2025-08-17T09:15:00Z',
      folderId: 'projects'
    },
    {
      id: 6,
      content: `Interesting article about the future of remote work and its impact on company culture. Key points:\n\n- Hybrid models are becoming the new standard\n- Digital-first communication strategies are essential\n- Employee wellbeing programs need to adapt\n- Technology infrastructure is more critical than ever`,
      tags: ['remote-work', 'culture', 'future', 'article'],
      priority: 'medium',
      isActionable: false,
      createdAt: '2025-08-12T14:10:00Z',
      modifiedAt: '2025-08-12T14:10:00Z',
      folderId: 'work'
    }
  ]);

  const [availableTags] = useState([
    { id: 1, name: 'product', count: 3 },
    { id: 2, name: 'meeting', count: 5 },
    { id: 3, name: 'personal', count: 8 },
    { id: 4, name: 'work', count: 12 },
    { id: 5, name: 'ideas', count: 6 },
    { id: 6, name: 'planning', count: 4 },
    { id: 7, name: 'features', count: 2 },
    { id: 8, name: 'design', count: 7 },
    { id: 9, name: 'client', count: 3 },
    { id: 10, name: 'feedback', count: 4 }
  ]);

  // Filter thoughts based on selected folder and filters
  const filteredThoughts = thoughts?.filter(thought => {
    // Folder filter
    if (selectedFolder !== 'root' && thought?.folderId !== selectedFolder) {
      return false;
    }

    // Search filter
    if (filters?.searchTerm && !thought?.content?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase())) {
      return false;
    }

    // Tag filter
    if (filters?.tags?.length > 0 && !filters?.tags?.some(tag => thought?.tags?.includes(tag))) {
      return false;
    }

    // Priority filter
    if (filters?.priorities?.length > 0 && !filters?.priorities?.includes(thought?.priority)) {
      return false;
    }

    // Actionable filter
    if (filters?.isActionable !== null && thought?.isActionable !== filters?.isActionable) {
      return false;
    }

    return true;
  });

  // Sort thoughts
  const sortedThoughts = [...filteredThoughts]?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'created-asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'created-desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'modified-desc':
        return new Date(b.modifiedAt) - new Date(a.modifiedAt);
      case 'modified-asc':
        return new Date(a.modifiedAt) - new Date(b.modifiedAt);
      case 'priority-desc':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder?.[b?.priority] || 0) - (priorityOrder?.[a?.priority] || 0);
      case 'alphabetical':
        return a?.content?.localeCompare(b?.content);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Event handlers
  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    setSelectedThoughts([]);
    setShowMobileFolders(false);
  };

  const handleFolderCreate = (parentId, name) => {
    showSuccess(`Folder "${name}" created successfully`);
  };

  const handleFolderRename = (folderId, newName) => {
    showSuccess(`Folder renamed to "${newName}"`);
  };

  const handleFolderDelete = (folderId) => {
    showSuccess('Folder deleted and thoughts moved to parent folder');
  };

  const handleThoughtSelect = (thoughtId, selected) => {
    if (selected) {
      setSelectedThoughts([...selectedThoughts, thoughtId]);
    } else {
      setSelectedThoughts(selectedThoughts?.filter(id => id !== thoughtId));
    }
  };

  const handleBulkSelect = (thoughtIds) => {
    setSelectedThoughts(thoughtIds);
  };

  const handleThoughtEdit = (thoughtId, updates) => {
    showSuccess('Thought updated successfully');
  };

  const handleThoughtDelete = (thoughtId) => {
    showSuccess('Thought deleted successfully');
  };

  const handleThoughtMove = (thoughtIds, targetFolderId) => {
    const count = Array.isArray(thoughtIds) ? thoughtIds?.length : 1;
    showSuccess(`${count} thought${count > 1 ? 's' : ''} moved successfully`);
    setSelectedThoughts([]);
  };

  const handleBulkMove = (folderId) => {
    handleThoughtMove(selectedThoughts, folderId);
  };

  const handleBulkTag = (tagName) => {
    showSuccess(`Tag "${tagName}" added to ${selectedThoughts?.length} thoughts`);
    setSelectedThoughts([]);
  };

  const handleBulkDelete = () => {
    showSuccess(`${selectedThoughts?.length} thoughts deleted successfully`);
    setSelectedThoughts([]);
  };

  const handleBulkExport = (format) => {
    showInfo(`Exporting ${selectedThoughts?.length} thoughts as ${format?.toUpperCase()}...`);
    setSelectedThoughts([]);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedThoughts([]);
  };

  const handleTagCreate = (tagName) => {
    showSuccess(`Tag "${tagName}" created successfully`);
  };

  const handleTagRename = (tagId, newName) => {
    showSuccess(`Tag renamed to "${newName}"`);
  };

  const handleTagDelete = (tagId) => {
    showSuccess('Tag deleted and removed from all thoughts');
  };

  const handleTagMerge = (tagIds, targetName) => {
    showSuccess(`Tags merged into "${targetName}"`);
  };

  const getCurrentFolderName = () => {
    const findFolder = (folders, id) => {
      for (const folder of folders) {
        if (folder?.id === id) return folder?.name;
        if (folder?.children) {
          const found = findFolder(folder?.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(folders, selectedFolder) || 'All Thoughts';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickCaptureBar />
      <div className="pt-16 pb-20 md:pb-6">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Desktop Folder Sidebar */}
          <div className="hidden lg:block w-80 border-r border-border bg-surface">
            <FolderTree
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={handleFolderSelect}
              onFolderCreate={handleFolderCreate}
              onFolderRename={handleFolderRename}
              onFolderDelete={handleFolderDelete}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden p-4 border-b border-border bg-surface">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setShowMobileFolders(true)}
                  iconName="Folder"
                  iconPosition="left"
                >
                  {getCurrentFolderName()}
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilterSidebar(true)}
                  >
                    <Icon name="Filter" size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTagManager(true)}
                  >
                    <Icon name="Tag" size={20} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-6 border-b border-border bg-surface">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {getCurrentFolderName()}
                </h1>
                <p className="text-text-secondary mt-1">
                  {sortedThoughts?.length} thought{sortedThoughts?.length !== 1 ? 's' : ''}
                  {selectedThoughts?.length > 0 && ` • ${selectedThoughts?.length} selected`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTagManager(true)}
                  iconName="Tag"
                  iconPosition="left"
                >
                  Manage Tags
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilterSidebar(true)}
                  iconName="Filter"
                  iconPosition="left"
                >
                  Filters
                </Button>
              </div>
            </div>

            {/* Thought Grid */}
            <ThoughtGrid
              thoughts={sortedThoughts}
              selectedThoughts={selectedThoughts}
              onThoughtSelect={handleThoughtSelect}
              onThoughtEdit={handleThoughtEdit}
              onThoughtDelete={handleThoughtDelete}
              onThoughtMove={handleThoughtMove}
              onBulkSelect={handleBulkSelect}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters?.sortBy}
              onSortChange={(value) => setFilters({ ...filters, sortBy: value })}
            />
          </div>
        </div>
      </div>
      {/* Mobile Folder Drawer */}
      {showMobileFolders && (
        <div className="lg:hidden fixed inset-0 z-[1050] bg-black bg-opacity-50 animate-fade-in">
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-surface animate-slide-in-left">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">Folders</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFolders(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            <FolderTree
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={handleFolderSelect}
              onFolderCreate={handleFolderCreate}
              onFolderRename={handleFolderRename}
              onFolderDelete={handleFolderDelete}
            />
          </div>
        </div>
      )}
      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedCount={selectedThoughts?.length}
        onMove={handleBulkMove}
        onTag={handleBulkTag}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onClearSelection={() => setSelectedThoughts([])}
        folders={folders?.[0]?.children || []}
      />
      {/* Filter Sidebar */}
      <FilterSidebar
        isVisible={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={availableTags?.map(tag => tag?.name)}
      />
      {/* Tag Manager */}
      <TagManager
        isVisible={showTagManager}
        onClose={() => setShowTagManager(false)}
        availableTags={availableTags}
        onTagCreate={handleTagCreate}
        onTagRename={handleTagRename}
        onTagDelete={handleTagDelete}
        onTagMerge={handleTagMerge}
      />
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={() => {}}
      />
    </div>
  );
};

export default ThoughtOrganization;