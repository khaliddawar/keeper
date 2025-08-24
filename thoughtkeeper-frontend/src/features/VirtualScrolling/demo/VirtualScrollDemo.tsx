import React, { useState, useMemo } from 'react';
import { VirtualList, VirtualTaskList, VirtualNotebookList, VirtualSearchResults } from '../index';
import { VirtualScrollPresets } from '../index';
import type { VirtualItemProps } from '../types';

/**
 * Virtual Scrolling Demo Component
 * Demonstrates virtual scrolling with large datasets
 */
export const VirtualScrollDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'tasks' | 'notebooks' | 'search'>('basic');
  const [itemCount, setItemCount] = useState(1000);
  
  // Generate large dataset for basic demo
  const basicItems = useMemo(() => {
    return Array.from({ length: itemCount }, (_, index) => ({
      id: `item-${index}`,
      title: `Item ${index + 1}`,
      description: `This is the description for item ${index + 1}. It contains some sample text to demonstrate variable height calculation and content rendering.`,
      value: Math.floor(Math.random() * 1000),
      category: ['work', 'personal', 'project'][index % 3],
      created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, [itemCount]);

  // Generate large task dataset
  const taskItems = useMemo(() => {
    return Array.from({ length: itemCount }, (_, index) => ({
      id: `task-${index}`,
      title: `Task ${index + 1}`,
      description: `This is task number ${index + 1}. ${index % 3 === 0 ? 'It has a longer description to test dynamic height calculation and text wrapping in the virtual list component.' : ''}`,
      status: ['pending', 'in_progress', 'completed', 'cancelled'][index % 4] as any,
      priority: ['low', 'medium', 'high', 'urgent'][index % 4] as any,
      tags: [`tag${index % 5}`, `category${index % 3}`],
      dueDate: index % 10 === 0 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      subtasks: index % 5 === 0 ? [
        { id: `subtask-1`, title: 'Subtask 1', completed: false },
        { id: `subtask-2`, title: 'Subtask 2', completed: true }
      ] : []
    }));
  }, [itemCount]);

  // Generate large notebook dataset
  const notebookItems = useMemo(() => {
    return Array.from({ length: itemCount }, (_, index) => ({
      id: `notebook-${index}`,
      title: `Notebook ${index + 1}`,
      description: `This is notebook ${index + 1}. ${index % 4 === 0 ? 'It contains detailed information about various topics and has been used extensively for research and documentation purposes.' : 'A simple notebook for quick notes.'}`,
      color: ['blue', 'green', 'purple', 'red', 'yellow'][index % 5],
      category: ['personal', 'work', 'project', 'reference'][index % 4],
      tags: [`research`, `notes`, `category${index % 3}`],
      taskCount: Math.floor(Math.random() * 50),
      isFavorite: index % 10 === 0,
      isArchived: index % 20 === 0,
      collaborators: index % 7 === 0 ? [`user${index % 5}`, `admin`] : [],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, [itemCount]);

  // Generate search results
  const searchResults = useMemo(() => {
    return basicItems.slice(0, Math.min(500, itemCount)).map((item, index) => ({
      item,
      score: Math.random(),
      highlights: index % 3 === 0 ? [
        {
          field: 'title',
          fragments: [`<mark>Item</mark> ${index + 1}`]
        },
        {
          field: 'description',
          fragments: [`This is the <mark>description</mark> for item ${index + 1}`]
        }
      ] : [],
      snippet: item.description,
      matchedFields: ['title', 'description']
    }));
  }, [basicItems, itemCount]);

  const renderBasicItem = ({ index, item, style }: VirtualItemProps) => (
    <div style={style} className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>Value: {item.value}</span>
          <span>Category: {item.category}</span>
          <span>Created: {new Date(item.created).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const renderSearchResultItem = (item: any, index: number) => (
    <div className="p-3">
      <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
        <span>Value: {item.value}</span>
        <span>Category: {item.category}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Virtual Scrolling Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating high-performance virtual scrolling with large datasets
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Demo Type:
            </label>
            <select
              value={activeDemo}
              onChange={(e) => setActiveDemo(e.target.value as any)}
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="basic">Basic List</option>
              <option value="tasks">Task List</option>
              <option value="notebooks">Notebook List</option>
              <option value="search">Search Results</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Item Count:
            </label>
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={100}>100 items</option>
              <option value={500}>500 items</option>
              <option value={1000}>1,000 items</option>
              <option value={5000}>5,000 items</option>
              <option value={10000}>10,000 items</option>
              <option value={50000}>50,000 items</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Performance:</strong> Only visible items are rendered in the DOM. 
            Scroll through {itemCount.toLocaleString()} items smoothly with minimal memory usage.
          </p>
        </div>
      </div>

      {/* Demo Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {activeDemo === 'basic' && 'Basic Virtual List'}
            {activeDemo === 'tasks' && 'Virtual Task List'}
            {activeDemo === 'notebooks' && 'Virtual Notebook List'}
            {activeDemo === 'search' && 'Virtual Search Results'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Showing {itemCount.toLocaleString()} items with virtual scrolling
          </p>
        </div>
        
        <div className="h-[600px]">
          {activeDemo === 'basic' && (
            <VirtualList
              items={basicItems}
              height="100%"
              itemHeight={120}
              renderItem={renderBasicItem}
              overscanCount={10}
            />
          )}
          
          {activeDemo === 'tasks' && (
            <VirtualTaskList
              tasks={taskItems}
              height="100%"
              onTaskClick={(task) => console.log('Task clicked:', task)}
              onTaskComplete={(taskId) => console.log('Task completed:', taskId)}
              enableSelection={true}
              showSubtasks={true}
              showPriority={true}
              showDueDate={true}
              showTags={true}
            />
          )}
          
          {activeDemo === 'notebooks' && (
            <VirtualNotebookList
              notebooks={notebookItems}
              height="100%"
              onNotebookClick={(notebook) => console.log('Notebook clicked:', notebook)}
              enableSelection={true}
              showDescription={true}
              showTaskCount={true}
              showTags={true}
              showCollaborators={true}
            />
          )}
          
          {activeDemo === 'search' && (
            <VirtualSearchResults
              results={searchResults}
              totalCount={searchResults.length}
              renderItem={renderSearchResultItem}
              height="100%"
              showScore={true}
              showHighlights={true}
              showSnippets={true}
              showMetadata={true}
            />
          )}
        </div>
      </div>

      {/* Performance Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Performance Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">DOM Efficiency</div>
            <div className="text-blue-700 dark:text-blue-300">
              Only ~20 DOM elements for {itemCount.toLocaleString()} items
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">Memory Usage</div>
            <div className="text-blue-700 dark:text-blue-300">
              Constant memory footprint regardless of dataset size
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">Scroll Performance</div>
            <div className="text-blue-700 dark:text-blue-300">
              60 FPS scrolling with smooth rendering
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">Browser Support</div>
            <div className="text-blue-700 dark:text-blue-300">
              Modern browsers with fallback support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollDemo;
