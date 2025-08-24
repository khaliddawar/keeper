import React, { useState } from 'react';
import { usePWA } from '../OfflineSupportProvider';

/**
 * PWA Install Prompt Component
 * 
 * Displays installation prompts for Progressive Web App functionality,
 * handles user dismissals, and provides installation guidance.
 */
interface PWAInstallPromptProps {
  layout?: 'compact' | 'detailed' | 'banner';
  showDismiss?: boolean;
  autoShow?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  layout = 'detailed',
  showDismiss = true,
  autoShow = false
}) => {
  const { 
    pwaStatus, 
    serviceWorkerStatus, 
    canInstall, 
    isUpdateAvailable, 
    showInstallPrompt, 
    installUpdate, 
    dismissInstallPrompt 
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Handle installation
  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await showInstallPrompt();
      if (installed) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Handle update installation
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await installUpdate();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle dismissal
  const handleDismiss = () => {
    setIsDismissed(true);
    dismissInstallPrompt();
  };

  // Don't show if dismissed or conditions not met
  if (isDismissed || (!canInstall && !isUpdateAvailable)) {
    return null;
  }

  // Don't show if user has dismissed too many times
  if (pwaStatus.userDismissedCount >= 3 && !autoShow) {
    return null;
  }

  // Get installation benefits
  const getInstallBenefits = () => [
    '🚀 Faster loading and better performance',
    '📱 Native app-like experience',
    '📴 Works offline with cached data',
    '🔔 Push notifications (coming soon)',
    '🏠 Add to home screen for quick access',
    '💾 Automatic updates in background'
  ];

  // Banner layout for minimal prompts
  if (layout === 'banner') {
    return (
      <div className="pwa-install-prompt pwa-install-prompt--banner">
        <div className="pwa-install-prompt__banner-content">
          <div className="pwa-install-prompt__banner-info">
            <span className="pwa-install-prompt__banner-icon">📱</span>
            <div className="pwa-install-prompt__banner-text">
              {isUpdateAvailable ? (
                <>
                  <strong>App Update Available!</strong>
                  <span>Restart to get the latest features</span>
                </>
              ) : (
                <>
                  <strong>Install ThoughtKeeper</strong>
                  <span>Get the full app experience</span>
                </>
              )}
            </div>
          </div>

          <div className="pwa-install-prompt__banner-actions">
            {isUpdateAvailable ? (
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="pwa-install-prompt__banner-btn pwa-install-prompt__banner-btn--primary"
              >
                {isUpdating ? '🔄' : '⬆️'} {isUpdating ? 'Updating...' : 'Update'}
              </button>
            ) : (
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="pwa-install-prompt__banner-btn pwa-install-prompt__banner-btn--primary"
              >
                {isInstalling ? '🔄' : '📱'} {isInstalling ? 'Installing...' : 'Install'}
              </button>
            )}

            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="pwa-install-prompt__banner-btn pwa-install-prompt__banner-btn--dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <style>{`
          .pwa-install-prompt--banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease-out;
          }

          .pwa-install-prompt__banner-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .pwa-install-prompt__banner-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pwa-install-prompt__banner-icon {
            font-size: 1.5rem;
          }

          .pwa-install-prompt__banner-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .pwa-install-prompt__banner-text strong {
            font-size: 0.875rem;
            font-weight: 600;
          }

          .pwa-install-prompt__banner-text span {
            font-size: 0.75rem;
            opacity: 0.9;
          }

          .pwa-install-prompt__banner-actions {
            display: flex;
            gap: 8px;
          }

          .pwa-install-prompt__banner-btn {
            padding: 6px 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .pwa-install-prompt__banner-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.3);
          }

          .pwa-install-prompt__banner-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pwa-install-prompt__banner-btn--primary {
            background: rgba(16, 185, 129, 0.8);
            border-color: rgba(16, 185, 129, 1);
          }

          .pwa-install-prompt__banner-btn--dismiss {
            width: 28px;
            height: 28px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          @keyframes slideDown {
            from {
              transform: translateY(-100%);
            }
            to {
              transform: translateY(0);
            }
          }

          /* Responsive */
          @media (max-width: 640px) {
            .pwa-install-prompt__banner-content {
              padding: 8px 16px;
            }

            .pwa-install-prompt__banner-info {
              gap: 8px;
            }

            .pwa-install-prompt__banner-text {
              display: none;
            }

            .pwa-install-prompt__banner-actions {
              gap: 4px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Compact layout
  if (layout === 'compact') {
    return (
      <div className="pwa-install-prompt pwa-install-prompt--compact">
        <div className="pwa-install-prompt__header">
          <div className="pwa-install-prompt__icon">
            {isUpdateAvailable ? '⬆️' : '📱'}
          </div>
          <div className="pwa-install-prompt__title">
            {isUpdateAvailable ? 'Update Available' : 'Install App'}
          </div>
        </div>

        <div className="pwa-install-prompt__description">
          {isUpdateAvailable 
            ? 'Get the latest features and improvements' 
            : 'Install for a better, faster experience'
          }
        </div>

        <div className="pwa-install-prompt__actions">
          {isUpdateAvailable ? (
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="pwa-install-prompt__btn pwa-install-prompt__btn--primary"
            >
              {isUpdating ? '🔄' : '⬆️'} {isUpdating ? 'Updating...' : 'Update'}
            </button>
          ) : (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="pwa-install-prompt__btn pwa-install-prompt__btn--primary"
            >
              {isInstalling ? '🔄' : '📱'} {isInstalling ? 'Installing...' : 'Install'}
            </button>
          )}

          {showDismiss && (
            <button
              onClick={handleDismiss}
              className="pwa-install-prompt__btn pwa-install-prompt__btn--secondary"
            >
              Maybe Later
            </button>
          )}
        </div>

        <style>{`
          .pwa-install-prompt--compact {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            max-width: 300px;
          }

          .pwa-install-prompt__header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .pwa-install-prompt__icon {
            font-size: 1.25rem;
          }

          .pwa-install-prompt__title {
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
          }

          .pwa-install-prompt__description {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 16px;
            line-height: 1.4;
          }

          .pwa-install-prompt__actions {
            display: flex;
            gap: 8px;
          }

          .pwa-install-prompt__btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .pwa-install-prompt__btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pwa-install-prompt__btn--primary {
            background: #3b82f6;
            color: white;
          }

          .pwa-install-prompt__btn--primary:hover:not(:disabled) {
            background: #2563eb;
          }

          .pwa-install-prompt__btn--secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .pwa-install-prompt__btn--secondary:hover:not(:disabled) {
            background: #e5e7eb;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .pwa-install-prompt--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .pwa-install-prompt__title {
              color: #f1f5f9;
            }

            .pwa-install-prompt__description {
              color: #94a3b8;
            }

            .pwa-install-prompt__btn--secondary {
              background: #374151;
              color: #f9fafb;
              border-color: #4b5563;
            }

            .pwa-install-prompt__btn--secondary:hover:not(:disabled) {
              background: #4b5563;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout (default)
  return (
    <div className="pwa-install-prompt pwa-install-prompt--detailed">
      {/* Header */}
      <div className="pwa-install-prompt__header">
        <div className="pwa-install-prompt__app-info">
          <div className="pwa-install-prompt__app-icon">📱</div>
          <div className="pwa-install-prompt__app-details">
            <h3 className="pwa-install-prompt__app-name">ThoughtKeeper</h3>
            <p className="pwa-install-prompt__app-description">
              {isUpdateAvailable 
                ? 'A new version is available with improvements and bug fixes.'
                : 'Transform your browser experience into a native app-like interface.'
              }
            </p>
          </div>
        </div>

        {showDismiss && (
          <button
            onClick={handleDismiss}
            className="pwa-install-prompt__dismiss-btn"
            title="Dismiss"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Information */}
      <div className="pwa-install-prompt__status">
        <div className="pwa-install-prompt__status-item">
          <span className="pwa-install-prompt__status-label">Status:</span>
          <span className="pwa-install-prompt__status-value">
            {pwaStatus.isInstalled ? 'Installed' : 
             isUpdateAvailable ? 'Update Available' :
             canInstall ? 'Ready to Install' : 'Not Available'}
          </span>
        </div>

        {pwaStatus.installationDate && (
          <div className="pwa-install-prompt__status-item">
            <span className="pwa-install-prompt__status-label">Installed:</span>
            <span className="pwa-install-prompt__status-value">
              {new Date(pwaStatus.installationDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="pwa-install-prompt__status-item">
          <span className="pwa-install-prompt__status-label">Service Worker:</span>
          <span className="pwa-install-prompt__status-value">
            {serviceWorkerStatus.isActive ? '✅ Active' : 
             serviceWorkerStatus.isInstalling ? '🔄 Installing' :
             serviceWorkerStatus.isRegistered ? '⏳ Registered' : '❌ Not Available'}
          </span>
        </div>
      </div>

      {/* Benefits */}
      {!isUpdateAvailable && !pwaStatus.isInstalled && (
        <div className="pwa-install-prompt__benefits">
          <h4 className="pwa-install-prompt__benefits-title">Why Install?</h4>
          <div className="pwa-install-prompt__benefits-list">
            {getInstallBenefits().map((benefit, index) => (
              <div key={index} className="pwa-install-prompt__benefit-item">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Information */}
      {isUpdateAvailable && (
        <div className="pwa-install-prompt__update-info">
          <h4 className="pwa-install-prompt__update-title">🚀 What's New</h4>
          <div className="pwa-install-prompt__update-notes">
            <div className="pwa-install-prompt__update-item">
              ✨ Performance improvements and bug fixes
            </div>
            <div className="pwa-install-prompt__update-item">
              🔧 Enhanced offline capabilities
            </div>
            <div className="pwa-install-prompt__update-item">
              🎨 UI/UX improvements
            </div>
            <div className="pwa-install-prompt__update-item">
              🔐 Security updates
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pwa-install-prompt__actions">
        {isUpdateAvailable ? (
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="pwa-install-prompt__action-btn pwa-install-prompt__action-btn--primary"
          >
            {isUpdating ? '🔄 Updating...' : '⬆️ Update Now'}
          </button>
        ) : (
          <button
            onClick={handleInstall}
            disabled={isInstalling || !canInstall}
            className="pwa-install-prompt__action-btn pwa-install-prompt__action-btn--primary"
          >
            {isInstalling ? '🔄 Installing...' : '📱 Install App'}
          </button>
        )}

        {showDismiss && !isUpdateAvailable && (
          <button
            onClick={handleDismiss}
            className="pwa-install-prompt__action-btn pwa-install-prompt__action-btn--secondary"
          >
            Maybe Later
          </button>
        )}
      </div>

      {/* Installation Instructions */}
      {!pwaStatus.isInstallable && !isUpdateAvailable && (
        <div className="pwa-install-prompt__instructions">
          <h4 className="pwa-install-prompt__instructions-title">Manual Installation</h4>
          <div className="pwa-install-prompt__instructions-list">
            <div className="pwa-install-prompt__instruction-item">
              <strong>Chrome/Edge:</strong> Click the install icon in the address bar
            </div>
            <div className="pwa-install-prompt__instruction-item">
              <strong>Safari (iOS):</strong> Tap Share → Add to Home Screen
            </div>
            <div className="pwa-install-prompt__instruction-item">
              <strong>Firefox:</strong> Look for "Install" in the address bar menu
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pwa-install-prompt--detailed {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .pwa-install-prompt__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .pwa-install-prompt__app-info {
          display: flex;
          gap: 16px;
          flex: 1;
        }

        .pwa-install-prompt__app-icon {
          font-size: 3rem;
          line-height: 1;
        }

        .pwa-install-prompt__app-name {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .pwa-install-prompt__app-description {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.4;
          opacity: 0.9;
        }

        .pwa-install-prompt__dismiss-btn {
          padding: 4px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-install-prompt__dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .pwa-install-prompt__status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .pwa-install-prompt__status-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .pwa-install-prompt__status-label {
          color: #64748b;
          font-weight: 500;
        }

        .pwa-install-prompt__status-value {
          color: #1e293b;
          font-weight: 600;
        }

        .pwa-install-prompt__benefits {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pwa-install-prompt__benefits-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .pwa-install-prompt__benefits-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pwa-install-prompt__benefit-item {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.4;
        }

        .pwa-install-prompt__update-info {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pwa-install-prompt__update-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .pwa-install-prompt__update-notes {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pwa-install-prompt__update-item {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.4;
        }

        .pwa-install-prompt__actions {
          display: flex;
          gap: 12px;
          padding: 20px;
        }

        .pwa-install-prompt__action-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-install-prompt__action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pwa-install-prompt__action-btn--primary {
          background: #3b82f6;
          color: white;
        }

        .pwa-install-prompt__action-btn--primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .pwa-install-prompt__action-btn--secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .pwa-install-prompt__action-btn--secondary:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .pwa-install-prompt__instructions {
          padding: 20px;
          background: #f8fafc;
        }

        .pwa-install-prompt__instructions-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .pwa-install-prompt__instructions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pwa-install-prompt__instruction-item {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.4;
        }

        .pwa-install-prompt__instruction-item strong {
          color: #1e293b;
          font-weight: 600;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .pwa-install-prompt--detailed {
            background: #1e293b;
            border-color: #334155;
          }

          .pwa-install-prompt__status {
            background: #0f172a;
            border-color: #334155;
          }

          .pwa-install-prompt__status-label {
            color: #94a3b8;
          }

          .pwa-install-prompt__status-value {
            color: #f1f5f9;
          }

          .pwa-install-prompt__benefits-title,
          .pwa-install-prompt__update-title,
          .pwa-install-prompt__instructions-title {
            color: #f1f5f9;
          }

          .pwa-install-prompt__benefit-item,
          .pwa-install-prompt__update-item,
          .pwa-install-prompt__instruction-item {
            color: #e2e8f0;
          }

          .pwa-install-prompt__instruction-item strong {
            color: #f1f5f9;
          }

          .pwa-install-prompt__action-btn--secondary {
            background: #374151;
            color: #f9fafb;
            border-color: #4b5563;
          }

          .pwa-install-prompt__action-btn--secondary:hover:not(:disabled) {
            background: #4b5563;
            border-color: #6b7280;
          }

          .pwa-install-prompt__instructions {
            background: #0f172a;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .pwa-install-prompt__header {
            padding: 16px;
          }

          .pwa-install-prompt__app-info {
            gap: 12px;
          }

          .pwa-install-prompt__app-icon {
            font-size: 2.5rem;
          }

          .pwa-install-prompt__actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
