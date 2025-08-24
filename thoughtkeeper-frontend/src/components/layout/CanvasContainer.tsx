import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';

/**
 * CanvasContainer - Main layout wrapper component
 * 
 * Features:
 * - Responsive canvas with optimized padding (8px mobile, 16px desktop, 32px large)
 * - Rounded corners (16px mobile, 24px desktop, 32px large)
 * - Multi-layer shadow for depth
 * - Gradient background with subtle radial overlays
 * - Centered layout with max-width constraint
 * - Flex layout for sidebar + main content
 */

interface CanvasContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <motion.div
      className={`canvas-container canvas-gradient ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {/* Custom Layout or Default Three-Panel Layout */}
      {children ? (
        children
      ) : (
        <>
          {/* Left Sidebar - Navigation */}
          <Sidebar />
          
          {/* Main Content Area */}
          <MainContent />
          
          {/* Right Panel - Notebook Details */}
          <RightPanel />
        </>
      )}
    </motion.div>
  );
};

export default CanvasContainer;
