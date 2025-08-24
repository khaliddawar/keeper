import React from 'react';

export interface MetricDisplayProps {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  name,
  value,
  unit = '',
  trend = 'stable',
  color = '#3b82f6'
}) => {
  return (
    <div className="metric-display">
      <div className="metric-display__name">{name}</div>
      <div className="metric-display__value" style={{ color }}>
        {value}{unit}
      </div>
      {trend !== 'stable' && (
        <div className={`metric-display__trend metric-display__trend--${trend}`}>
          {trend === 'up' ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};
