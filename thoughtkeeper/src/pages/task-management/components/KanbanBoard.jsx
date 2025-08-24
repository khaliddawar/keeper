import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import TaskCard from './TaskCard';
import Button from '../../../components/ui/Button';

const KanbanBoard = ({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete, onTaskView, onAddTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-muted', icon: 'Circle' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-warning/10', icon: 'Clock' },
    { id: 'completed', title: 'Completed', color: 'bg-success/10', icon: 'CheckCircle' }
  ];

  const getTasksByStatus = (status) => {
    return tasks?.filter(task => task?.status === status);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e?.preventDefault();
    const taskData = e?.dataTransfer?.getData('text/plain');
    
    if (taskData) {
      const task = JSON.parse(taskData);
      if (task?.status !== newStatus) {
        onTaskUpdate(task?.id, { status: newStatus });
      }
    }
    setDraggedTask(null);
  };

  const getColumnStats = (status) => {
    const columnTasks = getTasksByStatus(status);
    const total = columnTasks?.length;
    const highPriority = columnTasks?.filter(task => task?.priority === 'high')?.length;
    const overdue = columnTasks?.filter(task => {
      if (!task?.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task?.status !== 'completed';
    })?.length;

    return { total, highPriority, overdue };
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex space-x-6 min-w-max p-6">
        {columns?.map((column) => {
          const columnTasks = getTasksByStatus(column?.id);
          const stats = getColumnStats(column?.id);

          return (
            <div
              key={column?.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column?.id)}
            >
              {/* Column Header */}
              <div className={`${column?.color} rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name={column?.icon} size={20} className="text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {column?.title}
                    </h3>
                  </div>
                  <span className="bg-background text-foreground px-2 py-1 rounded-full text-sm font-medium">
                    {stats?.total}
                  </span>
                </div>

                {/* Column Stats */}
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  {stats?.highPriority > 0 && (
                    <div className="flex items-center space-x-1">
                      <Icon name="AlertTriangle" size={12} className="text-error" />
                      <span>{stats?.highPriority} high priority</span>
                    </div>
                  )}
                  {stats?.overdue > 0 && column?.id !== 'completed' && (
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} className="text-error" />
                      <span>{stats?.overdue} overdue</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Add Task Button */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                onClick={() => onAddTask(column?.id)}
                className="mb-4"
              >
                Add Task
              </Button>
              {/* Task Cards */}
              <div className="space-y-3 min-h-[200px] group">
                {columnTasks?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Icon name="Package" size={48} className="text-text-secondary mb-4" />
                    <p className="text-text-secondary text-sm">
                      No tasks in {column?.title?.toLowerCase()}
                    </p>
                    <p className="text-text-secondary text-xs mt-1">
                      Drag tasks here or click "Add Task"
                    </p>
                  </div>
                ) : (
                  columnTasks?.map((task) => (
                    <TaskCard
                      key={task?.id}
                      task={task}
                      onStatusChange={onTaskUpdate}
                      onEdit={onTaskEdit}
                      onDelete={onTaskDelete}
                      onViewDetails={onTaskView}
                    />
                  ))
                )}
              </div>
              {/* Drop Zone Indicator */}
              <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-center space-x-2 text-text-secondary">
                  <Icon name="Download" size={16} />
                  <span className="text-sm">Drop tasks here</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;