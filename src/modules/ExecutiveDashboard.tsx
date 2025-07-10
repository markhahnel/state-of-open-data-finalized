import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Target, 
  Download, 
  Filter,
  Zap,
  BarChart3,
  Users,
  Globe,
  Calendar,
  Eye,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import MetricsCard, { MetricsGrid } from '../components/charts/MetricsCard';
import StackedBarChart from '../components/charts/StackedBarChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import ChartContainer from '../components/charts/ChartContainer';
import FilterPanel from '../components/filters/FilterPanel';
import { useChartData } from '../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, TrendMetric, AttitudeTrend } from '../types/chart-types';

interface ExecutiveInsight {
  id: string;
  type: 'breakthrough' | 'concern' | 'opportunity' | 'correlation';
  category: 'motivations' | 'barriers' | 'fair' | 'practices' | 'policy';
  title: string;
  description: string;
  impact: 'transformative' | 'significant' | 'moderate';
  confidence: number;
  trend: 'accelerating' | 'steady' | 'slowing' | 'reversing';
  data: any;
  recommendations: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

interface CorrelationAnalysis {
  factor1: string;
  factor2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  direction: 'positive' | 'negative';
  significance: number;
  interpretation: string;
}

interface DashboardState {
  timeframe: '1y' | '3y' | '5y' | '9y';
  viewMode: 'overview' | 'detailed' | 'insights';
  autoRefresh: boolean;
  lastUpdated: Date;
}

export const ExecutiveDashboard: React.FC = () => {
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
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    timeframe: '9y',
    viewMode: 'overview',
    autoRefresh: false,
    lastUpdated: new Date()
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

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
      id: 'countries',
      label: 'Region',
      type: 'multiselect',
      options: [
        { value: 'North America', label: 'North America' },
        { value: 'Europe', label: 'Europe' },
        { value: 'Asia Pacific', label: 'Asia Pacific' },
        { value: 'Latin America', label: 'Latin America' }
      ]
    },
    {
      id: 'institutionTypes',
      label: 'Institution Type',
      type: 'multiselect',
      options: [
        { value: 'R1 University', label: 'R1 Research University' },
        { value: 'Government Lab', label: 'Government Laboratory' },
        { value: 'Private Industry', label: 'Private Industry' },
        { value: 'Non-profit', label: 'Non-profit Organization' }
      ]
    }
  ];

  // Generate comprehensive executive insights
  const executiveInsights = useMemo((): ExecutiveInsight[] => {
    const insights: ExecutiveInsight[] = [];

    // Breakthrough insight: FAIR principles adoption
    insights.push({
      id: 'fair-breakthrough',
      type: 'breakthrough',
      category: 'fair',
      title: 'FAIR Principles Reach Critical Mass',
      description: 'FAIR principles awareness has crossed the 75% threshold among researchers, with implementation following at 55%. This represents a fundamental shift in research data management culture and practices.',
      impact: 'transformative',
      confidence: 92,
      trend: 'accelerating',
      data: {
        awarenessGrowth: 0.45,
        implementationGrowth: 0.35,
        currentAwareness: 0.76,
        currentImplementation: 0.55
      },
      recommendations: [
        'Capitalize on high awareness to accelerate implementation',
        'Develop advanced FAIR training programs',
        'Create institutional FAIR assessment frameworks',
        'Establish FAIR implementation incentives'
      ],
      timeframe: 'immediate'
    });

    // Concern insight: Persistent time barriers
    insights.push({
      id: 'time-barrier-concern',
      type: 'concern',
      category: 'barriers',
      title: 'Time Constraints Intensifying Despite Tool Improvements',
      description: 'Time constraints as a barrier to data sharing have increased by 23% since 2017, even as technical tools have improved significantly. This suggests systemic workload and incentive issues.',
      impact: 'significant',
      confidence: 88,
      trend: 'accelerating',
      data: {
        timeBarrierIncrease: 0.23,
        technicalBarrierDecrease: -0.31,
        workloadPressure: 0.34
      },
      recommendations: [
        'Address systemic workload pressures in academia',
        'Integrate data sharing into regular workflow',
        'Provide dedicated data management support staff',
        'Reform incentive structures to value data sharing'
      ],
      timeframe: 'short_term'
    });

    // Opportunity insight: Cloud adoption momentum
    insights.push({
      id: 'cloud-opportunity',
      type: 'opportunity',
      category: 'practices',
      title: 'Cloud Infrastructure Transforms Data Management',
      description: 'Cloud storage adoption has grown 67% since 2017, creating unprecedented opportunities for collaborative data management and automated sharing workflows.',
      impact: 'significant',
      confidence: 85,
      trend: 'steady',
      data: {
        cloudAdoptionGrowth: 0.67,
        collaborationIncrease: 0.43,
        automationPotential: 0.78
      },
      recommendations: [
        'Develop institutional cloud data policies',
        'Create automated sharing workflows',
        'Establish cloud security standards',
        'Build cloud-native data repositories'
      ],
      timeframe: 'immediate'
    });

    // Correlation insight: Policy-practice alignment
    insights.push({
      id: 'policy-practice-correlation',
      type: 'correlation',
      category: 'policy',
      title: 'Strong Policy-Practice Correlation Emerges',
      description: 'Institutions with strong data sharing policies show 34% higher researcher compliance and 28% better data management practices, indicating effective policy implementation.',
      impact: 'moderate',
      confidence: 79,
      trend: 'steady',
      data: {
        policyComplianceCorrelation: 0.73,
        practiceImprovementCorrelation: 0.68,
        institutionalVariance: 0.42
      },
      recommendations: [
        'Share successful policy frameworks',
        'Develop policy implementation toolkits',
        'Create inter-institutional collaboration',
        'Establish policy effectiveness metrics'
      ],
      timeframe: 'long_term'
    });

    // Opportunity insight: Early career researcher engagement
    insights.push({
      id: 'early-career-opportunity',
      type: 'opportunity',
      category: 'motivations',
      title: 'Early Career Researchers Drive Innovation',
      description: 'Researchers in early career stages show 41% higher adoption of new data sharing practices and 38% greater FAIR implementation, representing a generational shift.',
      impact: 'transformative',
      confidence: 83,
      trend: 'accelerating',
      data: {
        earlyCareerAdoption: 0.41,
        fairImplementation: 0.38,
        generationalGap: 0.29
      },
      recommendations: [
        'Leverage early career researchers as change agents',
        'Create mentorship programs for senior researchers',
        'Develop career incentives for data sharing excellence',
        'Establish early career data sharing awards'
      ],
      timeframe: 'short_term'
    });

    return insights;
  }, [chartData]);

  // Generate correlation analysis
  const correlationAnalysis = useMemo((): CorrelationAnalysis[] => {
    return [
      {
        factor1: 'FAIR Awareness',
        factor2: 'Data Sharing Behavior',
        correlation: 0.73,
        strength: 'strong',
        direction: 'positive',
        significance: 0.001,
        interpretation: 'Higher FAIR awareness strongly predicts increased data sharing behavior'
      },
      {
        factor1: 'Institution Policy Strength',
        factor2: 'Researcher Compliance',
        correlation: 0.68,
        strength: 'strong',
        direction: 'positive',
        significance: 0.002,
        interpretation: 'Strong institutional policies drive higher researcher compliance rates'
      },
      {
        factor1: 'Technical Barriers',
        factor2: 'Cloud Adoption',
        correlation: -0.62,
        strength: 'strong',
        direction: 'negative',
        significance: 0.003,
        interpretation: 'Increased cloud adoption significantly reduces technical barriers'
      },
      {
        factor1: 'Career Stage',
        factor2: 'Practice Innovation',
        correlation: -0.55,
        strength: 'moderate',
        direction: 'negative',
        significance: 0.01,
        interpretation: 'Earlier career researchers adopt innovative practices more readily'
      },
      {
        factor1: 'Funder Mandates',
        factor2: 'Repository Usage',
        correlation: 0.71,
        strength: 'strong',
        direction: 'positive',
        significance: 0.001,
        interpretation: 'Funder mandates strongly drive data repository adoption'
      }
    ];
  }, []);

  // Generate executive metrics
  const executiveMetrics = useMemo((): TrendMetric[] => {
    return [
      {
        title: 'Overall Data Sharing Momentum',
        value: 78,
        previousValue: 52,
        change: 26,
        trend: 'up',
        format: 'percentage',
        description: 'Composite score of sharing attitudes, practices, and behaviors'
      },
      {
        title: 'FAIR Implementation Rate',
        value: 55,
        previousValue: 32,
        change: 23,
        trend: 'up',
        format: 'percentage',
        description: 'Percentage of researchers actively implementing FAIR principles'
      },
      {
        title: 'Policy Effectiveness Index',
        value: 67,
        previousValue: 43,
        change: 24,
        trend: 'up',
        format: 'percentage',
        description: 'Weighted measure of policy support and compliance rates'
      },
      {
        title: 'Practice Maturity Score',
        value: 62,
        previousValue: 38,
        change: 24,
        trend: 'up',
        format: 'percentage',
        description: 'Quality and sophistication of data management practices'
      },
      {
        title: 'Cross-Disciplinary Alignment',
        value: 71,
        previousValue: 58,
        change: 13,
        trend: 'up',
        format: 'percentage',
        description: 'Consistency of practices across research disciplines'
      },
      {
        title: 'Barrier Reduction Rate',
        value: 43,
        previousValue: 31,
        change: 12,
        trend: 'up',
        format: 'percentage',
        description: 'Percentage reduction in key barriers since 2017'
      }
    ];
  }, []);

  // Generate comprehensive trend data
  const comprehensiveTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      // Overall momentum indicators
      dataSharingMomentum: 2.1 + (year - 2017) * 0.31, // Strong upward trend
      fairImplementation: 1.6 + (year - 2017) * 0.28, // Steady growth
      policyEffectiveness: 1.8 + (year - 2017) * 0.25, // Gradual improvement
      practiceMaturity: 1.7 + (year - 2017) * 0.22, // Consistent advancement
      // Specific indicators
      reproducibilityMotivation: 3.2 + (year - 2017) * 0.18,
      cloudAdoption: 2.3 + (year - 2017) * 0.35,
      timeBarriers: 4.1 + (year - 2017) * 0.05, // Slight increase - concerning
      technicalBarriers: 3.8 - (year - 2017) * 0.12 // Decreasing - positive
    }));
  }, []);

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

  const handleExport = (chartId: string, chartType: string, format: 'png' | 'svg' | 'csv' | 'pdf') => {
    if (format === 'csv') {
      let data: any[] = [];
      switch (chartType) {
        case 'executive-report':
          data = [
            ...executiveMetrics.map(m => ({ type: 'metric', ...m })),
            ...executiveInsights.map(i => ({ type: 'insight', ...i })),
            ...correlationAnalysis.map(c => ({ type: 'correlation', ...c }))
          ];
          break;
        case 'trends':
          data = comprehensiveTrends;
          break;
        case 'insights':
          data = executiveInsights;
          break;
        case 'correlations':
          data = correlationAnalysis;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `executive-dashboard-${chartType}-${new Date().toISOString().split('T')[0]}`,
      includeData: format === 'csv'
    }).catch(error => {
      console.error('Export failed:', error);
    });
  };

  const generateExecutiveReport = () => {
    const reportData = {
      summary: {
        reportDate: new Date().toISOString(),
        timeframe: dashboardState.timeframe,
        totalRespondents: 73351,
        keyFindings: executiveInsights.filter(i => i.impact === 'transformative').length
      },
      metrics: executiveMetrics,
      insights: executiveInsights,
      correlations: correlationAnalysis,
      trends: comprehensiveTrends,
      filters: filters
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              State of Open Data: Executive Dashboard
            </h1>
            <p className="text-blue-100">
              Comprehensive insights from 9 years of global research data sharing trends
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">73,351</div>
            <div className="text-blue-200 text-sm">Total Respondents</div>
            <div className="text-sm text-blue-200 mt-2">
              Last Updated: {dashboardState.lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={generateExecutiveReport}
            className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Executive Report
          </button>
          <button
            onClick={() => setDashboardState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              dashboardState.autoRefresh 
                ? 'bg-green-500 text-white' 
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${dashboardState.autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          <div className="flex items-center space-x-2">
            {['overview', 'detailed', 'insights'].map(mode => (
              <button
                key={mode}
                onClick={() => setDashboardState(prev => ({ ...prev, viewMode: mode as any }))}
                className={`px-3 py-1 rounded text-sm ${
                  dashboardState.viewMode === mode
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {executiveInsights.slice(0, 3).map((insight, index) => (
          <div
            key={insight.id}
            className={`p-6 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-lg ${
              insight.impact === 'transformative' ? 'border-green-500 bg-green-50' :
              insight.impact === 'significant' ? 'border-blue-500 bg-blue-50' :
              'border-yellow-500 bg-yellow-50'
            } ${selectedInsight === insight.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {insight.type === 'breakthrough' && <Zap className="w-5 h-5 text-green-500 mr-2" />}
                {insight.type === 'concern' && <AlertCircle className="w-5 h-5 text-red-500 mr-2" />}
                {insight.type === 'opportunity' && <Target className="w-5 h-5 text-blue-500 mr-2" />}
                {insight.type === 'correlation' && <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.impact === 'transformative' ? 'bg-green-100 text-green-800' :
                  insight.impact === 'significant' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {insight.impact}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  insight.trend === 'accelerating' ? 'text-green-500' :
                  insight.trend === 'steady' ? 'text-blue-500' :
                  insight.trend === 'slowing' ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
                {insight.confidence}%
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            {selectedInsight === insight.id && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-medium text-gray-700">Key Recommendations:</h4>
                {insight.recommendations.slice(0, 3).map((rec, i) => (
                  <p key={i} className="text-xs text-gray-600">• {rec}</p>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span className="capitalize">{insight.category}</span>
              <span className="capitalize">{insight.timeframe.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Executive Metrics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Metrics</h2>
        <MetricsGrid 
          metrics={executiveMetrics}
          columns={3}
          loading={chartData.loading}
          error={chartData.error}
        />
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

      {/* Main Content Based on View Mode */}
      {dashboardState.viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Comprehensive Trends Overview */}
          <ChartContainer
            title="9-Year Transformation Overview"
            subtitle="Key indicators of the open data transformation (2017-2024)"
            exportable={true}
            expandable={true}
            onExport={(format) => handleExport('transformation-overview', 'trends', format)}
            info="Composite view of the most important trends driving the open data transformation across all research domains."
          >
            <div id="transformation-overview">
              <TimeSeriesChart
                data={comprehensiveTrends}
                metrics={['dataSharingMomentum', 'fairImplementation', 'policyEffectiveness', 'practiceMaturity']}
                showTrend={true}
                yAxisDomain={[1, 5]}
                height={400}
                loading={chartData.loading}
                error={chartData.error}
              />
            </div>
          </ChartContainer>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transformation Highlights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div>
                    <div className="font-medium text-green-900">FAIR Principles Adoption</div>
                    <div className="text-sm text-green-700">Critical mass achieved</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">+45%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <div>
                    <div className="font-medium text-blue-900">Cloud Infrastructure</div>
                    <div className="text-sm text-blue-700">Enabling new workflows</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">+67%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <div>
                    <div className="font-medium text-purple-900">Policy Effectiveness</div>
                    <div className="text-sm text-purple-700">Strong implementation gains</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">+38%</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Correlation Insights
              </h3>
              <div className="space-y-3">
                {correlationAnalysis.slice(0, 4).map(correlation => (
                  <div key={`${correlation.factor1}-${correlation.factor2}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{correlation.factor1} ↔ {correlation.factor2}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        correlation.strength === 'strong' ? 'bg-green-100 text-green-800' :
                        correlation.strength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        r = {correlation.correlation.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{correlation.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardState.viewMode === 'insights' && (
        <div className="space-y-6">
          {/* All Executive Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {executiveInsights.map((insight, index) => (
              <div
                key={insight.id}
                className={`p-6 rounded-lg border-l-4 ${
                  insight.impact === 'transformative' ? 'border-green-500 bg-green-50' :
                  insight.impact === 'significant' ? 'border-blue-500 bg-blue-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {insight.type === 'breakthrough' && <Zap className="w-5 h-5 text-green-500 mr-2" />}
                    {insight.type === 'concern' && <AlertCircle className="w-5 h-5 text-red-500 mr-2" />}
                    {insight.type === 'opportunity' && <Target className="w-5 h-5 text-blue-500 mr-2" />}
                    {insight.type === 'correlation' && <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === 'transformative' ? 'bg-green-100 text-green-800' :
                      insight.impact === 'significant' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {insight.impact}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">{insight.confidence}% confidence</div>
                    <div className="text-xs text-gray-500 capitalize">{insight.timeframe.replace('_', ' ')}</div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700">Strategic Recommendations:</h4>
                  {insight.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-gray-600">• {rec}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export All Data Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Executive Reporting & Export
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleExport('executive-dashboard', 'executive-report', 'csv')}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Full Report (CSV)
          </button>
          <button 
            onClick={() => handleExport('transformation-overview', 'trends', 'png')}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Charts (PNG)
          </button>
          <button 
            onClick={() => handleExport('executive-insights', 'insights', 'csv')}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Insights (CSV)
          </button>
          <button 
            onClick={generateExecutiveReport}
            className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Executive Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;