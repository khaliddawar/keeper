import type { Notebook } from '../types/notebook';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

/**
 * Mock Data Generation System
 * 
 * Creates realistic notebook and task data with proper relationships
 * Includes multiple users, realistic dates, and varied content
 */

// Sample user data
const USERS = [
  { id: 'user-1', name: 'Alex Chen', email: 'alex.chen@example.com', avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Alex' },
  { id: 'user-2', name: 'Sarah Johnson', email: 'sarah.j@example.com', avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Sarah' },
  { id: 'user-3', name: 'Marcus Williams', email: 'marcus.w@example.com', avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Marcus' },
  { id: 'user-4', name: 'Emily Rodriguez', email: 'emily.r@example.com', avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Emily' },
  { id: 'user-5', name: 'David Kim', email: 'david.kim@example.com', avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=David' }
];

// Sample notebook templates with realistic content
const NOTEBOOK_TEMPLATES = [
  {
    title: 'Project Planning',
    description: 'Strategic planning and roadmap for upcoming projects',
    content: `# Project Planning

## Current Projects
- [ ] Website Redesign
- [ ] Mobile App Development
- [ ] Customer Portal Enhancement

## Planning Process
1. Define objectives
2. Identify stakeholders
3. Create timeline
4. Allocate resources
5. Define success metrics

## Resources
- Budget: $50,000
- Timeline: 6 months
- Team: 5 developers, 2 designers, 1 PM`,
    tags: ['planning', 'projects', 'strategy'],
    status: 'active'
  },
  {
    title: 'Meeting Notes - Q4 Review',
    description: 'Quarterly business review meeting notes and action items',
    content: `# Q4 Business Review Meeting
**Date:** December 15, 2023
**Attendees:** Leadership team, Department heads

## Key Discussion Points
- Revenue exceeded targets by 15%
- Customer satisfaction scores improved
- New product launch successful

## Action Items
- [ ] Prepare Q1 budget proposal
- [ ] Schedule team building event
- [ ] Review vendor contracts

## Next Meeting
January 15, 2024 - Q1 Planning Session`,
    tags: ['meetings', 'quarterly', 'business'],
    status: 'active'
  },
  {
    title: 'Learning React Advanced Patterns',
    description: 'Notes and examples from advanced React development course',
    content: `# Advanced React Patterns

## Key Concepts
- Higher-Order Components (HOCs)
- Render Props
- Context API
- Custom Hooks
- Compound Components

## Code Examples
\`\`\`jsx
// Custom Hook Example
const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  
  return { count, increment, decrement };
};
\`\`\`

## Practice Projects
- [ ] Build custom hook library
- [ ] Implement compound component pattern
- [ ] Create render prop components`,
    tags: ['learning', 'react', 'development'],
    status: 'active'
  },
  {
    title: 'Travel Itinerary - Japan 2024',
    description: 'Complete travel plan for 2-week Japan trip',
    content: `# Japan Trip - March 2024

## Itinerary Overview
**Duration:** 14 days
**Cities:** Tokyo, Kyoto, Osaka, Hiroshima

## Week 1 - Tokyo
- Days 1-3: Shibuya, Shinjuku, Harajuku
- Days 4-5: Traditional areas (Asakusa, Ueno)
- Days 6-7: Modern Tokyo (Ginza, Roppongi)

## Week 2 - Other Cities
- Days 8-10: Kyoto (temples, bamboo forest)
- Days 11-12: Osaka (food culture, castle)
- Days 13-14: Hiroshima, return to Tokyo

## Bookings
- [ ] Flights booked
- [ ] Hotels reserved
- [ ] JR Pass purchased
- [ ] Restaurant reservations`,
    tags: ['travel', 'planning', 'japan'],
    status: 'active'
  },
  {
    title: 'Recipe Collection',
    description: 'Favorite recipes and cooking experiments',
    content: `# My Recipe Collection

## Favorites
### Pasta Carbonara
- 4 eggs
- 100g pancetta
- 50g pecorino romano
- Black pepper
- 400g spaghetti

### Thai Green Curry
- Green curry paste
- Coconut milk
- Chicken thighs
- Thai basil
- Fish sauce

## To Try
- [ ] Korean bibimbap
- [ ] French coq au vin
- [ ] Indian butter chicken
- [ ] Mexican mole

## Notes
- Always use freshly grated cheese
- Toast spices before adding
- Let meat rest after cooking`,
    tags: ['recipes', 'cooking', 'food'],
    status: 'active'
  },
  {
    title: 'Book Notes - Atomic Habits',
    description: 'Key insights and takeaways from James Clear\'s book',
    content: `# Atomic Habits - James Clear

## Core Principles
1. **1% Better Every Day:** Small improvements compound
2. **Identity-Based Habits:** Focus on who you want to become
3. **Four Laws of Behavior Change:**
   - Make it obvious
   - Make it attractive
   - Make it easy
   - Make it satisfying

## Key Takeaways
- Habits are the compound interest of self-improvement
- Environment design is crucial
- Start small, be consistent
- Track progress visibly

## Personal Applications
- [ ] Morning routine optimization
- [ ] Reading habit (20 pages/day)
- [ ] Exercise consistency
- [ ] Digital detox periods`,
    tags: ['books', 'habits', 'self-improvement'],
    status: 'active'
  },
  {
    title: 'Home Renovation Ideas',
    description: 'Plans and inspiration for upcoming home renovations',
    content: `# Home Renovation Project

## Priority Areas
1. **Kitchen Upgrade**
   - New countertops (quartz)
   - Cabinet refinishing
   - Modern appliances
   
2. **Master Bedroom**
   - Paint refresh
   - New lighting
   - Built-in storage
   
3. **Home Office**
   - Soundproofing
   - Better lighting
   - Ergonomic setup

## Budget Breakdown
- Kitchen: $25,000
- Bedroom: $5,000
- Office: $3,000
- Contingency: $5,000

## Timeline
- Planning: January
- Kitchen: February-March
- Other rooms: April-May`,
    tags: ['renovation', 'home', 'planning'],
    status: 'active'
  },
  {
    title: 'Fitness Journey 2024',
    description: 'Health and fitness goals with tracking system',
    content: `# 2024 Fitness Goals

## Objectives
- Lose 20 pounds
- Build muscle strength
- Improve cardiovascular health
- Better flexibility

## Workout Plan
### Week Schedule
- Monday: Upper body strength
- Tuesday: Cardio (running/cycling)
- Wednesday: Lower body strength
- Thursday: Yoga/stretching
- Friday: Full body workout
- Weekend: Active recovery

## Nutrition Goals
- 2000 calories/day
- 150g protein
- 5 servings fruits/vegetables
- 2L water minimum

## Progress Tracking
- [ ] Weekly weigh-ins
- [ ] Progress photos
- [ ] Workout logging
- [ ] Measurements`,
    tags: ['fitness', 'health', 'goals'],
    status: 'active'
  }
];

// Task templates for realistic task generation
const TASK_TEMPLATES = {
  planning: [
    'Define project scope and objectives',
    'Create detailed project timeline',
    'Identify and assess project risks',
    'Allocate budget and resources',
    'Set up project tracking system',
    'Schedule stakeholder meetings',
    'Create project documentation',
    'Review and approve project charter'
  ],
  development: [
    'Set up development environment',
    'Design database schema',
    'Create API endpoints',
    'Implement user authentication',
    'Build responsive UI components',
    'Write unit tests',
    'Set up CI/CD pipeline',
    'Conduct code review',
    'Deploy to staging environment',
    'Perform user acceptance testing'
  ],
  learning: [
    'Watch course video lectures',
    'Complete practice exercises',
    'Build sample project',
    'Read supplementary articles',
    'Join study group discussions',
    'Take practice quizzes',
    'Write summary notes',
    'Create flashcards for key concepts'
  ],
  travel: [
    'Research destination attractions',
    'Book flights and accommodation',
    'Apply for visa if required',
    'Purchase travel insurance',
    'Create packing checklist',
    'Exchange currency',
    'Download offline maps',
    'Research local customs and etiquette'
  ],
  personal: [
    'Organize digital photos',
    'Update personal budget',
    'Schedule medical appointments',
    'Clean and organize workspace',
    'Plan weekend activities',
    'Call family members',
    'Review and pay bills',
    'Backup important files'
  ]
};

// Utility functions for realistic data generation
const getRandomDate = (start: Date, end: Date): Date => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
};

const getRandomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: readonly T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate realistic notebooks
const generateNotebooks = (count: number = 12): Notebook[] => {
  const notebooks: Notebook[] = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  for (let i = 0; i < count; i++) {
    const template = getRandomElement(NOTEBOOK_TEMPLATES);
    const createdAt = getRandomDate(oneYearAgo, now);
    const updatedAt = getRandomDate(createdAt, now);
    const owner = getRandomElement(USERS);
    
    const notebook: Notebook = {
      id: generateId(),
      title: template.title + (i > 7 ? ` ${i - 7}` : ''),
      name: template.title,
      color: '#3B82F6',
      icon: 'notebook',
      description: template.description,
      content: template.content,
      status: getRandomElement(['active', 'archived', 'draft'] as const),
      tags: template.tags,
      taskCount: 0, // Will be updated later
      urgentCount: 0, // Will be updated later
      progressIndicator: 0, // Will be updated later
      recentActivity: updatedAt,
      sortOrder: i,
      shared: Math.random() > 0.7,
      pinned: Math.random() > 0.8,
      archived: Math.random() > 0.9,
      wordCount: template.content.length,
      characterCount: template.content.replace(/\s/g, '').length,
      readingTime: Math.ceil(template.content.split(' ').length / 200),
      attachments: Math.random() > 0.6 ? [
        `attachment-${Math.floor(Math.random() * 1000)}.pdf`
      ] : [],
      ownerId: owner.id,
      createdAt,
      updatedAt,
      collaborators: Math.random() > 0.8 ? getRandomElements(
        USERS.filter(u => u.id !== owner.id), 
        Math.floor(Math.random() * 3) + 1
      ).map(user => ({
        userId: user.id,
        role: getRandomElement(['viewer', 'editor'] as const),
        addedAt: getRandomDate(createdAt, updatedAt)
      })) : undefined
    };
    
    notebooks.push(notebook);
  }
  
  return notebooks;
};

// Generate realistic tasks with proper notebook relationships
const generateTasks = (notebooks: Notebook[], tasksPerNotebook: number = 8): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  notebooks.forEach((notebook, notebookIndex) => {
    const notebookTasks: Task[] = [];
    const taskCount = tasksPerNotebook + Math.floor(Math.random() * 5) - 2; // Variation
    
    // Determine task category based on notebook content
    let taskCategory = 'personal';
    const title = notebook.title.toLowerCase();
    if (title.includes('project') || title.includes('planning')) taskCategory = 'planning';
    if (title.includes('learn') || title.includes('course') || title.includes('book')) taskCategory = 'learning';
    if (title.includes('travel') || title.includes('trip')) taskCategory = 'travel';
    if (title.includes('develop') || title.includes('code') || title.includes('react')) taskCategory = 'development';
    
    for (let i = 0; i < taskCount; i++) {
      const createdAt = getRandomDate(notebook.createdAt, now);
      const status = getRandomElement(['pending', 'in-progress', 'completed', 'cancelled'] as TaskStatus[]);
      const priority = getRandomElement(['low', 'medium', 'high', 'urgent'] as TaskPriority[]);
      
      let dueDate: Date | undefined;
      if (Math.random() > 0.3) {
        if (status === 'completed') {
          dueDate = getRandomDate(oneMonthAgo, createdAt);
        } else {
          dueDate = getRandomDate(now, oneMonthLater);
        }
      }
      
      const taskTemplate = getRandomElement(TASK_TEMPLATES[taskCategory as keyof typeof TASK_TEMPLATES]);
      const taskTitle = taskTemplate + (Math.random() > 0.8 ? ` (Phase ${i + 1})` : '');
      
      const task: Task = {
        id: generateId(),
        title: taskTitle,
        description: `Task for ${notebook.title}. ${getRandomElement([
          'This is a high priority item that needs immediate attention.',
          'Regular maintenance task to keep things running smoothly.',
          'Important milestone that blocks other work.',
          'Quick task that should be completed today.',
          'Complex task that may require multiple sessions.',
          'Research task to gather information for decision making.'
        ])}`,
        status,
        priority,
        labels: getRandomElements([
          'urgent', 'review', 'blocked', 'waiting', 'research', 
          'meeting', 'documentation', 'testing', 'bug', 'feature'
        ], Math.floor(Math.random() * 3)),
        assignee: Math.random() > 0.7 ? getRandomElement(USERS).id : undefined,
        dueDate,
        createdAt,
        updatedAt: getRandomDate(createdAt, now),
        completedAt: status === 'completed' ? getRandomDate(createdAt, now) : undefined,
        progress: status === 'completed' ? 100 : Math.floor(Math.random() * 80),
        tags: getRandomElements(['work', 'personal', 'urgent', 'project', 'meeting'], Math.floor(Math.random() * 3)),
        timeEstimate: Math.random() > 0.5 ? Math.floor(Math.random() * 480) + 30 : undefined, // 30 minutes to 8 hours
        actualTimeSpent: status === 'completed' ? Math.floor(Math.random() * 360) + 15 : undefined,
        timeSpent: status === 'completed' ? Math.floor(Math.random() * 360) + 15 : 0,
        notebookId: notebook.id,
        parentId: undefined,
        attachments: [],
        reminders: [],
        integrations: []
      };
      
      notebookTasks.push(task);
      tasks.push(task);
    }
    
    // Create some subtasks for complex tasks
    const complexTasks = notebookTasks.filter(t => 
      t.priority === 'high' || t.priority === 'urgent'
    ).slice(0, 2);
    
    complexTasks.forEach(parentTask => {
      const subtaskCount = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < subtaskCount; j++) {
        const subtaskTemplate = getRandomElement(TASK_TEMPLATES[taskCategory as keyof typeof TASK_TEMPLATES]);
        
        const subtask: Task = {
          id: generateId(),
          title: `${subtaskTemplate} (Step ${j + 1})`,
          description: `Subtask of "${parentTask.title}". ${getRandomElement([
            'Detailed implementation step.',
            'Preparation work required.',
            'Follow-up action item.',
            'Verification and testing.',
            'Documentation update.'
          ])}`,
          status: getRandomElement(['pending', 'in-progress', 'completed'] as TaskStatus[]),
          priority: parentTask.priority,
          labels: parentTask.labels,
          assignee: parentTask.assignee,
          dueDate: parentTask.dueDate ? 
            new Date(parentTask.dueDate.getTime() - (subtaskCount - j) * 24 * 60 * 60 * 1000) : 
            undefined,
          createdAt: new Date(parentTask.createdAt.getTime() + j * 60 * 60 * 1000),
          updatedAt: getRandomDate(parentTask.createdAt, now),
          completedAt: Math.random() > 0.5 ? getRandomDate(parentTask.createdAt, now) : undefined,
          progress: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
          tags: parentTask.tags,
          timeEstimate: Math.floor(Math.random() * 120) + 15, // 15 minutes to 2 hours
          actualTimeSpent: Math.random() > 0.5 ? Math.floor(Math.random() * 90) + 5 : undefined,
          timeSpent: Math.floor(Math.random() * 90) + 5,
          notebookId: notebook.id,
          parentId: parentTask.id,
          attachments: [],
          reminders: [],
          integrations: []
        };
        
        tasks.push(subtask);
      }
    });
  });
  
  return tasks;
};

// Generate complete mock data set
export const generateMockData = () => {
  const notebooks = generateNotebooks(12);
  const tasks = generateTasks(notebooks, 6);
  
  return {
    notebooks,
    tasks,
    users: USERS,
    stats: {
      totalNotebooks: notebooks.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      activeNotebooks: notebooks.filter(n => n.status === 'active').length,
      sharedNotebooks: notebooks.filter(n => n.shared).length,
      upcomingDeadlines: tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate <= weekFromNow && t.status !== 'completed';
      }).length
    }
  };
};

// Export the generated data as default
export const MOCK_DATA = generateMockData();

// Utility functions for accessing mock data
export const getMockNotebooks = () => MOCK_DATA.notebooks;
export const getMockTasks = () => MOCK_DATA.tasks;
export const getMockUsers = () => MOCK_DATA.users;
export const getMockStats = () => MOCK_DATA.stats;

// Search and filter utilities for mock data
export const searchNotebooks = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_DATA.notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(lowercaseQuery) ||
    notebook.description?.toLowerCase().includes(lowercaseQuery) ||
    notebook.content?.toLowerCase().includes(lowercaseQuery) ||
    notebook.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const searchTasks = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_DATA.tasks.filter(task =>
    task.title.toLowerCase().includes(lowercaseQuery) ||
    task.description?.toLowerCase().includes(lowercaseQuery) ||
    task.labels.some(label => label.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTasksByNotebook = (notebookId: string) => {
  return MOCK_DATA.tasks.filter(task => task.notebookId === notebookId);
};

export const getSubtasks = (parentId: string) => {
  return MOCK_DATA.tasks.filter(task => task.parentId === parentId);
};

export const getOverdueTasks = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return MOCK_DATA.tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < now && 
    task.status !== 'completed'
  );
};

export const getDueTasks = (days: number = 7) => {
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return MOCK_DATA.tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) <= future &&
    task.status !== 'completed'
  );
};
