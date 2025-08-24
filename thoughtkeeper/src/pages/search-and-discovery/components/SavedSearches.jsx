import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState([
    {
      id: 1,
      name: 'Work Projects',
      query: 'project meeting work',
      filters: { dateRange: 'month', tags: ['work', 'project'] },
      resultCount: 23,
      lastRun: '2025-08-17',
      notifications: true,
      color: '#3B82F6'
    },
    {
      id: 2,
      name: 'Personal Planning',
      query: 'personal planning weekend',
      filters: { dateRange: 'week', folder: 'Personal' },
      resultCount: 12,
      lastRun: '2025-08-16',
      notifications: false,
      color: '#10B981'
    },
    {
      id: 3,
      name: 'Urgent Tasks',
      query: 'urgent priority high',
      filters: { contentType: 'tasks', priority: 'high' },
      resultCount: 8,
      lastRun: '2025-08-17',
      notifications: true,
      color: '#EF4444'
    },
    {
      id: 4,
      name: 'Ideas & Innovation',
      query: 'idea innovation creative',
      filters: { contentType: 'ideas', tags: ['innovation', 'creative'] },
      resultCount: 15,
      lastRun: '2025-08-15',
      notifications: false,
      color: '#F59E0B'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');

  const handleRunSearch = (search) => {
    console.log('Running saved search:', search);
    // Navigate to search results with the saved query and filters
  };

  const handleToggleNotifications = (searchId) => {
    setSavedSearches(prev => 
      prev?.map(search => 
        search?.id === searchId 
          ? { ...search, notifications: !search?.notifications }
          : search
      )
    );
  };

  const handleDeleteSearch = (searchId) => {
    setSavedSearches(prev => prev?.filter(search => search?.id !== searchId));
  };

  const handleCreateSearch = () => {
    if (newSearchName?.trim()) {
      const newSearch = {
        id: Date.now(),
        name: newSearchName,
        query: 'new search query',
        filters: {},
        resultCount: 0,
        lastRun: new Date()?.toISOString()?.split('T')?.[0],
        notifications: false,
        color: '#6B7280'
      };
      setSavedSearches(prev => [...prev, newSearch]);
      setNewSearchName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Saved Searches</h2>
          <p className="text-text-secondary">Quick access to your frequently used search queries</p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowCreateForm(true)}
        >
          Save Current Search
        </Button>
      </div>
      {/* Create New Search Form */}
      {showCreateForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Create Saved Search</h3>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Input
                label="Search Name"
                type="text"
                placeholder="Enter a name for this search"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e?.target?.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewSearchName('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreateSearch}
                disabled={!newSearchName?.trim()}
              >
                Save Search
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Saved Searches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedSearches?.map((search) => (
          <div
            key={search?.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-soft transition-micro"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: search?.color }}
                />
                <h3 className="text-lg font-medium text-foreground">{search?.name}</h3>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleNotifications(search?.id)}
                  className={search?.notifications ? 'text-primary' : 'text-text-secondary'}
                >
                  <Icon name={search?.notifications ? 'Bell' : 'BellOff'} size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSearch(search?.id)}
                  className="text-text-secondary hover:text-error"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-sm text-text-secondary">Query:</span>
                <p className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
                  {search?.query}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="Search" size={14} className="text-text-secondary" />
                  <span className="text-text-secondary">
                    {search?.resultCount} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={14} className="text-text-secondary" />
                  <span className="text-text-secondary">
                    Last run: {search?.lastRun}
                  </span>
                </div>
              </div>

              {/* Filters Preview */}
              {Object.keys(search?.filters)?.length > 0 && (
                <div>
                  <span className="text-sm text-text-secondary">Filters:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(search?.filters)?.map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 bg-muted text-text-secondary text-xs rounded-full"
                      >
                        {key}: {Array.isArray(value) ? value?.join(', ') : value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                fullWidth
                iconName="Play"
                iconPosition="left"
                onClick={() => handleRunSearch(search)}
              >
                Run Search
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                onClick={() => console.log('Edit search:', search?.id)}
              >
                Edit
              </Button>
            </div>

            {/* Notification Status */}
            {search?.notifications && (
              <div className="mt-3 flex items-center space-x-2 text-xs text-success">
                <Icon name="Bell" size={12} />
                <span>Notifications enabled for new matches</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Empty State */}
      {savedSearches?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Saved Searches</h3>
          <p className="text-text-secondary mb-4">
            Save your frequently used searches for quick access
          </p>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Saved Search
          </Button>
        </div>
      )}
      {/* Quick Actions */}
      <div className="mt-8 bg-muted rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Export Searches
          </Button>
          <Button variant="outline" size="sm" iconName="Upload" iconPosition="left">
            Import Searches
          </Button>
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh All
          </Button>
          <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
            Manage Notifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedSearches;