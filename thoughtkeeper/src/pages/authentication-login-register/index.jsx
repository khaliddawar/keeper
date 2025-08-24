import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import AuthToggle from './components/AuthToggle';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AuthBackground from './components/AuthBackground';
import SecurityBadges from './components/SecurityBadges';
import NotificationMessage from './components/NotificationMessage';

const AuthenticationPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    // Clear notification when switching between login/register
    setNotification({ message: '', type: '' });
  }, [isLogin]);

  const handleAuthToggle = (loginMode) => {
    setIsLogin(loginMode);
  };

  const handleError = (message) => {
    setNotification({ message, type: 'error' });
  };

  const handleSuccess = (message) => {
    setNotification({ message, type: 'success' });
  };

  const clearNotification = () => {
    setNotification({ message: '', type: '' });
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} - ThoughtKeeper</title>
        <meta 
          name="description" 
          content={isLogin 
            ? "Sign in to your ThoughtKeeper account to access your personal thought capture workspace." :"Create your ThoughtKeeper account and start organizing your thoughts into actionable insights."
          } 
        />
      </Helmet>
      <div className="min-h-screen bg-background flex">
        {/* Left Side - Auth Form */}
        <div className="flex-1 lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="Brain" size={28} color="white" />
                </div>
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-text-secondary">
                {isLogin 
                  ? 'Sign in to access your thought workspace' :'Start capturing and organizing your thoughts'
                }
              </p>
            </div>

            {/* Auth Toggle */}
            <AuthToggle isLogin={isLogin} onToggle={handleAuthToggle} />

            {/* Notification */}
            <NotificationMessage
              message={notification?.message}
              type={notification?.type}
              onClose={clearNotification}
            />

            {/* Auth Form */}
            {isLogin ? (
              <LoginForm onError={handleError} onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onError={handleError} onSuccess={handleSuccess} />
            )}

            {/* Security Badges */}
            <SecurityBadges />

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-text-secondary">
                © {new Date()?.getFullYear()} ThoughtKeeper. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Background Content */}
        <AuthBackground />
      </div>
    </>
  );
};

export default AuthenticationPage;