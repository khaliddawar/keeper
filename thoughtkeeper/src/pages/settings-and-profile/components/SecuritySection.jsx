import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useNotifications } from '../../../components/ui/NotificationToast';

const SecuritySection = () => {
  const { showSuccess, showError } = useNotifications();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: true,
    loginNotifications: true,
    deviceTracking: true,
    dataEncryption: true
  });

  const activeSessions = [
    {
      id: 1,
      device: "MacBook Pro",
      browser: "Chrome 118.0",
      location: "San Francisco, CA",
      lastActive: "Active now",
      current: true
    },
    {
      id: 2,
      device: "iPhone 15",
      browser: "Safari Mobile",
      location: "San Francisco, CA",
      lastActive: "2 hours ago",
      current: false
    },
    {
      id: 3,
      device: "Windows PC",
      browser: "Edge 118.0",
      location: "New York, NY",
      lastActive: "3 days ago",
      current: false
    }
  ];

  const securityEvents = [
    {
      id: 1,
      type: "login",
      description: "Successful login from Chrome on MacBook Pro",
      timestamp: "2025-08-17 10:30 AM",
      location: "San Francisco, CA"
    },
    {
      id: 2,
      type: "password_change",
      description: "Password changed successfully",
      timestamp: "2025-08-15 02:15 PM",
      location: "San Francisco, CA"
    },
    {
      id: 3,
      type: "failed_login",
      description: "Failed login attempt",
      timestamp: "2025-08-14 11:45 PM",
      location: "Unknown location"
    }
  ];

  const handlePasswordChange = async () => {
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      showError("New passwords don't match!");
      return;
    }

    if (passwordData?.newPassword?.length < 8) {
      showError("Password must be at least 8 characters long!");
      return;
    }

    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    setSaving(false);
    showSuccess("Password changed successfully!");
  };

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingChange = (setting, value) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleTerminateSession = (sessionId) => {
    showSuccess("Session terminated successfully!");
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    showSuccess(twoFactorEnabled ? "Two-factor authentication disabled!" : "Two-factor authentication enabled!");
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'login':
        return 'LogIn';
      case 'password_change':
        return 'Key';
      case 'failed_login':
        return 'AlertTriangle';
      default:
        return 'Shield';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'login':
        return 'text-success';
      case 'password_change':
        return 'text-primary';
      case 'failed_login':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Key" size={20} className="mr-2" />
          Password & Authentication
        </h3>
        
        <div className="space-y-4">
          {!isChangingPassword ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium text-foreground">Password</div>
                <div className="text-xs text-text-secondary">Last changed 3 days ago</div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                iconName="Edit"
                iconPosition="left"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <Input
                label="Current Password"
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e?.target?.value)}
                placeholder="Enter current password"
                required
              />
              
              <Input
                label="New Password"
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => handleInputChange('newPassword', e?.target?.value)}
                placeholder="Enter new password"
                description="Must be at least 8 characters long"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                placeholder="Confirm new password"
                required
              />
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={handlePasswordChange}
                  loading={isSaving}
                  iconName="Save"
                  iconPosition="left"
                >
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
              <div className="text-xs text-text-secondary">
                {twoFactorEnabled ? 'Enabled - Extra security for your account' : 'Add an extra layer of security'}
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? "destructive" : "default"}
              onClick={handleEnable2FA}
              iconName={twoFactorEnabled ? "ShieldOff" : "Shield"}
              iconPosition="left"
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>
      {/* Security Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2" />
          Security Settings
        </h3>
        
        <div className="space-y-3">
          <Checkbox
            label="Auto-logout after inactivity"
            description="Automatically sign out after 30 minutes of inactivity"
            checked={securitySettings?.sessionTimeout}
            onChange={(e) => handleSecuritySettingChange('sessionTimeout', e?.target?.checked)}
          />
          
          <Checkbox
            label="Login notifications"
            description="Get notified when someone signs into your account"
            checked={securitySettings?.loginNotifications}
            onChange={(e) => handleSecuritySettingChange('loginNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Device tracking"
            description="Keep track of devices that access your account"
            checked={securitySettings?.deviceTracking}
            onChange={(e) => handleSecuritySettingChange('deviceTracking', e?.target?.checked)}
          />
          
          <Checkbox
            label="Data encryption"
            description="Encrypt your thoughts and tasks for additional security"
            checked={securitySettings?.dataEncryption}
            onChange={(e) => handleSecuritySettingChange('dataEncryption', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Active Sessions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Monitor" size={20} className="mr-2" />
          Active Sessions
        </h3>
        
        <div className="space-y-3">
          {activeSessions?.map((session) => (
            <div key={session?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Monitor" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground flex items-center">
                    {session?.device}
                    {session?.current && (
                      <span className="ml-2 px-2 py-1 bg-success text-success-foreground text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {session?.browser} • {session?.location}
                  </div>
                  <div className="text-xs text-text-secondary">{session?.lastActive}</div>
                </div>
              </div>
              {!session?.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session?.id)}
                  iconName="X"
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Security Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Activity" size={20} className="mr-2" />
          Recent Security Activity
        </h3>
        
        <div className="space-y-3">
          {securityEvents?.map((event) => (
            <div key={event?.id} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-micro">
              <div className={`mt-1 ${getEventColor(event?.type)}`}>
                <Icon name={getEventIcon(event?.type)} size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-foreground">{event?.description}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {event?.timestamp} • {event?.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" fullWidth iconName="Eye" iconPosition="left">
            View All Security Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;