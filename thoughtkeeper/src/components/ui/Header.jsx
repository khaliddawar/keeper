import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard-thought-stream', icon: 'Home' },
    { label: 'Organize', path: '/thought-organization', icon: 'FolderOpen' },
    { label: 'Discover', path: '/search-and-discovery', icon: 'Search' },
    { label: 'Tasks', path: '/task-management', icon: 'CheckSquare' },
  ];

  const isActive = (path) => location?.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate(`/search-and-discovery?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleProfileNavigation = (path) => {
    navigate(path);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => handleNavigation('/dashboard-thought-stream')}
            className="flex items-center space-x-2 transition-micro hover:opacity-80"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Brain" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">ThoughtKeeper</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-micro ${
                isActive(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </button>
          ))}
        </nav>

        {/* Search and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Search thoughts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-64 pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-micro"
              />
            </div>
          </form>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/search-and-discovery')}
            className="sm:hidden"
          >
            <Icon name="Search" size={20} />
          </Button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={handleProfileMenuToggle}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-micro"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-lg shadow-elevated z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleProfileNavigation('/settings-and-profile')}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-micro"
                  >
                    <Icon name="Settings" size={16} />
                    <span>Settings & Profile</span>
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => handleProfileNavigation('/authentication-login-register')}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-micro"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-background border-t border-border">
        <nav className="flex items-center justify-around h-16 px-4">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-micro ${
                isActive(item?.path)
                  ? 'text-primary' :'text-text-secondary hover:text-foreground'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-medium">{item?.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Mobile Search Overlay Backdrop */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;