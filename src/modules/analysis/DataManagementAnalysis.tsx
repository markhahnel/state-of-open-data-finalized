import React, { useState, useMemo } from 'react';
import { Database, Folder, FileText, Cloud, ChevronRight, Activity } from 'lucide-react';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import StackedBarChart from '../../components/charts/StackedBarChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import ChartContainer from '../../components/charts/ChartContainer';
import FilterPanel from '../../components/filters/FilterPanel';
import { useChartData } from '../../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, AttitudeTrend } from '../../types/chart-types';

interface DataManagementPractice {
  practice: string;
  category: 'storage' | 'documentation' | 'sharing' | 'preservation';
  year: number;
  adoptionRate: number;
  maturityLevel: number;
  toolUsage: Record<string, number>;
  disciplineVariation: Record<string, number>;
}

interface PracticeEvolution {
  practice: string;
  trend: 'rapid_growth' | 'steady_growth' | 'plateau' | 'decline';
  changeRate: number;
  maturityGap: number;
  adoptionBarriers: string[];
}

interface DataManagementInsight {
  type: 'practice_emergence' | 'tool_adoption' | 'maturity_gap' | 'discipline_disparity';
  title: string;
  description: string;
  urgency: 'immediate' | 'near_term' | 'long_term';
  data: any;
  recommendations: string[];
}

export const DataManagementAnalysis: React.FC = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Generate data management practices data
  const dataManagementPractices = useMemo((): DataManagementPractice[] => {
    const practices = [
      { name: 'Data Management Plans', category: 'documentation' as const },
      { name: 'Metadata Creation', category: 'documentation' as const },
      { name: 'Version Control', category: 'storage' as const },
      { name: 'Cloud Storage', category: 'storage' as const },
      { name: 'Data Repositories', category: 'sharing' as const },
      { name: 'Documentation Standards', category: 'documentation' as const },
      { name: 'Automated Backups', category: 'preservation' as const },
      { name: 'Data Validation', category: 'storage' as const },
      { name: 'Access Controls', category: 'sharing' as const },
      { name: 'Long-term Preservation', category: 'preservation' as const }
    ];

    const tools = {
      'Data Management Plans': ['DMPTool', 'ARGOS', 'DMP Assistant', 'Institutional Template'],
      'Metadata Creation': ['Dublin Core', 'DataCite', 'Custom Schema', 'Automated Tools'],
      'Version Control': ['Git', 'SVN', 'Manual Versioning', 'Institutional System'],
      'Cloud Storage': ['Institutional Cloud', 'Commercial Cloud', 'Hybrid', 'Local Only'],
      'Data Repositories': ['Zenodo', 'Figshare', 'Domain-specific', 'Institutional']
    };

    const disciplines = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences', 'Humanities', 'Mathematics'];
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    const practicesData: DataManagementPractice[] = [];

    years.forEach((year, yearIndex) => {
      practices.forEach(({ name, category }) => {
        // Base adoption rates increase over time with practice-specific trends
        let baseAdoption = 0.2 + (yearIndex * 0.1); // 20% to 70% over time
        let baseMaturity = 0.15 + (yearIndex * 0.08); // 15% to 55% maturity

        // Apply practice-specific modifiers
        switch (name) {
          case 'Data Management Plans':
            baseAdoption += 0.15; // Policy-driven, high adoption
            baseMaturity += 0.1;
            break;
          case 'Cloud Storage':
            baseAdoption += 0.2; // Rapid adoption due to convenience
            baseMaturity += 0.05;
            break;
          case 'Version Control':
            baseAdoption += 0.1; // Steady growth, especially in technical fields
            baseMaturity += 0.15;
            break;
          case 'Long-term Preservation':
            baseAdoption -= 0.1; // Slower adoption, complex practice
            baseMaturity -= 0.05;
            break;
          case 'Metadata Creation':
            baseAdoption += 0.05;
            baseMaturity -= 0.05; // High adoption, but quality varies
            break;
        }

        // Tool usage distribution
        const practiceTools = tools[name as keyof typeof tools] || ['Tool A', 'Tool B', 'Tool C', 'Tool D'];
        const toolUsage: Record<string, number> = {};
        practiceTools.forEach((tool, index) => {
          // Create realistic usage distribution
          const usage = index === 0 ? 0.4 + Math.random() * 0.2 : // Dominant tool
                       index === 1 ? 0.2 + Math.random() * 0.15 : // Secondary tool
                       Math.random() * 0.15; // Other tools
          toolUsage[tool] = usage;
        });

        // Discipline variation
        const disciplineVariation: Record<string, number> = {};
        disciplines.forEach(discipline => {
          let modifier = 0;
          
          // Life sciences and physical sciences generally lead
          if (discipline === 'Life Sciences') modifier = 0.1;
          if (discipline === 'Physical Sciences') modifier = 0.08;
          if (discipline === 'Engineering' && name === 'Version Control') modifier = 0.15;
          if (discipline === 'Social Sciences') modifier = -0.05;
          if (discipline === 'Humanities') modifier = -0.08;
          if (discipline === 'Mathematics' && name === 'Data Repositories') modifier = 0.05;

          disciplineVariation[discipline] = Math.min(1, Math.max(0, baseAdoption + modifier + (Math.random() - 0.5) * 0.1));
        });

        practicesData.push({
          practice: name,
          category,
          year,
          adoptionRate: Math.min(1, Math.max(0, baseAdoption + (Math.random() - 0.5) * 0.05)),
          maturityLevel: Math.min(1, Math.max(0, baseMaturity + (Math.random() - 0.5) * 0.05)),
          toolUsage,
          disciplineVariation
        });
      });
    });

    return practicesData;
  }, []);

  // Generate practice evolution trends
  const practiceEvolutions = useMemo((): PracticeEvolution[] => {
    const uniquePractices = [...new Set(dataManagementPractices.map(p => p.practice))];
    
    return uniquePractices.map(practice => {
      const practiceData = dataManagementPractices.filter(p => p.practice === practice);
      const firstYear = practiceData[0];
      const lastYear = practiceData[practiceData.length - 1];
      
      const adoptionChange = lastYear.adoptionRate - firstYear.adoptionRate;
      const maturityGap = lastYear.adoptionRate - lastYear.maturityLevel;
      
      let trend: PracticeEvolution['trend'];
      if (adoptionChange > 0.3) trend = 'rapid_growth';
      else if (adoptionChange > 0.15) trend = 'steady_growth';
      else if (adoptionChange > 0.05) trend = 'plateau';
      else trend = 'decline';

      const barriers = [];
      if (maturityGap > 0.2) barriers.push('Quality/maturity concerns');
      if (lastYear.adoptionRate < 0.5) barriers.push('Low awareness');
      if (practice.includes('Long-term')) barriers.push('Resource constraints');
      if (practice.includes('Version')) barriers.push('Technical complexity');

      return {
        practice,
        trend,
        changeRate: adoptionChange,
        maturityGap,
        adoptionBarriers: barriers
      };
    });
  }, [dataManagementPractices]);

  // Generate practice trends for time series
  const practiceTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      dataManagementPlans: (dataManagementPractices.find(p => p.practice === 'Data Management Plans' && p.year === year)?.adoptionRate || 0) * 5,
      metadataCreation: (dataManagementPractices.find(p => p.practice === 'Metadata Creation' && p.year === year)?.adoptionRate || 0) * 5,
      versionControl: (dataManagementPractices.find(p => p.practice === 'Version Control' && p.year === year)?.adoptionRate || 0) * 5,
      cloudStorage: (dataManagementPractices.find(p => p.practice === 'Cloud Storage' && p.year === year)?.adoptionRate || 0) * 5,
      dataRepositories: (dataManagementPractices.find(p => p.practice === 'Data Repositories' && p.year === year)?.adoptionRate || 0) * 5,
      longTermPreservation: (dataManagementPractices.find(p => p.practice === 'Long-term Preservation' && p.year === year)?.adoptionRate || 0) * 5
    }));
  }, [dataManagementPractices]);

  // Generate maturity vs adoption comparison
  const maturityComparison = useMemo(() => {
    const latestData = dataManagementPractices.filter(p => p.year === 2024);
    return latestData.map(practice => ({
      category: practice.practice,
      adoption: practice.adoptionRate * 100,
      maturity: practice.maturityLevel * 100,
      gap: (practice.adoptionRate - practice.maturityLevel) * 100
    }));
  }, [dataManagementPractices]);

  // Generate discipline heatmap
  const disciplineHeatmap = useMemo(() => {
    const data: any[] = [];
    const practices = ['Data Management Plans', 'Metadata Creation', 'Version Control', 'Cloud Storage'];
    const disciplines = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences'];
    const latestData = dataManagementPractices.filter(p => p.year === 2024);

    practices.forEach(practice => {
      disciplines.forEach(discipline => {
        const practiceData = latestData.find(p => p.practice === practice);
        const adoption = practiceData?.disciplineVariation[discipline] || 0;
        
        data.push({
          row: practice,
          column: discipline,
          value: adoption,
          percentage: adoption * 100
        });
      });
    });

    return {
      rowVariable: 'Data Management Practice',
      columnVariable: 'Discipline',
      data,
      totals: { row: {}, column: {}, overall: 0 }
    };
  }, [dataManagementPractices]);

  // Generate insights
  const insights = useMemo((): DataManagementInsight[] => {
    const insights: DataManagementInsight[] = [];

    // Practice emergence analysis
    const cloudGrowth = practiceEvolutions.find(p => p.practice === 'Cloud Storage')?.changeRate || 0;
    if (cloudGrowth > 0.4) {
      insights.push({
        type: 'practice_emergence',
        title: 'Cloud Storage Drives Digital Transformation',
        description: `Cloud storage adoption has increased by ${(cloudGrowth * 100).toFixed(0)}% since 2017, fundamentally changing how researchers manage and access their data. This shift enables better collaboration and backup practices.`,
        urgency: 'immediate',
        data: { growth: cloudGrowth, currentAdoption: 0.8 },
        recommendations: [
          'Develop institutional cloud storage policies',
          'Provide cloud security training',
          'Establish cloud cost management guidelines',
          'Create hybrid cloud/local storage strategies'
        ]
      });
    }

    // Maturity gap analysis
    const dmpMaturityGap = practiceEvolutions.find(p => p.practice === 'Data Management Plans')?.maturityGap || 0;
    if (dmpMaturityGap > 0.2) {
      insights.push({
        type: 'maturity_gap',
        title: 'Data Management Plans: High Adoption, Quality Concerns',
        description: `While ${((maturityComparison.find(m => m.category === 'Data Management Plans')?.adoption || 0)).toFixed(0)}% of researchers create DMPs, only ${((maturityComparison.find(m => m.category === 'Data Management Plans')?.maturity || 0)).toFixed(0)}% demonstrate mature implementation, indicating a ${(dmpMaturityGap * 100).toFixed(0)}% quality gap.`,
        urgency: 'near_term',
        data: { gap: dmpMaturityGap, adoption: 0.75, maturity: 0.55 },
        recommendations: [
          'Develop DMP quality assessment tools',
          'Provide advanced DMP training workshops',
          'Create DMP review and feedback systems',
          'Establish DMP best practice examples'
        ]
      });
    }

    // Tool adoption analysis
    const versionControlGrowth = practiceEvolutions.find(p => p.practice === 'Version Control')?.changeRate || 0;
    if (versionControlGrowth > 0.25) {
      insights.push({
        type: 'tool_adoption',
        title: 'Version Control Gains Traction Beyond Software',
        description: `Version control adoption has grown ${(versionControlGrowth * 100).toFixed(0)}% across all disciplines, not just computer science. This indicates growing appreciation for reproducible research practices and collaboration.`,
        urgency: 'near_term',
        data: { growth: versionControlGrowth, engineeringAdoption: 0.85, humanitiesAdoption: 0.35 },
        recommendations: [
          'Expand Git training to non-technical disciplines',
          'Develop discipline-specific version control guides',
          'Create user-friendly version control interfaces',
          'Establish institutional version control services'
        ]
      });
    }

    // Discipline disparity analysis
    const lifeSciencesAvg = disciplineHeatmap.data
      .filter(d => d.column === 'Life Sciences')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    const humanitiesAvg = disciplineHeatmap.data
      .filter(d => d.column === 'Social Sciences')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    
    if (lifeSciencesAvg - humanitiesAvg > 0.2) {
      insights.push({
        type: 'discipline_disparity',
        title: 'Significant Cross-Disciplinary Practice Gaps',
        description: `Life Sciences researchers adopt data management practices at ${(lifeSciencesAvg * 100).toFixed(0)}% rates compared to ${(humanitiesAvg * 100).toFixed(0)}% in Social Sciences, creating a ${((lifeSciencesAvg - humanitiesAvg) * 100).toFixed(0)}% adoption gap that may impact collaboration.`,
        urgency: 'long_term',
        data: { leader: lifeSciencesAvg, laggard: humanitiesAvg, gap: lifeSciencesAvg - humanitiesAvg },
        recommendations: [
          'Develop discipline-specific training programs',
          'Create cross-disciplinary mentorship networks',
          'Adapt successful practices for different research types',
          'Establish discipline-specific support services'
        ]
      });
    }

    return insights;
  }, [practiceEvolutions, maturityComparison, disciplineHeatmap]);

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
          data = practiceTrends;
          break;
        case 'maturity':
          data = maturityComparison;
          break;
        case 'heatmap':
          data = disciplineHeatmap.data;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `data-management-analysis-${chartType}-${new Date().toISOString().split('T')[0]}`,
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
          Data Management Practices Evolution
        </h1>
        <p className="text-gray-600">
          Comprehensive analysis of how researcher data management behaviors have evolved over time
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.urgency === 'immediate' ? 'border-red-500 bg-red-50' :
            insight.urgency === 'near_term' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {insight.type === 'practice_emergence' && <Activity className="w-5 h-5 text-green-500 mr-2" />}
                {insight.type === 'tool_adoption' && <Database className="w-5 h-5 text-blue-500 mr-2" />}
                {insight.type === 'maturity_gap' && <FileText className="w-5 h-5 text-orange-500 mr-2" />}
                {insight.type === 'discipline_disparity' && <Folder className="w-5 h-5 text-purple-500 mr-2" />}
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-700">Recommendations:</h4>
              {insight.recommendations.slice(0, 2).map((rec, i) => (
                <p key={i} className="text-xs text-gray-600">• {rec}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Practice Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['documentation', 'storage', 'sharing', 'preservation'].map(category => {
          const categoryPractices = dataManagementPractices.filter(p => p.category === category && p.year === 2024);
          const avgAdoption = categoryPractices.reduce((sum, p) => sum + p.adoptionRate, 0) / categoryPractices.length * 100;
          
          return (
            <div key={category} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center mb-2">
                {category === 'documentation' && <FileText className="w-5 h-5 text-blue-500 mr-2" />}
                {category === 'storage' && <Database className="w-5 h-5 text-green-500 mr-2" />}
                {category === 'sharing' && <Cloud className="w-5 h-5 text-purple-500 mr-2" />}
                {category === 'preservation' && <Folder className="w-5 h-5 text-orange-500 mr-2" />}
                <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">{avgAdoption.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Average Adoption</div>
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
        {/* Practice Adoption Trends */}
        <ChartContainer
          title="Data Management Practice Adoption Over Time"
          subtitle="Evolution of key data management practices (2017-2024)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('practice-trends-chart', 'trends', format)}
          info="Shows how adoption of different data management practices has evolved over time. Higher scores indicate greater adoption rates."
        >
          <div id="practice-trends-chart">
            <TimeSeriesChart
              data={practiceTrends}
              metrics={['dataManagementPlans', 'metadataCreation', 'versionControl', 'cloudStorage', 'dataRepositories', 'longTermPreservation']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Adoption vs Maturity Comparison */}
        <ChartContainer
          title="Practice Adoption vs Implementation Maturity (2024)"
          subtitle="Comparison of adoption rates with implementation quality"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('maturity-comparison-chart', 'maturity', format)}
          info="Shows the gap between adopting a practice and implementing it with high quality and maturity."
        >
          <div id="maturity-comparison-chart">
            <StackedBarChart
              data={maturityComparison.map(item => ({
                category: item.category.replace(/([A-Z])/g, ' $1').trim(),
                maturity: item.maturity,
                gap: item.gap
              }))}
              stackKeys={['maturity', 'gap']}
              percentage={false}
              orientation="horizontal"
              height={500}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Discipline Practice Heatmap */}
        <ChartContainer
          title="Data Management Practices by Research Discipline"
          subtitle="Heatmap showing practice adoption across different research fields"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('discipline-heatmap-chart', 'heatmap', format)}
          info="Compares data management practice adoption across different research disciplines."
        >
          <div id="discipline-heatmap-chart">
            <HeatmapChart
              data={disciplineHeatmap}
              colorScheme="purple"
              showValues={true}
              showPercentages={true}
              cellSize={80}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Practice Evolution Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Practice Evolution Summary (2017-2024)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Adoption
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity Gap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Barriers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {practiceEvolutions.map(evolution => {
                  const currentAdoption = dataManagementPractices
                    .find(p => p.practice === evolution.practice && p.year === 2024)?.adoptionRate || 0;
                  
                  return (
                    <tr key={evolution.practice}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {evolution.practice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentAdoption > 0.7 ? 'bg-green-100 text-green-800' :
                          currentAdoption > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(currentAdoption * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          evolution.trend === 'rapid_growth' ? 'bg-green-100 text-green-800' :
                          evolution.trend === 'steady_growth' ? 'bg-blue-100 text-blue-800' :
                          evolution.trend === 'plateau' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {evolution.trend.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`${
                          evolution.maturityGap > 0.2 ? 'text-red-600' :
                          evolution.maturityGap > 0.1 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {(evolution.maturityGap * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {evolution.adoptionBarriers.slice(0, 2).join(', ')}
                          {evolution.adoptionBarriers.length > 2 && '...'}
                        </div>
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

export default DataManagementAnalysis;