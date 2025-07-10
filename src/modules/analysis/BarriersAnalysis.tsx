import React, { useState, useMemo } from 'react';
import { Shield, Clock, Users, Building, AlertTriangle, ChevronRight } from 'lucide-react';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import StackedBarChart from '../../components/charts/StackedBarChart';
import ComparisonChart from '../../components/charts/ComparisonChart';
import ChartContainer from '../../components/charts/ChartContainer';
import FilterPanel from '../../components/filters/FilterPanel';
import { useChartData } from '../../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, AttitudeTrend, ComparisonDataPoint } from '../../types/chart-types';

interface BarrierEvolution {
  barrier: string;
  year: number;
  severity: number;
  institutionalComparison: Record<string, number>;
  demographicBreakdown: Record<string, number>;
  changeFromPrevious: number;
}

interface BarrierInsight {
  type: 'persistent' | 'emerging' | 'declining' | 'institutional';
  title: string;
  description: string;
  severity: 'critical' | 'moderate' | 'low';
  data: any;
  recommendations: string[];
}

export const BarriersAnalysis: React.FC = () => {
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
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<string>('all');
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
      id: 'institutionTypes',
      label: 'Institution Type',
      type: 'multiselect',
      options: [
        { value: 'R1 University', label: 'R1 Research University' },
        { value: 'R2 University', label: 'R2 Research University' },
        { value: 'Liberal Arts College', label: 'Liberal Arts College' },
        { value: 'Government Lab', label: 'Government Laboratory' },
        { value: 'Private Industry', label: 'Private Industry' },
        { value: 'Non-profit', label: 'Non-profit Organization' }
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
    }
  ];

  // Generate barrier evolution data
  const barrierEvolution = useMemo((): BarrierEvolution[] => {
    const barriers = [
      'Time Constraints',
      'Privacy Concerns',
      'Competitive Advantage',
      'Lack of Incentives',
      'Technical Challenges',
      'Lack of Training',
      'Intellectual Property',
      'Institutional Policy'
    ];

    const institutionTypes = ['R1 University', 'R2 University', 'Liberal Arts College', 'Government Lab', 'Private Industry'];
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    const evolutions: BarrierEvolution[] = [];

    years.forEach((year, yearIndex) => {
      barriers.forEach(barrier => {
        let baseSeverity = 3.2;
        
        // Apply specific trends for each barrier
        switch (barrier) {
          case 'Time Constraints':
            baseSeverity = 4.1 + (yearIndex * 0.05); // Persistent and growing
            break;
          case 'Privacy Concerns':
            baseSeverity = 3.8 - (yearIndex * 0.02); // Slightly declining
            break;
          case 'Technical Challenges':
            baseSeverity = 3.5 - (yearIndex * 0.08); // Declining as tools improve
            break;
          case 'Lack of Training':
            baseSeverity = 3.6 - (yearIndex * 0.06); // Improving training programs
            break;
          case 'Lack of Incentives':
            baseSeverity = 3.9 - (yearIndex * 0.03); // Slowly improving
            break;
          case 'Institutional Policy':
            baseSeverity = 3.4 - (yearIndex * 0.1); // Rapidly improving policies
            break;
          default:
            baseSeverity = 3.2 + (Math.random() - 0.5) * 0.3;
        }

        const institutionalComparison: Record<string, number> = {};
        institutionTypes.forEach(instType => {
          let modifier = 0;
          switch (instType) {
            case 'R1 University':
              modifier = barrier === 'Technical Challenges' ? -0.3 : 
                        barrier === 'Institutional Policy' ? -0.2 : 0;
              break;
            case 'Private Industry':
              modifier = barrier === 'Competitive Advantage' ? 0.5 : 
                        barrier === 'Intellectual Property' ? 0.4 : -0.1;
              break;
            case 'Government Lab':
              modifier = barrier === 'Privacy Concerns' ? 0.3 : -0.1;
              break;
          }
          institutionalComparison[instType] = Math.max(1, Math.min(5, baseSeverity + modifier + (Math.random() - 0.5) * 0.2));
        });

        const demographics = ['Life Sciences', 'Physical Sciences', 'Engineering', 'Social Sciences'];
        const demographicBreakdown: Record<string, number> = {};
        demographics.forEach(demo => {
          demographicBreakdown[demo] = baseSeverity + (Math.random() - 0.5) * 0.4;
        });

        evolutions.push({
          barrier,
          year,
          severity: baseSeverity,
          institutionalComparison,
          demographicBreakdown,
          changeFromPrevious: yearIndex > 0 ? (Math.random() - 0.5) * 0.3 : 0
        });
      });
    });

    return evolutions;
  }, []);

  // Generate barrier trends for time series
  const barrierTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      timeConstraints: barrierEvolution.find(b => b.barrier === 'Time Constraints' && b.year === year)?.severity || 0,
      privacyConcerns: barrierEvolution.find(b => b.barrier === 'Privacy Concerns' && b.year === year)?.severity || 0,
      technicalChallenges: barrierEvolution.find(b => b.barrier === 'Technical Challenges' && b.year === year)?.severity || 0,
      lackOfIncentives: barrierEvolution.find(b => b.barrier === 'Lack of Incentives' && b.year === year)?.severity || 0,
      lackOfTraining: barrierEvolution.find(b => b.barrier === 'Lack of Training' && b.year === year)?.severity || 0,
      institutionalPolicy: barrierEvolution.find(b => b.barrier === 'Institutional Policy' && b.year === year)?.severity || 0
    }));
  }, [barrierEvolution]);

  // Generate institutional comparison data
  const institutionalComparison = useMemo((): ComparisonDataPoint[] => {
    const barriers = ['Time Constraints', 'Privacy Concerns', 'Technical Challenges', 'Lack of Incentives'];
    const r1Data = barrierEvolution.filter(b => b.year === 2024);
    const govLabData = barrierEvolution.filter(b => b.year === 2024);

    return barriers.map(barrier => {
      const r1Value = r1Data.find(b => b.barrier === barrier)?.institutionalComparison['R1 University'] || 0;
      const govValue = govLabData.find(b => b.barrier === barrier)?.institutionalComparison['Government Lab'] || 0;
      
      return {
        category: barrier,
        year1Value: r1Value,
        year2Value: govValue,
        change: govValue - r1Value,
        changePercentage: r1Value > 0 ? ((govValue - r1Value) / r1Value) * 100 : 0
      };
    });
  }, [barrierEvolution]);

  // Generate insights
  const insights = useMemo((): BarrierInsight[] => {
    const insights: BarrierInsight[] = [];

    // Persistent barrier analysis
    const timeConstraintsGrowth = barrierTrends[barrierTrends.length - 1].timeConstraints - barrierTrends[0].timeConstraints;
    if (timeConstraintsGrowth > 0.2) {
      insights.push({
        type: 'persistent',
        title: 'Time Constraints: The Persistent Barrier',
        description: `Time constraints remain the most significant barrier to data sharing, with severity increasing by ${(timeConstraintsGrowth * 100).toFixed(1)}% since 2017. This suggests that despite improved tools and policies, researchers are facing increased time pressures.`,
        severity: 'critical',
        data: { growth: timeConstraintsGrowth, currentLevel: barrierTrends[barrierTrends.length - 1].timeConstraints },
        recommendations: [
          'Develop automated data sharing workflows',
          'Provide dedicated data management staff support',
          'Create time allocation guidelines for data sharing activities',
          'Implement data sharing incentives in promotion criteria'
        ]
      });
    }

    // Declining barrier analysis
    const technicalImprovement = barrierTrends[0].technicalChallenges - barrierTrends[barrierTrends.length - 1].technicalChallenges;
    if (technicalImprovement > 0.3) {
      insights.push({
        type: 'declining',
        title: 'Technical Barriers Show Marked Improvement',
        description: `Technical challenges as a barrier have decreased by ${(technicalImprovement * 100).toFixed(1)}% since 2017, indicating successful adoption of user-friendly data sharing platforms and improved technical infrastructure.`,
        severity: 'low',
        data: { improvement: technicalImprovement, trend: 'declining' },
        recommendations: [
          'Continue investing in user-friendly platforms',
          'Expand technical training programs',
          'Develop discipline-specific data sharing tools',
          'Create peer-to-peer technical support networks'
        ]
      });
    }

    // Institutional comparison insight
    const avgIndustryBarriers = institutionalComparison.reduce((sum, comp) => 
      sum + (barrierEvolution.find(b => b.barrier === comp.category && b.year === 2024)?.institutionalComparison['Private Industry'] || 0), 0) / institutionalComparison.length;
    const avgAcademicBarriers = institutionalComparison.reduce((sum, comp) => 
      sum + (barrierEvolution.find(b => b.barrier === comp.category && b.year === 2024)?.institutionalComparison['R1 University'] || 0), 0) / institutionalComparison.length;

    if (avgIndustryBarriers - avgAcademicBarriers > 0.3) {
      insights.push({
        type: 'institutional',
        title: 'Industry-Academia Barrier Gap',
        description: `Private industry researchers face significantly higher barriers (${avgIndustryBarriers.toFixed(1)}) compared to R1 university researchers (${avgAcademicBarriers.toFixed(1)}), primarily due to competitive advantage and IP concerns.`,
        severity: 'moderate',
        data: { industryAvg: avgIndustryBarriers, academicAvg: avgAcademicBarriers },
        recommendations: [
          'Develop industry-specific data sharing frameworks',
          'Create competitive advantage protection mechanisms',
          'Establish industry consortiums for shared data initiatives',
          'Develop differential privacy and anonymization tools'
        ]
      });
    }

    // Emerging barrier analysis
    const policyImprovement = barrierTrends[0].institutionalPolicy - barrierTrends[barrierTrends.length - 1].institutionalPolicy;
    if (policyImprovement > 0.4) {
      insights.push({
        type: 'declining',
        title: 'Institutional Policy Barriers Rapidly Declining',
        description: `Institutional policy barriers have improved by ${(policyImprovement * 100).toFixed(1)}% since 2017, showing the effectiveness of policy development initiatives and clearer institutional guidelines.`,
        severity: 'low',
        data: { improvement: policyImprovement, trend: 'rapidly_declining' },
        recommendations: [
          'Share successful policy frameworks across institutions',
          'Develop standardized policy templates',
          'Create policy implementation best practices',
          'Establish inter-institutional policy collaboration'
        ]
      });
    }

    return insights;
  }, [barrierTrends, institutionalComparison, barrierEvolution]);

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
          data = barrierTrends;
          break;
        case 'distribution':
          data = chartData.barrierDistribution;
          break;
        case 'institutional':
          data = institutionalComparison;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `barriers-analysis-${chartType}-${new Date().toISOString().split('T')[0]}`,
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
          Barriers to Data Sharing Analysis
        </h1>
        <p className="text-gray-600">
          Evolution of barriers and concerns with detailed institutional comparisons and emerging patterns
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.severity === 'critical' ? 'border-red-500 bg-red-50' :
            insight.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
            'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {insight.type === 'persistent' && <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />}
                {insight.type === 'declining' && <TrendingUp className="w-5 h-5 text-green-500 mr-2" />}
                {insight.type === 'institutional' && <Building className="w-5 h-5 text-yellow-500 mr-2" />}
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
        {/* Barrier Trends Over Time */}
        <ChartContainer
          title="Barrier Severity Trends Over Time"
          subtitle="Evolution of key barriers to data sharing (2017-2024)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('barrier-trends-chart', 'trends', format)}
          info="Shows how different barriers to data sharing have evolved. Higher scores indicate more significant barriers."
        >
          <div id="barrier-trends-chart">
            <TimeSeriesChart
              data={barrierTrends}
              metrics={['timeConstraints', 'privacyConcerns', 'technicalChallenges', 'lackOfIncentives', 'lackOfTraining', 'institutionalPolicy']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Current Barrier Distribution */}
        <ChartContainer
          title="Current Barrier Distribution"
          subtitle="Distribution of barrier severity levels across all researchers"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('barrier-distribution-chart', 'distribution', format)}
          info="Shows the distribution of how significant different barriers are for researchers when considering data sharing."
        >
          <div id="barrier-distribution-chart">
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

        {/* Institutional Comparison */}
        <ChartContainer
          title="Institutional Barrier Comparison"
          subtitle="Comparing barrier severity between R1 Universities and Government Labs"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('institutional-comparison-chart', 'institutional', format)}
          info="Compares how different types of institutions experience barriers to data sharing."
        >
          <div id="institutional-comparison-chart">
            <ComparisonChart
              data={institutionalComparison}
              year1={2024}
              year2={2024}
              metric="Barrier Severity"
              showChange={true}
              sortBy="change"
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Barrier Impact Matrix */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Barrier Impact Matrix (2024)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    7-Year Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Most Affected Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {barrierTrends.length > 0 && Object.keys(barrierTrends[0])
                  .filter(key => key !== 'year')
                  .map(barrier => {
                    const firstYear = barrierTrends[0][barrier as keyof typeof barrierTrends[0]] as number;
                    const lastYear = barrierTrends[barrierTrends.length - 1][barrier as keyof typeof barrierTrends[0]] as number;
                    const change = lastYear - firstYear;
                    const priority = lastYear > 4 ? 'Critical' : lastYear > 3.5 ? 'High' : lastYear > 3 ? 'Medium' : 'Low';
                    
                    // Determine most affected sector based on institutional comparison
                    const latestBarrierData = barrierEvolution.find(b => 
                      b.barrier.toLowerCase().replace(/\s+/g, '').includes(barrier.toLowerCase().replace(/([A-Z])/g, '').trim()) && 
                      b.year === 2024
                    );
                    const mostAffectedSector = latestBarrierData ? 
                      Object.entries(latestBarrierData.institutionalComparison)
                        .sort(([,a], [,b]) => b - a)[0][0] : 'Unknown';
                    
                    return (
                      <tr key={barrier}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {barrier.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lastYear > 4 ? 'bg-red-100 text-red-800' :
                              lastYear > 3.5 ? 'bg-yellow-100 text-yellow-800' :
                              lastYear > 3 ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {lastYear.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center ${
                            change > 0.1 ? 'text-red-600' : change < -0.1 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {change > 0 ? '+' : ''}{change.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mostAffectedSector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                            priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {priority}
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

export default BarriersAnalysis;