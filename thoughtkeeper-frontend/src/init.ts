/**
 * Application Initialization
 * 
 * Sets up the app with initial data, stores, and configurations
 */

import { initializeStores } from './stores';
import { DevUtils } from './mocks';

/**
 * Initialize the ThoughtKeeper application
 * 
 * This function should be called once when the app starts
 */
export const initializeApp = async () => {
  console.log('🚀 Initializing ThoughtKeeper...');
  
  try {
    // Initialize all stores with mock data
    await initializeStores();
    
    // Development-only setup
    if (process.env.NODE_ENV === 'development') {
      // Log initial data state
      DevUtils.logDataState();
      
      // Analyze relationships for development insight
      DevUtils.analyzeRelationships();
      
      console.log('🛠️ Development mode active - additional tools available');
      console.log('  - window.ThoughtKeeperDevUtils for data utilities');
      console.log('  - window.MockApiService for API simulation');
      console.log('  - window.stores for store access');
    }
    
    console.log('✅ ThoughtKeeper initialized successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize ThoughtKeeper:', error);
    
    // Show user-friendly error in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔧 Troubleshooting Tips:');
      console.log('1. Check browser console for detailed errors');
      console.log('2. Try refreshing the page');
      console.log('3. Clear browser cache and local storage');
      console.log('4. Run DevUtils.resetData() to reset mock data');
      console.groupEnd();
    }
    
    return false;
  }
};

/**
 * Cleanup function for app shutdown or hot reload
 */
export const cleanupApp = () => {
  console.log('🧹 Cleaning up ThoughtKeeper...');
  // Add cleanup logic if needed
};

/**
 * Development utilities for manual initialization
 */
export const DevInit = {
  /**
   * Reinitialize the app (useful during development)
   */
  reinitialize: async () => {
    console.log('🔄 Reinitializing ThoughtKeeper...');
    cleanupApp();
    return await initializeApp();
  },
  
  /**
   * Reset all data and reinitialize
   */
  resetAndReinitialize: async () => {
    console.log('🗑️ Resetting data and reinitializing...');
    if (typeof window !== 'undefined' && (window as any).ThoughtKeeperDevUtils) {
      (window as any).ThoughtKeeperDevUtils.resetData();
    }
    return await DevInit.reinitialize();
  },
  
  /**
   * Test error handling by simulating initialization failure
   */
  simulateInitError: async () => {
    console.log('🧪 Simulating initialization error...');
    throw new Error('Simulated initialization failure for testing');
  }
};

// Make development utilities available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).DevInit = DevInit;
  console.log('🛠️ DevInit utilities available at window.DevInit');
}

export default initializeApp;
