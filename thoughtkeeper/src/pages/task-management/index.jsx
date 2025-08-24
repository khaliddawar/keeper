import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import QuickCaptureBar from '../../components/ui/QuickCaptureBar';
import ContextualSidebar from '../../components/ui/ContextualSidebar';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';

import Button from '../../components/ui/Button';
import KanbanBoard from './components/KanbanBoard';
import TaskListView from './components/TaskListView';
import TaskCalendarView from './components/TaskCalendarView';
import TaskModal from './components/TaskModal';
import TaskFilters from './components/TaskFilters';
import NotebookManager from './components/NotebookManager';

const TaskManagement = () => {
  const [viewMode, setViewMode] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNotebookManagerOpen, setIsNotebookManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [activeNotebook, setActiveNotebook] = useState('all');
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    dueDate: 'all',
    notebook: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    showCompleted: true,
    showArchived: false
  });

  const { notifications, showSuccess, showError, showWarning, showInfo, removeNotification } = useNotifications();

  // Predefined notebooks
  const defaultNotebooks = [
    { id: 'personal', name: 'Personal', color: '#10B981', icon: 'User' },
    { id: 'work', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
    { id: 'trading', name: 'Trading', color: '#F59E0B', icon: 'TrendingUp' },
    { id: 'reading', name: 'Reading', color: '#8B5CF6', icon: 'BookOpen' },
    { id: 'fitness', name: 'Fitness', color: '#EF4444', icon: 'Activity' },
    { id: 'ideas', name: 'Ideas', color: '#EC4899', icon: 'Lightbulb' }
  ];

  // Mock tasks data with notebooks
  const mockTasks = [
    {
      id: 1,
      title: "Review quarterly performance reports",
      description: "Analyze Q3 metrics and prepare presentation for stakeholders meeting next week.",
      priority: "high",
      status: "todo",
      dueDate: "2025-08-18",
      timeEstimate: "3 hours",
      progress: 0,
      notebook: "work",
      tags: ["reports", "quarterly"],
      originalThought: "thought-123",
      createdAt: "2025-08-15T10:00:00Z",
      updatedAt: "2025-08-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Plan weekend hiking trip",
      description: "Research trails, book campsite, and prepare gear list for the upcoming weekend adventure.",
      priority: "medium",
      status: "in-progress",
      dueDate: "2025-08-19",
      timeEstimate: "2 hours",
      progress: 65,
      notebook: "personal",
      tags: ["outdoor", "planning"],
      originalThought: "thought-456",
      createdAt: "2025-08-14T15:30:00Z",
      updatedAt: "2025-08-17T09:15:00Z"
    },
    {
      id: 3,
      title: "Update project documentation",
      description: "Revise API documentation and add new endpoint specifications for the mobile app integration.",
      priority: "medium",
      status: "todo",
      dueDate: "2025-08-20",
      timeEstimate: "4 hours",
      progress: 0,
      notebook: "work",
      tags: ["documentation", "api"],
      originalThought: "thought-789",
      createdAt: "2025-08-16T11:20:00Z",
      updatedAt: "2025-08-16T11:20:00Z"
    },
    {
      id: 4,
      title: "Call dentist for appointment",
      description: "Schedule routine cleaning and checkup for next month.",
      priority: "low",
      status: "completed",
      dueDate: "2025-08-16",
      timeEstimate: "15 minutes",
      progress: 100,
      notebook: "personal",
      tags: ["health"],
      originalThought: null,
      createdAt: "2025-08-15T08:45:00Z",
      updatedAt: "2025-08-16T14:30:00Z"
    },
    {
      id: 5,
      title: "Analyze crypto market trends",
      description: "Study Bitcoin and Ethereum price patterns for potential trading opportunities.",
      priority: "high",
      status: "in-progress",
      dueDate: "2025-08-17",
      timeEstimate: "2 hours",
      progress: 80,
      notebook: "trading",
      tags: ["crypto", "analysis"],
      originalThought: "thought-101",
      createdAt: "2025-08-13T16:00:00Z",
      updatedAt: "2025-08-17T12:45:00Z"
    },
    {
      id: 6,
      title: "Read \'Atomic Habits\' chapter 5",
      description: "Continue reading and take notes on habit stacking techniques.",
      priority: "medium",
      status: "todo",
      dueDate: "2025-08-18",
      timeEstimate: "45 minutes",
      progress: 0,
      notebook: "reading",
      tags: ["books", "self-improvement"],
      originalThought: null,
      createdAt: "2025-08-17T07:30:00Z",
      updatedAt: "2025-08-17T07:30:00Z"
    },
    {
      id: 7,
      title: "Morning workout routine",
      description: "30-minute HIIT workout focusing on cardio and core strength.",
      priority: "medium",
      status: "todo",
      dueDate: "2025-08-18",
      timeEstimate: "30 minutes",
      progress: 0,
      notebook: "fitness",
      tags: ["workout", "cardio"],
      originalThought: null,
      createdAt: "2025-08-17T06:00:00Z",
      updatedAt: "2025-08-17T06:00:00Z"
    },
    {
      id: 8,
      title: "App idea: Habit tracker with AI",
      description: "Develop concept for a habit tracking app that uses AI to provide personalized insights.",
      priority: "low",
      status: "todo",
      dueDate: null,
      timeEstimate: "1 hour",
      progress: 0,
      notebook: "ideas",
      tags: ["app", "ai", "habits"],
      originalThought: null,
      createdAt: "2025-08-16T20:00:00Z",
      updatedAt: "2025-08-16T20:00:00Z"
    }
  ];

  useEffect(() => {
    setNotebooks(defaultNotebooks);
    setTasks(mockTasks);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, activeNotebook]);

  const applyFilters = () => {
    let filtered = [...tasks];

    // Notebook filter
    if (activeNotebook !== 'all') {
      filtered = filtered?.filter(task => task?.notebook === activeNotebook);
    }

    if (filters?.notebook !== 'all') {
      filtered = filtered?.filter(task => task?.notebook === filters?.notebook);
    }

    // Priority filter
    if (filters?.priority !== 'all') {
      filtered = filtered?.filter(task => task?.priority === filters?.priority);
    }

    // Status filter
    if (filters?.status !== 'all') {
      if (filters?.status === 'overdue') {
        filtered = filtered?.filter(task => {
          if (!task?.dueDate || task?.status === 'completed') return false;
          return new Date(task.dueDate) < new Date();
        });
      } else {
        filtered = filtered?.filter(task => task?.status === filters?.status);
      }
    }

    // Due date filter
    if (filters?.dueDate !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow?.setDate(tomorrow?.getDate() + 1);

      filtered = filtered?.filter(task => {
        if (!task?.dueDate && filters?.dueDate === 'no-date') return true;
        if (!task?.dueDate) return false;

        const dueDate = new Date(task.dueDate);
        
        switch (filters?.dueDate) {
          case 'overdue':
            return dueDate < today && task?.status !== 'completed';
          case 'today':
            return dueDate?.toDateString() === today?.toDateString();
          case 'tomorrow':
            return dueDate?.toDateString() === tomorrow?.toDateString();
          case 'this-week':
            const weekEnd = new Date(today);
            weekEnd?.setDate(today?.getDate() + 7);
            return dueDate >= today && dueDate <= weekEnd;
          case 'this-month':
            return dueDate?.getMonth() === today?.getMonth() && dueDate?.getFullYear() === today?.getFullYear();
          default:
            return true;
        }
      });
    }

    // Show/hide completed and archived
    if (!filters?.showCompleted) {
      filtered = filtered?.filter(task => task?.status !== 'completed');
    }

    if (!filters?.showArchived) {
      filtered = filtered?.filter(task => !task?.archived);
    }

    // Sort tasks
    filtered?.sort((a, b) => {
      let aValue = a?.[filters?.sortBy];
      let bValue = b?.[filters?.sortBy];

      if (filters?.sortBy === 'dueDate') {
        aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
        bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
      }

      if (filters?.sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder?.[aValue] || 0;
        bValue = priorityOrder?.[bValue] || 0;
      }

      if (aValue < bValue) return filters?.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters?.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTasks(filtered);
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      setTasks(prev => prev?.map(task => 
        task?.id === editingTask?.id ? { ...taskData, id: editingTask?.id } : task
      ));
      showSuccess("Task updated successfully!");
    } else {
      const newTask = { 
        ...taskData, 
        id: Date.now(),
        notebook: taskData?.notebook || (activeNotebook !== 'all' ? activeNotebook : 'personal')
      };
      setTasks(prev => [...prev, newTask]);
      showSuccess("Task created successfully!");
    }
    setEditingTask(null);
  };

  const handleNotebookSave = (notebookData) => {
    if (notebookData?.id) {
      // Edit existing notebook
      setNotebooks(prev => prev?.map(notebook => 
        notebook?.id === notebookData?.id ? notebookData : notebook
      ));
      showSuccess("Notebook updated successfully!");
    } else {
      // Add new notebook
      const newNotebook = { 
        ...notebookData, 
        id: Date.now()?.toString() 
      };
      setNotebooks(prev => [...prev, newNotebook]);
      showSuccess("Notebook created successfully!");
    }
  };

  const handleNotebookDelete = (notebookId) => {
    // Check if notebook has tasks
    const notebookTasks = tasks?.filter(task => task?.notebook === notebookId);
    
    if (notebookTasks?.length > 0) {
      showWarning(`Cannot delete notebook with ${notebookTasks?.length} task${notebookTasks?.length !== 1 ? 's' : ''}. Move or delete tasks first.`);
      return;
    }

    setNotebooks(prev => prev?.filter(notebook => notebook?.id !== notebookId));
    if (activeNotebook === notebookId) {
      setActiveNotebook('all');
    }
    showSuccess("Notebook deleted successfully!");
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev?.filter(task => task?.id !== taskId));
    showSuccess("Task deleted successfully!");
  };

  const handleTaskUpdate = (taskId, updates) => {
    setTasks(prev => prev?.map(task => 
      task?.id === taskId ? { ...task, ...updates, updatedAt: new Date()?.toISOString() } : task
    ));
    
    if (updates?.status === 'completed') {
      showSuccess("Task marked as completed!");
    } else if (updates?.status) {
      showSuccess(`Task moved to ${updates?.status?.replace('-', ' ')}!`);
    }
  };

  const handleTaskView = (task) => {
    showInfo(`Viewing task: ${task?.title}`);
  };

  const handleBulkAction = (action, taskIds) => {
    switch (action) {
      case 'complete':
        setTasks(prev => prev?.map(task => 
          taskIds?.includes(task?.id) ? { ...task, status: 'completed', progress: 100 } : task
        ));
        showSuccess(`${taskIds?.length} task${taskIds?.length !== 1 ? 's' : ''} marked as completed!`);
        break;
      case 'archive':
        setTasks(prev => prev?.map(task => 
          taskIds?.includes(task?.id) ? { ...task, archived: true } : task
        ));
        showSuccess(`${taskIds?.length} task${taskIds?.length !== 1 ? 's' : ''} archived!`);
        break;
      case 'delete':
        setTasks(prev => prev?.filter(task => !taskIds?.includes(task?.id)));
        showSuccess(`${taskIds?.length} task${taskIds?.length !== 1 ? 's' : ''} deleted!`);
        break;
      default:
        break;
    }
  };

  const handleAddTask = (status = 'todo') => {
    setEditingTask({ 
      status,
      notebook: activeNotebook !== 'all' ? activeNotebook : 'personal'
    });
    setIsTaskModalOpen(true);
  };

  const handleDateSelect = (date) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    setFilters(prev => ({ ...prev, dueDate: 'custom', dateFrom: dateStr, dateTo: dateStr }));
  };

  const clearFilters = () => {
    setFilters({
      priority: 'all',
      status: 'all',
      dueDate: 'all',
      notebook: 'all',
      sortBy: 'dueDate',
      sortOrder: 'asc',
      showCompleted: true,
      showArchived: false
    });
    setActiveNotebook('all');
    showSuccess("Filters cleared!");
  };

  const getTaskStats = () => {
    const relevantTasks = activeNotebook === 'all' ? tasks : tasks?.filter(task => task?.notebook === activeNotebook);
    const total = relevantTasks?.length;
    const completed = relevantTasks?.filter(task => task?.status === 'completed')?.length;
    const inProgress = relevantTasks?.filter(task => task?.status === 'in-progress')?.length;
    const overdue = relevantTasks?.filter(task => {
      if (!task?.dueDate || task?.status === 'completed') return false;
      return new Date(task.dueDate) < new Date();
    })?.length;

    return { total, completed, inProgress, overdue };
  };

  const stats = getTaskStats();
  const activeNotebookData = notebooks?.find(notebook => notebook?.id === activeNotebook);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickCaptureBar />
      {/* Main Content */}
      <div className="pt-16 md:pt-32 pb-16 md:pb-0">
        {/* Notebooks Navigation */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4 overflow-x-auto">
                {/* All Notebooks Tab */}
                <Button
                  variant={activeNotebook === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  iconName="Layers"
                  iconPosition="left"
                  onClick={() => setActiveNotebook('all')}
                  className="whitespace-nowrap"
                >
                  All Notebooks
                </Button>

                {/* Individual Notebook Tabs */}
                {notebooks?.map((notebook) => (
                  <Button
                    key={notebook?.id}
                    variant={activeNotebook === notebook?.id ? 'default' : 'ghost'}
                    size="sm"
                    iconName={notebook?.icon}
                    iconPosition="left"
                    onClick={() => setActiveNotebook(notebook?.id)}
                    className="whitespace-nowrap"
                    style={activeNotebook === notebook?.id ? { backgroundColor: notebook?.color + '20', color: notebook?.color } : {}}
                  >
                    {notebook?.name}
                  </Button>
                ))}
              </div>

              {/* Manage Notebooks Button */}
              <Button
                variant="outline"
                size="sm"
                iconName="Settings"
                iconPosition="left"
                onClick={() => setIsNotebookManagerOpen(true)}
                className="whitespace-nowrap"
              >
                Manage Notebooks
              </Button>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
                  {activeNotebook === 'all' ? 'All Tasks' : `${activeNotebookData?.name} Notebook`}
                </h1>
                <p className="text-text-secondary">
                  {activeNotebook === 'all' ?'Transform your thoughts into actionable tasks across all notebooks'
                    : `Manage your ${activeNotebookData?.name?.toLowerCase()} tasks and track progress`
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-text-secondary">Total: {stats?.total}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-text-secondary">Completed: {stats?.completed}</span>
                  </div>
                  {stats?.overdue > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-error rounded-full" />
                      <span className="text-error">Overdue: {stats?.overdue}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Filter"
                    iconPosition="left"
                    onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => handleAddTask()}
                  >
                    New Task
                  </Button>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 mt-6">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'board' ? 'default' : 'ghost'}
                  size="sm"
                  iconName="Columns"
                  iconPosition="left"
                  onClick={() => setViewMode('board')}
                  className="rounded-md"
                >
                  Board
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  iconName="List"
                  iconPosition="left"
                  onClick={() => setViewMode('list')}
                  className="rounded-md"
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => setViewMode('calendar')}
                  className="rounded-md"
                >
                  Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          notebooks={notebooks}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />

        {/* Task Views */}
        <div className="flex-1">
          {viewMode === 'board' && (
            <KanbanBoard
              tasks={filteredTasks}
              notebooks={notebooks}
              onTaskUpdate={handleTaskUpdate}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskView={handleTaskView}
              onAddTask={handleAddTask}
            />
          )}

          {viewMode === 'list' && (
            <TaskListView
              tasks={filteredTasks}
              notebooks={notebooks}
              onTaskUpdate={handleTaskUpdate}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskView={handleTaskView}
              onBulkAction={handleBulkAction}
            />
          )}

          {viewMode === 'calendar' && (
            <TaskCalendarView
              tasks={filteredTasks}
              notebooks={notebooks}
              onTaskView={handleTaskView}
              onTaskEdit={handleTaskEdit}
              onDateSelect={handleDateSelect}
            />
          )}
        </div>
      </div>
      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        notebooks={notebooks}
        onSave={handleTaskSave}
      />

      {/* Notebook Manager */}
      <NotebookManager
        isOpen={isNotebookManagerOpen}
        onClose={() => setIsNotebookManagerOpen(false)}
        notebooks={notebooks}
        tasks={tasks}
        onSave={handleNotebookSave}
        onDelete={handleNotebookDelete}
      />

      {/* Contextual Sidebar */}
      <ContextualSidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
  );
};

export default TaskManagement;