import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskCalendarView = ({ tasks, onTaskView, onTaskEdit, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)?.getDay();
  };

  const getTasksForDate = (date) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return tasks?.filter(task => task?.dueDate === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  const isOverdue = (date) => {
    const today = new Date();
    return date < today;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days?.push(
        <div key={`empty-${i}`} className="h-24 bg-muted/30 border border-border" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isSelected = selectedDate && date?.toDateString() === selectedDate?.toDateString();

      days?.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            h-24 border border-border cursor-pointer transition-colors relative
            ${isToday(date) ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-muted/50'}
            ${isSelected ? 'ring-2 ring-primary' : ''}
          `}
        >
          <div className="p-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${
                isToday(date) ? 'text-primary' : 'text-foreground'
              }`}>
                {day}
              </span>
              {dayTasks?.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {dayTasks?.length}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
              {dayTasks?.slice(0, 2)?.map((task) => (
                <div
                  key={task?.id}
                  onClick={(e) => {
                    e?.stopPropagation();
                    onTaskView(task);
                  }}
                  className={`
                    text-xs p-1 rounded cursor-pointer truncate
                    ${task?.priority === 'high' ? 'bg-error/20 text-error' :
                      task?.priority === 'medium'? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}
                    ${isOverdue(date) && task?.status !== 'completed' ? 'animate-pulse' : ''}
                  `}
                >
                  {task?.title}
                </div>
              ))}
              {dayTasks?.length > 2 && (
                <div className="text-xs text-text-secondary">
                  +{dayTasks?.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  const getSelectedDateTasks = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="flex-1 flex">
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(-1)}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(1)}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-text-secondary">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-l border-t border-border">
          {renderCalendarDays()}
        </div>
      </div>
      {/* Selected Date Sidebar */}
      {selectedDate && (
        <div className="w-80 bg-surface border-l border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(null)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            {getSelectedDateTasks()?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Calendar" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No tasks for this date</p>
              </div>
            ) : (
              getSelectedDateTasks()?.map((task) => (
                <div
                  key={task?.id}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-soft transition-shadow"
                  onClick={() => onTaskView(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2">
                      {task?.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onTaskEdit(task);
                      }}
                      className="w-6 h-6"
                    >
                      <Icon name="Edit2" size={12} />
                    </Button>
                  </div>

                  {task?.description && (
                    <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                      {task?.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                      {task?.priority} priority
                    </span>
                    <div className="flex items-center space-x-2">
                      {task?.progress !== undefined && (
                        <div className="flex items-center space-x-1">
                          <div className="w-12 bg-muted rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full"
                              style={{ width: `${task?.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-secondary">{task?.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendarView;