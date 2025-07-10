import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { ChartProps, TimeSeriesDataPoint, AttitudeTrend } from '../../types/chart-types';

interface TimeSeriesChartProps extends ChartProps {
  data: AttitudeTrend[];
  metrics: string[];
  colors?: Record<string, string>;
  showTrend?: boolean;
  yAxisDomain?: [number, number];
}

const DEFAULT_COLORS = {
  openAccess: '#3B82F6',
  openData: '#10B981',
  openPeerReview: '#F59E0B',
  preprints: '#EF4444',
  openScience: '#8B5CF6',
  dataSharing: '#06B6D4'
};

const METRIC_LABELS = {
  openAccess: 'Open Access',
  openData: 'Open Data',
  openPeerReview: 'Open Peer Review',
  preprints: 'Preprints',
  openScience: 'Open Science',
  dataSharing: 'Data Sharing'
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metrics,
  colors = DEFAULT_COLORS,
  showTrend = false,
  yAxisDomain = [1, 5],
  width,
  height = 400,
  loading = false,
  error,
  title,
  subtitle
}) => {
  const formatTooltip = (value: number, name: string) => {
    const label = METRIC_LABELS[name as keyof typeof METRIC_LABELS] || name;
    return [`${value.toFixed(2)}/5`, label];
  };

  const formatYAxis = (value: number) => `${value.toFixed(1)}`;

  const calculateTrend = (data: AttitudeTrend[], metric: string) => {
    if (data.length < 2) return null;
    
    const firstValue = data[0][metric as keyof AttitudeTrend] as number;
    const lastValue = data[data.length - 1][metric as keyof AttitudeTrend] as number;
    const slope = (lastValue - firstValue) / (data.length - 1);
    
    return data.map(point => ({
      year: point.year,
      trend: firstValue + slope * (data.indexOf(point))
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Chart</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="year"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={yAxisDomain}
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              label={{
                value: 'Average Score (1-5 scale)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={formatTooltip}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            
            {/* Reference lines for scale interpretation */}
            <ReferenceLine y={3} stroke="#9CA3AF" strokeDasharray="2 2" strokeOpacity={0.5} />
            
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRIC_LABELS[metric as keyof typeof METRIC_LABELS] || metric}
                stroke={colors[metric] || '#6B7280'}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls={false}
              />
            ))}
            
            {/* Trend lines if enabled */}
            {showTrend && metrics.map((metric) => {
              const trendData = calculateTrend(data, metric);
              if (!trendData) return null;
              
              return (
                <Line
                  key={`${metric}-trend`}
                  type="linear"
                  dataKey="trend"
                  data={trendData}
                  stroke={colors[metric] || '#6B7280'}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Scale interpretation */}
      <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div className="flex justify-between">
          <span>1 = Very Negative</span>
          <span>3 = Neutral</span>
          <span>5 = Very Positive</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;