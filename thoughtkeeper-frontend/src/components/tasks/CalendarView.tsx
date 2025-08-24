import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CalendarView - Calendar view for tasks
 * 
 * Placeholder component for the calendar view.
 * Will be fully implemented in next development phase.
 */

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();
  
  // Mock task data
  const taskDays = [8, 12, 15, 18, 22, 25];

  return (
    <div className="h-full p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-accent-1" />
          <h3 className="text-lg font-semibold text-text-primary">Calendar View</h3>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-text-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-accent-1 text-white rounded-lg hover:bg-purple-700"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-text-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((day, index) => {
              const isToday = isCurrentMonth && day === today.getDate();
              const hasTasks = day && taskDays.includes(day);
              
              return (
                <motion.div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border-r border-b border-gray-100 
                    ${day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-25'}
                    ${isToday ? 'bg-blue-50' : ''}
                  `}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                >
                  {day && (
                    <>
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday ? 'text-blue-600' : 'text-text-primary'}
                      `}>
                        {day}
                      </div>
                      
                      {hasTasks && (
                        <div className="space-y-1">
                          <div className="w-full h-1.5 bg-accent-1 rounded-full opacity-60" />
                          <div className="text-xs text-text-secondary">
                            {Math.floor(Math.random() * 3) + 1} tasks
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 text-center text-text-secondary">
          <p className="text-sm">Calendar View implementation in progress...</p>
          <p className="text-xs mt-1">Task scheduling and drag-drop coming soon</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarView;
