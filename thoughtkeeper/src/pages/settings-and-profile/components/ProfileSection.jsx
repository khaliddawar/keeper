import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useNotifications } from '../../../components/ui/NotificationToast';

const ProfileSection = () => {
  const { showSuccess, showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "Alex Thompson",
    email: "alex.thompson@email.com",
    bio: "Product manager passionate about productivity and mindful thinking. Love capturing ideas and turning them into actionable insights.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  });

  const [formData, setFormData] = useState(profileData);

  const accountStats = [
    { label: "Total Thoughts", value: "1,247", icon: "FileText" },
    { label: "Active Tasks", value: "23", icon: "CheckSquare" },
    { label: "Folders Created", value: "8", icon: "Folder" },
    { label: "Days Active", value: "156", icon: "Calendar" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProfileData(formData);
    setIsEditing(false);
    setSaving(false);
    showSuccess("Profile updated successfully!");
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // Simulate avatar upload
    showSuccess("Avatar uploaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
              <Image
                src={profileData?.avatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background"
              onClick={handleAvatarUpload}
            >
              <Icon name="Camera" size={14} />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{profileData?.displayName}</h2>
                <p className="text-text-secondary">{profileData?.email}</p>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                iconName={isEditing ? "X" : "Edit"}
                iconPosition="left"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              {profileData?.bio}
            </p>
          </div>
        </div>
      </div>
      {/* Edit Form */}
      {isEditing && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Edit Profile Information</h3>
          <div className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              value={formData?.displayName}
              onChange={(e) => handleInputChange('displayName', e?.target?.value)}
              placeholder="Enter your display name"
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              placeholder="Enter your email"
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={formData?.bio}
                onChange={(e) => handleInputChange('bio', e?.target?.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full p-3 bg-input border border-border rounded-lg text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                variant="default"
                onClick={handleSave}
                loading={isSaving}
                iconName="Save"
                iconPosition="left"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Account Statistics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {accountStats?.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-muted rounded-lg">
              <div className="flex justify-center mb-2">
                <Icon name={stat?.icon} size={24} className="text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stat?.value}</div>
              <div className="text-sm text-text-secondary">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Account Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            iconName="Download"
            iconPosition="left"
            className="justify-start"
          >
            Download Account Data
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="RefreshCw"
            iconPosition="left"
            className="justify-start"
          >
            Reset Preferences
          </Button>
          <Button
            variant="destructive"
            fullWidth
            iconName="Trash2"
            iconPosition="left"
            className="justify-start"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;