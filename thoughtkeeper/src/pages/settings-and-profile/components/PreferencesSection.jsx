import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useNotifications } from '../../../components/ui/NotificationToast';

const PreferencesSection = () => {
  const { showSuccess } = useNotifications();
  const [preferences, setPreferences] = useState({
    theme: 'auto',
    autoSaveInterval: '30',
    defaultView: 'stream',
    keyboardShortcuts: true,
    soundEffects: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    thoughtReminders: false
  });

  const [isSaving, setSaving] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const autoSaveOptions = [
    { value: '10', label: 'Every 10 seconds' },
    { value: '30', label: 'Every 30 seconds' },
    { value: '60', label: 'Every minute' },
    { value: '300', label: 'Every 5 minutes' },
    { value: 'manual', label: 'Manual save only' }
  ];

  const defaultViewOptions = [
    { value: 'stream', label: 'Thought Stream' },
    { value: 'grid', label: 'Grid View' },
    { value: 'list', label: 'List View' },
    { value: 'kanban', label: 'Kanban Board' }
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl + N', action: 'New Thought' },
    { key: 'Ctrl + S', action: 'Save Current' },
    { key: 'Ctrl + F', action: 'Search' },
    { key: 'Ctrl + K', action: 'Quick Actions' },
    { key: 'Esc', action: 'Close Modals' }
  ];

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSaving(false);
    showSuccess("Preferences saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Palette" size={20} className="mr-2" />
          Appearance
        </h3>
        <div className="space-y-4">
          <Select
            label="Theme"
            description="Choose your preferred color theme"
            options={themeOptions}
            value={preferences?.theme}
            onChange={(value) => handlePreferenceChange('theme', value)}
          />
          
          <Select
            label="Default View"
            description="Set the default view when opening the app"
            options={defaultViewOptions}
            value={preferences?.defaultView}
            onChange={(value) => handlePreferenceChange('defaultView', value)}
          />
        </div>
      </div>
      {/* Behavior Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Settings" size={20} className="mr-2" />
          Behavior
        </h3>
        <div className="space-y-4">
          <Select
            label="Auto-save Interval"
            description="How often to automatically save your thoughts"
            options={autoSaveOptions}
            value={preferences?.autoSaveInterval}
            onChange={(value) => handlePreferenceChange('autoSaveInterval', value)}
          />
          
          <div className="space-y-3">
            <Checkbox
              label="Enable keyboard shortcuts"
              description="Use keyboard shortcuts for quick actions"
              checked={preferences?.keyboardShortcuts}
              onChange={(e) => handlePreferenceChange('keyboardShortcuts', e?.target?.checked)}
            />
            
            <Checkbox
              label="Sound effects"
              description="Play sounds for actions and notifications"
              checked={preferences?.soundEffects}
              onChange={(e) => handlePreferenceChange('soundEffects', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Keyboard Shortcuts */}
      {preferences?.keyboardShortcuts && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Icon name="Keyboard" size={20} className="mr-2" />
            Keyboard Shortcuts
          </h3>
          <div className="space-y-3">
            {keyboardShortcuts?.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{shortcut?.action}</span>
                <div className="flex items-center space-x-1">
                  {shortcut?.key?.split(' + ')?.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      {keyIndex > 0 && <span className="text-text-secondary">+</span>}
                      <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Bell" size={20} className="mr-2" />
          Notifications
        </h3>
        <div className="space-y-3">
          <Checkbox
            label="Email notifications"
            description="Receive important updates via email"
            checked={preferences?.emailNotifications}
            onChange={(e) => handlePreferenceChange('emailNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Push notifications"
            description="Get browser notifications for new activity"
            checked={preferences?.pushNotifications}
            onChange={(e) => handlePreferenceChange('pushNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Weekly digest"
            description="Receive a weekly summary of your thoughts and tasks"
            checked={preferences?.weeklyDigest}
            onChange={(e) => handlePreferenceChange('weeklyDigest', e?.target?.checked)}
          />
          
          <Checkbox
            label="Thought reminders"
            description="Get reminded about incomplete thoughts and tasks"
            checked={preferences?.thoughtReminders}
            onChange={(e) => handlePreferenceChange('thoughtReminders', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={handleSavePreferences}
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesSection;