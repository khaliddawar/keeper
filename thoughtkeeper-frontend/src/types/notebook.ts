/**
 * Notebook Types
 * 
 * Core type definitions for notebook entities in the ThoughtKeeper application.
 * Notebooks are the primary organizational unit for tasks and content.
 */

// Notebook status type
export type NotebookStatus = 'active' | 'archived' | 'draft';

// Notebook collaborator role
export type CollaboratorRole = 'viewer' | 'editor' | 'owner';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Notebook entity
export interface Notebook {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: NotebookStatus;
  tags: string[];
  color?: string;
  icon?: string;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  shared: boolean;
  pinned: boolean;
  archived: boolean;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  attachments?: Attachment[];
  collaborators?: Collaborator[];
}

// Attachment interface
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date | string;
}

// Collaborator interface
export interface Collaborator {
  userId: string;
  role: CollaboratorRole;
  addedAt: Date | string;
}

// Create notebook data
export interface CreateNotebookData {
  title: string;
  description?: string;
  content?: string;
  status?: NotebookStatus;
  tags?: string[];
  color?: string;
  icon?: string;
  shared?: boolean;
  pinned?: boolean;
}

// Update notebook data
export interface UpdateNotebookData {
  title?: string;
  description?: string;
  content?: string;
  status?: NotebookStatus;
  tags?: string[];
  color?: string;
  icon?: string;
  shared?: boolean;
  pinned?: boolean;
  archived?: boolean;
}

// Notebook statistics
export interface NotebookStats {
  total: number;
  active: number;
  archived: number;
  shared: number;
  pinned: number;
  totalWords: number;
  totalTasks: number;
  completedTasks: number;
}

// Notebook query options
export interface NotebookQueryOptions {
  search?: string;
  status?: NotebookStatus;
  tags?: string[];
  shared?: boolean;
  archived?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'wordCount';
  sortOrder?: SortDirection;
  limit?: number;
  offset?: number;
}

// Notebook creation request
export interface CreateNotebookRequest extends CreateNotebookData {
  // Additional fields for API request if needed
}

// Notebook update request
export interface UpdateNotebookRequest extends UpdateNotebookData {
  // Additional fields for API request if needed
}

// Notebook response from API
export interface NotebookResponse {
  notebook: Notebook;
  message?: string;
}

// Notebooks list response
export interface NotebooksResponse {
  notebooks: Notebook[];
  total: number;
  hasMore: boolean;
}

// Notebook activity
export interface NotebookActivity {
  id: string;
  notebookId: string;
  userId: string;
  action: 'created' | 'updated' | 'shared' | 'archived' | 'deleted';
  timestamp: Date | string;
  details?: string;
}

// Integration types for notebooks
export type NotebookIntegrationType = 'google-drive' | 'dropbox' | 'notion' | 'obsidian';