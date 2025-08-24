import React from 'react';
import { motion } from 'framer-motion';
import TaskHeader from '../tasks/TaskHeader';
import TaskManagementArea from '../tasks/TaskManagementArea';

/**
 * MainContent - Central content area component
 * 
 * Features:
 * - Responsive layout that adjusts to sidebar expansion
 * - Smooth margin transitions (margin-left: 0 → 176px when sidebar expands)
 * - Mobile-safe behavior (no margin adjustments on mobile)
 * - Flex column layout for header + content
 * - Proper overflow handling for content scrolling
 * - Animation entrance effects
 */

interface MainContentProps {
  className?: string;
  children?: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <motion.main 
      className={`main-content ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        delay: 0.1 
      }}
    >
      {/* Header Section */}
      <div className="flex-shrink-0 bg-bg-primary border-b border-gray-100">
        <TaskHeader />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {children ? (
          children
        ) : (
          <TaskManagementArea />
        )}
      </div>
    </motion.main>
  );
};

export default MainContent;
