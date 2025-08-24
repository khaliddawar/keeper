import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * UI Store - Comprehensive UI state management
 * 
 * Features:
 * - Theme management (dark/light/system)
 * - Layout and view states (sidebar, panels, modals)
 * - Toast notification system with queue
 * - Modal stack with z-index management
 * - Search and command palette overlays
 * - Keyboard shortcuts registry
 * - Loading states and error handling
 * - Responsive breakpoint detection
 * - Reduced motion and accessibility
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'list' | 'kanban' | 'calendar' | 'grid';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closable?: boolean;
  persistent?: boolean;
  zIndex?: number;
  onClose?: () => void;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: string[];
  action: () => void;
  description?: string;
  category?: string;
  enabled?: boolean;
}

interface UIState {
  // Theme and appearance
  theme: ThemeMode;
  reducedMotion: boolean;
  
  // Layout state
  sidebarExpanded: boolean;
  rightPanelCollapsed: boolean;
  activeRightTab: string;
  viewMode: ViewMode;
  
  // Overlay states
  searchOpen: boolean;
  quickCaptureOpen: boolean;
  commandPaletteOpen: boolean;
  
  // Toast system
  toasts: Toast[];
  maxToasts: number;
  
  // Modal system
  modals: Modal[];
  modalCounter: number;
  
  // Loading and errors
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  globalError: string | null;
  
  // Keyboard shortcuts
  shortcuts: Record<string, KeyboardShortcut>;
  shortcutsEnabled: boolean;
  
  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Miscellaneous
  lastActivity: Date;
  isOnline: boolean;
}

interface UIActions {
  // Theme management
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setReducedMotion: (reduced: boolean) => void;
  
  // Layout management
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  toggleRightPanel: () => void;
  setActiveRightTab: (tabId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Overlay management
  setSearchOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  closeAllOverlays: () => void;
  
  // Toast management
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  
  // Modal management
  showModal: (modal: Omit<Modal, 'id'>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  updateModal: (id: string, updates: Partial<Modal>) => void;
  getTopModal: () => Modal | undefined;
  
  // Loading state management
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  isLoading: (key?: string) => boolean;
  
  // Error management
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
  
  // Keyboard shortcuts
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  executeShortcut: (key: string, modifiers: string[]) => boolean;
  toggleShortcuts: (enabled: boolean) => void;
  
  // Responsive state
  setResponsiveState: (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => void;
  
  // Miscellaneous
  updateLastActivity: () => void;
  setOnlineStatus: (online: boolean) => void;
}

type UIStore = UIState & UIActions;

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const DEFAULT_TOAST_DURATION = 4000;
const MAX_TOASTS = 5;
const MODAL_Z_INDEX_BASE = 1000;

export const useUIStore = create<UIStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      theme: 'system',
      reducedMotion: false,
      sidebarExpanded: true,
      rightPanelCollapsed: false,
      activeRightTab: 'details',
      viewMode: 'list',
      searchOpen: false,
      quickCaptureOpen: false,
      commandPaletteOpen: false,
      toasts: [],
      maxToasts: MAX_TOASTS,
      modals: [],
      modalCounter: 0,
      globalLoading: false,
      loadingStates: {},
      globalError: null,
      shortcuts: {},
      shortcutsEnabled: true,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      lastActivity: new Date(),
      isOnline: true,
      
      // Theme management
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        
        // Apply theme to document
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', systemPrefersDark);
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        get().setTheme(next);
      },
      
      setReducedMotion: (reduced: boolean) => {
        set({ reducedMotion: reduced });
      },
      
      // Layout management
      setSidebarExpanded: (expanded: boolean) => {
        set({ sidebarExpanded: expanded });
        get().updateLastActivity();
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
        get().updateLastActivity();
      },
      
      setRightPanelCollapsed: (collapsed: boolean) => {
        set({ rightPanelCollapsed: collapsed });
        get().updateLastActivity();
      },
      
      toggleRightPanel: () => {
        set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed }));
        get().updateLastActivity();
      },
      
      setActiveRightTab: (tabId: string) => {
        set({ activeRightTab: tabId });
        
        // Expand right panel if collapsed when switching tabs
        if (get().rightPanelCollapsed) {
          set({ rightPanelCollapsed: false });
        }
        
        get().updateLastActivity();
      },
      
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
        get().updateLastActivity();
      },
      
      // Overlay management
      setSearchOpen: (open: boolean) => {
        set({ searchOpen: open });
        if (open) {
          // Close other overlays when opening search
          set({ quickCaptureOpen: false, commandPaletteOpen: false });
        }
        get().updateLastActivity();
      },
      
      setQuickCaptureOpen: (open: boolean) => {
        set({ quickCaptureOpen: open });
        if (open) {
          // Close other overlays when opening quick capture
          set({ searchOpen: false, commandPaletteOpen: false });
        }
        get().updateLastActivity();
      },
      
      setCommandPaletteOpen: (open: boolean) => {
        set({ commandPaletteOpen: open });
        if (open) {
          // Close other overlays when opening command palette
          set({ searchOpen: false, quickCaptureOpen: false });
        }
        get().updateLastActivity();
      },
      
      closeAllOverlays: () => {
        set({
          searchOpen: false,
          quickCaptureOpen: false,
          commandPaletteOpen: false
        });
      },
      
      // Toast management
      showToast: (toastData: Omit<Toast, 'id' | 'createdAt'>) => {
        const id = generateId();
        const toast: Toast = {
          ...toastData,
          id,
          createdAt: new Date(),
          duration: toastData.duration ?? DEFAULT_TOAST_DURATION
        };
        
        set((state) => {
          let newToasts = [...state.toasts, toast];
          
          // Remove oldest toasts if exceeding max
          if (newToasts.length > state.maxToasts) {
            newToasts = newToasts.slice(-state.maxToasts);
          }
          
          return { toasts: newToasts };
        });
        
        // Auto-hide toast if not persistent
        if (!toast.persistent && toast.duration && toast.duration > 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, toast.duration);
        }
        
        return id;
      },
      
      hideToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      },
      
      clearToasts: () => {
        set({ toasts: [] });
      },
      
      updateToast: (id: string, updates: Partial<Toast>) => {
        set((state) => ({
          toasts: state.toasts.map(toast => 
            toast.id === id ? { ...toast, ...updates } : toast
          )
        }));
      },
      
      // Modal management
      showModal: (modalData: Omit<Modal, 'id'>) => {
        const id = generateId();
        const modalCounter = get().modalCounter + 1;
        
        const modal: Modal = {
          ...modalData,
          id,
          zIndex: MODAL_Z_INDEX_BASE + modalCounter,
          closable: modalData.closable ?? true,
          size: modalData.size ?? 'md'
        };
        
        set((state) => ({
          modals: [...state.modals, modal],
          modalCounter
        }));
        
        return id;
      },
      
      hideModal: (id: string) => {
        const modal = get().modals.find(m => m.id === id);
        if (modal?.onClose) {
          modal.onClose();
        }
        
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id)
        }));
      },
      
      hideAllModals: () => {
        const modals = get().modals;
        modals.forEach(modal => {
          if (modal.onClose) {
            modal.onClose();
          }
        });
        
        set({ modals: [] });
      },
      
      updateModal: (id: string, updates: Partial<Modal>) => {
        set((state) => ({
          modals: state.modals.map(modal => 
            modal.id === id ? { ...modal, ...updates } : modal
          )
        }));
      },
      
      getTopModal: () => {
        const modals = get().modals;
        if (modals.length === 0) return undefined;
        
        return modals.reduce((top, modal) => 
          !top || (modal.zIndex || 0) > (top.zIndex || 0) ? modal : top
        );
      },
      
      // Loading state management
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },
      
      setLoadingState: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading
          }
        }));
      },
      
      isLoading: (key?: string) => {
        if (key) {
          return get().loadingStates[key] || false;
        }
        return get().globalLoading || Object.values(get().loadingStates).some(Boolean);
      },
      
      // Error management
      setGlobalError: (error: string | null) => {
        set({ globalError: error });
      },
      
      clearGlobalError: () => {
        set({ globalError: null });
      },
      
      // Keyboard shortcuts
      registerShortcut: (shortcut: KeyboardShortcut) => {
        set((state) => ({
          shortcuts: {
            ...state.shortcuts,
            [shortcut.id]: shortcut
          }
        }));
      },
      
      unregisterShortcut: (id: string) => {
        set((state) => {
          const { [id]: removed, ...shortcuts } = state.shortcuts;
          return { shortcuts };
        });
      },
      
      executeShortcut: (key: string, modifiers: string[]) => {
        if (!get().shortcutsEnabled) return false;
        
        const shortcuts = Object.values(get().shortcuts);
        const matchingShortcut = shortcuts.find(shortcut => 
          shortcut.key.toLowerCase() === key.toLowerCase() &&
          shortcut.modifiers.length === modifiers.length &&
          shortcut.modifiers.every(mod => modifiers.includes(mod)) &&
          shortcut.enabled !== false
        );
        
        if (matchingShortcut) {
          matchingShortcut.action();
          return true;
        }
        
        return false;
      },
      
      toggleShortcuts: (enabled: boolean) => {
        set({ shortcutsEnabled: enabled });
      },
      
      // Responsive state
      setResponsiveState: (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
        set({ isMobile, isTablet, isDesktop });
        
        // Auto-collapse sidebar on mobile
        if (isMobile && get().sidebarExpanded) {
          set({ sidebarExpanded: false });
        }
      },
      
      // Miscellaneous
      updateLastActivity: () => {
        set({ lastActivity: new Date() });
      },
      
      setOnlineStatus: (online: boolean) => {
        set({ isOnline: online });
        
        if (!online) {
          get().showToast({
            type: 'warning',
            message: 'You are currently offline. Some features may not be available.',
            persistent: true
          });
        } else {
          // Clear offline warning if it exists
          const offlineToast = get().toasts.find(t => t.message.includes('offline'));
          if (offlineToast) {
            get().hideToast(offlineToast.id);
          }
        }
      }
    })),
    {
      name: 'ui-store'
    }
  )
);

// Initialize theme on load
const initializeTheme = () => {
  const store = useUIStore.getState();
  store.setTheme(store.theme);
};

// Initialize responsive state
const initializeResponsive = () => {
  const updateResponsiveState = () => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    useUIStore.getState().setResponsiveState(isMobile, isTablet, isDesktop);
  };
  
  updateResponsiveState();
  window.addEventListener('resize', updateResponsiveState);
  
  return () => window.removeEventListener('resize', updateResponsiveState);
};

// Initialize online/offline detection
const initializeOnlineStatus = () => {
  const updateOnlineStatus = () => {
    useUIStore.getState().setOnlineStatus(navigator.onLine);
  };
  
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initializeTheme();
    initializeResponsive();
    initializeOnlineStatus();
  }, 0);
}