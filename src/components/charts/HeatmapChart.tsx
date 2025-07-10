import React from 'react';
import { ResponsiveContainer, Cell } from 'recharts';
import type { ChartProps, HeatmapDataPoint, CrossTabulation } from '../../types/chart-types';

interface HeatmapChartProps extends ChartProps {
  data: CrossTabulation;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  showValues?: boolean;
  showPercentages?: boolean;
  cellSize?: number;
  fontSize?: number;
}

const COLOR_SCHEMES = {
  blue: {
    low: '#EFF6FF',
    medium: '#93C5FD',
    high: '#1D4ED8'
  },
  green: {
    low: '#F0FDF4',
    medium: '#86EFAC',
    high: '#15803D'
  },
  red: {
    low: '#FEF2F2',
    medium: '#FCA5A5',
    high: '#DC2626'
  },
  purple: {
    low: '#FAF5FF',
    medium: '#C4B5FD',
    high: '#7C3AED'
  },
  orange: {
    low: '#FFF7ED',
    medium: '#FDBA74',
    high: '#EA580C'
  }
};

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  colorScheme = 'blue',
  showValues = true,
  showPercentages = false,
  cellSize = 60,
  fontSize = 12,
  width,
  height,
  loading = false,
  error,
  title,
  subtitle
}) => {
  const colors = COLOR_SCHEMES[colorScheme];
  
  // Get unique row and column values
  const rows = Array.from(new Set(data.data.map(d => d.row))).sort();
  const columns = Array.from(new Set(data.data.map(d => d.column))).sort();
  
  // Create a matrix for easier access
  const matrix = React.useMemo(() => {
    const map = new Map<string, HeatmapDataPoint>();
    data.data.forEach(point => {
      map.set(`${point.row}-${point.column}`, point);
    });
    return map;
  }, [data]);

  // Calculate min and max values for color scaling
  const { minValue, maxValue } = React.useMemo(() => {
    const values = data.data.map(d => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values)
    };
  }, [data]);

  const getColorIntensity = (value: number): string => {
    if (maxValue === minValue) return colors.medium;
    
    const intensity = (value - minValue) / (maxValue - minValue);
    
    if (intensity < 0.33) return colors.low;
    if (intensity < 0.67) return colors.medium;
    return colors.high;
  };

  const getTextColor = (value: number): string => {
    const intensity = (value - minValue) / (maxValue - minValue);
    return intensity > 0.5 ? '#ffffff' : '#374151';
  };

  const formatCellValue = (point: HeatmapDataPoint): string => {
    if (showPercentages && point.percentage !== undefined) {
      return `${point.percentage.toFixed(1)}%`;
    }
    return point.value.toLocaleString();
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

  if (!data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg">No data available</div>
      </div>
    );
  }

  const chartWidth = columns.length * cellSize + 150; // Extra space for row labels
  const chartHeight = rows.length * cellSize + 100; // Extra space for column labels

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
      
      <div className="bg-white p-4 rounded-lg shadow overflow-auto">
        <div className="relative" style={{ minWidth: chartWidth, minHeight: chartHeight }}>
          <svg width={chartWidth} height={chartHeight}>
            {/* Column headers */}
            {columns.map((column, colIndex) => (
              <text
                key={`col-header-${colIndex}`}
                x={150 + colIndex * cellSize + cellSize / 2}
                y={30}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fill="#374151"
                fontWeight="500"
                transform={`rotate(-45, ${150 + colIndex * cellSize + cellSize / 2}, 30)`}
              >
                {column}
              </text>
            ))}
            
            {/* Row headers and cells */}
            {rows.map((row, rowIndex) => (
              <g key={`row-${rowIndex}`}>
                {/* Row header */}
                <text
                  x={140}
                  y={60 + rowIndex * cellSize + cellSize / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fill="#374151"
                  fontWeight="500"
                >
                  {row}
                </text>
                
                {/* Row cells */}
                {columns.map((column, colIndex) => {
                  const point = matrix.get(`${row}-${column}`);
                  if (!point) return null;
                  
                  const x = 150 + colIndex * cellSize;
                  const y = 50 + rowIndex * cellSize;
                  const cellColor = getColorIntensity(point.value);
                  const textColor = getTextColor(point.value);
                  
                  return (
                    <g key={`cell-${rowIndex}-${colIndex}`}>
                      {/* Cell background */}
                      <rect
                        x={x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        fill={cellColor}
                        stroke="#ffffff"
                        strokeWidth={2}
                        rx={2}
                        className="hover:opacity-80 cursor-pointer transition-opacity"
                      />
                      
                      {/* Cell value */}
                      {showValues && (
                        <text
                          x={x + cellSize / 2}
                          y={y + cellSize / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={fontSize - 1}
                          fill={textColor}
                          fontWeight="500"
                        >
                          {formatCellValue(point)}
                        </text>
                      )}
                      
                      {/* Tooltip on hover */}
                      <title>
                        {`${row} × ${column}: ${point.value.toLocaleString()}`}
                        {point.percentage && ` (${point.percentage.toFixed(1)}%)`}
                      </title>
                    </g>
                  );
                })}
              </g>
            ))}
            
            {/* Variable labels */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize={fontSize + 1}
              fill="#374151"
              fontWeight="600"
            >
              {data.columnVariable}
            </text>
            
            <text
              x={20}
              y={chartHeight / 2}
              textAnchor="middle"
              fontSize={fontSize + 1}
              fill="#374151"
              fontWeight="600"
              transform={`rotate(-90, 20, ${chartHeight / 2})`}
            >
              {data.rowVariable}
            </text>
          </svg>
        </div>
        
        {/* Color scale legend */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-600">Low</span>
          <div className="flex">
            <div
              className="w-6 h-4"
              style={{ backgroundColor: colors.low }}
            />
            <div
              className="w-6 h-4"
              style={{ backgroundColor: colors.medium }}
            />
            <div
              className="w-6 h-4"
              style={{ backgroundColor: colors.high }}
            />
          </div>
          <span className="text-sm text-gray-600">High</span>
          <span className="ml-4 text-xs text-gray-500">
            Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-900">Total Responses</div>
          <div className="text-lg font-bold text-blue-600">
            {data.totals.overall.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-900">Categories</div>
          <div className="text-lg font-bold text-green-600">
            {rows.length} × {columns.length}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-900">Max Value</div>
          <div className="text-lg font-bold text-purple-600">
            {maxValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-900">Avg Value</div>
          <div className="text-lg font-bold text-orange-600">
            {(data.data.reduce((sum, d) => sum + d.value, 0) / data.data.length).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;