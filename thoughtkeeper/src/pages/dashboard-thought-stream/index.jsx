import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import QuickCaptureInput from './components/QuickCaptureInput';
import ThoughtsList from './components/ThoughtsList';
import ThoughtsSidebar from './components/ThoughtsSidebar';
import EditThoughtModal from './components/EditThoughtModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DashboardThoughtStream = () => {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [editingThought, setEditingThought] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock thoughts data
  const mockThoughts = [
    {
      id: 1,
      content: `Had an interesting conversation with the team about implementing microservices architecture. The main benefits we discussed:\n\n• Better scalability and maintainability\n• Independent deployment cycles\n• Technology diversity across services\n• Improved fault isolation\n\nNeed to research the operational complexity and monitoring challenges before making a decision.`,
      category: 'work',
      priority: 'high',
      tags: ['architecture', 'microservices', 'team-discussion'],
      createdAt: '2025-08-17T14:30:00.000Z',
      archived: false
    },
    {
      id: 2,
      content: `Weekend hiking trip planning - looking at the Blue Ridge Trail. Weather forecast looks good for Saturday. Need to pack:\n\n• Water bottles and snacks\n• First aid kit\n• Camera for scenic shots\n• Comfortable hiking boots\n\nShould start early to avoid crowds and enjoy the sunrise from the summit.`,
      category: 'personal',
      priority: 'medium',
      tags: ['hiking', 'weekend', 'planning', 'outdoor'],
      createdAt: '2025-08-17T10:15:00.000Z',
      archived: false
    },
    {
      id: 3,
      content: `Product idea: A smart home device that learns your daily routines and automatically adjusts lighting, temperature, and music based on your activities. Could integrate with existing smart home ecosystems like Google Home or Alexa.\n\nKey features:\n• Machine learning for pattern recognition\n• Voice control integration\n• Mobile app for manual overrides\n• Energy efficiency optimization`,
      category: 'ideas',
      priority: 'low',
      tags: ['product-idea', 'smart-home', 'iot', 'innovation'],
      createdAt: '2025-08-16T16:45:00.000Z',
      archived: false
    },
    {
      id: 4,
      content: `Meeting notes from client presentation:\n\n• Client loved the new dashboard design\n• Requested additional reporting features\n• Timeline: 2 weeks for implementation\n• Budget approved for extra features\n• Next meeting scheduled for Friday\n\nAction items: Update project timeline, assign tasks to team members, prepare detailed technical specifications.`,
      category: 'meeting',
      priority: 'high',
      tags: ['client', 'presentation', 'dashboard', 'action-items'],
      createdAt: '2025-08-16T11:20:00.000Z',
      archived: false
    },
    {
      id: 5,
      content: `Reflection on productivity techniques I've been trying:\n\n• Pomodoro Technique: Works well for focused coding sessions\n• Time blocking: Helps with meeting management\n• Getting Things Done (GTD): Good for organizing tasks\n• Deep Work principles: Essential for complex problem-solving\n\nThe key is finding the right combination that fits my work style and energy patterns throughout the day.`,
      category: 'personal',priority: 'low',
      tags: ['productivity', 'reflection', 'techniques', 'self-improvement'],
      createdAt: '2025-08-15T09:30:00.000Z',
      archived: false
    }
  ];

  useEffect(() => {
    // Simulate loading thoughts from API
    const loadThoughts = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setThoughts(mockThoughts);
      setIsLoading(false);
    };

    loadThoughts();
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e?.metaKey || e?.ctrlKey) && e?.key === 'n') {
        e?.preventDefault();
        // Focus on quick capture input
        const captureInput = document.querySelector('textarea[placeholder*="mind"]');
        if (captureInput) {
          captureInput?.focus();
        }
      } else if ((e?.metaKey || e?.ctrlKey) && e?.key === 'k') {
        e?.preventDefault();
        // Open search
        navigate('/search-and-discovery');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleSaveThought = async (thoughtData) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setThoughts(prev => [thoughtData, ...prev]);
    setIsSaving(false);
  };

  const handleEditThought = (thought) => {
    setEditingThought(thought);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedThought = async (updatedThought) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setThoughts(prev => 
      prev?.map(thought => 
        thought?.id === updatedThought?.id ? updatedThought : thought
      )
    );
  };

  const handleConvertToTask = (thought) => {
    // Navigate to task management with pre-filled data
    navigate('/task-management', { 
      state: { 
        newTask: {
          title: thought?.content?.substring(0, 100) + (thought?.content?.length > 100 ? '...' : ''),
          description: thought?.content,
          priority: thought?.priority || 'medium',
          tags: thought?.tags || []
        }
      }
    });
  };

  const handleArchiveThought = async (thought) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setThoughts(prev => 
      prev?.map(t => 
        t?.id === thought?.id ? { ...t, archived: true } : t
      )
    );
  };

  const handleDeleteThought = async (thought) => {
    if (window.confirm('Are you sure you want to delete this thought? This action cannot be undone.')) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setThoughts(prev => prev?.filter(t => t?.id !== thought?.id));
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <div className="pt-16 pb-16 md:pb-0">
        <div className="flex">
          {/* Main Content Area */}
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-80' : ''}`}>
            <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Thought Stream</h1>
                  <p className="text-text-secondary mt-1">
                    Capture and organize your thoughts in real-time
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Filter"
                    iconPosition="left"
                    onClick={toggleSidebar}
                    className="lg:hidden"
                  >
                    Filters
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="SlidersHorizontal"
                    onClick={toggleSidebar}
                    className="hidden lg:flex"
                  />
                </div>
              </div>

              {/* Quick Capture */}
              <div className="mb-8">
                <QuickCaptureInput 
                  onSave={handleSaveThought}
                  isLoading={isSaving}
                />
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center justify-center mb-6 p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-6 text-xs text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon name="Command" size={12} />
                    <span>⌘ + N</span>
                    <span>Quick capture</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Command" size={12} />
                    <span>⌘ + K</span>
                    <span>Search</span>
                  </div>
                </div>
              </div>

              {/* Thoughts List */}
              <ThoughtsList
                thoughts={thoughts}
                filters={activeFilters}
                isLoading={isLoading}
                onEdit={handleEditThought}
                onConvertToTask={handleConvertToTask}
                onArchive={handleArchiveThought}
                onDelete={handleDeleteThought}
              />
            </div>
          </div>

          {/* Desktop Sidebar */}
          {isSidebarOpen && (
            <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-80 z-[900]">
              <ThoughtsSidebar
                thoughts={thoughts}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      </div>
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[1050] bg-black bg-opacity-50">
          <div className="fixed bottom-0 left-0 right-0 h-[90vh] bg-surface rounded-t-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-medium text-foreground">Filters & Stats</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="h-[calc(90vh-60px)] overflow-y-auto">
              <ThoughtsSidebar
                thoughts={thoughts}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}
      {/* Edit Thought Modal */}
      <EditThoughtModal
        thought={editingThought}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingThought(null);
        }}
        onSave={handleSaveEditedThought}
      />
      {/* Mobile FAB for Quick Capture */}
      <div className="md:hidden fixed bottom-20 right-4 z-[999]">
        <button
          onClick={() => {
            const captureInput = document.querySelector('textarea[placeholder*="mind"]');
            if (captureInput) {
              captureInput?.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-elevated flex items-center justify-center transition-micro hover:scale-105 active:scale-95"
        >
          <Icon name="Plus" size={24} />
        </button>
      </div>
    </div>
  );
};

export default DashboardThoughtStream;