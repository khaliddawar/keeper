import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationToast = ({ notifications = [], onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev?.filter(notification => notification?.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success text-success-foreground border-success';
      case 'error':
        return 'bg-error text-error-foreground border-error';
      case 'warning':
        return 'bg-warning text-warning-foreground border-warning';
      case 'info':
        return 'bg-primary text-primary-foreground border-primary';
      default:
        return 'bg-card text-card-foreground border-border';
    }
  };

  if (visibleNotifications?.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[1200] space-y-2 max-w-sm w-full">
      {visibleNotifications?.map((notification, index) => (
        <div
          key={notification?.id}
          className={`
            ${getNotificationStyles(notification?.type)}
            border rounded-lg shadow-elevated p-4 animate-slide-in-right
            transition-all duration-300 ease-in-out
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icon 
                name={getNotificationIcon(notification?.type)} 
                size={20} 
                className="opacity-90"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              {notification?.title && (
                <h4 className="text-sm font-medium mb-1 truncate">
                  {notification?.title}
                </h4>
              )}
              <p className="text-sm opacity-90 leading-relaxed">
                {notification?.message}
              </p>
              
              {notification?.action && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={notification?.action?.onClick}
                    className="text-current hover:bg-white/20 p-2 h-auto"
                  >
                    {notification?.action?.label}
                  </Button>
                </div>
              )}
            </div>

            {notification?.dismissible !== false && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(notification?.id)}
                className="text-current hover:bg-white/20 flex-shrink-0 w-6 h-6"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>

          {/* Progress bar for auto-dismiss */}
          {notification?.duration && notification?.duration > 0 && (
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/40 rounded-full transition-all ease-linear"
                style={{
                  animation: `shrink ${notification?.duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      dismissible: true,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is set
    if (newNotification?.duration && newNotification?.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification?.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev?.filter(notification => notification?.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (message, options = {}) => {
    return addNotification({ ...options, type: 'success', message });
  };

  const showError = (message, options = {}) => {
    return addNotification({ ...options, type: 'error', message, duration: 0 });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({ ...options, type: 'warning', message });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({ ...options, type: 'info', message });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default NotificationToast;