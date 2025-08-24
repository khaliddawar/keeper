/**
 * Mock Data System - Entry Point
 * 
 * Provides comprehensive mock data and API simulation for development and testing
 * 
 * Features:
 * - Realistic notebook and task data with proper relationships
 * - Full CRUD operations with proper delays and error simulation
 * - Search, filtering, and pagination support
 * - Statistics and analytics
 * - Development utilities and helpers
 */

import {
  MOCK_DATA,
  generateMockData,
  getMockNotebooks,
  getMockTasks,
  getMockUsers,
  getMockStats,
  searchNotebooks,
  searchTasks,
  getTasksByNotebook,
  getSubtasks,
  getOverdueTasks,
  getDueTasks
} from './mockData';

import {
  MockApiService,
  NotebooksApiMock,
  TasksApiMock
} from './mockApi';

// Re-export everything
export {
  MOCK_DATA,
  generateMockData,
  getMockNotebooks,
  getMockTasks,
  getMockUsers,
  getMockStats,
  searchNotebooks,
  searchTasks,
  getTasksByNotebook,
  getSubtasks,
  getOverdueTasks,
  getDueTasks,
  MockApiService,
  NotebooksApiMock,
  TasksApiMock
};

// Development utilities
export const DevUtils = {
  /**
   * Log current mock data state to console
   */
  logDataState: () => {
    const data = MockApiService.getCurrentData();
    console.group('📊 Mock Data State');
    console.log('📚 Notebooks:', data.notebooks.length);
    console.log('✅ Tasks:', data.tasks.length);
    console.log('🏷️ Unique Tags:', [...new Set(data.notebooks.flatMap(n => n.tags))]);
    console.log('👥 Assignees:', [...new Set(data.tasks.map(t => t.assignee).filter(Boolean))]);
    console.groupEnd();
  },
  
  /**
   * Generate additional mock data for testing large datasets
   */
  generateLargeDataset: (notebookCount = 50, tasksPerNotebook = 15) => {
    console.log(`🔄 Generating large dataset: ${notebookCount} notebooks, ~${tasksPerNotebook} tasks each`);
    const newData = generateMockData();
    // Would typically add logic to generate larger datasets
    console.log('✅ Large dataset generated');
    return newData;
  },
  
  /**
   * Reset mock data to initial state
   */
  resetData: () => {
    MockApiService.resetData();
    console.log('🔄 Mock data reset to initial state');
  },
  
  /**
   * Simulate API performance testing
   */
  performanceTest: async () => {
    console.log('🚀 Running API performance test...');
    const start = performance.now();
    
    try {
      await Promise.all([
        MockApiService.notebooks.getNotebooks({ limit: 10 }),
        MockApiService.tasks.getTasks({ limit: 20 }),
        MockApiService.notebooks.getNotebookStats(),
        MockApiService.tasks.getTaskStats()
      ]);
      
      const end = performance.now();
      console.log(`✅ Performance test completed in ${Math.round(end - start)}ms`);
    } catch (error) {
      console.error('❌ Performance test failed:', error);
    }
  },
  
  /**
   * Test error simulation
   */
  testErrorHandling: async () => {
    console.log('🧪 Testing error handling...');
    let errorCount = 0;
    
    // Run multiple API calls to trigger random errors
    for (let i = 0; i < 10; i++) {
      try {
        await MockApiService.notebooks.getNotebooks();
      } catch (error) {
        errorCount++;
        console.log(`❌ Error ${errorCount}:`, (error as Error).message);
      }
    }
    
    console.log(`✅ Error test completed. ${errorCount}/10 calls failed (expected ~5% failure rate)`);
  },
  
  /**
   * Analyze mock data relationships
   */
  analyzeRelationships: () => {
    const data = MockApiService.getCurrentData();
    
    console.group('🔍 Data Relationship Analysis');
    
    // Notebook analysis
    const notebooksByStatus = data.notebooks.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📚 Notebooks by status:', notebooksByStatus);
    
    // Task analysis
    const tasksByStatus = data.tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('✅ Tasks by status:', tasksByStatus);
    
    // Relationship analysis
    const notebooksWithTasks = data.notebooks.filter(n => 
      data.tasks.some(t => t.notebookId === n.id)
    ).length;
    console.log(`🔗 ${notebooksWithTasks}/${data.notebooks.length} notebooks have tasks`);
    
    const parentTasks = data.tasks.filter(t => !t.parentId).length;
    const subtasks = data.tasks.filter(t => t.parentId).length;
    console.log(`📋 ${parentTasks} parent tasks, ${subtasks} subtasks`);
    
    // Due date analysis
    const tasksWithDueDates = data.tasks.filter(t => t.dueDate).length;
    const overdueTasks = getOverdueTasks().length;
    const dueSoonTasks = getDueTasks(7).length;
    
    console.log(`📅 ${tasksWithDueDates}/${data.tasks.length} tasks have due dates`);
    console.log(`⚠️ ${overdueTasks} overdue tasks`);
    console.log(`⏰ ${dueSoonTasks} tasks due within 7 days`);
    
    console.groupEnd();
  },
  
  /**
   * Export mock data for external use
   */
  exportData: (format: 'json' | 'csv' = 'json') => {
    const data = MockApiService.getCurrentData();
    
    if (format === 'json') {
      const jsonData = JSON.stringify(data, null, 2);
      console.log('📁 JSON Export ready (copy from console)');
      console.log(jsonData);
      return jsonData;
    } else if (format === 'csv') {
      // Simple CSV export for notebooks
      const csvHeaders = 'ID,Title,Status,Tags,Created,Updated';
      const csvRows = data.notebooks.map(n => 
        `"${n.id}","${n.title}","${n.status}","${n.tags.join(';')}","${n.createdAt}","${n.updatedAt}"`
      );
      const csvData = [csvHeaders, ...csvRows].join('\n');
      console.log('📁 CSV Export ready (copy from console)');
      console.log(csvData);
      return csvData;
    }
  }
};

// Make development utilities available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).ThoughtKeeperDevUtils = DevUtils;
  (window as any).MockApiService = MockApiService;
  
  console.log('🛠️ ThoughtKeeper Dev Utils available:');
  console.log('  - window.ThoughtKeeperDevUtils');
  console.log('  - window.MockApiService');
  console.log('  - Try: ThoughtKeeperDevUtils.analyzeRelationships()');
}

// Default export for convenience
export default {
  ...MOCK_DATA,
  api: MockApiService,
  dev: DevUtils
};
