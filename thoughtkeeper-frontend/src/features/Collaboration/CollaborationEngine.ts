/**
 * Collaboration Engine
 * 
 * Core engine for simulating real-time collaborative features including
 * user presence, live updates, conflict resolution, and activity tracking.
 */

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
  ConflictStrategy,
  UserLocation,
  CursorPosition,
  Operation,
  SimulationEvent,
  SimulationScenario
} from './types';

export class CollaborationEngine {
  private config: CollaborationConfig;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private simulationInterval: number | null = null;
  private simulatedUsers: CollaboratorUser[] = [];
  private updateCounter = 0;

  // Simulated data stores
  private collaborators = new Map<string, CollaboratorUser>();
  private sessions = new Map<string, CollaborationSession>();
  private updates: CollaborativeUpdate[] = [];
  private conflicts: ConflictResolution[] = [];
  private liveEdits = new Map<string, LiveEdit>();
  private notifications: CollaborativeNotification[] = [];
  private activityFeed: ActivityEvent[] = [];

  constructor(config: CollaborationConfig) {
    this.config = {
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
      autoResolveConflicts: false,
      ...config
    };

    if (this.config.simulationMode) {
      this.initializeSimulation();
    }
  }

  // Event System
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Collaboration event listener error:', error);
      }
    });
  }

  // User and Presence Management
  addCollaborator(user: CollaboratorUser): void {
    this.collaborators.set(user.id, user);
    this.addActivityEvent({
      type: 'created',
      entityType: 'project',
      entityId: 'current',
      entityName: 'Collaboration',
      description: `${user.name} joined the collaboration`,
      metadata: { collaborators: [user.id] }
    });

    this.addNotification({
      type: 'user_joined',
      userId: user.id,
      targetUsers: Array.from(this.collaborators.keys()).filter(id => id !== user.id),
      entityType: 'project',
      entityId: 'current',
      message: `${user.name} joined the session`,
      priority: 'low'
    });

    this.emit('collaborator-added', user);
    this.emit('presence-updated', Array.from(this.collaborators.values()));
  }

  removeCollaborator(userId: string): void {
    const user = this.collaborators.get(userId);
    if (!user) return;

    this.collaborators.delete(userId);
    
    // End any live edits by this user
    Array.from(this.liveEdits.values())
      .filter(edit => edit.userId === userId)
      .forEach(edit => this.endLiveEdit(edit.id));

    this.addActivityEvent({
      type: 'created',
      entityType: 'project', 
      entityId: 'current',
      entityName: 'Collaboration',
      description: `${user.name} left the collaboration`
    });

    this.addNotification({
      type: 'user_left',
      userId: userId,
      targetUsers: Array.from(this.collaborators.keys()),
      entityType: 'project',
      entityId: 'current', 
      message: `${user.name} left the session`,
      priority: 'low'
    });

    this.emit('collaborator-removed', userId);
    this.emit('presence-updated', Array.from(this.collaborators.values()));
  }

  updateCollaboratorPresence(userId: string, location: UserLocation, status?: CollaboratorUser['status']): void {
    const user = this.collaborators.get(userId);
    if (!user) return;

    const updatedUser = {
      ...user,
      location,
      lastSeen: Date.now(),
      ...(status && { status })
    };

    this.collaborators.set(userId, updatedUser);
    this.emit('presence-updated', Array.from(this.collaborators.values()));
  }

  getCollaborators(): CollaboratorUser[] {
    return Array.from(this.collaborators.values()).sort((a, b) => {
      // Sort by status (online first), then by last seen
      if (a.status !== b.status) {
        const statusOrder = { online: 0, away: 1, offline: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return b.lastSeen - a.lastSeen;
    });
  }

  // Real-time Updates
  addUpdate(update: Omit<CollaborativeUpdate, 'id' | 'timestamp'>): CollaborativeUpdate {
    const fullUpdate: CollaborativeUpdate = {
      ...update,
      id: `update_${++this.updateCounter}_${Date.now()}`,
      timestamp: Date.now()
    };

    this.updates.unshift(fullUpdate);
    
    // Keep only recent updates (last 100)
    if (this.updates.length > 100) {
      this.updates = this.updates.slice(0, 100);
    }

    // Check for conflicts
    this.detectConflicts(fullUpdate);

    // Add activity event
    const user = this.collaborators.get(fullUpdate.userId);
    if (user) {
      this.addActivityEvent({
        type: this.mapUpdateTypeToActivity(fullUpdate.type),
        entityType: fullUpdate.entityType,
        entityId: fullUpdate.entityId,
        entityName: `${fullUpdate.entityType} ${fullUpdate.entityId}`,
        description: this.generateUpdateDescription(fullUpdate, user)
      });
    }

    this.emit('update-received', fullUpdate);
    return fullUpdate;
  }

  private mapUpdateTypeToActivity(updateType: CollaborativeUpdate['type']): ActivityEvent['type'] {
    const mapping: Record<CollaborativeUpdate['type'], ActivityEvent['type']> = {
      'create': 'created',
      'update': 'updated', 
      'delete': 'deleted',
      'move': 'moved',
      'rename': 'renamed',
      'status_change': 'updated',
      'content_edit': 'updated',
      'property_change': 'updated'
    };
    return mapping[updateType] || 'updated';
  }

  private generateUpdateDescription(update: CollaborativeUpdate, user: CollaboratorUser): string {
    const entity = `${update.entityType} "${update.entityId}"`;
    const actions: Record<string, string> = {
      'create': `created ${entity}`,
      'update': `updated ${entity}`,
      'delete': `deleted ${entity}`,
      'move': `moved ${entity}`,
      'rename': `renamed ${entity}`,
      'status_change': `changed status of ${entity}`,
      'content_edit': `edited content of ${entity}`,
      'property_change': `updated properties of ${entity}`
    };

    return `${user.name} ${actions[update.type] || `modified ${entity}`}`;
  }

  getRecentUpdates(limit = 20): CollaborativeUpdate[] {
    return this.updates.slice(0, limit);
  }

  // Conflict Detection and Resolution
  private detectConflicts(newUpdate: CollaborativeUpdate): void {
    // Simple conflict detection: same entity/field updated within 5 seconds
    const conflictWindow = 5000;
    const potentialConflicts = this.updates.filter(update => 
      update.entityType === newUpdate.entityType &&
      update.entityId === newUpdate.entityId &&
      update.operation.path === newUpdate.operation.path &&
      update.userId !== newUpdate.userId &&
      (newUpdate.timestamp - update.timestamp) < conflictWindow
    );

    if (potentialConflicts.length > 0) {
      this.createConflict([...potentialConflicts, newUpdate]);
    }
  }

  private createConflict(conflictingUpdates: CollaborativeUpdate[]): void {
    const conflict: ConflictResolution = {
      id: `conflict_${Date.now()}`,
      conflictId: `conflict_${Date.now()}`,
      updates: conflictingUpdates,
      resolutionStrategy: 'user_choice',
      finalState: null,
      metadata: {
        reason: 'Simultaneous edits detected',
        alternatives: conflictingUpdates.map(u => u.operation.value)
      }
    };

    this.conflicts.push(conflict);

    // Notify relevant users
    const involvedUsers = [...new Set(conflictingUpdates.map(u => u.userId))];
    this.addNotification({
      type: 'conflict_detected',
      userId: 'system',
      targetUsers: involvedUsers,
      entityType: conflictingUpdates[0].entityType,
      entityId: conflictingUpdates[0].entityId,
      message: `Conflict detected in ${conflictingUpdates[0].entityType}`,
      priority: 'high'
    });

    this.emit('conflict-detected', conflict);

    // Auto-resolve if enabled
    if (this.config.autoResolveConflicts) {
      setTimeout(() => {
        if (!conflict.resolved) {
          this.resolveConflict(conflict.id, 'last_writer_wins');
        }
      }, this.config.conflictResolutionTimeout);
    }
  }

  resolveConflict(conflictId: string, strategy: ConflictStrategy, customData?: any): void {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict || conflict.resolved) return;

    const resolution = this.applyResolutionStrategy(conflict, strategy, customData);
    
    conflict.resolutionStrategy = strategy;
    conflict.resolvedAt = Date.now();
    conflict.resolved = true;
    conflict.finalState = resolution.finalState;

    if (customData?.resolvedBy) {
      conflict.resolvedBy = customData.resolvedBy;
    }

    // Notify involved users
    const involvedUsers = [...new Set(conflict.updates.map(u => u.userId))];
    this.addNotification({
      type: 'conflict_resolved',
      userId: conflict.resolvedBy || 'system',
      targetUsers: involvedUsers,
      entityType: conflict.updates[0].entityType,
      entityId: conflict.updates[0].entityId,
      message: `Conflict resolved using ${strategy}`,
      priority: 'medium'
    });

    this.emit('conflict-resolved', conflict);
  }

  private applyResolutionStrategy(
    conflict: ConflictResolution, 
    strategy: ConflictStrategy, 
    customData?: any
  ): { finalState: any } {
    const updates = conflict.updates;
    
    switch (strategy) {
      case 'last_writer_wins':
        const latestUpdate = updates.reduce((latest, current) => 
          current.timestamp > latest.timestamp ? current : latest
        );
        return { finalState: latestUpdate.operation.value };

      case 'first_writer_wins':
        const earliestUpdate = updates.reduce((earliest, current) => 
          current.timestamp < earliest.timestamp ? current : earliest
        );
        return { finalState: earliestUpdate.operation.value };

      case 'merge_changes':
        // Simple merge strategy - combine non-conflicting changes
        const merged = updates.reduce((result, update) => {
          if (typeof result === 'object' && typeof update.operation.value === 'object') {
            return { ...result, ...update.operation.value };
          }
          return update.operation.value;
        }, {});
        return { finalState: merged };

      case 'user_choice':
        return { finalState: customData?.chosenValue || updates[0].operation.value };

      case 'custom_resolution':
        return { finalState: customData?.customValue || updates[0].operation.value };

      default:
        return { finalState: updates[updates.length - 1].operation.value };
    }
  }

  getActiveConflicts(): ConflictResolution[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  // Live Editing
  startLiveEdit(entityType: string, entityId: string, field: string, userId: string): LiveEdit {
    const editId = `edit_${entityType}_${entityId}_${field}_${Date.now()}`;
    
    const liveEdit: LiveEdit = {
      id: editId,
      entityType: entityType as any,
      entityId,
      field,
      userId,
      startTime: Date.now(),
      isActive: true
    };

    this.liveEdits.set(editId, liveEdit);
    this.emit('live-edit-started', liveEdit);
    
    return liveEdit;
  }

  endLiveEdit(editId: string): void {
    const edit = this.liveEdits.get(editId);
    if (!edit) return;

    edit.isActive = false;
    this.liveEdits.delete(editId);
    this.emit('live-edit-ended', edit);
  }

  updateLiveEdit(editId: string, content?: string, cursor?: CursorPosition): void {
    const edit = this.liveEdits.get(editId);
    if (!edit || !edit.isActive) return;

    if (content !== undefined) {
      edit.content = content;
    }
    if (cursor) {
      edit.cursor = cursor;
    }

    this.liveEdits.set(editId, edit);
    this.emit('live-edit-updated', edit);
  }

  getLiveEdits(): LiveEdit[] {
    return Array.from(this.liveEdits.values()).filter(edit => edit.isActive);
  }

  isBeingEdited(entityType: string, entityId: string, field: string): boolean {
    return Array.from(this.liveEdits.values()).some(edit =>
      edit.entityType === entityType &&
      edit.entityId === entityId &&
      edit.field === field &&
      edit.isActive
    );
  }

  // Notifications
  private addNotification(notification: Omit<CollaborativeNotification, 'id' | 'timestamp'>): void {
    if (!this.config.notificationSettings.enabled) return;
    if (!this.config.notificationSettings.types.includes(notification.type)) return;

    const fullNotification: CollaborativeNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: {}
    };

    this.notifications.unshift(fullNotification);
    
    // Keep only recent notifications (last 50)
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.emit('notification-added', fullNotification);
  }

  markNotificationRead(notificationId: string, userId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    notification.read = notification.read || {};
    notification.read[userId] = true;

    this.emit('notification-updated', notification);
  }

  getNotifications(userId: string, limit = 20): CollaborativeNotification[] {
    return this.notifications
      .filter(n => n.targetUsers.includes(userId))
      .slice(0, limit);
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications
      .filter(n => n.targetUsers.includes(userId) && !n.read?.[userId])
      .length;
  }

  // Activity Feed
  private addActivityEvent(event: Omit<ActivityEvent, 'id' | 'timestamp' | 'userId'>): void {
    if (!this.config.activityFeedEnabled) return;

    const fullEvent: ActivityEvent = {
      ...event,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'system', // Default to system user
      timestamp: Date.now()
    };

    this.activityFeed.unshift(fullEvent);
    
    // Keep only recent activities (last 100)
    if (this.activityFeed.length > 100) {
      this.activityFeed = this.activityFeed.slice(0, 100);
    }

    this.emit('activity-added', fullEvent);
  }

  getActivityFeed(limit = 20): ActivityEvent[] {
    return this.activityFeed.slice(0, limit);
  }

  // Simulation Features
  private initializeSimulation(): void {
    // Create some simulated users
    this.simulatedUsers = this.generateSimulatedUsers(3);
    this.simulatedUsers.forEach(user => this.addCollaborator(user));

    // Start simulation loop
    if (this.config.simulationMode) {
      this.startSimulation();
    }
  }

  private generateSimulatedUsers(count: number): CollaboratorUser[] {
    const names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'Dave Wilson', 'Eve Brown'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `sim_user_${i + 1}`,
      name: names[i] || `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      color: colors[i] || '#6B7280',
      role: 'editor' as const,
      status: 'online' as const,
      lastSeen: Date.now(),
      location: {
        type: 'dashboard' as const
      }
    }));
  }

  addSimulatedUser(): CollaboratorUser {
    const existingCount = this.simulatedUsers.length;
    const newUser = this.generateSimulatedUsers(1)[0];
    newUser.id = `sim_user_${existingCount + 1}`;
    newUser.name = `Simulated User ${existingCount + 1}`;
    
    this.simulatedUsers.push(newUser);
    this.addCollaborator(newUser);
    
    return newUser;
  }

  removeSimulatedUser(userId: string): void {
    this.simulatedUsers = this.simulatedUsers.filter(u => u.id !== userId);
    this.removeCollaborator(userId);
  }

  private startSimulation(): void {
    if (this.simulationInterval) return;

    this.simulationInterval = window.setInterval(() => {
      this.simulateRandomActivity();
    }, 3000 + Math.random() * 7000); // Every 3-10 seconds
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private simulateRandomActivity(): void {
    if (this.simulatedUsers.length === 0) return;

    const activities = [
      () => this.simulatePresenceUpdate(),
      () => this.simulateContentEdit(),
      () => this.simulateTaskUpdate(),
      () => this.simulateNotebookCreation(),
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    randomActivity();
  }

  private simulatePresenceUpdate(): void {
    const user = this.simulatedUsers[Math.floor(Math.random() * this.simulatedUsers.length)];
    const locations: UserLocation[] = [
      { type: 'dashboard' },
      { type: 'notebook', id: 'notebook_1' },
      { type: 'task', id: 'task_1' },
      { type: 'search' }
    ];

    const location = locations[Math.floor(Math.random() * locations.length)];
    this.updateCollaboratorPresence(user.id, location);
  }

  private simulateContentEdit(): void {
    const user = this.simulatedUsers[Math.floor(Math.random() * this.simulatedUsers.length)];
    const entityTypes = ['notebook', 'task'] as const;
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    
    this.addUpdate({
      type: 'content_edit',
      entityType,
      entityId: `${entityType}_${Math.floor(Math.random() * 3) + 1}`,
      userId: user.id,
      operation: {
        type: 'replace',
        path: 'content',
        value: `Updated content at ${new Date().toLocaleTimeString()}`,
        oldValue: 'Previous content'
      }
    });
  }

  private simulateTaskUpdate(): void {
    const user = this.simulatedUsers[Math.floor(Math.random() * this.simulatedUsers.length)];
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    
    this.addUpdate({
      type: 'status_change',
      entityType: 'task',
      entityId: `task_${Math.floor(Math.random() * 5) + 1}`,
      userId: user.id,
      operation: {
        type: 'property_set',
        path: 'status',
        value: statuses[Math.floor(Math.random() * statuses.length)],
        oldValue: 'pending'
      }
    });
  }

  private simulateNotebookCreation(): void {
    const user = this.simulatedUsers[Math.floor(Math.random() * this.simulatedUsers.length)];
    
    this.addUpdate({
      type: 'create',
      entityType: 'notebook',
      entityId: `notebook_${Date.now()}`,
      userId: user.id,
      operation: {
        type: 'insert',
        path: '',
        value: {
          title: `New Notebook ${Date.now()}`,
          content: 'Fresh notebook content',
          createdBy: user.id
        }
      }
    });
  }

  simulateConflict(): void {
    if (this.simulatedUsers.length < 2) return;

    const [user1, user2] = this.simulatedUsers.slice(0, 2);
    const entityId = `task_${Math.floor(Math.random() * 3) + 1}`;
    
    // Create two conflicting updates
    const baseTime = Date.now();
    
    setTimeout(() => {
      this.addUpdate({
        type: 'update',
        entityType: 'task',
        entityId,
        userId: user1.id,
        operation: {
          type: 'replace',
          path: 'title',
          value: `Updated by ${user1.name}`,
          oldValue: 'Original Title'
        }
      });
    }, 0);

    setTimeout(() => {
      this.addUpdate({
        type: 'update',
        entityType: 'task',
        entityId,
        userId: user2.id,
        operation: {
          type: 'replace',
          path: 'title',
          value: `Updated by ${user2.name}`,
          oldValue: 'Original Title'
        }
      });
    }, 500); // Half second delay to create conflict
  }

  // Cleanup
  destroy(): void {
    this.stopSimulation();
    this.eventListeners.clear();
    this.collaborators.clear();
    this.liveEdits.clear();
    this.updates = [];
    this.conflicts = [];
    this.notifications = [];
    this.activityFeed = [];
  }
}
