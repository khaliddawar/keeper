import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import QuickCaptureBar from '../../components/ui/QuickCaptureBar';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import SearchHeader from './components/SearchHeader';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import SearchAnalytics from './components/SearchAnalytics';
import SavedSearches from './components/SavedSearches';

const SearchAndDiscovery = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('results');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const { notifications, showSuccess, showInfo, dismissNotification } = useNotifications();

  const searchQuery = searchParams?.get('q') || '';

  useEffect(() => {
    // Set default tab based on whether there's a search query
    if (searchQuery) {
      setActiveTab('results');
    } else {
      setActiveTab('saved');
    }
  }, [searchQuery]);

  useEffect(() => {
    // Check if there are active filters
    const filterCount = Object.keys(appliedFilters)?.filter(key => {
      const value = appliedFilters?.[key];
      if (Array.isArray(value)) {
        return value?.length > 0 && !value?.includes('all');
      }
      return value && value !== 'all';
    })?.length;
    
    setHasActiveFilters(filterCount > 0);
  }, [appliedFilters]);

  const handleFiltersToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    showSuccess('Filters applied successfully');
  };

  const tabs = [
    { id: 'results', label: 'Search Results', icon: 'Search' },
    { id: 'saved', label: 'Saved Searches', icon: 'Bookmark' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        return <SearchResults searchQuery={searchQuery} filters={appliedFilters} />;
      case 'saved':
        return <SavedSearches />;
      case 'analytics':
        return <SearchAnalytics />;
      default:
        return <SearchResults searchQuery={searchQuery} filters={appliedFilters} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickCaptureBar />
      {/* Search Header */}
      <SearchHeader 
        onFiltersToggle={handleFiltersToggle}
        hasActiveFilters={hasActiveFilters}
      />
      {/* Tab Navigation */}
      <div className="bg-background border-b border-border sticky top-32 z-30">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <nav className="flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-micro ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground hover:border-border'
                }`}
              >
                <span>{tab?.label}</span>
                {tab?.id === 'results' && searchQuery && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    24
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <main className={`transition-all duration-300 ${showFilters ? 'lg:mr-80' : ''}`}>
        <div className="pb-20 md:pb-6">
          {renderTabContent()}
        </div>
      </main>
      {/* Search Filters Sidebar */}
      <SearchFilters
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
      {/* Notifications */}
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 z-50 hidden lg:block">
        <div className="bg-card border border-border rounded-lg p-3 shadow-soft">
          <div className="text-xs text-text-secondary space-y-1">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">K</kbd>
              <span>Quick search</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
              <span>Toggle filters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndDiscovery;