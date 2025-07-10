import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, CheckCircle, AlertCircle, ChevronRight, BookOpen } from 'lucide-react';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import StackedBarChart from '../../components/charts/StackedBarChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import ChartContainer from '../../components/charts/ChartContainer';
import FilterPanel from '../../components/filters/FilterPanel';
import { useChartData } from '../../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, AttitudeTrend } from '../../types/chart-types';

interface FAIRMetric {
  principle: 'Findable' | 'Accessible' | 'Interoperable' | 'Reusable';
  year: number;
  awareness: number;
  implementation: number;
  gap: number;
  disciplineBreakdown: Record<string, { awareness: number; implementation: number }>;
}

interface FAIRInsight {
  type: 'awareness_growth' | 'implementation_gap' | 'discipline_leader' | 'principle_focus';
  title: string;
  description: string;
  impact: 'transformative' | 'significant' | 'moderate';
  data: any;
  actionItems: string[];
}

export const FAIRAnalysis: React.FC = () => {
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
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>('all');
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

  // Generate FAIR metrics data
  const fairMetrics = useMemo((): FAIRMetric[] => {
    const principles: FAIRMetric['principle'][] = ['Findable', 'Accessible', 'Interoperable', 'Reusable'];
    const disciplines = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences', 'Humanities', 'Mathematics'];
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    const metrics: FAIRMetric[] = [];

    years.forEach((year, yearIndex) => {
      principles.forEach(principle => {
        // Awareness generally increases over time, but at different rates
        let baseAwareness = 0.3 + (yearIndex * 0.12); // 30% to 90% over 7 years
        let baseImplementation = 0.15 + (yearIndex * 0.08); // 15% to 55% over 7 years

        // Apply principle-specific trends
        switch (principle) {
          case 'Findable':
            baseAwareness += 0.1; // Most familiar principle
            baseImplementation += 0.05;
            break;
          case 'Accessible':
            baseAwareness += 0.05;
            baseImplementation += 0.03;
            break;
          case 'Interoperable':
            baseAwareness -= 0.05; // Most technical/complex
            baseImplementation -= 0.08;
            break;
          case 'Reusable':
            baseAwareness -= 0.02;
            baseImplementation -= 0.05;
            break;
        }

        const disciplineBreakdown: Record<string, { awareness: number; implementation: number }> = {};
        disciplines.forEach(discipline => {
          let disciplineModifier = 0;
          
          // Life sciences and physical sciences lead in FAIR adoption
          if (discipline === 'Life Sciences') disciplineModifier = 0.15;
          if (discipline === 'Physical Sciences') disciplineModifier = 0.1;
          if (discipline === 'Engineering') disciplineModifier = 0.05;
          if (discipline === 'Social Sciences') disciplineModifier = -0.05;
          if (discipline === 'Humanities') disciplineModifier = -0.1;
          if (discipline === 'Mathematics') disciplineModifier = 0.02;

          disciplineBreakdown[discipline] = {
            awareness: Math.min(1, Math.max(0, baseAwareness + disciplineModifier + (Math.random() - 0.5) * 0.1)),
            implementation: Math.min(1, Math.max(0, baseImplementation + disciplineModifier * 0.8 + (Math.random() - 0.5) * 0.1))
          };
        });

        const awareness = baseAwareness + (Math.random() - 0.5) * 0.05;
        const implementation = baseImplementation + (Math.random() - 0.5) * 0.05;

        metrics.push({
          principle,
          year,
          awareness: Math.min(1, Math.max(0, awareness)),
          implementation: Math.min(1, Math.max(0, implementation)),
          gap: awareness - implementation,
          disciplineBreakdown
        });
      });
    });

    return metrics;
  }, []);

  // Generate FAIR awareness trends for time series
  const fairAwarenessTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      findable: (fairMetrics.find(m => m.principle === 'Findable' && m.year === year)?.awareness || 0) * 5,
      accessible: (fairMetrics.find(m => m.principle === 'Accessible' && m.year === year)?.awareness || 0) * 5,
      interoperable: (fairMetrics.find(m => m.principle === 'Interoperable' && m.year === year)?.awareness || 0) * 5,
      reusable: (fairMetrics.find(m => m.principle === 'Reusable' && m.year === year)?.awareness || 0) * 5,
      overallAwareness: (fairMetrics.filter(m => m.year === year).reduce((sum, m) => sum + m.awareness, 0) / 4) * 5,
      overallImplementation: (fairMetrics.filter(m => m.year === year).reduce((sum, m) => sum + m.implementation, 0) / 4) * 5
    }));
  }, [fairMetrics]);

  // Generate implementation vs awareness comparison
  const implementationComparison = useMemo(() => {
    const principles = ['Findable', 'Accessible', 'Interoperable', 'Reusable'];
    const latestData = fairMetrics.filter(m => m.year === 2024);
    
    return principles.map(principle => ({
      category: principle,
      awareness: (latestData.find(m => m.principle === principle)?.awareness || 0) * 100,
      implementation: (latestData.find(m => m.principle === principle)?.implementation || 0) * 100,
      gap: ((latestData.find(m => m.principle === principle)?.gap || 0)) * 100
    }));
  }, [fairMetrics]);

  // Generate discipline heatmap for FAIR implementation
  const disciplineHeatmap = useMemo(() => {
    const data: any[] = [];
    const principles = ['Findable', 'Accessible', 'Interoperable', 'Reusable'];
    const disciplines = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences'];
    const latestData = fairMetrics.filter(m => m.year === 2024);

    principles.forEach(principle => {
      disciplines.forEach(discipline => {
        const metric = latestData.find(m => m.principle === principle);
        const implementation = metric?.disciplineBreakdown[discipline]?.implementation || 0;
        
        data.push({
          row: principle,
          column: discipline,
          value: implementation,
          percentage: implementation * 100
        });
      });
    });

    return {
      rowVariable: 'FAIR Principle',
      columnVariable: 'Discipline',
      data,
      totals: { row: {}, column: {}, overall: 0 }
    };
  }, [fairMetrics]);

  // Generate insights
  const insights = useMemo((): FAIRInsight[] => {
    const insights: FAIRInsight[] = [];

    // Awareness growth analysis
    const overallAwarenessGrowth = fairAwarenessTrends[fairAwarenessTrends.length - 1].overallAwareness - fairAwarenessTrends[0].overallAwareness;
    if (overallAwarenessGrowth > 1.5) {
      insights.push({
        type: 'awareness_growth',
        title: 'FAIR Principles Awareness Reaches Tipping Point',
        description: `FAIR principles awareness has increased by ${(overallAwarenessGrowth * 20).toFixed(0)}% since 2017, with ${(fairAwarenessTrends[fairAwarenessTrends.length - 1].overallAwareness * 20).toFixed(0)}% of researchers now familiar with the framework. This represents a fundamental shift in research data management culture.`,
        impact: 'transformative',
        data: { growth: overallAwarenessGrowth, currentLevel: fairAwarenessTrends[fairAwarenessTrends.length - 1].overallAwareness },
        actionItems: [
          'Capitalize on high awareness to drive implementation',
          'Develop advanced FAIR training for aware researchers',
          'Create community of practice for FAIR champions',
          'Establish FAIR implementation benchmarks'
        ]
      });
    }

    // Implementation gap analysis
    const latestImplementation = fairAwarenessTrends[fairAwarenessTrends.length - 1].overallImplementation;
    const latestAwareness = fairAwarenessTrends[fairAwarenessTrends.length - 1].overallAwareness;
    const implementationGap = latestAwareness - latestImplementation;
    
    if (implementationGap > 1.0) {
      insights.push({
        type: 'implementation_gap',
        title: 'Significant Implementation Gap Persists',
        description: `Despite high awareness (${(latestAwareness * 20).toFixed(0)}%), implementation lags at ${(latestImplementation * 20).toFixed(0)}%, creating a ${(implementationGap * 20).toFixed(0)}% gap. This suggests barriers in translating knowledge into practice.`,
        impact: 'significant',
        data: { gap: implementationGap, awareness: latestAwareness, implementation: latestImplementation },
        actionItems: [
          'Identify and address implementation barriers',
          'Develop practical implementation guides',
          'Create institutional support programs',
          'Provide hands-on training workshops'
        ]
      });
    }

    // Discipline leader analysis
    const lifeSciencesImpl = disciplineHeatmap.data
      .filter(d => d.column === 'Life Sciences')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    const humanitiesImpl = disciplineHeatmap.data
      .filter(d => d.column === 'Social Sciences')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    
    if (lifeSciencesImpl > 0.5 && lifeSciencesImpl - humanitiesImpl > 0.2) {
      insights.push({
        type: 'discipline_leader',
        title: 'Life Sciences Lead FAIR Implementation',
        description: `Life Sciences researchers show ${(lifeSciencesImpl * 100).toFixed(0)}% implementation rates, significantly ahead of Social Sciences at ${(humanitiesImpl * 100).toFixed(0)}%. This creates opportunities for cross-disciplinary knowledge transfer.`,
        impact: 'moderate',
        data: { leader: lifeSciencesImpl, laggard: humanitiesImpl, gap: lifeSciencesImpl - humanitiesImpl },
        actionItems: [
          'Facilitate life sciences mentorship programs',
          'Adapt successful life sciences practices',
          'Create discipline-specific FAIR guidelines',
          'Establish cross-disciplinary collaboration'
        ]
      });
    }

    // Principle focus analysis
    const findableImpl = implementationComparison.find(p => p.category === 'Findable')?.implementation || 0;
    const interoperableImpl = implementationComparison.find(p => p.category === 'Interoperable')?.implementation || 0;
    
    if (findableImpl - interoperableImpl > 20) {
      insights.push({
        type: 'principle_focus',
        title: 'Interoperability Needs Focused Attention',
        description: `While Findability shows strong implementation (${findableImpl.toFixed(0)}%), Interoperability lags at ${interoperableImpl.toFixed(0)}%. This technical principle requires specialized support and infrastructure.`,
        impact: 'significant',
        data: { findable: findableImpl, interoperable: interoperableImpl, gap: findableImpl - interoperableImpl },
        actionItems: [
          'Develop interoperability training programs',
          'Create technical infrastructure support',
          'Establish metadata standards',
          'Build community vocabularies and ontologies'
        ]
      });
    }

    return insights;
  }, [fairAwarenessTrends, implementationComparison, disciplineHeatmap]);

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
        case 'awareness':
          data = fairAwarenessTrends;
          break;
        case 'comparison':
          data = implementationComparison;
          break;
        case 'heatmap':
          data = disciplineHeatmap.data;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `fair-analysis-${chartType}-${new Date().toISOString().split('T')[0]}`,
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
          FAIR Principles Adoption Analysis
        </h1>
        <p className="text-gray-600">
          Comprehensive tracking of FAIR (Findable, Accessible, Interoperable, Reusable) principles awareness and implementation
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.impact === 'transformative' ? 'border-green-500 bg-green-50' :
            insight.impact === 'significant' ? 'border-blue-500 bg-blue-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {insight.type === 'awareness_growth' && <TrendingUp className="w-5 h-5 text-green-500 mr-2" />}
                {insight.type === 'implementation_gap' && <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />}
                {insight.type === 'discipline_leader' && <Target className="w-5 h-5 text-blue-500 mr-2" />}
                {insight.type === 'principle_focus' && <BookOpen className="w-5 h-5 text-purple-500 mr-2" />}
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-700">Action Items:</h4>
              {insight.actionItems.slice(0, 2).map((action, i) => (
                <p key={i} className="text-xs text-gray-600">• {action}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAIR Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['Findable', 'Accessible', 'Interoperable', 'Reusable'].map(principle => {
          const latestData = fairMetrics.find(m => m.principle === principle && m.year === 2024);
          const awareness = (latestData?.awareness || 0) * 100;
          const implementation = (latestData?.implementation || 0) * 100;
          
          return (
            <div key={principle} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold text-gray-900 mb-2">{principle}</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Awareness</span>
                    <span>{awareness.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${awareness}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Implementation</span>
                    <span>{implementation.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${implementation}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
        {/* FAIR Awareness Trends */}
        <ChartContainer
          title="FAIR Principles Awareness Over Time"
          subtitle="Evolution of awareness for each FAIR principle (2017-2024)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('fair-awareness-chart', 'awareness', format)}
          info="Shows how awareness of FAIR principles has evolved over time. Scores are normalized to 1-5 scale."
        >
          <div id="fair-awareness-chart">
            <TimeSeriesChart
              data={fairAwarenessTrends}
              metrics={['findable', 'accessible', 'interoperable', 'reusable', 'overallAwareness']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Implementation vs Awareness Comparison */}
        <ChartContainer
          title="Awareness vs Implementation Gap (2024)"
          subtitle="Comparison of current awareness levels with actual implementation"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('fair-comparison-chart', 'comparison', format)}
          info="Shows the gap between knowing about FAIR principles and actually implementing them in practice."
        >
          <div id="fair-comparison-chart">
            <StackedBarChart
              data={implementationComparison.map(item => ({
                category: item.category,
                awareness: item.awareness,
                implementation: item.implementation,
                gap: item.gap
              }))}
              stackKeys={['implementation', 'gap']}
              percentage={false}
              orientation="vertical"
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Discipline Implementation Heatmap */}
        <ChartContainer
          title="FAIR Implementation by Research Discipline"
          subtitle="Heatmap showing implementation levels across different research fields"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('fair-heatmap-chart', 'heatmap', format)}
          info="Compares FAIR implementation levels across different research disciplines and principles."
        >
          <div id="fair-heatmap-chart">
            <HeatmapChart
              data={disciplineHeatmap}
              colorScheme="green"
              showValues={true}
              showPercentages={true}
              cellSize={80}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* FAIR Maturity Assessment */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            FAIR Maturity Assessment (2024)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Implementation Progress</h4>
              <div className="space-y-3">
                {implementationComparison.map(principle => (
                  <div key={principle.category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{principle.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{principle.implementation.toFixed(0)}%</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${principle.implementation}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Implementation Priorities</h4>
              <div className="space-y-2">
                {implementationComparison
                  .sort((a, b) => b.gap - a.gap)
                  .map((principle, index) => (
                    <div key={principle.category} className={`p-3 rounded ${
                      index === 0 ? 'bg-red-50 border border-red-200' :
                      index === 1 ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{principle.category}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          index === 0 ? 'bg-red-100 text-red-800' :
                          index === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {index === 0 ? 'High Priority' : index === 1 ? 'Medium Priority' : 'Low Priority'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {principle.gap.toFixed(0)}% awareness-implementation gap
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAIRAnalysis;