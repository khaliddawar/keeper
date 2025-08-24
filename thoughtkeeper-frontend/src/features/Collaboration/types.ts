/**
 * Real-time Collaboration Types
 * 
 * Defines the type system for simulated collaborative features including
 * user presence, real-time updates, conflict resolution, and shared editing.
 */

// User and Presence Types
export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Unique color for cursors, highlights, etc.
  role: 'owner' | 'editor' | 'viewer' | 'guest';
  status: 'online' | 'away' | 'offline';
  lastSeen: number; // timestamp
  location?: UserLocation; // What they're currently viewing/editing
}

export interface UserLocation {
  type: 'notebook' | 'task' | 'dashboard' | 'search';
  id?: string; // notebook ID, task ID, etc.
  section?: string; // specific section within the location
  position?: CursorPosition; // for text editing
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

// Real-time Update Types
export interface CollaborativeUpdate {
  id: string;
  type: CollaborativeUpdateType;
  entityType: 'notebook' | 'task' | 'project';
  entityId: string;
  userId: string;
  timestamp: number;
  operation: Operation;
  metadata?: Record<string, any>;
  conflicted?: boolean;
  resolved?: boolean;
}

export type CollaborativeUpdateType =
  | 'create'
  | 'update' 
  | 'delete'
  | 'move'
  | 'rename'
  | 'status_change'
  | 'content_edit'
  | 'property_change';

export interface Operation {
  type: 'insert' | 'delete' | 'replace' | 'move' | 'property_set';
  path: string; // JSON path to the field being modified
  value?: any; // new value for insert/replace operations
  oldValue?: any; // previous value for conflict resolution
  position?: number; // for text operations
  length?: number; // for delete operations
}

// Conflict Resolution Types
export interface ConflictResolution {
  id: string;
  conflictId: string;
  updates: CollaborativeUpdate[]; // The conflicting updates
  resolutionStrategy: ConflictStrategy;
  resolvedBy?: string; // user ID
  resolvedAt?: number; // timestamp
  finalState: any; // The resolved final state
  metadata?: {
    reason?: string;
    alternatives?: any[];
    userChoices?: Record<string, any>;
  };
}

export type ConflictStrategy =
  | 'last_writer_wins'
  | 'first_writer_wins'
  | 'merge_changes'
  | 'user_choice'
  | 'custom_resolution';

// Live Editing Types
export interface LiveEdit {
  id: string;
  entityType: 'notebook' | 'task';
  entityId: string;
  field: string; // which field is being edited
  userId: string;
  startTime: number;
  cursor?: CursorPosition;
  content?: string; // current draft content
  isActive: boolean;
}

// Notification Types
export interface CollaborativeNotification {
  id: string;
  type: NotificationType;
  userId: string; // who caused the notification
  targetUsers: string[]; // who should see it
  entityType: 'notebook' | 'task' | 'project';
  entityId: string;
  timestamp: number;
  message: string;
  metadata?: Record<string, any>;
  read?: Record<string, boolean>; // read status per user
  priority: 'low' | 'medium' | 'high';
}

export type NotificationType =
  | 'user_joined'
  | 'user_left'
  | 'content_changed'
  | 'task_assigned'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'mention'
  | 'comment_added'
  | 'status_updated';

// Activity Feed Types
export interface ActivityEvent {
  id: string;
  type: ActivityType;
  userId: string;
  entityType: 'notebook' | 'task' | 'project';
  entityId: string;
  entityName: string;
  timestamp: number;
  description: string;
  metadata?: {
    oldValue?: any;
    newValue?: any;
    duration?: number;
    collaborators?: string[];
  };
}

export type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'assigned'
  | 'moved'
  | 'renamed'
  | 'shared'
  | 'collaborated';

// Session and Connection Types
export interface CollaborationSession {
  id: string;
  entityType: 'notebook' | 'task' | 'project';
  entityId: string;
  participants: CollaboratorUser[];
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  permissions: Record<string, SessionPermission[]>;
}

export type SessionPermission =
  | 'read'
  | 'write'
  | 'delete' 
  | 'share'
  | 'manage_users'
  | 'resolve_conflicts';

export interface ConnectionStatus {
  isConnected: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency?: number; // ms
  lastSync?: number; // timestamp
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'error';
  pendingUpdates: number;
}

// Configuration Types
export interface CollaborationConfig {
  enabled: boolean;
  simulationMode: boolean;
  maxCollaborators: number;
  conflictResolutionTimeout: number; // ms
  presenceUpdateInterval: number; // ms
  syncInterval: number; // ms
  notificationSettings: {
    enabled: boolean;
    types: NotificationType[];
    sound: boolean;
    desktop: boolean;
  };
  cursorsEnabled: boolean;
  activityFeedEnabled: boolean;
  autoResolveConflicts: boolean;
}

// Provider Context Types
export interface CollaborationContextValue {
  // Current user and session
  currentUser: CollaboratorUser | null;
  session: CollaborationSession | null;
  connectionStatus: ConnectionStatus;
  
  // Collaborators and presence
  collaborators: CollaboratorUser[];
  liveEdits: LiveEdit[];
  
  // Updates and conflicts
  recentUpdates: CollaborativeUpdate[];
  activeConflicts: ConflictResolution[];
  notifications: CollaborativeNotification[];
  activityFeed: ActivityEvent[];
  
  // Actions
  joinSession: (entityType: string, entityId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  sendUpdate: (update: Omit<CollaborativeUpdate, 'id' | 'timestamp' | 'userId'>) => void;
  resolveConflict: (conflictId: string, strategy: ConflictStrategy, customData?: any) => void;
  startLiveEdit: (entityType: string, entityId: string, field: string) => void;
  endLiveEdit: (liveEditId: string) => void;
  updateCursor: (position: CursorPosition) => void;
  markNotificationRead: (notificationId: string) => void;
  
  // Simulation controls (for demo purposes)
  simulation: {
    addSimulatedUser: () => CollaboratorUser;
    removeSimulatedUser: (userId: string) => void;
    simulateActivity: (type: ActivityType) => void;
    simulateConflict: () => void;
    toggleSimulation: (enabled: boolean) => void;
  };
}

// Utility Types
export interface CollaborationStats {
  totalCollaborators: number;
  activeCollaborators: number;
  totalUpdates: number;
  conflictsResolved: number;
  averageResponseTime: number;
  syncHealth: 'healthy' | 'degraded' | 'critical';
}

// Hooks return types
export interface UseCollaborationReturn extends CollaborationContextValue {}

export interface UsePresenceReturn {
  collaborators: CollaboratorUser[];
  currentUser: CollaboratorUser | null;
  updatePresence: (location: UserLocation) => void;
  setStatus: (status: CollaboratorUser['status']) => void;
}

export interface UseCollaborativeEditingReturn {
  liveEdits: LiveEdit[];
  startEdit: (entityType: string, entityId: string, field: string) => void;
  endEdit: (liveEditId: string) => void;
  updateContent: (liveEditId: string, content: string, cursor?: CursorPosition) => void;
  isBeingEdited: (entityType: string, entityId: string, field: string) => boolean;
  getEditor: (entityType: string, entityId: string, field: string) => CollaboratorUser | null;
}

export interface UseConflictResolutionReturn {
  conflicts: ConflictResolution[];
  resolveConflict: (conflictId: string, strategy: ConflictStrategy, customData?: any) => void;
  previewResolution: (conflictId: string, strategy: ConflictStrategy) => any;
  getPendingConflicts: () => ConflictResolution[];
}

// Event Types for Simulation
export interface SimulationEvent {
  type: 'user_action' | 'system_event' | 'network_event';
  action: string;
  userId?: string;
  entityId?: string;
  data?: any;
  delay?: number; // ms delay before executing
}

export interface SimulationScenario {
  name: string;
  description: string;
  duration: number; // ms
  events: SimulationEvent[];
  expectedOutcomes: string[];
}
