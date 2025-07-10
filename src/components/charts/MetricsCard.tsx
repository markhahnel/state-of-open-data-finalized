import React from 'react';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon
} from 'lucide-react';
import type { TrendMetric } from '../../types/chart-types';

interface MetricsCardProps {
  metric: TrendMetric;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  className?: string;
}

interface MetricsGridProps {
  metrics: TrendMetric[];
  columns?: number;
  loading?: boolean;
  error?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  metric,
  size = 'medium',
  showDescription = true,
  className = ''
}) => {
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'score':
        return `${value.toFixed(2)}/5`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const formatChange = (change: number | undefined, format: string): string => {
    if (change === undefined) return '';
    
    const prefix = change > 0 ? '+' : '';
    switch (format) {
      case 'percentage':
        return `${prefix}${change.toFixed(1)}%`;
      case 'score':
        return `${prefix}${change.toFixed(2)}`;
      case 'number':
      default:
        return `${prefix}${change.toLocaleString()}`;
    }
  };

  const getTrendIcon = (trend: string, change?: number) => {
    const iconSize = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5';
    
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className={`${iconSize} text-green-600`} />;
      case 'down':
        return <TrendingDownIcon className={`${iconSize} text-red-600`} />;
      default:
        return <MinusIcon className={`${iconSize} text-gray-400`} />;
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getValueSize = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-2xl';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${getCardSize()} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-semibold text-gray-900 ${
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
        }`}>
          {metric.title}
        </h3>
        {getTrendIcon(metric.trend, metric.change)}
      </div>

      {/* Main value */}
      <div className="mb-2">
        <div className={`font-bold text-gray-900 ${getValueSize()}`}>
          {formatValue(metric.value, metric.format)}
        </div>
        
        {/* Change indicator */}
        {metric.change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
            {metric.trend === 'up' && <ArrowUpIcon className="w-3 h-3" />}
            {metric.trend === 'down' && <ArrowDownIcon className="w-3 h-3" />}
            <span>
              {formatChange(metric.change, metric.format)}
              {metric.changePercentage !== undefined && (
                <span className="ml-1 text-xs text-gray-500">
                  ({metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {showDescription && metric.description && (
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">{metric.description}</p>
        </div>
      )}

      {/* Previous value comparison */}
      {metric.previousValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Previous: {formatValue(metric.previousValue, metric.format)}
          </div>
        </div>
      )}
    </div>
  );
};

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 4,
  loading = false,
  error
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600 font-semibold">Error Loading Metrics</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500">No metrics available</div>
      </div>
    );
  }

  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {metrics.map((metric, index) => (
        <MetricsCard
          key={index}
          metric={metric}
          size="medium"
          showDescription={true}
        />
      ))}
    </div>
  );
};

// Predefined metric configurations for common use cases
export const createOpenDataMetrics = (data: any): TrendMetric[] => [
  {
    title: 'Support for Open Data Mandates',
    value: data.mandateSupport || 0,
    previousValue: data.previousMandateSupport,
    change: data.mandateSupportChange,
    changePercentage: data.mandateSupportChangePercentage,
    trend: data.mandateSupportChange > 0 ? 'up' : data.mandateSupportChange < 0 ? 'down' : 'stable',
    format: 'percentage',
    description: 'Percentage of researchers supporting mandatory data sharing policies'
  },
  {
    title: 'FAIR Awareness Growth',
    value: data.fairAwareness || 0,
    previousValue: data.previousFairAwareness,
    change: data.fairAwarenessChange,
    changePercentage: data.fairAwarenessChangePercentage,
    trend: data.fairAwarenessChange > 0 ? 'up' : data.fairAwarenessChange < 0 ? 'down' : 'stable',
    format: 'score',
    description: 'Average awareness score of FAIR data principles (1-5 scale)'
  },
  {
    title: 'Active Data Sharers',
    value: data.activeSharers || 0,
    previousValue: data.previousActiveSharers,
    change: data.activeSharersChange,
    changePercentage: data.activeSharersChangePercentage,
    trend: data.activeSharersChange > 0 ? 'up' : data.activeSharersChange < 0 ? 'down' : 'stable',
    format: 'percentage',
    description: 'Percentage of researchers who have shared data in the past year'
  },
  {
    title: 'Institutional Support',
    value: data.institutionalSupport || 0,
    previousValue: data.previousInstitutionalSupport,
    change: data.institutionalSupportChange,
    changePercentage: data.institutionalSupportChangePercentage,
    trend: data.institutionalSupportChange > 0 ? 'up' : data.institutionalSupportChange < 0 ? 'down' : 'stable',
    format: 'percentage',
    description: 'Percentage of researchers with institutional data sharing support'
  }
];

export default MetricsCard;