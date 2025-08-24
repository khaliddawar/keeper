import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type {
  ExportImportContext,
  ExportConfig,
  ImportConfig,
  ExportData,
  ImportResult,
  ImportPreview,
  ExportProgress,
  ImportProgress,
  ExportTemplate,
  ExportMetadata,
  ValidationResult,
  ImportFieldMapping
} from './types';
import { ExportHandlerRegistry } from './handlers/ExportHandlerRegistry';
import { ImportHandlerRegistry } from './handlers/ImportHandlerRegistry';

/**
 * Export/Import Context
 */
const ExportImportContext = createContext<ExportImportContext | null>(null);

/**
 * State management for export/import operations
 */
interface ExportImportState {
  isExporting: boolean;
  isImporting: boolean;
  exportProgress: ExportProgress | null;
  importProgress: ImportProgress | null;
  lastExport?: ExportMetadata;
  lastImport?: ImportResult;
  templates: ExportTemplate[];
}

type ExportImportAction =
  | { type: 'START_EXPORT' }
  | { type: 'UPDATE_EXPORT_PROGRESS'; progress: ExportProgress }
  | { type: 'COMPLETE_EXPORT'; metadata: ExportMetadata }
  | { type: 'CANCEL_EXPORT' }
  | { type: 'ERROR_EXPORT'; error: string }
  | { type: 'START_IMPORT' }
  | { type: 'UPDATE_IMPORT_PROGRESS'; progress: ImportProgress }
  | { type: 'COMPLETE_IMPORT'; result: ImportResult }
  | { type: 'CANCEL_IMPORT' }
  | { type: 'ERROR_IMPORT'; error: string }
  | { type: 'SET_TEMPLATES'; templates: ExportTemplate[] }
  | { type: 'ADD_TEMPLATE'; template: ExportTemplate }
  | { type: 'UPDATE_TEMPLATE'; id: string; template: ExportTemplate }
  | { type: 'DELETE_TEMPLATE'; id: string };

const initialState: ExportImportState = {
  isExporting: false,
  isImporting: false,
  exportProgress: null,
  importProgress: null,
  templates: []
};

function exportImportReducer(state: ExportImportState, action: ExportImportAction): ExportImportState {
  switch (action.type) {
    case 'START_EXPORT':
      return {
        ...state,
        isExporting: true,
        exportProgress: {
          stage: 'preparing',
          progress: 0,
          processedItems: 0,
          totalItems: 0,
          message: 'Preparing export...',
          timeElapsed: 0
        }
      };
      
    case 'UPDATE_EXPORT_PROGRESS':
      return {
        ...state,
        exportProgress: action.progress
      };
      
    case 'COMPLETE_EXPORT':
      return {
        ...state,
        isExporting: false,
        exportProgress: null,
        lastExport: action.metadata
      };
      
    case 'CANCEL_EXPORT':
    case 'ERROR_EXPORT':
      return {
        ...state,
        isExporting: false,
        exportProgress: action.type === 'ERROR_EXPORT' ? {
          ...state.exportProgress!,
          stage: 'error',
          error: action.error
        } : null
      };
      
    case 'START_IMPORT':
      return {
        ...state,
        isImporting: true,
        importProgress: {
          stage: 'parsing',
          progress: 0,
          processedItems: 0,
          totalItems: 0,
          message: 'Parsing import file...',
          timeElapsed: 0
        }
      };
      
    case 'UPDATE_IMPORT_PROGRESS':
      return {
        ...state,
        importProgress: action.progress
      };
      
    case 'COMPLETE_IMPORT':
      return {
        ...state,
        isImporting: false,
        importProgress: null,
        lastImport: action.result
      };
      
    case 'CANCEL_IMPORT':
    case 'ERROR_IMPORT':
      return {
        ...state,
        isImporting: false,
        importProgress: action.type === 'ERROR_IMPORT' ? {
          ...state.importProgress!,
          stage: 'error',
          error: action.error
        } : null
      };
      
    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.templates
      };
      
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.template]
      };
      
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t => 
          t.id === action.id ? action.template : t
        )
      };
      
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.id)
      };
      
    default:
      return state;
  }
}

/**
 * Export/Import Provider Props
 */
interface ExportImportProviderProps {
  children: React.ReactNode;
}

/**
 * Export/Import Provider Component
 */
export const ExportImportProvider: React.FC<ExportImportProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(exportImportReducer, initialState);
  
  // Refs for cancellation
  const exportCancelRef = useRef<AbortController | null>(null);
  const importCancelRef = useRef<AbortController | null>(null);
  
  // Registry instances
  const exportHandlerRegistry = useRef(new ExportHandlerRegistry()).current;
  const importHandlerRegistry = useRef(new ImportHandlerRegistry()).current;

  /**
   * Load export templates from localStorage
   */
  const loadTemplates = useCallback(() => {
    try {
      const savedTemplates = localStorage.getItem('thoughtkeeper_export_templates');
      if (savedTemplates) {
        const templates = JSON.parse(savedTemplates);
        dispatch({ type: 'SET_TEMPLATES', templates });
      }
    } catch (error) {
      console.error('Failed to load export templates:', error);
    }
  }, []);

  /**
   * Save templates to localStorage
   */
  const saveTemplates = useCallback((templates: ExportTemplate[]) => {
    try {
      localStorage.setItem('thoughtkeeper_export_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save export templates:', error);
    }
  }, []);

  /**
   * Get current data for export
   */
  const getCurrentData = useCallback(async (): Promise<ExportData> => {
    // This would typically fetch from your data stores
    // For now, we'll simulate with mock data
    const { MockApiService } = await import('../../mocks');
    
    const notebooksResponse = await MockApiService.notebooks.getNotebooks();
    const notebooks = notebooksResponse.notebooks;
    const tasksResponse = await MockApiService.tasks.getTasks({ includeSubtasks: true });
    
    return {
      metadata: {
        version: '1.0.0',
        format: 'json',
        exportedAt: new Date(),
        source: 'ThoughtKeeper',
        itemCounts: {
          notebooks: notebooks.length,
          tasks: tasksResponse.tasks.length,
          subtasks: tasksResponse.tasks.reduce((sum, task) => 
            sum + (task.subtasks?.length || 0), 0
          )
        },
        filters: []
      },
      notebooks: notebooks.map((notebook: any) => ({
        id: notebook.id,
        title: notebook.title,
        description: notebook.description || '',
        content: notebook.content || '',
        tags: notebook.tags || [],
        color: notebook.color,
        category: notebook.category || 'personal',
        isFavorite: notebook.isFavorite || false,
        isArchived: notebook.isArchived || false,
        taskCount: notebook.taskCount || 0,
        collaborators: notebook.collaborators || [],
        createdAt: new Date(notebook.createdAt),
        updatedAt: new Date(notebook.updatedAt)
      })),
      tasks: tasksResponse.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        // notes field not in Task; omit
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
        notebookId: task.notebookId,
        parentId: task.parentId,
        assignee: task.assignee,
        // map time fields to export schema if present
        estimatedHours: task.timeEstimate,
        actualHours: task.actualTimeSpent,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        subtasks: (task.subtasks || []).map((subtask: any) => ({
          id: subtask.id,
          title: subtask.title,
          completed: Boolean(subtask.completedAt),
          createdAt: new Date(subtask.createdAt),
          updatedAt: new Date(subtask.updatedAt)
        }))
      }))
    };
  }, []);

  /**
   * Export data
   */
  const exportData = useCallback(async (config: ExportConfig): Promise<void> => {
    const controller = new AbortController();
    exportCancelRef.current = controller;
    
    dispatch({ type: 'START_EXPORT' });
    const startTime = Date.now();
    
    try {
      // Get export handler
      const handler = exportHandlerRegistry.getHandler(config.format);
      if (!handler) {
        throw new Error(`Unsupported export format: ${config.format}`);
      }
      
      // Update progress: collecting data
      dispatch({
        type: 'UPDATE_EXPORT_PROGRESS',
        progress: {
          stage: 'collecting',
          progress: 10,
          processedItems: 0,
          totalItems: 0,
          message: 'Collecting data...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      // Get data
      const data = await getCurrentData();
      
      // Apply filters if any
      let filteredData = data;
      if (config.filters.length > 0) {
        // Apply filters (implementation would depend on filter logic)
        // For now, we'll just use the original data
      }
      
      const totalItems = filteredData.notebooks.length + filteredData.tasks.length;
      
      // Update progress: transforming
      dispatch({
        type: 'UPDATE_EXPORT_PROGRESS',
        progress: {
          stage: 'transforming',
          progress: 40,
          processedItems: 0,
          totalItems,
          message: 'Transforming data...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      // Update metadata
      filteredData.metadata = {
        ...filteredData.metadata,
        format: config.format,
        filters: config.filters,
        itemCounts: {
          notebooks: filteredData.notebooks.length,
          tasks: filteredData.tasks.length,
          subtasks: filteredData.tasks.reduce((sum, task) => sum + task.subtasks.length, 0)
        }
      };
      
      // Update progress: generating file
      dispatch({
        type: 'UPDATE_EXPORT_PROGRESS',
        progress: {
          stage: 'generating',
          progress: 70,
          processedItems: totalItems,
          totalItems,
          message: 'Generating export file...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      // Generate export
      const blob = await handler.export(filteredData, config);
      
      // Update progress: complete
      dispatch({
        type: 'UPDATE_EXPORT_PROGRESS',
        progress: {
          stage: 'complete',
          progress: 100,
          processedItems: totalItems,
          totalItems,
          message: 'Export complete',
          timeElapsed: Date.now() - startTime
        }
      });
      
      // Download file
      downloadBlob(blob, config.filename || generateFilename(config.format), handler.mimeType);
      
      // Complete export
      dispatch({
        type: 'COMPLETE_EXPORT',
        metadata: filteredData.metadata
      });
      
    } catch (error) {
      if (controller.signal.aborted) {
        dispatch({ type: 'CANCEL_EXPORT' });
      } else {
        dispatch({ 
          type: 'ERROR_EXPORT', 
          error: error instanceof Error ? error.message : 'Export failed'
        });
      }
    } finally {
      exportCancelRef.current = null;
    }
  }, [getCurrentData, exportHandlerRegistry]);

  /**
   * Cancel export
   */
  const cancelExport = useCallback(() => {
    if (exportCancelRef.current) {
      exportCancelRef.current.abort();
    }
  }, []);

  /**
   * Preview import
   */
  const previewImport = useCallback(async (config: Omit<ImportConfig, 'dryRun'>): Promise<ImportPreview> => {
    const handler = importHandlerRegistry.getHandler(config.format);
    if (!handler) {
      throw new Error(`Unsupported import format: ${config.format}`);
    }
    
    // Parse file
    const rawData = await handler.parse(config.file);
    
    // Validate data
    const validationResults = await handler.validate(rawData, { ...config, dryRun: true });
    
    // Count valid/invalid items
    const validItems = validationResults.filter(r => r.isValid).length;
    const invalidItems = validationResults.filter(r => !r.isValid).length;
    
    // Generate sample data (first 5 items)
    const transformedData = await handler.transform(
      rawData.slice(0, 5), 
      config.mapping
    );
    
    return {
      totalItems: rawData.length,
      validItems,
      invalidItems,
      conflicts: [], // Would be populated by conflict detection
      errors: validationResults
        .filter(r => !r.isValid && r.error)
        .map(r => ({
          type: 'validation',
          message: r.error!,
          severity: 'error' as const,
          fixable: false
        })),
      warnings: validationResults
        .filter(r => r.warning)
        .map(r => ({
          type: 'data_loss',
          message: r.warning!,
          impact: 'low' as const
        })),
      sampleData: {
        notebooks: transformedData.notebooks.slice(0, 3),
        tasks: transformedData.tasks.slice(0, 3)
      }
    };
  }, [importHandlerRegistry]);

  /**
   * Import data
   */
  const importData = useCallback(async (config: ImportConfig): Promise<ImportResult> => {
    const controller = new AbortController();
    importCancelRef.current = controller;
    
    dispatch({ type: 'START_IMPORT' });
    const startTime = Date.now();
    
    try {
      const handler = importHandlerRegistry.getHandler(config.format);
      if (!handler) {
        throw new Error(`Unsupported import format: ${config.format}`);
      }
      
      // Parse file
      dispatch({
        type: 'UPDATE_IMPORT_PROGRESS',
        progress: {
          stage: 'parsing',
          progress: 10,
          processedItems: 0,
          totalItems: 0,
          message: 'Parsing import file...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      const rawData = await handler.parse(config.file);
      
      // Validate
      dispatch({
        type: 'UPDATE_IMPORT_PROGRESS',
        progress: {
          stage: 'validating',
          progress: 30,
          processedItems: 0,
          totalItems: rawData.length,
          message: 'Validating data...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      const validationResults = await handler.validate(rawData, config);
      
      // Transform
      dispatch({
        type: 'UPDATE_IMPORT_PROGRESS',
        progress: {
          stage: 'importing',
          progress: 50,
          processedItems: 0,
          totalItems: rawData.length,
          message: 'Importing data...',
          timeElapsed: Date.now() - startTime
        }
      });
      
      const transformedData = await handler.transform(rawData, config.mapping);
      
      // Import to stores (simulation)
      const result: ImportResult = {
        success: true,
        processed: rawData.length,
        imported: validationResults.filter(r => r.isValid).length,
        skipped: 0,
        errors: validationResults.filter(r => !r.isValid).length,
        warnings: validationResults.filter(r => r.warning).length,
        conflicts: 0,
        duration: Date.now() - startTime,
        summary: {
          notebooks: {
            created: transformedData.notebooks.length,
            updated: 0,
            skipped: 0,
            errors: 0
          },
          tasks: {
            created: transformedData.tasks.length,
            updated: 0,
            skipped: 0,
            errors: 0
          }
        },
        details: []
      };
      
      dispatch({ type: 'COMPLETE_IMPORT', result });
      return result;
      
    } catch (error) {
      if (controller.signal.aborted) {
        dispatch({ type: 'CANCEL_IMPORT' });
        throw new Error('Import cancelled');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Import failed';
        dispatch({ type: 'ERROR_IMPORT', error: errorMessage });
        throw new Error(errorMessage);
      }
    } finally {
      importCancelRef.current = null;
    }
  }, [importHandlerRegistry]);

  /**
   * Cancel import
   */
  const cancelImport = useCallback(() => {
    if (importCancelRef.current) {
      importCancelRef.current.abort();
    }
  }, []);

  /**
   * Template management
   */
  const getExportTemplates = useCallback(() => state.templates, [state.templates]);

  const createExportTemplate = useCallback(async (template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportTemplate> => {
    const newTemplate: ExportTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_TEMPLATE', template: newTemplate });
    saveTemplates([...state.templates, newTemplate]);
    return newTemplate;
  }, [state.templates, saveTemplates]);

  const updateExportTemplate = useCallback(async (id: string, updates: Partial<ExportTemplate>): Promise<ExportTemplate> => {
    const updatedTemplate = {
      ...state.templates.find(t => t.id === id)!,
      ...updates,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_TEMPLATE', id, template: updatedTemplate });
    const updatedTemplates = state.templates.map(t => t.id === id ? updatedTemplate : t);
    saveTemplates(updatedTemplates);
    return updatedTemplate;
  }, [state.templates, saveTemplates]);

  const deleteExportTemplate = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_TEMPLATE', id });
    const updatedTemplates = state.templates.filter(t => t.id !== id);
    saveTemplates(updatedTemplates);
  }, [state.templates, saveTemplates]);

  /**
   * Utility functions
   */
  const validateImportFile = useCallback(async (file: File, format: ImportFormat): Promise<ValidationResult> => {
    const handler = importHandlerRegistry.getHandler(format);
    if (!handler) {
      return {
        isValid: false,
        error: `Unsupported format: ${format}`
      };
    }
    
    // Check file size
    if (handler.maxFileSize && file.size > handler.maxFileSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${handler.maxFileSize / 1024 / 1024}MB`
      };
    }
    
    // Check file type
    if (!handler.mimeTypes.includes(file.type) && !handler.extensions.some(ext => file.name.endsWith(ext))) {
      return {
        isValid: false,
        error: `Invalid file type. Expected: ${handler.extensions.join(', ')}`
      };
    }
    
    return { isValid: true };
  }, [importHandlerRegistry]);

  const generateMapping = useCallback(async (file: File, format: ImportFormat): Promise<ImportFieldMapping[]> => {
    const handler = importHandlerRegistry.getHandler(format);
    if (!handler) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    const columns = await handler.detectColumns(file);
    return handler.generateMapping(columns);
  }, [importHandlerRegistry]);

  const downloadExport = useCallback((data: ExportData, config: ExportConfig) => {
    // This would typically trigger a download
    // Implementation depends on the export handler
    console.log('Downloading export:', data, config);
  }, []);

  // Initialize templates on mount
  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const contextValue: ExportImportContext = {
    // Export
    exportData,
    cancelExport,
    getExportProgress: () => state.exportProgress,
    
    // Import
    importData,
    previewImport,
    cancelImport,
    getImportProgress: () => state.importProgress,
    
    // Templates
    getExportTemplates,
    createExportTemplate,
    updateExportTemplate,
    deleteExportTemplate,
    
    // Utilities
    validateImportFile,
    generateMapping,
    downloadExport,
    
    // State
    isExporting: state.isExporting,
    isImporting: state.isImporting,
    exportProgress: state.exportProgress,
    importProgress: state.importProgress,
    lastExport: state.lastExport,
    lastImport: state.lastImport
  };

  return (
    <ExportImportContext.Provider value={contextValue}>
      {children}
    </ExportImportContext.Provider>
  );
};

/**
 * Hook to use Export/Import context
 */
export const useExportImport = (): ExportImportContext => {
  const context = useContext(ExportImportContext);
  if (!context) {
    throw new Error('useExportImport must be used within an ExportImportProvider');
  }
  return context;
};

// Utility functions
function downloadBlob(blob: Blob, filename: string, mimeType: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function generateFilename(format: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `thoughtkeeper-export-${timestamp}.${format}`;
}
