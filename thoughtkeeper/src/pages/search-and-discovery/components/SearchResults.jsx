import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchResults = ({ searchQuery, filters }) => {
  const navigate = useNavigate();
  const [selectedResults, setSelectedResults] = useState([]);

  // Mock search results data
  const searchResults = [
    {
      id: 1,
      type: 'thought',
      title: 'Project brainstorming session notes',
      content: `Had an amazing brainstorming session today with the team. We discussed several innovative approaches to the new product features.\n\nKey insights:\n- User experience should be the primary focus\n- Mobile-first approach is crucial\n- Integration with existing tools is a must-have\n\nNext steps: Create wireframes and user journey maps.`,
      tags: ['project', 'meeting', 'ideas', 'ux'],
      folder: 'Work',
      date: '2025-08-17',
      time: '14:30',
      relevanceScore: 95,
      highlighted: 'Project brainstorming session notes'
    },
    {
      id: 2,
      type: 'task',
      title: 'Review quarterly reports',
      content: `Need to analyze Q3 performance metrics and prepare presentation for the board meeting.\n\nTasks:\n- Gather data from all departments\n- Create visual charts and graphs\n- Prepare executive summary\n- Schedule review meeting with stakeholders`,
      tags: ['work', 'reports', 'urgent', 'quarterly'],
      folder: 'Work',
      date: '2025-08-16',
      time: '09:15',
      priority: 'high',
      dueDate: '2025-08-20',
      relevanceScore: 88,
      highlighted: 'quarterly reports'
    },
    {
      id: 3,
      type: 'idea',
      title: 'Weekend hiking trail exploration',
      content: `Research local hiking trails for the upcoming weekend adventure. Looking for moderate difficulty trails with scenic views.\n\nPotential locations:\n- Blue Ridge Mountains\n- Shenandoah National Park\n- Great Falls Park\n\nDon't forget to check weather conditions and pack appropriate gear.`,
      tags: ['personal', 'outdoor', 'planning', 'weekend'],
      folder: 'Personal',date: '2025-08-15',time: '19:45',relevanceScore: 76,highlighted: 'hiking trail'
    },
    {
      id: 4,
      type: 'thought',title: 'Team collaboration improvement ideas',content: `Thinking about ways to enhance team collaboration and communication. Current tools are working but there's room for improvement.\n\nIdeas to explore:\n- Weekly sync meetings\n- Shared knowledge base\n- Cross-functional workshops\n- Team building activities`,
      tags: ['team', 'collaboration', 'improvement', 'work'],
      folder: 'Work',
      date: '2025-08-14',
      time: '16:20',
      relevanceScore: 82,
      highlighted: 'team collaboration'
    },
    {
      id: 5,
      type: 'task',
      title: 'Plan birthday celebration',
      content: `Mom's birthday is coming up next month. Need to start planning the celebration.\n\nTo-do list:\n- Book restaurant reservation\n- Invite family members\n- Order birthday cake\n- Buy thoughtful gift\n- Arrange transportation`,
      tags: ['personal', 'family', 'celebration', 'planning'],
      folder: 'Personal',date: '2025-08-13',time: '20:10',priority: 'medium',dueDate: '2025-09-15',relevanceScore: 65,highlighted: 'birthday celebration'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task':
        return 'CheckSquare';
      case 'idea':
        return 'Lightbulb';
      case 'thought':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task':
        return 'text-blue-600 bg-blue-50';
      case 'idea':
        return 'text-yellow-600 bg-yellow-50';
      case 'thought':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-red-50';
      case 'medium':
        return 'text-warning bg-yellow-50';
      case 'low':
        return 'text-success bg-green-50';
      default:
        return 'text-text-secondary bg-gray-50';
    }
  };

  const handleResultClick = (result) => {
    if (result?.type === 'task') {
      navigate('/task-management');
    } else {
      navigate('/dashboard-thought-stream');
    }
  };

  const handleSelectResult = (resultId) => {
    setSelectedResults(prev => 
      prev?.includes(resultId) 
        ? prev?.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on results:`, selectedResults);
    setSelectedResults([]);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text?.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results
          </h2>
          <span className="text-sm text-text-secondary">
            {searchResults?.length} results found
          </span>
        </div>

        {selectedResults?.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">
              {selectedResults?.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              iconName="Tag"
              iconPosition="left"
              onClick={() => handleBulkAction('tag')}
            >
              Tag
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="FolderOpen"
              iconPosition="left"
              onClick={() => handleBulkAction('move')}
            >
              Move
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Archive"
              iconPosition="left"
              onClick={() => handleBulkAction('archive')}
            >
              Archive
            </Button>
          </div>
        )}
      </div>
      {/* Results Grid */}
      <div className="space-y-4">
        {searchResults?.map((result) => (
          <div
            key={result?.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-soft transition-micro cursor-pointer"
            onClick={() => handleResultClick(result)}
          >
            <div className="flex items-start space-x-4">
              {/* Selection Checkbox */}
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={selectedResults?.includes(result?.id)}
                  onChange={(e) => {
                    e?.stopPropagation();
                    handleSelectResult(result?.id);
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  {/* Type Badge */}
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result?.type)}`}>
                    <Icon name={getTypeIcon(result?.type)} size={12} />
                    <span className="capitalize">{result?.type}</span>
                  </div>

                  {/* Priority Badge */}
                  {result?.priority && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(result?.priority)}`}>
                      {result?.priority?.toUpperCase()}
                    </div>
                  )}

                  {/* Relevance Score */}
                  <div className="text-xs text-text-secondary">
                    {result?.relevanceScore}% match
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-lg font-medium text-foreground mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result?.title, searchQuery) 
                  }}
                />

                {/* Content Preview */}
                <p 
                  className="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result?.content?.substring(0, 200) + '...', searchQuery) 
                  }}
                />

                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>{result?.date} at {result?.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Folder" size={12} />
                      <span>{result?.folder}</span>
                    </div>
                    {result?.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={12} />
                        <span>Due {result?.dueDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center space-x-1">
                    {result?.tags?.slice(0, 3)?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-muted text-text-secondary text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {result?.tags?.length > 3 && (
                      <span className="text-xs text-text-secondary">
                        +{result?.tags?.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex-shrink-0 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    console.log('Edit result:', result?.id);
                  }}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    console.log('Share result:', result?.id);
                  }}
                >
                  <Icon name="Share" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    console.log('More actions for result:', result?.id);
                  }}
                >
                  <Icon name="MoreVertical" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" iconName="ChevronDown" iconPosition="left">
          Load More Results
        </Button>
      </div>
    </div>
  );
};

export default SearchResults;