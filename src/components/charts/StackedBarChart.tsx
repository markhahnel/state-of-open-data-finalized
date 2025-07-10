import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { ChartProps, StackedBarDataPoint } from '../../types/chart-types';

interface StackedBarChartProps extends ChartProps {
  data: StackedBarDataPoint[];
  stackKeys: string[];
  colors?: Record<string, string>;
  orientation?: 'horizontal' | 'vertical';
  percentage?: boolean;
  showValues?: boolean;
}

const DEFAULT_COLORS = {
  veryHigh: '#059669',
  high: '#10B981',
  moderate: '#F59E0B',
  low: '#F97316',
  veryLow: '#EF4444',
  
  majorBarrier: '#DC2626',
  significantBarrier: '#F97316',
  moderateBarrier: '#F59E0B',
  minorBarrier: '#10B981',
  notABarrier: '#059669',
  
  strongly_agree: '#059669',
  agree: '#10B981',
  neutral: '#F59E0B',
  disagree: '#F97316',
  strongly_disagree: '#EF4444'
};

const LABEL_MAPPING = {
  veryHigh: 'Very High',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  veryLow: 'Very Low',
  
  majorBarrier: 'Major Barrier',
  significantBarrier: 'Significant',
  moderateBarrier: 'Moderate',
  minorBarrier: 'Minor',
  notABarrier: 'Not a Barrier',
  
  strongly_agree: 'Strongly Agree',
  agree: 'Agree',
  neutral: 'Neutral',
  disagree: 'Disagree',
  strongly_disagree: 'Strongly Disagree'
};

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  stackKeys,
  colors = DEFAULT_COLORS,
  orientation = 'vertical',
  percentage = false,
  showValues = false,
  width,
  height = 400,
  loading = false,
  error,
  title,
  subtitle
}) => {
  // Transform data for percentage display if needed
  const processedData = React.useMemo(() => {
    if (!percentage) return data;
    
    return data.map(item => {
      const total = stackKeys.reduce((sum, key) => sum + (Number(item[key]) || 0), 0);
      const processed: StackedBarDataPoint = { ...item };
      
      stackKeys.forEach(key => {
        const value = Number(item[key]) || 0;
        processed[key] = total > 0 ? Math.round((value / total) * 100) : 0;
      });
      
      return processed;
    });
  }, [data, stackKeys, percentage]);

  const formatTooltip = (value: number, name: string) => {
    const label = LABEL_MAPPING[name as keyof typeof LABEL_MAPPING] || name;
    const formattedValue = percentage ? `${value}%` : value.toLocaleString();
    return [formattedValue, label];
  };

  const formatYAxis = (value: number) => {
    return percentage ? `${value}%` : value.toLocaleString();
  };

  const customLabel = (props: any) => {
    if (!showValues) return null;
    
    const { x, y, width, height, value } = props;
    const labelValue = percentage ? `${value}%` : value;
    
    // Only show label if the segment is large enough
    const minHeight = 20;
    if (height < minHeight) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="500"
      >
        {labelValue}
      </text>
    );
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

  const ChartComponent = orientation === 'horizontal' ? BarChart : BarChart;

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
          <ChartComponent
            data={processedData}
            margin={{
              top: 20,
              right: 30,
              left: orientation === 'horizontal' ? 100 : 20,
              bottom: orientation === 'horizontal' ? 5 : 50,
            }}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            {orientation === 'horizontal' ? (
              <>
                <XAxis
                  type="number"
                  domain={percentage ? [0, 100] : undefined}
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="category"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={percentage ? [0, 100] : undefined}
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  label={{
                    value: percentage ? 'Percentage (%)' : 'Count',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
                  }}
                />
              </>
            )}
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={formatTooltip}
              labelFormatter={(label) => `${label}`}
            />
            
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
              formatter={(value) => LABEL_MAPPING[value as keyof typeof LABEL_MAPPING] || value}
            />
            
            {stackKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={colors[key] || `hsl(${(index * 60) % 360}, 70%, 50%)`}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
              >
                {showValues && processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Bar>
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      
      {/* Legend explanation for percentage mode */}
      {percentage && (
        <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>Values shown as percentages of total responses per category</p>
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;