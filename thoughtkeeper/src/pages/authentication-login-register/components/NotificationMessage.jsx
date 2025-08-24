import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const NotificationMessage = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    if (message && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClose]);

  if (!message) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'error':
        return 'bg-error/10 border-error/20 text-error';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Info';
    }
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${getNotificationStyles()} animate-fade-in`}>
      <div className="flex items-start space-x-3">
        <Icon name={getIcon()} size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current hover:opacity-70 transition-micro"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationMessage;