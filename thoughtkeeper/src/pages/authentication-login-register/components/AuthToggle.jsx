import React from 'react';

const AuthToggle = ({ isLogin, onToggle }) => {
  return (
    <div className="flex bg-muted rounded-lg p-1 mb-8">
      <button
        onClick={() => onToggle(true)}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-micro ${
          isLogin
            ? 'bg-background text-foreground shadow-soft'
            : 'text-text-secondary hover:text-foreground'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => onToggle(false)}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-micro ${
          !isLogin
            ? 'bg-background text-foreground shadow-soft'
            : 'text-text-secondary hover:text-foreground'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthToggle;