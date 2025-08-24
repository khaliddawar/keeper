/**
 * Collaboration Provider
 * 
 * React context provider that wraps the CollaborationEngine and provides
 * real-time collaborative features to the entire application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CollaborationEngine } from './CollaborationEngine';
import type {
  CollaboratorUser,
  CollaborativeUpdate,
  ConflictResolution,
  LiveEdit,
  CollaborativeNotification,
  ActivityEvent,
  CollaborationSession,
  ConnectionStatus,
  CollaborationConfig,
  CollaborationContextValue,
  ConflictStrategy,
  UserLocation,
  CursorPosition
} from './types';

// Default configuration
const DEFAULT_CONFIG: CollaborationConfig = {
  enabled: true,
  simulationMode: true,
  maxCollaborators: 10,
  conflictResolutionTimeout: 30000,
  presenceUpdateInterval: 5000,
  syncInterval: 1000,
  notificationSettings: {
    enabled: true,
    types: ['user_joined', 'user_left', 'content_changed', 'conflict_detected'],
    sound: false,
    desktop: false
  },
  cursorsEnabled: true,
  activityFeedEnabled: true,
  autoResolveConflicts: false
};

// Context
const CollaborationContext = createContext<CollaborationContextValue | null>(null);

// Provider Props
interface CollaborationProviderProps {
  children: React.ReactNode;
  config?: Partial<CollaborationConfig>;
  currentUser?: CollaboratorUser;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  config = {},
  currentUser: initialUser
}) => {
  const engineRef = useRef<CollaborationEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // State
  const [currentUser, setCurrentUser] = useState<CollaboratorUser | null>(
    initialUser || {
      id: 'current_user',
      name: 'You',
      email: 'you@example.com',
      color: '#3B82F6',
      role: 'owner',
      status: 'online',
      lastSeen: Date.now(),
      location: { type: 'dashboard' }
    }
  );

  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: true,
    quality: 'excellent',
    latency: 50,
    lastSync: Date.now(),
    syncStatus: 'synced',
    pendingUpdates: 0
  });

  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<CollaborativeUpdate[]>([]);
  const [activeConflicts, setActiveConflicts] = useState<ConflictResolution[]>([]);
  const [notifications, setNotifications] = useState<CollaborativeNotification[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  // Initialize engine
  useEffect(() => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    engineRef.current = new CollaborationEngine(finalConfig);

    // Set up event listeners
    const engine = engineRef.current;

    engine.addEventListener('collaborator-added', (user: CollaboratorUser) => {
      setCollaborators(engine.getCollaborators());
    });

    engine.addEventListener('collaborator-removed', (userId: string) => {
      setCollaborators(engine.getCollaborators());
    });

    engine.addEventListener('presence-updated', (users: CollaboratorUser[]) => {
      setCollaborators(users);
    });

    engine.addEventListener('update-received', (update: CollaborativeUpdate) => {
      setRecentUpdates(engine.getRecentUpdates());
    });

    engine.addEventListener('conflict-detected', (conflict: ConflictResolution) => {
      setActiveConflicts(engine.getActiveConflicts());
    });

    engine.addEventListener('conflict-resolved', (conflict: ConflictResolution) => {
      setActiveConflicts(engine.getActiveConflicts());
    });

    engine.addEventListener('live-edit-started', (edit: LiveEdit) => {
      setLiveEdits(engine.getLiveEdits());
    });

    engine.addEventListener('live-edit-ended', (edit: LiveEdit) => {
      setLiveEdits(engine.getLiveEdits());
    });

    engine.addEventListener('live-edit-updated', (edit: LiveEdit) => {
      setLiveEdits(engine.getLiveEdits());
    });

    engine.addEventListener('notification-added', (notification: CollaborativeNotification) => {
      if (currentUser) {
        setNotifications(engine.getNotifications(currentUser.id));
      }
    });

    engine.addEventListener('activity-added', (activity: ActivityEvent) => {
      setActivityFeed(engine.getActivityFeed());
    });

    // Add current user as collaborator
    if (currentUser) {
      engine.addCollaborator(currentUser);
    }

    // Initialize state
    setCollaborators(engine.getCollaborators());
    setRecentUpdates(engine.getRecentUpdates());
    setActiveConflicts(engine.getActiveConflicts());
    setLiveEdits(engine.getLiveEdits());
    setActivityFeed(engine.getActivityFeed());
    
    if (currentUser) {
      setNotifications(engine.getNotifications(currentUser.id));
    }

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      engine.destroy();
    };
  }, []);

  // Update notifications when current user changes
  useEffect(() => {
    if (currentUser && engineRef.current) {
      setNotifications(engineRef.current.getNotifications(currentUser.id));
    }
  }, [currentUser]);

  // Context methods
  const joinSession = useCallback(async (entityType: string, entityId: string): Promise<void> => {
    if (!engineRef.current || !currentUser) return;

    // Create or update session
    const newSession: CollaborationSession = {
      id: `session_${entityType}_${entityId}`,
      entityType: entityType as any,
      entityId,
      participants: [currentUser],
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      permissions: {
        [currentUser.id]: ['read', 'write', 'share', 'manage_users', 'resolve_conflicts']
      }
    };

    setSession(newSession);

    // Update user presence
    engineRef.current.updateCollaboratorPresence(currentUser.id, {
      type: entityType as any,
      id: entityId
    });
  }, [currentUser]);

  const leaveSession = useCallback(async (): Promise<void> => {
    if (!engineRef.current || !currentUser) return;

    setSession(null);

    // Update user presence back to dashboard
    engineRef.current.updateCollaboratorPresence(currentUser.id, {
      type: 'dashboard'
    });
  }, [currentUser]);

  const sendUpdate = useCallback((update: Omit<CollaborativeUpdate, 'id' | 'timestamp' | 'userId'>): void => {
    if (!engineRef.current || !currentUser) return;

    engineRef.current.addUpdate({
      ...update,
      userId: currentUser.id
    });
  }, [currentUser]);

  const resolveConflict = useCallback((
    conflictId: string,
    strategy: ConflictStrategy,
    customData?: any
  ): void => {
    if (!engineRef.current || !currentUser) return;

    engineRef.current.resolveConflict(conflictId, strategy, {
      ...customData,
      resolvedBy: currentUser.id
    });
  }, [currentUser]);

  const startLiveEdit = useCallback((entityType: string, entityId: string, field: string): void => {
    if (!engineRef.current || !currentUser) return;

    engineRef.current.startLiveEdit(entityType, entityId, field, currentUser.id);
  }, [currentUser]);

  const endLiveEdit = useCallback((liveEditId: string): void => {
    if (!engineRef.current) return;

    engineRef.current.endLiveEdit(liveEditId);
  }, []);

  const updateCursor = useCallback((position: CursorPosition): void => {
    if (!engineRef.current || !currentUser) return;

    // Find active live edit by current user
    const activeEdit = liveEdits.find(edit => 
      edit.userId === currentUser.id && edit.isActive
    );

    if (activeEdit) {
      engineRef.current.updateLiveEdit(activeEdit.id, undefined, position);
    }
  }, [currentUser, liveEdits]);

  const markNotificationRead = useCallback((notificationId: string): void => {
    if (!engineRef.current || !currentUser) return;

    engineRef.current.markNotificationRead(notificationId, currentUser.id);
  }, [currentUser]);

  // Simulation methods
  const addSimulatedUser = useCallback((): CollaboratorUser => {
    if (!engineRef.current) throw new Error('Engine not initialized');
    return engineRef.current.addSimulatedUser();
  }, []);

  const removeSimulatedUser = useCallback((userId: string): void => {
    if (!engineRef.current) return;
    engineRef.current.removeSimulatedUser(userId);
  }, []);

  const simulateActivity = useCallback((type: ActivityEvent['type']): void => {
    if (!engineRef.current) return;

    // Trigger random simulated activity based on type
    switch (type) {
      case 'created':
        engineRef.current.simulateConflict();
        break;
      case 'updated':
        // Simulate content update
        break;
      default:
        // Random activity
        break;
    }
  }, []);

  const simulateConflict = useCallback((): void => {
    if (!engineRef.current) return;
    engineRef.current.simulateConflict();
  }, []);

  const toggleSimulation = useCallback((enabled: boolean): void => {
    if (!engineRef.current) return;

    if (enabled) {
      engineRef.current['startSimulation']?.();
    } else {
      engineRef.current.stopSimulation();
    }
  }, []);

  // Context value
  const contextValue: CollaborationContextValue = {
    // Current state
    currentUser,
    session,
    connectionStatus,
    
    // Data
    collaborators,
    liveEdits,
    recentUpdates,
    activeConflicts,
    notifications,
    activityFeed,
    
    // Actions
    joinSession,
    leaveSession,
    sendUpdate,
    resolveConflict,
    startLiveEdit,
    endLiveEdit,
    updateCursor,
    markNotificationRead,
    
    // Simulation
    simulation: {
      addSimulatedUser,
      removeSimulatedUser,
      simulateActivity,
      simulateConflict,
      toggleSimulation
    }
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🤝 Initializing collaboration...
      </div>
    );
  }

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Hook for consuming the collaboration context
export const useCollaboration = (): CollaborationContextValue => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

// Specialized hooks for specific collaboration features
export const usePresence = () => {
  const { collaborators, currentUser, sendUpdate } = useCollaboration();

  const updatePresence = useCallback((location: UserLocation) => {
    // Update presence through the collaboration system
    sendUpdate({
      type: 'property_change',
      entityType: 'project',
      entityId: 'presence',
      operation: {
        type: 'property_set',
        path: 'location',
        value: location
      }
    });
  }, [sendUpdate]);

  const setStatus = useCallback((status: CollaboratorUser['status']) => {
    sendUpdate({
      type: 'property_change',
      entityType: 'project',
      entityId: 'presence',
      operation: {
        type: 'property_set',
        path: 'status',
        value: status
      }
    });
  }, [sendUpdate]);

  return {
    collaborators,
    currentUser,
    updatePresence,
    setStatus
  };
};

export const useCollaborativeEditing = () => {
  const { liveEdits, startLiveEdit, endLiveEdit, updateCursor, collaborators } = useCollaboration();

  const startEdit = useCallback((entityType: string, entityId: string, field: string) => {
    startLiveEdit(entityType, entityId, field);
  }, [startLiveEdit]);

  const endEdit = useCallback((liveEditId: string) => {
    endLiveEdit(liveEditId);
  }, [endLiveEdit]);

  const updateContent = useCallback((liveEditId: string, content: string, cursor?: CursorPosition) => {
    // Update live edit content through the engine
    updateCursor(cursor || { line: 0, column: 0 });
  }, [updateCursor]);

  const isBeingEdited = useCallback((entityType: string, entityId: string, field: string): boolean => {
    return liveEdits.some(edit =>
      edit.entityType === entityType &&
      edit.entityId === entityId &&
      edit.field === field &&
      edit.isActive
    );
  }, [liveEdits]);

  const getEditor = useCallback((entityType: string, entityId: string, field: string): CollaboratorUser | null => {
    const edit = liveEdits.find(edit =>
      edit.entityType === entityType &&
      edit.entityId === entityId &&
      edit.field === field &&
      edit.isActive
    );

    if (!edit) return null;

    return collaborators.find(user => user.id === edit.userId) || null;
  }, [liveEdits, collaborators]);

  return {
    liveEdits,
    startEdit,
    endEdit,
    updateContent,
    isBeingEdited,
    getEditor
  };
};

export const useConflictResolution = () => {
  const { activeConflicts, resolveConflict } = useCollaboration();

  const previewResolution = useCallback((conflictId: string, strategy: ConflictStrategy): any => {
    const conflict = activeConflicts.find(c => c.id === conflictId);
    if (!conflict) return null;

    // Simple preview logic - would be more sophisticated in real implementation
    switch (strategy) {
      case 'last_writer_wins':
        const latest = conflict.updates.reduce((latest, current) => 
          current.timestamp > latest.timestamp ? current : latest
        );
        return latest.operation.value;
      
      case 'first_writer_wins':
        const earliest = conflict.updates.reduce((earliest, current) => 
          current.timestamp < earliest.timestamp ? current : earliest
        );
        return earliest.operation.value;
      
      default:
        return conflict.updates[0].operation.value;
    }
  }, [activeConflicts]);

  const getPendingConflicts = useCallback((): ConflictResolution[] => {
    return activeConflicts.filter(c => !c.resolved);
  }, [activeConflicts]);

  return {
    conflicts: activeConflicts,
    resolveConflict,
    previewResolution,
    getPendingConflicts
  };
};
