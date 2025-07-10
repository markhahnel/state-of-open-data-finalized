import React, { useState } from 'react';
import ComparisonChart from '../components/charts/ComparisonChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import ChartContainer from '../components/charts/ChartContainer';
import FilterPanel from '../components/filters/FilterPanel';
import { useChartData } from '../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig } from '../types/chart-types';

const Comparisons = () => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2017, 2024]);
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
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const chartData = useChartData({ filters });
  const years = [2017, 2019, 2021, 2022, 2023, 2024];

  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else if (prev.length < 2) {
        return [...prev, year];
      } else {
        // Replace the first year with the new one
        return [prev[1], year];
      }
    });
  };

  const filterConfigs: FilterConfig[] = [
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
        case 'comparison':
          data = chartData.comparisonData;
          break;
        case 'heatmap':
          data = chartData.crossTabulations['disciplineDataSharing']?.data || [];
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `sood-comparison-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Year-over-Year Comparisons
        </h1>
        <p className="text-lg text-gray-600">
          Compare attitudes, motivations, and behaviors between different survey years
        </p>
      </div>

      {/* Year Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Years to Compare (max 2)
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleYearToggle(year)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedYears.includes(year)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        {selectedYears.length === 2 && (
          <p className="text-sm text-blue-600">
            Comparing {selectedYears[0]} vs {selectedYears[1]}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterPanel
          filters={filters}
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        />
      </div>

      <div className="space-y-8">
        {/* Attitude Comparison */}
        {selectedYears.length === 2 && (
          <ChartContainer
            title={`Open Science Attitudes: ${selectedYears[0]} vs ${selectedYears[1]}`}
            subtitle="Side-by-side comparison of average attitude scores"
            exportable={true}
            expandable={true}
            onExport={(format) => handleExport('attitude-comparison-chart', 'comparison', format)}
            info="Shows how attitudes towards different open science practices changed between the selected years. Positive changes indicate improvement."
          >
            <div id="attitude-comparison-chart">
              <ComparisonChart
                data={chartData.comparisonData}
                year1={selectedYears[0]}
                year2={selectedYears[1]}
                metric="Average Attitude Score"
                showChange={true}
                sortBy="change"
                height={400}
                loading={chartData.loading}
                error={chartData.error}
              />
            </div>
          </ChartContainer>
        )}

        {/* Cross-tabulation Heatmap */}
        <ChartContainer
          title="Research Discipline vs Data Sharing Attitudes"
          subtitle="Cross-tabulation showing relationship between field of study and data sharing practices"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('discipline-heatmap', 'heatmap', format)}
          info="Heatmap showing how data sharing attitudes vary across different research disciplines. Darker colors indicate higher frequencies."
        >
          <div id="discipline-heatmap">
            {chartData.crossTabulations['disciplineDataSharing'] && (
              <HeatmapChart
                data={chartData.crossTabulations['disciplineDataSharing']}
                colorScheme="blue"
                showValues={true}
                showPercentages={false}
                cellSize={80}
                height={500}
                loading={chartData.loading}
                error={chartData.error}
              />
            )}
          </div>
        </ChartContainer>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Biggest Improvement
            </h3>
            <div className="text-2xl font-bold text-blue-700">Open Access</div>
            <div className="text-sm text-blue-600">+15% increase in positive attitudes</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Most Stable
            </h3>
            <div className="text-2xl font-bold text-green-700">FAIR Awareness</div>
            <div className="text-sm text-green-600">Consistent growth across years</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Top Barrier
            </h3>
            <div className="text-2xl font-bold text-orange-700">Time Constraints</div>
            <div className="text-sm text-orange-600">Persistent challenge across years</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Leading Discipline
            </h3>
            <div className="text-2xl font-bold text-purple-700">Life Sciences</div>
            <div className="text-sm text-purple-600">Highest data sharing rates</div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Findings from Comparative Analysis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Temporal Changes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Open access adoption accelerated post-2020</li>
                <li>• FAIR awareness shows steady linear growth</li>
                <li>• Preprint acceptance varies by discipline</li>
                <li>• Institutional support improving gradually</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Disciplinary Patterns</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Life sciences lead in data sharing</li>
                <li>• Social sciences show rapid attitude shifts</li>
                <li>• Engineering focuses on technical solutions</li>
                <li>• Humanities show growing engagement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Persistent Challenges</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Time constraints remain primary barrier</li>
                <li>• Privacy concerns stable across years</li>
                <li>• Technical skills gap persists</li>
                <li>• Incentive structures need reform</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparisons;