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
  Cell,
  ReferenceLine
} from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from 'lucide-react';
import type { ChartProps, ComparisonDataPoint } from '../../types/chart-types';

interface ComparisonChartProps extends ChartProps {
  data: ComparisonDataPoint[];
  year1: number;
  year2: number;
  metric: string;
  showChange?: boolean;
  showPercentageChange?: boolean;
  orientation?: 'horizontal' | 'vertical';
  sortBy?: 'category' | 'change' | 'year1' | 'year2';
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  year1,
  year2,
  metric,
  showChange = true,
  showPercentageChange = false,
  orientation = 'vertical',
  sortBy = 'category',
  width,
  height = 400,
  loading = false,
  error,
  title,
  subtitle
}) => {
  // Sort data based on sortBy parameter
  const sortedData = React.useMemo(() => {
    const sorted = [...data];
    
    switch (sortBy) {
      case 'change':
        return sorted.sort((a, b) => (b.change || 0) - (a.change || 0));
      case 'year1':
        return sorted.sort((a, b) => b.year1Value - a.year1Value);
      case 'year2':
        return sorted.sort((a, b) => b.year2Value - a.year2Value);
      default:
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
    }
  }, [data, sortBy]);

  // Calculate color based on change
  const getChangeColor = (change: number | undefined): string => {
    if (!change || Math.abs(change) < 0.1) return '#6B7280'; // Gray for no change
    return change > 0 ? '#10B981' : '#EF4444'; // Green for positive, red for negative
  };

  const getChangeIcon = (change: number | undefined) => {
    if (!change || Math.abs(change) < 0.1) {
      return <ArrowRightIcon className="w-4 h-4 text-gray-500" />;
    }
    return change > 0 
      ? <ArrowUpIcon className="w-4 h-4 text-green-600" />
      : <ArrowDownIcon className="w-4 h-4 text-red-600" />;
  };

  const formatTooltip = (value: number, name: string, props: any) => {
    const { payload } = props;
    const formattedValue = value.toFixed(2);
    
    if (name === 'year1Value') {
      return [`${formattedValue}`, `${year1}`];
    } else if (name === 'year2Value') {
      return [`${formattedValue}`, `${year2}`];
    }
    
    return [formattedValue, name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              {year1}: {data.year1Value.toFixed(2)}
            </p>
            <p className="text-orange-600">
              {year2}: {data.year2Value.toFixed(2)}
            </p>
            {data.change !== undefined && (
              <div className="flex items-center space-x-1 pt-1 border-t">
                {getChangeIcon(data.change)}
                <span className={`font-medium ${
                  data.change > 0 ? 'text-green-600' : 
                  data.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {showPercentageChange && data.changePercentage 
                    ? `${data.changePercentage > 0 ? '+' : ''}${data.changePercentage.toFixed(1)}%`
                    : `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
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
      
      {/* Sort controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        {['category', 'change', 'year1', 'year2'].map((sort) => (
          <button
            key={sort}
            onClick={() => {/* Handle sort change */}}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              sortBy === sort 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sort === 'year1' ? year1.toString() :
             sort === 'year2' ? year2.toString() :
             sort.charAt(0).toUpperCase() + sort.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={sortedData}
            margin={{
              top: 20,
              right: 30,
              left: orientation === 'horizontal' ? 100 : 20,
              bottom: orientation === 'horizontal' ? 5 : 60,
            }}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            {orientation === 'horizontal' ? (
              <>
                <XAxis 
                  type="number"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
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
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: metric,
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
                  }}
                />
              </>
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            
            {/* Reference line at zero for change visualization */}
            {showChange && (
              <ReferenceLine 
                y={0} 
                stroke="#9CA3AF" 
                strokeDasharray="2 2" 
                strokeOpacity={0.5} 
              />
            )}
            
            <Bar 
              dataKey="year1Value"
              name={year1.toString()}
              fill="#3B82F6"
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
            
            <Bar 
              dataKey="year2Value"
              name={year2.toString()}
              fill="#F59E0B"
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Change summary */}
      {showChange && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Changes from {year1} to {year2}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedData.filter(d => (d.change || 0) > 0.1).length}
              </div>
              <div className="text-gray-600">Increased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {sortedData.filter(d => (d.change || 0) < -0.1).length}
              </div>
              <div className="text-gray-600">Decreased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sortedData.filter(d => Math.abs(d.change || 0) <= 0.1).length}
              </div>
              <div className="text-gray-600">No Change</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonChart;