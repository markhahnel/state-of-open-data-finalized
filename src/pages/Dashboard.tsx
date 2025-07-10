import React, { useState } from 'react';
import DataInventory from '../components/DataInventory';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import MetricsCard, { MetricsGrid } from '../components/charts/MetricsCard';
import StackedBarChart from '../components/charts/StackedBarChart';
import ChartContainer from '../components/charts/ChartContainer';
import { useChartData } from '../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../utils/chart-utils/exportUtils';
import type { ChartFilters } from '../types/chart-types';

const Dashboard = () => {
  const [filters] = useState<ChartFilters>({
    years: [],
    countries: [],
    disciplines: [],
    jobTitles: [],
    careerStages: [],
    institutionTypes: [],
    genders: [],
    ageGroups: []
  });

  const chartData = useChartData({ filters });

  const handleExport = (chartId: string, chartType: string, format: 'png' | 'svg' | 'csv') => {
    if (format === 'csv') {
      let data: any[] = [];
      switch (chartType) {
        case 'overview':
          data = chartData.attitudeTrends.slice(-3); // Last 3 years
          break;
        case 'participation':
          data = chartData.demographicBreakdown;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `sood-dashboard-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          State of Open Data - Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive analysis of 10 years of open data survey data (2014-2024)
        </p>
      </div>
      
      {/* Key Metrics Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <MetricsGrid 
          metrics={chartData.keyMetrics}
          columns={3}
          loading={chartData.loading}
          error={chartData.error}
        />
      </div>

      {/* Recent Trends Overview */}
      <div className="mb-8">
        <ChartContainer
          title="Recent Trends Overview"
          subtitle="Open science attitudes over the last 3 years"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('recent-trends-chart', 'overview', format)}
          info="Overview of recent changes in open science attitudes, focusing on the most recent survey years."
        >
          <div id="recent-trends-chart">
            <TimeSeriesChart
              data={chartData.attitudeTrends.slice(-3)}
              metrics={['openAccess', 'openData', 'openPeerReview', 'preprints']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={300}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>
      </div>

      {/* Survey Participation Overview */}
      <div className="mb-8">
        <ChartContainer
          title="Survey Participation Overview"
          subtitle="Breakdown of participant demographics across all survey years"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('participation-chart', 'participation', format)}
          info="Shows the distribution of survey participants across different demographic categories."
        >
          <div id="participation-chart">
            <StackedBarChart
              data={chartData.demographicBreakdown}
              stackKeys={Object.keys(chartData.demographicBreakdown[0] || {}).filter(key => key !== 'category')}
              percentage={false}
              orientation="horizontal"
              height={300}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Total Responses
          </h3>
          <div className="text-2xl font-bold text-blue-700">73,351</div>
          <div className="text-sm text-blue-600">Across all survey years</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Survey Years
          </h3>
          <div className="text-2xl font-bold text-green-700">10</div>
          <div className="text-sm text-green-600">From 2014 to 2024</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Countries
          </h3>
          <div className="text-2xl font-bold text-purple-700">180+</div>
          <div className="text-sm text-purple-600">Global representation</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Disciplines
          </h3>
          <div className="text-2xl font-bold text-orange-700">20+</div>
          <div className="text-sm text-orange-600">Research fields covered</div>
        </div>
      </div>

      {/* Data Inventory */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Inventory</h2>
        <DataInventory />
      </div>

      {/* Navigation to Other Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trends Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore 9-year evolution of open science attitudes and behaviors
          </p>
          <a
            href="/trends"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Trends
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Year Comparisons
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Compare attitudes and behaviors between different survey years
          </p>
          <a
            href="/comparisons"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Compare Years
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Deep Dive
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Detailed analysis and data export tools for researchers
          </p>
          <a
            href="/deep-dive"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Explore Data
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;