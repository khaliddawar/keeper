import { useMemo, useCallback, useEffect } from 'react';
import { useUIStore } from '../stores';
import type { Toast, Modal, ThemeMode, ViewMode } from '../stores';

/**
 * useUI - Custom hook for UI state management
 * 
 * Features:
 * - View mode and layout management
 * - Toast notification system
 * - Modal management with z-index stacking
 * - Theme switching and system preference detection
 * - Keyboard shortcut registration
 * - Responsive breakpoint detection
 * - Loading state management
 * - Error handling utilities
 */

interface UseUIReturn {
  // View state
  viewMode: ViewMode;
  sidebarExpanded: boolean;
  rightPanelCollapsed: boolean;
  activeRightTab: string;
  
  // Theme
  theme: ThemeMode;
  isDarkMode: boolean;
  reducedMotion: boolean;
  
  // Overlay states
  searchOpen: boolean;
  quickCaptureOpen: boolean;
  commandPaletteOpen: boolean;
  
  // Notifications
  toasts: Toast[];
  hasToasts: boolean;
  
  // Modals
  modals: Modal[];
  hasModals: boolean;
  topModal: Modal | undefined;
  
  // Loading and errors
  globalLoading: boolean;
  globalError: string | null;
  hasError: boolean;
  
  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Actions - View Management
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleRightPanel: () => void;
  setActiveRightTab: (tabId: string) => void;
  
  // Actions - Theme Management
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setReducedMotion: (reduced: boolean) => void;
  
  // Actions - Overlays
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  toggleQuickCapture: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  closeAllOverlays: () => void;
  
  // Actions - Toast Management
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  showSuccess: (message: string, options?: Partial<Toast>) => string;
  showError: (message: string, options?: Partial<Toast>) => string;
  showWarning: (message: string, options?: Partial<Toast>) => string;
  showInfo: (message: string, options?: Partial<Toast>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  
  // Actions - Modal Management
  showModal: (modal: Omit<Modal, 'id'>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  
  // Actions - Loading and Error Management
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  isLoading: (key?: string) => boolean;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

export const useUI = (): UseUIReturn => {
  const store = useUIStore();
  
  // Memoized computed values
  const isDarkMode = useMemo(() => {
    if (store.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return store.theme === 'dark';
  }, [store.theme]);
  
  const hasToasts = useMemo(() => store.toasts.length > 0, [store.toasts.length]);
  
  const hasModals = useMemo(() => store.modals.length > 0, [store.modals.length]);
  
  const topModal = useMemo(() => store.getTopModal(), [store.modals]);
  
  const hasError = useMemo(() => store.globalError !== null, [store.globalError]);
  
  // Enhanced toast functions
  const showSuccess = useCallback((message: string, options: Partial<Toast> = {}) => {
    return store.showToast({
      type: 'success',
      message,
      ...options
    });
  }, [store]);
  
  const showError = useCallback((message: string, options: Partial<Toast> = {}) => {
    return store.showToast({
      type: 'error',
      message,
      duration: 6000, // Longer duration for errors
      ...options
    });
  }, [store]);
  
  const showWarning = useCallback((message: string, options: Partial<Toast> = {}) => {
    return store.showToast({
      type: 'warning',
      message,
      ...options
    });
  }, [store]);
  
  const showInfo = useCallback((message: string, options: Partial<Toast> = {}) => {
    return store.showToast({
      type: 'info',
      message,
      ...options
    });
  }, [store]);
  
  // Enhanced overlay management
  const openSearch = useCallback(() => store.setSearchOpen(true), [store]);
  const closeSearch = useCallback(() => store.setSearchOpen(false), [store]);
  const toggleSearch = useCallback(() => store.setSearchOpen(!store.searchOpen), [store]);
  
  const openQuickCapture = useCallback(() => store.setQuickCaptureOpen(true), [store]);
  const closeQuickCapture = useCallback(() => store.setQuickCaptureOpen(false), [store]);
  const toggleQuickCapture = useCallback(() => store.setQuickCaptureOpen(!store.quickCaptureOpen), [store]);
  
  const openCommandPalette = useCallback(() => store.setCommandPaletteOpen(true), [store]);
  const closeCommandPalette = useCallback(() => store.setCommandPaletteOpen(false), [store]);
  
  // System theme detection
  useEffect(() => {
    if (store.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        // Force re-render when system theme changes
        // The actual theme application is handled by the computed isDarkMode value
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [store.theme]);
  
  // Responsive state detection
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      store.setResponsiveState(isMobile, isTablet, isDesktop);
    };
    
    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, [store]);
  
  // Reduced motion detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    store.setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      store.setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [store]);
  
  // Global keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers = [];
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');
      
      const handled = store.executeShortcut(event.key, modifiers);
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [store]);
  
  return {
    // View state
    viewMode: store.viewMode,
    sidebarExpanded: store.sidebarExpanded,
    rightPanelCollapsed: store.rightPanelCollapsed,
    activeRightTab: store.activeRightTab,
    
    // Theme
    theme: store.theme,
    isDarkMode,
    reducedMotion: store.reducedMotion,
    
    // Overlay states
    searchOpen: store.searchOpen,
    quickCaptureOpen: store.quickCaptureOpen,
    commandPaletteOpen: store.commandPaletteOpen,
    
    // Notifications
    toasts: store.toasts,
    hasToasts,
    
    // Modals
    modals: store.modals,
    hasModals,
    topModal,
    
    // Loading and errors
    globalLoading: store.globalLoading,
    globalError: store.globalError,
    hasError,
    
    // Responsive state
    isMobile: store.isMobile,
    isTablet: store.isTablet,
    isDesktop: store.isDesktop,
    
    // Actions - View Management
    setViewMode: store.setViewMode,
    toggleSidebar: store.toggleSidebar,
    setSidebarExpanded: store.setSidebarExpanded,
    toggleRightPanel: store.toggleRightPanel,
    setActiveRightTab: store.setActiveRightTab,
    
    // Actions - Theme Management
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    setReducedMotion: store.setReducedMotion,
    
    // Actions - Overlays
    openSearch,
    closeSearch,
    toggleSearch,
    openQuickCapture,
    closeQuickCapture,
    toggleQuickCapture,
    openCommandPalette,
    closeCommandPalette,
    closeAllOverlays: store.closeAllOverlays,
    
    // Actions - Toast Management
    showToast: store.showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast: store.hideToast,
    clearToasts: store.clearToasts,
    
    // Actions - Modal Management
    showModal: store.showModal,
    hideModal: store.hideModal,
    hideAllModals: store.hideAllModals,
    
    // Actions - Loading and Error Management
    setGlobalLoading: store.setGlobalLoading,
    setLoadingState: store.setLoadingState,
    isLoading: store.isLoading,
    setGlobalError: store.setGlobalError,
    clearError: store.clearGlobalError
  };
};
