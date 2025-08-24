import type {
  AnalyticsStorage as IAnalyticsStorage,
  AnalyticsEvent,
  ProductivityMetrics,
  AnalyticsInsight,
  UserBehaviorPattern,
  ProductivityGoal,
  EventFilters,
  MetricFilters,
  InsightFilters,
  PatternFilters,
  GoalFilters
} from './types';

/**
 * IndexedDB-based Analytics Storage
 * Handles persistent storage of all analytics data using IndexedDB
 */
export class AnalyticsStorage implements IAnalyticsStorage {
  private db: IDBDatabase | null = null;
  private dbName = 'ThoughtKeeperAnalytics';
  private dbVersion = 1;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await this.openDatabase();
      this.isInitialized = true;
      console.log('📊 Analytics Storage initialized');
    } catch (error) {
      console.error('Failed to initialize Analytics Storage:', error);
      // Fallback to in-memory storage if IndexedDB fails
      this.initializeFallbackStorage();
    }
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Events store
    if (!db.objectStoreNames.contains('events')) {
      const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
      eventsStore.createIndex('timestamp', 'timestamp');
      eventsStore.createIndex('type', 'type');
      eventsStore.createIndex('category', 'category');
      eventsStore.createIndex('sessionId', 'sessionId');
      eventsStore.createIndex('typeCategory', ['type', 'category']);
    }

    // Metrics store
    if (!db.objectStoreNames.contains('metrics')) {
      const metricsStore = db.createObjectStore('metrics', { keyPath: 'id', autoIncrement: true });
      metricsStore.createIndex('date', 'date');
      metricsStore.createIndex('period', ['period.type', 'period.start']);
    }

    // Insights store
    if (!db.objectStoreNames.contains('insights')) {
      const insightsStore = db.createObjectStore('insights', { keyPath: 'id' });
      insightsStore.createIndex('type', 'type');
      insightsStore.createIndex('category', 'category');
      insightsStore.createIndex('createdAt', 'createdAt');
      insightsStore.createIndex('confidence', 'confidence');
      insightsStore.createIndex('dismissed', 'dismissed');
    }

    // Patterns store
    if (!db.objectStoreNames.contains('patterns')) {
      const patternsStore = db.createObjectStore('patterns', { keyPath: 'id' });
      patternsStore.createIndex('pattern', 'pattern');
      patternsStore.createIndex('confidence', 'confidence');
      patternsStore.createIndex('lastSeen', 'lastSeen');
    }

    // Goals store
    if (!db.objectStoreNames.contains('goals')) {
      const goalsStore = db.createObjectStore('goals', { keyPath: 'id' });
      goalsStore.createIndex('status', 'status');
      goalsStore.createIndex('category', 'category');
      goalsStore.createIndex('priority', 'priority');
      goalsStore.createIndex('createdAt', 'createdAt');
      goalsStore.createIndex('timeframe', ['timeframe.type', 'timeframe.start']);
    }
  }

  /**
   * Save single event
   */
  async saveEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      const request = store.put(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save multiple events in batch
   */
  async saveEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (hasError) return;
        completed++;
        if (completed === events.length) {
          resolve();
        }
      };

      for (const event of events) {
        const request = store.put(event);
        request.onsuccess = checkComplete;
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      }

      if (events.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Get events with filters
   */
  async getEvents(filters: EventFilters): Promise<AnalyticsEvent[]> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      
      let request: IDBRequest;

      // Use appropriate index based on filters
      if (filters.types && filters.categories) {
        const index = store.index('typeCategory');
        // This is a simplified approach - in practice, you'd need more complex filtering
        request = index.getAll();
      } else if (filters.sessionId) {
        const index = store.index('sessionId');
        request = index.getAll(filters.sessionId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let results = request.result as AnalyticsEvent[];

        // Apply filters
        results = this.applyEventFilters(results, filters);

        // Apply limit and offset
        if (filters.offset) {
          results = results.slice(filters.offset);
        }
        if (filters.limit) {
          results = results.slice(0, filters.limit);
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete events matching filters
   */
  async deleteEvents(filters: EventFilters): Promise<number> {
    if (!this.db) return 0;

    const eventsToDelete = await this.getEvents(filters);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      let deleted = 0;
      let completed = 0;

      const checkComplete = () => {
        completed++;
        if (completed === eventsToDelete.length) {
          resolve(deleted);
        }
      };

      for (const event of eventsToDelete) {
        const request = store.delete(event.id);
        request.onsuccess = () => {
          deleted++;
          checkComplete();
        };
        request.onerror = checkComplete;
      }

      if (eventsToDelete.length === 0) {
        resolve(0);
      }
    });
  }

  /**
   * Save productivity metrics
   */
  async saveMetrics(metrics: ProductivityMetrics): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    const metricsWithId = { ...metrics, id: `${metrics.period.type}_${metrics.date.getTime()}` };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metrics'], 'readwrite');
      const store = transaction.objectStore('metrics');
      const request = store.put(metricsWithId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get productivity metrics with filters
   */
  async getMetrics(filters: MetricFilters): Promise<ProductivityMetrics[]> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metrics'], 'readonly');
      const store = transaction.objectStore('metrics');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as (ProductivityMetrics & { id: string })[];

        // Apply filters
        if (filters.periods && filters.periods.length > 0) {
          results = results.filter(metric => 
            filters.periods.some(period => 
              metric.period.type === period.type &&
              metric.period.start <= period.end &&
              metric.period.end >= period.start
            )
          );
        }

        if (filters.categories) {
          // Filter based on categories would need event-level data
          // This is a simplified implementation
        }

        // Remove the added id field
        const cleanResults = results.map(({ id, ...metric }) => metric);
        resolve(cleanResults);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save insight
   */
  async saveInsight(insight: AnalyticsInsight): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.put(insight);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get insights with filters
   */
  async getInsights(filters: InsightFilters): Promise<AnalyticsInsight[]> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readonly');
      const store = transaction.objectStore('insights');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as AnalyticsInsight[];

        // Apply filters
        if (filters.types) {
          results = results.filter(insight => filters.types!.includes(insight.type));
        }

        if (filters.categories) {
          results = results.filter(insight => filters.categories!.includes(insight.category));
        }

        if (filters.minConfidence !== undefined) {
          results = results.filter(insight => insight.confidence >= filters.minConfidence!);
        }

        if (filters.dismissed !== undefined) {
          results = results.filter(insight => !!insight.dismissed === filters.dismissed);
        }

        if (filters.implemented !== undefined) {
          results = results.filter(insight => !!insight.implemented === filters.implemented);
        }

        if (filters.timeRange) {
          const { start, end } = this.parseTimeRange(filters.timeRange);
          results = results.filter(insight => 
            insight.createdAt >= start && insight.createdAt <= end
          );
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update insight
   */
  async updateInsight(id: string, updates: Partial<AnalyticsInsight>): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const insight = getRequest.result;
        if (insight) {
          const updatedInsight = { ...insight, ...updates };
          const putRequest = store.put(updatedInsight);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Insight not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Save behavior pattern
   */
  async savePattern(pattern: UserBehaviorPattern): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patterns'], 'readwrite');
      const store = transaction.objectStore('patterns');
      const request = store.put(pattern);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get behavior patterns with filters
   */
  async getPatterns(filters: PatternFilters): Promise<UserBehaviorPattern[]> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patterns'], 'readonly');
      const store = transaction.objectStore('patterns');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as UserBehaviorPattern[];

        // Apply filters
        if (filters.types) {
          results = results.filter(pattern => filters.types!.includes(pattern.pattern));
        }

        if (filters.minConfidence !== undefined) {
          results = results.filter(pattern => pattern.confidence >= filters.minConfidence!);
        }

        if (filters.minFrequency !== undefined) {
          results = results.filter(pattern => pattern.frequency >= filters.minFrequency!);
        }

        if (filters.timeRange) {
          const { start, end } = this.parseTimeRange(filters.timeRange);
          results = results.filter(pattern => 
            pattern.lastSeen >= start && pattern.firstSeen <= end
          );
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save productivity goal
   */
  async saveGoal(goal: ProductivityGoal): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      const request = store.put(goal);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get goals with filters
   */
  async getGoals(filters: GoalFilters): Promise<ProductivityGoal[]> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readonly');
      const store = transaction.objectStore('goals');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as ProductivityGoal[];

        // Apply filters
        if (filters.status) {
          results = results.filter(goal => filters.status!.includes(goal.status));
        }

        if (filters.categories) {
          results = results.filter(goal => filters.categories!.includes(goal.category));
        }

        if (filters.priorities) {
          results = results.filter(goal => filters.priorities!.includes(goal.priority));
        }

        if (filters.timeRange) {
          const { start, end } = this.parseTimeRange(filters.timeRange);
          results = results.filter(goal => 
            goal.timeframe.start <= end && goal.timeframe.end >= start
          );
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update goal
   */
  async updateGoal(id: string, updates: Partial<ProductivityGoal>): Promise<void> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const goal = getRequest.result;
        if (goal) {
          const updatedGoal = { ...goal, ...updates, updatedAt: new Date() };
          const putRequest = store.put(updatedGoal);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Goal not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    if (!navigator.storage?.estimate) {
      return { used: 0, available: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  }

  /**
   * Cleanup old data
   */
  async cleanup(olderThan: Date): Promise<number> {
    if (!this.db) return 0;

    let totalDeleted = 0;

    try {
      // Cleanup events
      const eventsDeleted = await this.deleteEvents({
        timeRange: {
          type: 'absolute',
          absolute: {
            start: new Date(0),
            end: olderThan
          }
        }
      });
      totalDeleted += eventsDeleted;

      // Cleanup metrics
      const oldMetrics = await this.getMetrics({
        periods: [{
          type: 'day',
          start: new Date(0),
          end: olderThan,
          label: 'cleanup'
        }]
      });

      for (const metric of oldMetrics) {
        if (metric.date < olderThan) {
          // Delete old metrics (this would need the metric id)
          // Simplified for this implementation
        }
      }

      // Cleanup insights older than retention period
      const oldInsights = await this.getInsights({
        timeRange: {
          type: 'absolute',
          absolute: {
            start: new Date(0),
            end: olderThan
          }
        }
      });

      for (const insight of oldInsights) {
        await this.deleteInsight(insight.id);
        totalDeleted++;
      }

      console.log(`🗑️  Cleaned up ${totalDeleted} old analytics records`);
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }

    return totalDeleted;
  }

  /**
   * Private helper methods
   */
  private applyEventFilters(events: AnalyticsEvent[], filters: EventFilters): AnalyticsEvent[] {
    let results = events;

    // Filter by types
    if (filters.types && filters.types.length > 0) {
      results = results.filter(event => filters.types!.includes(event.type));
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(event => filters.categories!.includes(event.category));
    }

    // Filter by time range
    if (filters.timeRange) {
      const { start, end } = this.parseTimeRange(filters.timeRange);
      results = results.filter(event => event.timestamp >= start && event.timestamp <= end);
    }

    // Filter by user ID
    if (filters.userId) {
      results = results.filter(event => event.userId === filters.userId);
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(event => 
        event.action.toLowerCase().includes(searchLower) ||
        (event.label && event.label.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp (most recent first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return results;
  }

  private parseTimeRange(timeRange: any): { start: Date; end: Date } {
    if (timeRange.type === 'absolute' && timeRange.absolute) {
      return {
        start: new Date(timeRange.absolute.start),
        end: new Date(timeRange.absolute.end)
      };
    }

    if (timeRange.type === 'relative' && timeRange.relative) {
      const end = new Date();
      const start = new Date();
      
      switch (timeRange.relative.unit) {
        case 'minutes':
          start.setMinutes(start.getMinutes() - timeRange.relative.amount);
          break;
        case 'hours':
          start.setHours(start.getHours() - timeRange.relative.amount);
          break;
        case 'days':
          start.setDate(start.getDate() - timeRange.relative.amount);
          break;
        case 'weeks':
          start.setDate(start.getDate() - (timeRange.relative.amount * 7));
          break;
        case 'months':
          start.setMonth(start.getMonth() - timeRange.relative.amount);
          break;
        case 'years':
          start.setFullYear(start.getFullYear() - timeRange.relative.amount);
          break;
      }

      return { start, end };
    }

    // Default to last 24 hours
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 1);
    return { start, end };
  }

  private async deleteInsight(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fallback storage for when IndexedDB is not available
   */
  private fallbackStorage = {
    events: [] as AnalyticsEvent[],
    metrics: [] as ProductivityMetrics[],
    insights: [] as AnalyticsInsight[],
    patterns: [] as UserBehaviorPattern[],
    goals: [] as ProductivityGoal[]
  };

  private initializeFallbackStorage(): void {
    console.warn('Using fallback in-memory storage for analytics');
    this.isInitialized = true;

    // Override methods to use in-memory storage
    this.saveEvent = async (event: AnalyticsEvent) => {
      this.fallbackStorage.events.push(event);
    };

    this.saveEvents = async (events: AnalyticsEvent[]) => {
      this.fallbackStorage.events.push(...events);
    };

    this.getEvents = async (filters: EventFilters) => {
      return this.applyEventFilters(this.fallbackStorage.events, filters);
    };

    this.saveMetrics = async (metrics: ProductivityMetrics) => {
      this.fallbackStorage.metrics.push(metrics);
    };

    this.getMetrics = async (filters: MetricFilters) => {
      return this.fallbackStorage.metrics.filter(metric => {
        if (filters.periods && filters.periods.length > 0) {
          return filters.periods.some(period => 
            metric.period.type === period.type &&
            metric.period.start <= period.end &&
            metric.period.end >= period.start
          );
        }
        return true;
      });
    };

    this.saveInsight = async (insight: AnalyticsInsight) => {
      this.fallbackStorage.insights.push(insight);
    };

    this.getInsights = async (filters: InsightFilters) => {
      return this.fallbackStorage.insights.filter(insight => {
        if (filters.types && !filters.types.includes(insight.type)) return false;
        if (filters.categories && !filters.categories.includes(insight.category)) return false;
        if (filters.minConfidence !== undefined && insight.confidence < filters.minConfidence) return false;
        if (filters.dismissed !== undefined && !!insight.dismissed !== filters.dismissed) return false;
        if (filters.implemented !== undefined && !!insight.implemented !== filters.implemented) return false;
        return true;
      });
    };

    this.savePattern = async (pattern: UserBehaviorPattern) => {
      this.fallbackStorage.patterns.push(pattern);
    };

    this.getPatterns = async (filters: PatternFilters) => {
      return this.fallbackStorage.patterns.filter(pattern => {
        if (filters.types && !filters.types.includes(pattern.pattern)) return false;
        if (filters.minConfidence !== undefined && pattern.confidence < filters.minConfidence) return false;
        if (filters.minFrequency !== undefined && pattern.frequency < filters.minFrequency) return false;
        return true;
      });
    };

    this.saveGoal = async (goal: ProductivityGoal) => {
      const existingIndex = this.fallbackStorage.goals.findIndex(g => g.id === goal.id);
      if (existingIndex >= 0) {
        this.fallbackStorage.goals[existingIndex] = goal;
      } else {
        this.fallbackStorage.goals.push(goal);
      }
    };

    this.getGoals = async (filters: GoalFilters) => {
      return this.fallbackStorage.goals.filter(goal => {
        if (filters.status && !filters.status.includes(goal.status)) return false;
        if (filters.categories && !filters.categories.includes(goal.category)) return false;
        if (filters.priorities && !filters.priorities.includes(goal.priority)) return false;
        return true;
      });
    };

    this.updateGoal = async (id: string, updates: Partial<ProductivityGoal>) => {
      const goal = this.fallbackStorage.goals.find(g => g.id === id);
      if (goal) {
        Object.assign(goal, updates, { updatedAt: new Date() });
      }
    };

    this.cleanup = async (olderThan: Date) => {
      const initialCount = this.fallbackStorage.events.length;
      this.fallbackStorage.events = this.fallbackStorage.events.filter(
        event => event.timestamp >= olderThan
      );
      return initialCount - this.fallbackStorage.events.length;
    };
  }

  /**
   * Check if storage is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Wait for storage to be ready
   */
  async waitForReady(): Promise<void> {
    if (this.isReady()) return;

    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady()) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * Destroy storage and cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }
}
