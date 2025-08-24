import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const SearchAnalytics = () => {
  // Mock analytics data
  const searchTrendsData = [
    { month: 'Jan', searches: 45 },
    { month: 'Feb', searches: 52 },
    { month: 'Mar', searches: 48 },
    { month: 'Apr', searches: 61 },
    { month: 'May', searches: 55 },
    { month: 'Jun', searches: 67 },
    { month: 'Jul', searches: 73 },
    { month: 'Aug', searches: 89 }
  ];

  const contentTypeData = [
    { name: 'Thoughts', value: 45, color: '#10B981' },
    { name: 'Tasks', value: 30, color: '#3B82F6' },
    { name: 'Ideas', value: 20, color: '#F59E0B' },
    { name: 'Archived', value: 5, color: '#6B7280' }
  ];

  const popularSearches = [
    { query: 'project meeting', count: 23, trend: 'up' },
    { query: 'quarterly reports', count: 18, trend: 'up' },
    { query: 'team collaboration', count: 15, trend: 'down' },
    { query: 'weekend plans', count: 12, trend: 'up' },
    { query: 'budget planning', count: 9, trend: 'stable' }
  ];

  const recentActivity = [
    { time: '2 hours ago', action: 'Searched for "project brainstorming"', results: 8 },
    { time: '5 hours ago', action: 'Searched for "meeting notes"', results: 12 },
    { time: '1 day ago', action: 'Searched for "quarterly review"', results: 6 },
    { time: '2 days ago', action: 'Searched for "team building"', results: 4 },
    { time: '3 days ago', action: 'Searched for "budget analysis"', results: 15 }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Search Analytics</h2>
        <p className="text-text-secondary">Insights into your search patterns and content discovery</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Search Trends */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Search Trends</h3>
            <Icon name="TrendingUp" size={20} className="text-success" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={searchTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="searches" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Content Distribution</h3>
            <Icon name="PieChart" size={20} className="text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contentTypeData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {contentTypeData?.map((item) => (
              <div key={item?.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm text-foreground">{item?.name}</span>
                <span className="text-sm text-text-secondary">({item?.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Popular Searches</h3>
            <Icon name="Search" size={20} className="text-text-secondary" />
          </div>
          <div className="space-y-3">
            {popularSearches?.map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-foreground">
                    "{search?.query}"
                  </span>
                  <span className="text-xs text-text-secondary">
                    {search?.count} searches
                  </span>
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(search?.trend)}`}>
                  <Icon name={getTrendIcon(search?.trend)} size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
            <Icon name="Clock" size={20} className="text-text-secondary" />
          </div>
          <div className="space-y-3">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-micro">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity?.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-text-secondary">{activity?.time}</span>
                    <span className="text-xs text-success">
                      {activity?.results} results found
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">156</div>
          <div className="text-sm text-text-secondary">Total Items</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">89</div>
          <div className="text-sm text-text-secondary">This Month</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">23</div>
          <div className="text-sm text-text-secondary">Avg. Daily</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-error mb-1">4.2s</div>
          <div className="text-sm text-text-secondary">Avg. Search</div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;