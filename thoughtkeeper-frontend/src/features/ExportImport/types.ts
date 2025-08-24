/**
 * Export/Import System Types
 * Defines interfaces for data portability and backup functionality
 */

// Export formats and configuration
export type ExportFormat = 'json' | 'csv' | 'excel' | 'markdown' | 'pdf';
export type ImportFormat = 'json' | 'csv' | 'excel';

export interface ExportConfig {
  format: ExportFormat;
  includeMetadata: boolean;
  includeDeleted: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters: ExportFilter[];
  compression: 'none' | 'zip' | 'gzip';
  filename?: string;
  template?: ExportTemplate;
}

export interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'between';
  value: any;
  enabled: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  config: Partial<ExportConfig>;
  fields: ExportFieldMapping[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required: boolean;
  defaultValue?: any;
}

// Export data structures
export interface ExportData {
  metadata: ExportMetadata;
  notebooks: ExportedNotebook[];
  tasks: ExportedTask[];
  settings?: Record<string, any>;
  customData?: Record<string, any>;
}

export interface ExportMetadata {
  version: string;
  format: ExportFormat;
  exportedAt: Date;
  exportedBy?: string;
  source: string;
  itemCounts: {
    notebooks: number;
    tasks: number;
    subtasks: number;
  };
  filters: ExportFilter[];
  checksum?: string;
}

export interface ExportedNotebook {
  id: string;
  title: string;
  description?: string;
  content?: string;
  tags: string[];
  color?: string;
  category?: string;
  isFavorite: boolean;
  isArchived: boolean;
  taskCount: number;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
  customFields?: Record<string, any>;
}

export interface ExportedTask {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  status: string;
  priority: string;
  tags: string[];
  notebookId?: string;
  parentId?: string;
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtasks: ExportedSubtask[];
  customFields?: Record<string, any>;
}

export interface ExportedSubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Import configuration and validation
export interface ImportConfig {
  format: ImportFormat;
  file: File;
  mapping: ImportFieldMapping[];
  conflictResolution: ConflictResolution;
  validation: ValidationConfig;
  preview: boolean;
  dryRun: boolean;
}

export interface ImportFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  validator?: (value: any) => ValidationResult;
  required: boolean;
  defaultValue?: any;
}

export interface ConflictResolution {
  strategy: 'skip' | 'overwrite' | 'merge' | 'prompt';
  mergeFields?: string[];
  preserveIds: boolean;
  updateExisting: boolean;
}

export interface ValidationConfig {
  strictMode: boolean;
  allowMissingFields: boolean;
  maxErrors: number;
  customValidators: Record<string, (value: any) => ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestedValue?: any;
}

// Import process and results
export interface ImportPreview {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  conflicts: ImportConflict[];
  errors: ImportError[];
  warnings: ImportWarning[];
  sampleData: {
    notebooks: Partial<ExportedNotebook>[];
    tasks: Partial<ExportedTask>[];
  };
}

export interface ImportConflict {
  type: 'duplicate_id' | 'duplicate_title' | 'missing_reference' | 'invalid_reference';
  sourceItem: any;
  existingItem?: any;
  field: string;
  severity: 'low' | 'medium' | 'high';
  resolution?: 'skip' | 'overwrite' | 'merge' | 'rename';
  suggestedAction?: string;
}

export interface ImportError {
  type: 'validation' | 'format' | 'reference' | 'constraint';
  message: string;
  field?: string;
  value?: any;
  row?: number;
  severity: 'error' | 'warning';
  fixable: boolean;
  suggestedFix?: string;
}

export interface ImportWarning {
  type: 'data_loss' | 'format_conversion' | 'missing_field' | 'deprecated_field';
  message: string;
  field?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ImportResult {
  success: boolean;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
  warnings: number;
  conflicts: number;
  duration: number;
  summary: ImportSummary;
  details: ImportItemResult[];
}

export interface ImportSummary {
  notebooks: {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  tasks: {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

export interface ImportItemResult {
  sourceId?: string;
  targetId?: string;
  type: 'notebook' | 'task' | 'subtask';
  action: 'created' | 'updated' | 'skipped' | 'error';
  error?: string;
  warnings: string[];
}

// Progress tracking
export interface ExportProgress {
  stage: 'preparing' | 'collecting' | 'transforming' | 'generating' | 'complete' | 'error';
  progress: number;
  processedItems: number;
  totalItems: number;
  currentItem?: string;
  message: string;
  timeElapsed: number;
  timeRemaining?: number;
  error?: string;
}

export interface ImportProgress {
  stage: 'parsing' | 'validating' | 'previewing' | 'importing' | 'complete' | 'error';
  progress: number;
  processedItems: number;
  totalItems: number;
  currentItem?: string;
  message: string;
  timeElapsed: number;
  timeRemaining?: number;
  error?: string;
}

// Context and hooks
export interface ExportImportContext {
  // Export
  exportData: (config: ExportConfig) => Promise<void>;
  cancelExport: () => void;
  getExportProgress: () => ExportProgress | null;
  
  // Import  
  importData: (config: ImportConfig) => Promise<ImportResult>;
  previewImport: (config: Omit<ImportConfig, 'dryRun'>) => Promise<ImportPreview>;
  cancelImport: () => void;
  getImportProgress: () => ImportProgress | null;
  
  // Templates
  getExportTemplates: () => ExportTemplate[];
  createExportTemplate: (template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ExportTemplate>;
  updateExportTemplate: (id: string, updates: Partial<ExportTemplate>) => Promise<ExportTemplate>;
  deleteExportTemplate: (id: string) => Promise<void>;
  
  // Utilities
  validateImportFile: (file: File, format: ImportFormat) => Promise<ValidationResult>;
  generateMapping: (file: File, format: ImportFormat) => Promise<ImportFieldMapping[]>;
  downloadExport: (data: ExportData, config: ExportConfig) => void;
  
  // State
  isExporting: boolean;
  isImporting: boolean;
  exportProgress: ExportProgress | null;
  importProgress: ImportProgress | null;
  lastExport?: ExportMetadata;
  lastImport?: ImportResult;
}

// UI Component Props
export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  selectedItems?: string[];
  defaultFormat?: ExportFormat;
  availableTemplates: ExportTemplate[];
}

export interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (config: ImportConfig) => void;
  onPreview: (config: ImportConfig) => void;
}

export interface ExportProgressProps {
  progress: ExportProgress;
  onCancel: () => void;
  onComplete?: () => void;
}

export interface ImportProgressProps {
  progress: ImportProgress;
  onCancel: () => void;
  onComplete?: (result: ImportResult) => void;
}

export interface ImportPreviewProps {
  preview: ImportPreview;
  config: ImportConfig;
  onUpdateConfig: (config: ImportConfig) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ConflictResolutionProps {
  conflicts: ImportConflict[];
  onResolve: (conflicts: ImportConflict[]) => void;
  onSkipAll: () => void;
  onOverwriteAll: () => void;
}

// Export format handlers
export interface ExportHandler {
  format: ExportFormat;
  name: string;
  description: string;
  extensions: string[];
  mimeType: string;
  maxFileSize?: number;
  
  export: (data: ExportData, config: ExportConfig) => Promise<Blob>;
  validate: (config: ExportConfig) => ValidationResult;
  getDefaultConfig: () => Partial<ExportConfig>;
  getFieldMappings: () => ExportFieldMapping[];
}

export interface ImportHandler {
  format: ImportFormat;
  name: string;
  description: string;
  extensions: string[];
  mimeTypes: string[];
  maxFileSize?: number;
  
  parse: (file: File) => Promise<any[]>;
  validate: (data: any[], config: ImportConfig) => Promise<ValidationResult[]>;
  transform: (data: any[], mapping: ImportFieldMapping[]) => Promise<ExportData>;
  detectColumns: (file: File) => Promise<string[]>;
  generateMapping: (columns: string[]) => ImportFieldMapping[];
}

// Backup and restore
export interface BackupConfig {
  includeSettings: boolean;
  includeDeletedItems: boolean;
  compression: boolean;
  encryption?: {
    enabled: boolean;
    password?: string;
    algorithm: 'AES-256' | 'AES-128';
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    maxBackups: number;
  };
}

export interface RestoreConfig {
  backup: File;
  selectiveRestore: boolean;
  selectedCategories: ('notebooks' | 'tasks' | 'settings')[];
  conflictResolution: ConflictResolution;
  createBackupBeforeRestore: boolean;
}

export interface BackupMetadata {
  id: string;
  name: string;
  createdAt: Date;
  size: number;
  itemCounts: Record<string, number>;
  version: string;
  encrypted: boolean;
  checksum: string;
}

// Analytics and reporting
export interface ExportAnalytics {
  totalExports: number;
  formatBreakdown: Record<ExportFormat, number>;
  averageExportSize: number;
  mostExportedItems: Array<{
    type: string;
    count: number;
  }>;
  exportTrends: Array<{
    date: Date;
    count: number;
    format: ExportFormat;
  }>;
}

export interface ImportAnalytics {
  totalImports: number;
  successRate: number;
  formatBreakdown: Record<ImportFormat, number>;
  commonErrors: Array<{
    error: string;
    count: number;
  }>;
  averageImportTime: number;
  importTrends: Array<{
    date: Date;
    count: number;
    success: boolean;
  }>;
}

// Advanced features
export interface DataTransformation {
  id: string;
  name: string;
  description: string;
  sourceFormat: ImportFormat;
  targetSchema: string;
  rules: TransformationRule[];
  isActive: boolean;
}

export interface TransformationRule {
  field: string;
  operation: 'map' | 'transform' | 'validate' | 'filter' | 'aggregate';
  parameters: Record<string, any>;
  condition?: string;
}

export interface SyncConfig {
  provider: 'google-drive' | 'dropbox' | 'onedrive' | 'icloud';
  credentials: Record<string, string>;
  autoSync: boolean;
  syncInterval: number;
  conflictResolution: ConflictResolution;
  lastSync?: Date;
}

// Error types
export class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public stage?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export class ImportError extends Error {
  constructor(
    message: string,
    public code: string,
    public stage?: string,
    public row?: number,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImportError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any,
    public rule?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
