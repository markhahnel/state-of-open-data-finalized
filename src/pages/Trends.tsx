import React, { useState } from 'react';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import MetricsCard, { MetricsGrid } from '../components/charts/MetricsCard';
import ChartContainer from '../components/charts/ChartContainer';
import FilterPanel from '../components/filters/FilterPanel';
import { useChartData } from '../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig } from '../types/chart-types';

const Trends = () => {
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

  const filterConfigs: FilterConfig[] = [
    {
      id: 'years',
      label: 'Survey Years',
      type: 'multiselect',
      options: [
        { value: '2017', label: '2017', count: 2352 },
        { value: '2019', label: '2019', count: 9499 },
        { value: '2021', label: '2021', count: 21594 },
        { value: '2022', label: '2022', count: 28392 },
        { value: '2023', label: '2023', count: 6092 },
        { value: '2024', label: '2024', count: 5422 }
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
    },
    {
      id: 'countries',
      label: 'Country',
      type: 'multiselect',
      options: [
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'Germany', label: 'Germany' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Australia', label: 'Australia' },
        { value: 'France', label: 'France' }
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
    // Set data attribute for CSV export
    if (format === 'csv') {
      let data: any[] = [];
      switch (chartType) {
        case 'timeSeries':
          data = chartData.attitudeTrends;
          break;
        case 'motivations':
          data = chartData.motivationDistribution;
          break;
        case 'barriers':
          data = chartData.barrierDistribution;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `sood-trends-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
      // Handle error (show toast, etc.)
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trends Analysis
        </h1>
        <p className="text-lg text-gray-600">
          9-year evolution of open science attitudes and behaviors (2017-2024)
        </p>
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

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Trends Overview</h2>
        <MetricsGrid 
          metrics={chartData.keyMetrics}
          columns={4}
          loading={chartData.loading}
          error={chartData.error}
        />
      </div>

      <div className="space-y-8">
        {/* Attitude Trends */}
        <ChartContainer
          title="Open Science Attitudes Over Time"
          subtitle="Average attitudes towards different open science practices (1-5 scale)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('attitude-trends-chart', 'timeSeries', format)}
          info="Shows the evolution of researcher attitudes towards open science practices from 2017-2024. Higher scores indicate more positive attitudes."
        >
          <div id="attitude-trends-chart">
            <TimeSeriesChart
              data={chartData.attitudeTrends}
              metrics={['openAccess', 'openData', 'openPeerReview', 'preprints', 'openScience', 'dataSharing']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Motivations and Barriers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer
            title="Data Sharing Motivations"
            subtitle="Distribution of motivation levels across all survey years"
            exportable={true}
            expandable={true}
            onExport={(format) => handleExport('motivations-chart', 'motivations', format)}
            info="Shows the distribution of how important different motivations are for researchers when sharing data."
          >
            <div id="motivations-chart">
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

          <ChartContainer
            title="Barriers to Data Sharing"
            subtitle="Distribution of barrier severity across all survey years"
            exportable={true}
            expandable={true}
            onExport={(format) => handleExport('barriers-chart', 'barriers', format)}
            info="Shows how significant different barriers are for researchers when considering data sharing."
          >
            <div id="barriers-chart">
              <StackedBarChart
                data={chartData.barrierDistribution}
                stackKeys={['notABarrier', 'minorBarrier', 'moderateBarrier', 'significantBarrier', 'majorBarrier']}
                percentage={true}
                orientation="vertical"
                height={500}
                loading={chartData.loading}
                error={chartData.error}
              />
            </div>
          </ChartContainer>
        </div>

        {/* Demographic Trends */}
        <ChartContainer
          title="Researcher Demographics"
          subtitle="Breakdown of survey participants by key demographic categories"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('demographics-chart', 'demographics', format)}
          info="Distribution of survey participants across different demographic categories, helping understand the representativeness of the data."
        >
          <div id="demographics-chart">
            <StackedBarChart
              data={chartData.demographicBreakdown}
              stackKeys={Object.keys(chartData.demographicBreakdown[0] || {}).filter(key => key !== 'category')}
              percentage={false}
              orientation="horizontal"
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Insights Summary */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Key Insights from Trend Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Positive Trends</h4>
              <ul className="space-y-1">
                <li>• Steady growth in open access adoption</li>
                <li>• Increasing FAIR principles awareness</li>
                <li>• Growing institutional support</li>
                <li>• Rising collaboration motivations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Persistent Challenges</h4>
              <ul className="space-y-1">
                <li>• Time constraints remain top barrier</li>
                <li>• Privacy concerns persist</li>
                <li>• Technical challenges ongoing</li>
                <li>• Incentive structures need improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;