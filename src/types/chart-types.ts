export interface TimeSeriesDataPoint {
  year: number;
  value: number;
  category?: string;
  label?: string;
}

export interface StackedBarDataPoint {
  category: string;
  [key: string]: string | number;
}

export interface HeatmapDataPoint {
  row: string;
  column: string;
  value: number;
  percentage?: number;
  count?: number;
}

export interface ComparisonDataPoint {
  category: string;
  year1Value: number;
  year2Value: number;
  change?: number;
  changePercentage?: number;
}

export interface TrendMetric {
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'percentage' | 'number' | 'score';
  description?: string;
}

export interface ChartFilters {
  years: number[];
  countries: string[];
  disciplines: string[];
  jobTitles: string[];
  careerStages: string[];
  institutionTypes: string[];
  genders: string[];
  ageGroups: string[];
}

export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  filters?: Partial<ChartFilters>;
  onFilterChange?: (filters: Partial<ChartFilters>) => void;
}

export interface AttitudeTrend {
  year: number;
  openAccess: number;
  openData: number;
  openPeerReview: number;
  preprints: number;
  openScience: number;
  dataSharing: number;
}

export interface MotivationDistribution {
  motivation: string;
  veryHigh: number;
  high: number;
  moderate: number;
  low: number;
  veryLow: number;
}

export interface BarrierDistribution {
  barrier: string;
  majorBarrier: number;
  significantBarrier: number;
  moderateBarrier: number;
  minorBarrier: number;
  notABarrier: number;
}

export interface DemographicBreakdown {
  category: string;
  [key: string]: string | number;
}

export interface CrossTabulation {
  rowVariable: string;
  columnVariable: string;
  data: HeatmapDataPoint[];
  totals: {
    row: Record<string, number>;
    column: Record<string, number>;
    overall: number;
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'checkbox';
  options: FilterOption[];
  defaultValue?: any;
}

export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'csv';
  filename?: string;
  includeData?: boolean;
}

export interface TooltipConfig {
  show: boolean;
  formatter?: (value: any, label: string, props: any) => string;
  labelFormatter?: (label: string) => string;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

export interface AxisConfig {
  label?: string;
  domain?: [number, number];
  tickCount?: number;
  formatter?: (value: any) => string;
}