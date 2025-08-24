import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { Checkbox } from './Checkbox';

const ContextualSidebar = ({ isVisible = false, onClose }) => {
  const location = useLocation();
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const getSidebarContent = () => {
    switch (location?.pathname) {
      case '/thought-organization':
        return {
          title: 'Organization Tools',
          sections: [
            {
              title: 'Folders',
              content: (
                <div className="space-y-3">
                  <Button variant="outline" size="sm" fullWidth iconName="Plus" iconPosition="left">
                    New Folder
                  </Button>
                  <div className="space-y-2">
                    {['Personal', 'Work', 'Ideas', 'Archive']?.map((folder) => (
                      <div key={folder} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-micro">
                        <div className="flex items-center space-x-2">
                          <Icon name="Folder" size={16} className="text-text-secondary" />
                          <span className="text-sm text-foreground">{folder}</span>
                        </div>
                        <span className="text-xs text-text-secondary">12</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            },
            {
              title: 'Tags',
              content: (
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Filter tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="text-sm"
                  />
                  <div className="space-y-2">
                    {['important', 'project', 'meeting', 'idea', 'todo']?.map((tag) => (
                      <Checkbox
                        key={tag}
                        label={`#${tag}`}
                        checked={activeFilters?.[tag] || false}
                        onChange={(e) => setActiveFilters(prev => ({ ...prev, [tag]: e?.target?.checked }))}
                      />
                    ))}
                  </div>
                </div>
              )
            }
          ]
        };

      case '/search-and-discovery':
        return {
          title: 'Search Filters',
          sections: [
            {
              title: 'Date Range',
              content: (
                <div className="space-y-3">
                  <Select
                    options={[
                      { value: 'today', label: 'Today' },
                      { value: 'week', label: 'This Week' },
                      { value: 'month', label: 'This Month' },
                      { value: 'year', label: 'This Year' },
                      { value: 'custom', label: 'Custom Range' }
                    ]}
                    value="week"
                    onChange={() => {}}
                    placeholder="Select date range"
                  />
                </div>
              )
            },
            {
              title: 'Content Type',
              content: (
                <div className="space-y-2">
                  {['All Content', 'Text Notes', 'Tasks', 'Ideas', 'Archived']?.map((type) => (
                    <Checkbox
                      key={type}
                      label={type}
                      checked={type === 'All Content'}
                      onChange={() => {}}
                    />
                  ))}
                </div>
              )
            },
            {
              title: 'Sort By',
              content: (
                <Select
                  options={[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'date-desc', label: 'Newest First' },
                    { value: 'date-asc', label: 'Oldest First' },
                    { value: 'modified', label: 'Recently Modified' }
                  ]}
                  value="relevance"
                  onChange={() => {}}
                  placeholder="Sort results by"
                />
              )
            }
          ]
        };

      case '/task-management':
        return {
          title: 'Task Filters',
          sections: [
            {
              title: 'Status',
              content: (
                <div className="space-y-2">
                  {['All Tasks', 'To Do', 'In Progress', 'Completed', 'Overdue']?.map((status) => (
                    <Checkbox
                      key={status}
                      label={status}
                      checked={status === 'All Tasks'}
                      onChange={() => {}}
                    />
                  ))}
                </div>
              )
            },
            {
              title: 'Priority',
              content: (
                <div className="space-y-2">
                  {['High', 'Medium', 'Low']?.map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                       
                        onChange={() => {}}
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          priority === 'High' ? 'bg-error' : 
                          priority === 'Medium' ? 'bg-warning' : 'bg-success'
                        }`} />
                        <span className="text-sm text-foreground">{priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              title: 'Due Date',
              content: (
                <Select
                  options={[
                    { value: 'all', label: 'All Dates' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'today', label: 'Due Today' },
                    { value: 'week', label: 'Due This Week' },
                    { value: 'month', label: 'Due This Month' }
                  ]}
                  value="all"
                  onChange={() => {}}
                  placeholder="Filter by due date"
                />
              )
            }
          ]
        };

      default:
        return null;
    }
  };

  const sidebarContent = getSidebarContent();

  if (!sidebarContent || !isVisible) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-80 bg-surface border-l border-border z-[900] animate-slide-in-right">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">{sidebarContent?.title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {sidebarContent?.sections?.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">{section?.title}</h3>
                {section?.content}
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-border">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" fullWidth>
                Reset Filters
              </Button>
              <Button variant="default" size="sm" fullWidth>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      <div className="lg:hidden fixed inset-0 z-[1050] bg-black bg-opacity-50 animate-fade-in">
        <div className="fixed bottom-0 left-0 right-0 h-[90vh] bg-surface rounded-t-2xl animate-slide-up">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">{sidebarContent?.title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sidebarContent?.sections?.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">{section?.title}</h3>
                  {section?.content}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" fullWidth>
                  Reset Filters
                </Button>
                <Button variant="default" size="sm" fullWidth>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextualSidebar;