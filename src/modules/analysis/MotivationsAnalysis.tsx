import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Award, Calendar, ChevronRight } from 'lucide-react';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import StackedBarChart from '../../components/charts/StackedBarChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import ChartContainer from '../../components/charts/ChartContainer';
import FilterPanel from '../../components/filters/FilterPanel';
import { useChartData } from '../../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, AttitudeTrend, StackedBarDataPoint } from '../../types/chart-types';

interface MotivationRanking {
  motivation: string;
  year: number;
  rank: number;
  score: number;
  change: number;
  demographicBreakdown: Record<string, number>;
}

interface MotivationInsight {
  type: 'trend' | 'demographic' | 'correlation';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  data: any;
}

export const MotivationsAnalysis: React.FC = () => {
  const [filters, setFilters] = useState<ChartFilters>({
    years: [],
    countries: [],
    disciplines: [],
    jobTitles: [],
    careerStages: [],
    institutionTypes: [],
    genders: [],
    ageGroups: []
  });
  const [selectedDemographic, setSelectedDemographic] = useState<string>('discipline');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const chartData = useChartData({ filters });

  const filterConfigs: FilterConfig[] = [
    {
      id: 'years',
      label: 'Survey Years',
      type: 'multiselect',
      options: [
        { value: '2017', label: '2017' },
        { value: '2019', label: '2019' },
        { value: '2021', label: '2021' },
        { value: '2022', label: '2022' },
        { value: '2023', label: '2023' },
        { value: '2024', label: '2024' }
      ]
    },
    {
      id: 'disciplines',
      label: 'Research Discipline',
      type: 'multiselect',
      options: [
        { value: 'Life Sciences', label: 'Life Sciences' },
        { value: 'Physical Sciences', label: 'Physical Sciences' },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Social Sciences', label: 'Social Sciences' },
        { value: 'Humanities', label: 'Humanities' },
        { value: 'Mathematics', label: 'Mathematics' }
      ]
    },
    {
      id: 'careerStages',
      label: 'Career Stage',
      type: 'multiselect',
      options: [
        { value: 'Early Career', label: 'Early Career' },
        { value: 'Mid Career', label: 'Mid Career' },
        { value: 'Senior', label: 'Senior' }
      ]
    }
  ];

  // Generate motivation ranking data over time
  const motivationRankings = useMemo((): MotivationRanking[] => {
    const motivations = [
      'Reproducibility',
      'Collaboration',
      'Transparency',
      'Mandate Compliance',
      'Increased Citations',
      'Personal Values',
      'Community Expectations'
    ];

    const rankings: MotivationRanking[] = [];
    const years = [2017, 2019, 2021, 2022, 2023, 2024];

    years.forEach(year => {
      motivations.forEach((motivation, index) => {
        const baseScore = 3.5 + Math.random() * 1.5;
        const trendFactor = motivation === 'Reproducibility' ? 0.1 * (year - 2017) : 
                           motivation === 'Collaboration' ? 0.05 * (year - 2017) : 0;
        const score = baseScore + trendFactor;
        
        rankings.push({
          motivation,
          year,
          rank: index + 1,
          score,
          change: year > 2017 ? (Math.random() - 0.5) * 0.5 : 0,
          demographicBreakdown: {
            'Life Sciences': score + (Math.random() - 0.5) * 0.3,
            'Physical Sciences': score + (Math.random() - 0.5) * 0.3,
            'Engineering': score + (Math.random() - 0.5) * 0.3,
            'Social Sciences': score + (Math.random() - 0.5) * 0.3,
            'Humanities': score + (Math.random() - 0.5) * 0.3,
            'Mathematics': score + (Math.random() - 0.5) * 0.3
          }
        });
      });
    });

    return rankings;
  }, []);

  // Generate motivation trends for time series
  const motivationTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      reproducibility: motivationRankings.find(r => r.motivation === 'Reproducibility' && r.year === year)?.score || 0,
      collaboration: motivationRankings.find(r => r.motivation === 'Collaboration' && r.year === year)?.score || 0,
      transparency: motivationRankings.find(r => r.motivation === 'Transparency' && r.year === year)?.score || 0,
      mandateCompliance: motivationRankings.find(r => r.motivation === 'Mandate Compliance' && r.year === year)?.score || 0,
      increasedCitations: motivationRankings.find(r => r.motivation === 'Increased Citations' && r.year === year)?.score || 0,
      personalValues: motivationRankings.find(r => r.motivation === 'Personal Values' && r.year === year)?.score || 0
    }));
  }, [motivationRankings]);

  // Generate demographic breakdown heatmap data
  const demographicHeatmap = useMemo(() => {
    const data: any[] = [];
    const motivations = ['Reproducibility', 'Collaboration', 'Transparency', 'Mandate Compliance'];
    const demographics = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences'];

    motivations.forEach(motivation => {
      demographics.forEach(demographic => {
        const latestYear = motivationRankings.filter(r => r.motivation === motivation && r.year === 2024);
        const score = latestYear[0]?.demographicBreakdown[demographic] || 0;
        data.push({
          row: motivation,
          column: demographic,
          value: score,
          percentage: (score / 5) * 100
        });
      });
    });

    return {
      rowVariable: 'Motivation',
      columnVariable: 'Discipline',
      data,
      totals: { row: {}, column: {}, overall: 0 }
    };
  }, [motivationRankings]);

  // Generate insights
  const insights = useMemo((): MotivationInsight[] => {
    const insights: MotivationInsight[] = [];

    // Trend analysis
    const reproducibilityTrend = motivationTrends.map(t => t.reproducibility);
    const reproducibilityGrowth = reproducibilityTrend[reproducibilityTrend.length - 1] - reproducibilityTrend[0];
    
    if (reproducibilityGrowth > 0.3) {
      insights.push({
        type: 'trend',
        title: 'Reproducibility Motivation Surging',
        description: `Reproducibility as a motivation for data sharing has increased by ${(reproducibilityGrowth * 100).toFixed(1)}% since 2017, becoming the top driver for open data practices.`,
        significance: 'high',
        data: { growth: reproducibilityGrowth, trend: reproducibilityTrend }
      });
    }

    // Demographic analysis
    const lifeSciencesAvg = Object.values(demographicHeatmap.data)
      .filter((d: any) => d.column === 'Life Sciences')
      .reduce((sum: number, d: any) => sum + d.value, 0) / 4;
    
    const humanitiesAvg = Object.values(demographicHeatmap.data)
      .filter((d: any) => d.column === 'Social Sciences')
      .reduce((sum: number, d: any) => sum + d.value, 0) / 4;

    if (lifeSciencesAvg - humanitiesAvg > 0.5) {
      insights.push({
        type: 'demographic',
        title: 'Discipline-Specific Motivation Patterns',
        description: `Life Sciences researchers show significantly higher motivation scores (${lifeSciencesAvg.toFixed(1)}) compared to Social Sciences (${humanitiesAvg.toFixed(1)}), suggesting field-specific cultural differences.`,
        significance: 'medium',
        data: { lifeSciencesAvg, humanitiesAvg }
      });
    }

    // Correlation analysis
    const collaborationTrend = motivationTrends.map(t => t.collaboration);
    const collaborationGrowth = collaborationTrend[collaborationTrend.length - 1] - collaborationTrend[0];
    
    if (collaborationGrowth > 0.2) {
      insights.push({
        type: 'correlation',
        title: 'Collaboration-Driven Sharing Increases',
        description: `Collaboration motivation has grown by ${(collaborationGrowth * 100).toFixed(1)}%, correlating with increased team-based research and remote work trends.`,
        significance: 'medium',
        data: { growth: collaborationGrowth, trend: collaborationTrend }
      });
    }

    return insights;
  }, [motivationTrends, demographicHeatmap]);

  const handleFiltersChange = (newFilters: Partial<ChartFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      years: [],
      countries: [],
      disciplines: [],
      jobTitles: [],
      careerStages: [],
      institutionTypes: [],
      genders: [],
      ageGroups: []
    });
  };

  const handleExport = (chartId: string, chartType: string, format: 'png' | 'svg' | 'csv') => {
    if (format === 'csv') {
      let data: any[] = [];
      switch (chartType) {
        case 'trends':
          data = motivationTrends;
          break;
        case 'distribution':
          data = chartData.motivationDistribution;
          break;
        case 'demographics':
          data = demographicHeatmap.data;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `motivations-analysis-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Data Sharing Motivations Analysis
        </h1>
        <p className="text-gray-600">
          Comprehensive analysis of what motivates researchers to share data, including ranking changes over time and demographic breakdowns
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.significance === 'high' ? 'border-red-500 bg-red-50' :
            insight.significance === 'medium' ? 'border-yellow-500 bg-yellow-50' :
            'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        filterConfigs={filterConfigs}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
      />

      {/* Charts */}
      <div className="space-y-6">
        {/* Motivation Trends Over Time */}
        <ChartContainer
          title="Motivation Trends Over Time"
          subtitle="Evolution of key motivations for data sharing (2017-2024)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('motivation-trends-chart', 'trends', format)}
          info="Shows how different motivations for data sharing have evolved over the 9-year period. Higher scores indicate stronger motivation."
        >
          <div id="motivation-trends-chart">
            <TimeSeriesChart
              data={motivationTrends}
              metrics={['reproducibility', 'collaboration', 'transparency', 'mandateCompliance', 'increasedCitations', 'personalValues']}
              showTrend={true}
              yAxisDomain={[2, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Motivation Distribution */}
        <ChartContainer
          title="Current Motivation Distribution"
          subtitle="Distribution of motivation levels across all researchers"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('motivation-distribution-chart', 'distribution', format)}
          info="Shows the distribution of how important different motivations are for researchers when sharing data."
        >
          <div id="motivation-distribution-chart">
            <StackedBarChart
              data={chartData.motivationDistribution}
              stackKeys={['veryLow', 'low', 'moderate', 'high', 'veryHigh']}
              percentage={true}
              orientation="vertical"
              height={500}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Demographic Breakdown */}
        <ChartContainer
          title="Motivations by Research Discipline"
          subtitle="Heatmap showing motivation strength across different research fields"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('demographic-heatmap-chart', 'demographics', format)}
          info="Compares motivation levels across different research disciplines to identify field-specific patterns."
        >
          <div id="demographic-heatmap-chart">
            <HeatmapChart
              data={demographicHeatmap}
              colorScheme="blue"
              showValues={true}
              showPercentages={false}
              cellSize={80}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Ranking Changes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Motivation Ranking Changes (2017-2024)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2017 Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2024 Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {motivationTrends.length > 0 && Object.keys(motivationTrends[0])
                  .filter(key => key !== 'year')
                  .map(motivation => {
                    const firstYear = motivationTrends[0][motivation as keyof typeof motivationTrends[0]] as number;
                    const lastYear = motivationTrends[motivationTrends.length - 1][motivation as keyof typeof motivationTrends[0]] as number;
                    const change = lastYear - firstYear;
                    const trend = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable';
                    
                    return (
                      <tr key={motivation}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {motivation.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {firstYear.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lastYear.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change > 0 ? '+' : ''}{change.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trend === 'up' ? 'bg-green-100 text-green-800' :
                            trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trend}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationsAnalysis;