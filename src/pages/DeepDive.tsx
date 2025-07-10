import React, { useState } from 'react';
import { Search, Filter, Download, BarChart3, TrendingUp, Database } from 'lucide-react';
import HeatmapChart from '../components/charts/HeatmapChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import ChartContainer from '../components/charts/ChartContainer';
import FilterPanel from '../components/filters/FilterPanel';
import { useChartData } from '../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig } from '../types/chart-types';

const DeepDive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'search' | 'visualize' | 'export'>('search');

  const chartData = useChartData({ filters });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'motivations', label: 'Motivations' },
    { value: 'barriers', label: 'Barriers' },
    { value: 'tools', label: 'Tools & Platforms' },
    { value: 'policies', label: 'Policies & Practices' },
    { value: 'demographics', label: 'Demographics' },
  ];

  const mockResults = [
    {
      id: 1,
      question: "What are your primary motivations for sharing data?",
      category: "motivations",
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      responses: 28450,
    },
    {
      id: 2,
      question: "What barriers prevent you from sharing data openly?",
      category: "barriers",
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      responses: 27890,
    },
    {
      id: 3,
      question: "Which data repositories do you use most frequently?",
      category: "tools",
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      responses: 23120,
    },
  ];

  const filteredResults = mockResults.filter(result => {
    const matchesSearch = result.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || result.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        case 'heatmap':
          data = chartData.crossTabulations['disciplineDataSharing']?.data || [];
          break;
        case 'comparison':
          data = chartData.comparisonData;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `sood-deepdive-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Deep Dive - Detailed Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Advanced data exploration and analysis tools for researchers
        </p>
      </div>

      {/* Analysis Mode Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveAnalysisTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeAnalysisTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search Data
            </button>
            <button
              onClick={() => setActiveAnalysisTab('visualize')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeAnalysisTab === 'visualize'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Visualize
            </button>
            <button
              onClick={() => setActiveAnalysisTab('export')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeAnalysisTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export Data
            </button>
          </nav>
        </div>
      </div>

      {/* Search Tab */}
      {activeAnalysisTab === 'search' && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredResults.map(result => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.question}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                    {result.category}
                  </span>
                  <span>{result.responses.toLocaleString()} responses</span>
                  <span>Years: {result.years.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found for your search criteria.
            </div>
          )}
        </div>
      )}

      {/* Visualize Tab */}
      {activeAnalysisTab === 'visualize' && (
        <div className="space-y-6">
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

          {/* Custom Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Discipline vs Data Sharing Cross-Analysis"
              subtitle="Explore relationships between research fields and data sharing attitudes"
              exportable={true}
              expandable={true}
              onExport={(format) => handleExport('deepdive-heatmap', 'heatmap', format)}
              info="Interactive heatmap showing correlations between research disciplines and data sharing behaviors."
            >
              <div id="deepdive-heatmap">
                {chartData.crossTabulations['disciplineDataSharing'] && (
                  <HeatmapChart
                    data={chartData.crossTabulations['disciplineDataSharing']}
                    colorScheme="blue"
                    showValues={true}
                    showPercentages={true}
                    cellSize={60}
                    height={400}
                    loading={chartData.loading}
                    error={chartData.error}
                  />
                )}
              </div>
            </ChartContainer>

            <ChartContainer
              title="Comparative Analysis"
              subtitle="Compare trends across different dimensions"
              exportable={true}
              expandable={true}
              onExport={(format) => handleExport('deepdive-comparison', 'comparison', format)}
              info="Detailed comparison of open science attitudes across different categories."
            >
              <div id="deepdive-comparison">
                <ComparisonChart
                  data={chartData.comparisonData}
                  year1={2017}
                  year2={2024}
                  metric="Attitude Score"
                  showChange={true}
                  sortBy="change"
                  height={400}
                  loading={chartData.loading}
                  error={chartData.error}
                />
              </div>
            </ChartContainer>
          </div>

          {/* Analysis Insights */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Life sciences show highest data sharing rates</li>
                  <li>• Career stage significantly impacts attitudes</li>
                  <li>• Institutional support varies by discipline</li>
                  <li>• Geographic differences in policy implementation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Focus training on underrepresented fields</li>
                  <li>• Develop discipline-specific resources</li>
                  <li>• Address career-stage specific barriers</li>
                  <li>• Improve institutional policy clarity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeAnalysisTab === 'export' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data Export & Analysis Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Raw Survey Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download complete survey responses with demographic information
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  All Years
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Latest Year
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Custom Range
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Processed Analytics</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download aggregated statistics and trend analysis
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Trend Data
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Cross-tabulations
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Statistical Summary
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Custom Analysis</h4>
              <p className="text-sm text-gray-600 mb-3">
                Generate custom reports with specific filters and metrics
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Create Custom Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDive;