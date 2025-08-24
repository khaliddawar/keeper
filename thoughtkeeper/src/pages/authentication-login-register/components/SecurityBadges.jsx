import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-xs text-text-secondary">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={14} className="text-success" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Lock" size={14} className="text-success" />
          <span>GDPR Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Eye" size={14} className="text-success" />
          <span>Privacy Protected</span>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs text-text-secondary">
          Your data is encrypted and secure. We never share your personal information.
        </p>
      </div>
    </div>
  );
};

export default SecurityBadges;