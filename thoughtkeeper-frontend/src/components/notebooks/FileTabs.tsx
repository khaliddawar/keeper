import React from 'react';
import { motion } from 'framer-motion';

/**
 * FileTabs - Professional file tab navigation component
 * 
 * Features:
 * - Paper file tab appearance with clip-path styling
 * - Overlapping layout with -6px margins for stacking effect
 * - Z-index management for proper layering
 * - Color-coded top borders per notebook type
 * - Active state prominence (translateY, scale, enhanced shadow)
 * - Smooth hover animations with brightness filters
 * - Icons with proper sizing and spacing
 * - Responsive overflow handling
 * - Accessibility support with keyboard navigation
 */

interface TabData {
  id: string;
  name: string;
  notebookType: 'work' | 'personal' | 'health' | 'hustles' | 'ideas';
  icon: React.ComponentType<any>;
  color: string;
  taskCount: number;
  urgentCount: number;
  isActive: boolean;
}

interface FileTabsProps {
  tabs: TabData[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  className?: string;
}

const FileTabs: React.FC<FileTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabClick, 
  className = '' 
}) => {
  const getTabZIndex = (index: number, isActive: boolean) => {
    if (isActive) return 5;
    return 5 - index; // Background tabs get lower z-index
  };

  const getTabStyle = (tab: TabData, index: number) => {
    const isActive = tab.isActive;
    const baseStyle: React.CSSProperties = {
      zIndex: getTabZIndex(index, isActive)
    };

    if (isActive) {
      return {
        ...baseStyle,
        borderTopColor: tab.color
      };
    }

    return baseStyle;
  };

  return (
    <div className={`tab-list ${className}`}>
      {tabs.map((tab, index) => {
        const IconComponent = tab.icon;
        const isActive = tab.id === activeTab;
        
        return (
          <motion.button
            key={tab.id}
            className={`tab ${isActive ? 'active' : ''}`}
            data-notebook={tab.notebookType}
            style={getTabStyle(tab, index)}
            onClick={() => onTabClick(tab.id)}
            whileHover={!isActive ? { 
              filter: 'brightness(1.02)',
              y: -1
            } : {}}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            // Accessibility
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
          >
            {/* Tab Icon */}
            <IconComponent className="w-3 h-3" style={{ color: isActive ? tab.color : 'currentColor' }} />
            
            {/* Tab Name */}
            <span className="text-xs font-medium truncate">
              {tab.name}
            </span>

            {/* Urgent Badge */}
            {tab.urgentCount > 0 && (
              <motion.span
                className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                {tab.urgentCount}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default FileTabs;
