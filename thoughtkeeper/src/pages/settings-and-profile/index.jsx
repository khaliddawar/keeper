import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';

import Header from '../../components/ui/Header';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import ProfileSection from './components/ProfileSection';
import PreferencesSection from './components/PreferencesSection';
import DataSection from './components/DataSection';
import SecuritySection from './components/SecuritySection';

const SettingsAndProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { notifications, removeNotification } = useNotifications();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' },
    { id: 'data', label: 'Data', icon: 'Database' },
    { id: 'security', label: 'Security', icon: 'Shield' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'data':
        return <DataSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Settings & Profile - ThoughtKeeper</title>
        <meta name="description" content="Manage your account settings, preferences, and profile information in ThoughtKeeper" />
      </Helmet>
      <Header />
      <div className="pt-16 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-2">
              <span>ThoughtKeeper</span>
              <Icon name="ChevronRight" size={16} />
              <span>Settings</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Settings & Profile</h1>
            <p className="text-text-secondary mt-2">
              Manage your account settings, preferences, and personal information
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-2 sticky top-24">
                <nav className="space-y-1">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-micro ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-secondary hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden">
              <div className="bg-card border border-border rounded-lg p-1 mb-6">
                <div className="grid grid-cols-4 gap-1">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex flex-col items-center space-y-1 p-3 rounded-lg text-xs font-medium transition-micro ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-secondary hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-surface border border-border rounded-lg">
                {/* Tab Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon 
                        name={tabs?.find(tab => tab?.id === activeTab)?.icon || 'Settings'} 
                        size={16} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {tabs?.find(tab => tab?.id === activeTab)?.label}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {activeTab === 'profile' && 'Manage your personal information and account details'}
                        {activeTab === 'preferences' && 'Customize your ThoughtKeeper experience'}
                        {activeTab === 'data' && 'Export, import, and manage your data'}
                        {activeTab === 'security' && 'Secure your account and manage privacy settings'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationToast 
        notifications={notifications} 
        onDismiss={removeNotification} 
      />
    </div>
  );
};

export default SettingsAndProfile;