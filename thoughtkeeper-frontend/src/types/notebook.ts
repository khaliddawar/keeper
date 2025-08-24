// Notebook type definitions

export interface Notebook {
  id: string;
  title: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  content?: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
  taskCount: number;
  urgentCount: number;
  progressIndicator: number; // 0-100 percentage
  recentActivity?: Date;
  sortOrder: number;
  shared: boolean;
  pinned: boolean;
  archived: boolean;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  attachments: string[];
  collaborators?: Array<{
    userId: string;
    role: 'viewer' | 'editor';
    addedAt: Date;
  }>;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotebookRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateNotebookRequest {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}

// Data interfaces used by stores and API
export interface CreateNotebookData {
  title: string;
  name?: string;
  description?: string;
  content?: string;
  status?: 'active' | 'archived' | 'draft';
  tags?: string[];
  color?: string;
  icon?: string;
  shared?: boolean;
  pinned?: boolean;
  attachments?: string[];
}

export interface UpdateNotebookData {
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  status?: 'active' | 'archived' | 'draft';
  tags?: string[];
  color?: string;
  icon?: string;
  shared?: boolean;
  pinned?: boolean;
  archived?: boolean;
  attachments?: string[];
}

// Notebook type enum for predefined categories
export enum NotebookType {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  HUSTLES = 'hustles',
  IDEAS = 'ideas'
}

// Default notebook configurations
export const DEFAULT_NOTEBOOKS: Record<NotebookType, Omit<Notebook, 'id' | 'taskCount' | 'urgentCount' | 'progressIndicator' | 'recentActivity' | 'createdAt' | 'updatedAt'>> = {
  [NotebookType.WORK]: {
    title: 'Work',
    name: 'Work',
    color: '#3B82F6',
    icon: 'briefcase',
    description: 'Professional tasks and projects',
    content: 'Professional notebook for work-related tasks and projects',
    status: 'active' as const,
    tags: ['work', 'professional'],
    shared: false,
    pinned: false,
    archived: false,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    attachments: [],
    collaborators: [],
    ownerId: '',
    sortOrder: 1
  },
  [NotebookType.PERSONAL]: {
    title: 'Personal',
    name: 'Personal',
    color: '#10B981',
    icon: 'home',
    description: 'Personal tasks and life management',
    content: 'Personal notebook for life management and personal tasks',
    status: 'active' as const,
    tags: ['personal', 'life'],
    shared: false,
    pinned: false,
    archived: false,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    attachments: [],
    collaborators: [],
    ownerId: '',
    sortOrder: 2
  },
  [NotebookType.HEALTH]: {
    title: 'Health',
    name: 'Health',
    color: '#EF4444',
    icon: 'heart',
    description: 'Health, fitness, and wellness goals',
    content: 'Health notebook for fitness tracking and wellness goals',
    status: 'active' as const,
    tags: ['health', 'fitness', 'wellness'],
    shared: false,
    pinned: false,
    archived: false,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    attachments: [],
    collaborators: [],
    ownerId: '',
    sortOrder: 3
  },
  [NotebookType.HUSTLES]: {
    title: 'Hustles',
    name: 'Hustles',
    color: '#F59E0B',
    icon: 'trending-up',
    description: 'Trading, side projects, and business ventures',
    content: 'Hustles notebook for trading and business ventures',
    status: 'active' as const,
    tags: ['business', 'trading', 'projects'],
    shared: false,
    pinned: false,
    archived: false,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    attachments: [],
    collaborators: [],
    ownerId: '',
    sortOrder: 4
  },
  [NotebookType.IDEAS]: {
    title: 'Ideas',
    name: 'Ideas',
    color: '#8B5CF6',
    icon: 'lightbulb',
    description: 'Creative ideas and future projects',
    content: 'Ideas notebook for creative concepts and future projects',
    status: 'active' as const,
    tags: ['ideas', 'creative', 'future'],
    shared: false,
    pinned: false,
    archived: false,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    attachments: [],
    collaborators: [],
    ownerId: '',
    sortOrder: 5
  }
};

// Notebook statistics interface
export interface NotebookStats {
  total: number;
  active: number;
  archived: number;
  shared: number;
  pinned: number;
  totalWords: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks?: number;
  urgentTasks?: number;
  overdueTasks?: number;
  progressPercentage?: number;
  averageCompletionTime?: number; // in hours
  lastActivity?: Date | null;
}

// Notebook filter and sort options
export interface NotebookFilters {
  searchQuery?: string;
  hasUrgentTasks?: boolean;
  hasOverdueTasks?: boolean;
  sortBy: 'name' | 'taskCount' | 'recentActivity' | 'sortOrder';
  sortDirection: 'asc' | 'desc';
}

export type NotebookSortOption = NotebookFilters['sortBy'];
