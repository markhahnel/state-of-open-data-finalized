import React, { useState, useMemo } from 'react';
import { Scale, Building, FileCheck, Globe, ChevronRight, AlertTriangle } from 'lucide-react';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import StackedBarChart from '../../components/charts/StackedBarChart';
import ComparisonChart from '../../components/charts/ComparisonChart';
import ChartContainer from '../../components/charts/ChartContainer';
import FilterPanel from '../../components/filters/FilterPanel';
import { useChartData } from '../../hooks/useChartData';
import { exportChart, setChartDataAttribute } from '../../utils/chart-utils/exportUtils';
import type { ChartFilters, FilterConfig, AttitudeTrend, ComparisonDataPoint } from '../../types/chart-types';

interface PolicyAttitude {
  policyType: 'funder_mandates' | 'institutional_policies' | 'government_regulations' | 'publisher_requirements';
  year: number;
  support: number;
  compliance: number;
  effectiveness: number;
  regionalVariation: Record<string, number>;
  sectorDifferences: Record<string, number>;
}

interface PolicyTrend {
  policyType: string;
  direction: 'strongly_increasing' | 'increasing' | 'stable' | 'decreasing';
  momentum: number;
  controversyLevel: number;
  implementationChallenges: string[];
}

interface PolicyInsight {
  type: 'mandate_acceptance' | 'implementation_gap' | 'regional_disparity' | 'sector_alignment';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  data: any;
  policyRecommendations: string[];
}

export const PolicySupportAnalysis: React.FC = () => {
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
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>('all');
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
      id: 'countries',
      label: 'Region',
      type: 'multiselect',
      options: [
        { value: 'North America', label: 'North America' },
        { value: 'Europe', label: 'Europe' },
        { value: 'Asia Pacific', label: 'Asia Pacific' },
        { value: 'Latin America', label: 'Latin America' },
        { value: 'Africa', label: 'Africa' }
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

  // Generate policy attitude data
  const policyAttitudes = useMemo((): PolicyAttitude[] => {
    const policyTypes: PolicyAttitude['policyType'][] = [
      'funder_mandates',
      'institutional_policies', 
      'government_regulations',
      'publisher_requirements'
    ];
    
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'];
    const sectors = ['Academic', 'Government', 'Industry', 'Non-profit'];
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    const attitudes: PolicyAttitude[] = [];

    years.forEach((year, yearIndex) => {
      policyTypes.forEach(policyType => {
        // Base support levels with different trajectories
        let baseSupport = 0.45 + (yearIndex * 0.06); // 45% to 75% over time
        let baseCompliance = 0.35 + (yearIndex * 0.05); // 35% to 65% over time
        let baseEffectiveness = 0.3 + (yearIndex * 0.04); // 30% to 54% over time

        // Apply policy-specific modifiers
        switch (policyType) {
          case 'funder_mandates':
            baseSupport += 0.15; // Generally higher support
            baseCompliance += 0.2; // Higher compliance due to funding dependency
            baseEffectiveness += 0.1;
            break;
          case 'institutional_policies':
            baseSupport += 0.1;
            baseCompliance += 0.15;
            baseEffectiveness += 0.05;
            break;
          case 'government_regulations':
            baseSupport -= 0.05; // More controversial
            baseCompliance += 0.1; // Legal requirement
            baseEffectiveness -= 0.05;
            break;
          case 'publisher_requirements':
            baseSupport += 0.05;
            baseCompliance += 0.25; // High compliance for publication
            baseEffectiveness += 0.08;
            break;
        }

        // Regional variation
        const regionalVariation: Record<string, number> = {};
        regions.forEach(region => {
          let regionModifier = 0;
          
          switch (region) {
            case 'Europe':
              regionModifier = 0.1; // Strong regulatory environment
              break;
            case 'North America':
              regionModifier = 0.05; // Mixed federal/institutional approach
              break;
            case 'Asia Pacific':
              regionModifier = -0.05; // Varied regulatory landscape
              break;
            case 'Latin America':
              regionModifier = -0.1; // Developing frameworks
              break;
            case 'Africa':
              regionModifier = -0.15; // Limited regulatory infrastructure
              break;
          }
          
          regionalVariation[region] = Math.min(1, Math.max(0, baseSupport + regionModifier + (Math.random() - 0.5) * 0.1));
        });

        // Sector differences
        const sectorDifferences: Record<string, number> = {};
        sectors.forEach(sector => {
          let sectorModifier = 0;
          
          switch (sector) {
            case 'Academic':
              sectorModifier = 0.05; // Generally supportive
              break;
            case 'Government':
              sectorModifier = 0.15; // High policy alignment
              break;
            case 'Industry':
              sectorModifier = -0.2; // Concerns about competitive advantage
              break;
            case 'Non-profit':
              sectorModifier = 0.1; // Mission alignment
              break;
          }
          
          sectorDifferences[sector] = Math.min(1, Math.max(0, baseSupport + sectorModifier + (Math.random() - 0.5) * 0.1));
        });

        attitudes.push({
          policyType,
          year,
          support: Math.min(1, Math.max(0, baseSupport + (Math.random() - 0.5) * 0.05)),
          compliance: Math.min(1, Math.max(0, baseCompliance + (Math.random() - 0.5) * 0.05)),
          effectiveness: Math.min(1, Math.max(0, baseEffectiveness + (Math.random() - 0.5) * 0.05)),
          regionalVariation,
          sectorDifferences
        });
      });
    });

    return attitudes;
  }, []);

  // Generate policy trends analysis
  const policyTrends = useMemo((): PolicyTrend[] => {
    const policyTypes = ['Funder Mandates', 'Institutional Policies', 'Government Regulations', 'Publisher Requirements'];
    
    return policyTypes.map(policyType => {
      const policyKey = policyType.toLowerCase().replace(/\s+/g, '_') as PolicyAttitude['policyType'];
      const policyData = policyAttitudes.filter(p => p.policyType === policyKey);
      
      const firstYear = policyData[0];
      const lastYear = policyData[policyData.length - 1];
      const supportChange = lastYear.support - firstYear.support;
      
      let direction: PolicyTrend['direction'];
      if (supportChange > 0.2) direction = 'strongly_increasing';
      else if (supportChange > 0.1) direction = 'increasing';
      else if (supportChange > -0.1) direction = 'stable';
      else direction = 'decreasing';

      const momentum = Math.abs(supportChange);
      const controversyLevel = 1 - (lastYear.support * 0.7 + lastYear.effectiveness * 0.3);

      const challenges = [];
      if (lastYear.compliance - lastYear.support < -0.1) challenges.push('Low compliance rates');
      if (controversyLevel > 0.4) challenges.push('Researcher resistance');
      if (lastYear.effectiveness < 0.5) challenges.push('Implementation difficulties');
      if (policyKey === 'government_regulations') challenges.push('Regulatory complexity');

      return {
        policyType,
        direction,
        momentum,
        controversyLevel,
        implementationChallenges: challenges
      };
    });
  }, [policyAttitudes]);

  // Generate policy support trends for time series
  const policySupportTrends = useMemo((): AttitudeTrend[] => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      funderMandates: (policyAttitudes.find(p => p.policyType === 'funder_mandates' && p.year === year)?.support || 0) * 5,
      institutionalPolicies: (policyAttitudes.find(p => p.policyType === 'institutional_policies' && p.year === year)?.support || 0) * 5,
      governmentRegulations: (policyAttitudes.find(p => p.policyType === 'government_regulations' && p.year === year)?.support || 0) * 5,
      publisherRequirements: (policyAttitudes.find(p => p.policyType === 'publisher_requirements' && p.year === year)?.support || 0) * 5,
      overallSupport: (policyAttitudes.filter(p => p.year === year).reduce((sum, p) => sum + p.support, 0) / 4) * 5,
      overallCompliance: (policyAttitudes.filter(p => p.year === year).reduce((sum, p) => sum + p.compliance, 0) / 4) * 5
    }));
  }, [policyAttitudes]);

  // Generate support vs compliance comparison
  const supportComplianceComparison = useMemo((): ComparisonDataPoint[] => {
    const policyTypes = ['Funder Mandates', 'Institutional Policies', 'Government Regulations', 'Publisher Requirements'];
    const latestData = policyAttitudes.filter(p => p.year === 2024);
    
    return policyTypes.map(policyType => {
      const policyKey = policyType.toLowerCase().replace(/\s+/g, '_') as PolicyAttitude['policyType'];
      const data = latestData.find(p => p.policyType === policyKey);
      
      return {
        category: policyType,
        year1Value: (data?.support || 0) * 100,
        year2Value: (data?.compliance || 0) * 100,
        change: ((data?.compliance || 0) - (data?.support || 0)) * 100,
        changePercentage: data?.support ? (((data.compliance - data.support) / data.support) * 100) : 0
      };
    });
  }, [policyAttitudes]);

  // Generate regional policy comparison
  const regionalComparison = useMemo(() => {
    const data: any[] = [];
    const policies = ['Funder Mandates', 'Institutional Policies', 'Government Regulations', 'Publisher Requirements'];
    const regions = ['North America', 'Europe', 'Asia Pacific'];
    const latestData = policyAttitudes.filter(p => p.year === 2024);

    policies.forEach(policy => {
      regions.forEach(region => {
        const policyKey = policy.toLowerCase().replace(/\s+/g, '_') as PolicyAttitude['policyType'];
        const policyData = latestData.find(p => p.policyType === policyKey);
        const support = policyData?.regionalVariation[region] || 0;
        
        data.push({
          row: policy,
          column: region,
          value: support,
          percentage: support * 100
        });
      });
    });

    return {
      rowVariable: 'Policy Type',
      columnVariable: 'Region',
      data,
      totals: { row: {}, column: {}, overall: 0 }
    };
  }, [policyAttitudes]);

  // Generate insights
  const insights = useMemo((): PolicyInsight[] => {
    const insights: PolicyInsight[] = [];

    // Mandate acceptance analysis
    const funderMandateSupport = policySupportTrends[policySupportTrends.length - 1].funderMandates;
    const funderMandateGrowth = funderMandateSupport - policySupportTrends[0].funderMandates;
    
    if (funderMandateGrowth > 1.0) {
      insights.push({
        type: 'mandate_acceptance',
        title: 'Funder Mandates Gain Strong Researcher Support',
        description: `Support for funder data sharing mandates has increased by ${(funderMandateGrowth * 20).toFixed(0)}% since 2017, reaching ${(funderMandateSupport * 20).toFixed(0)}% approval. This represents a fundamental shift in researcher attitudes toward mandatory data sharing policies.`,
        priority: 'high',
        data: { growth: funderMandateGrowth, currentSupport: funderMandateSupport },
        policyRecommendations: [
          'Expand funder mandate programs with researcher input',
          'Provide comprehensive support for mandate compliance',
          'Develop clear implementation guidelines',
          'Create positive incentives alongside mandates'
        ]
      });
    }

    // Implementation gap analysis
    const supportComplianceGap = supportComplianceComparison.reduce((sum, comp) => sum + Math.abs(comp.change), 0) / supportComplianceComparison.length;
    
    if (supportComplianceGap > 15) {
      insights.push({
        type: 'implementation_gap',
        title: 'Significant Support-Compliance Gap Persists',
        description: `Despite growing policy support, there's an average ${supportComplianceGap.toFixed(0)}% gap between policy support and actual compliance across all policy types. This indicates structural barriers to implementation.`,
        priority: 'critical',
        data: { gap: supportComplianceGap, details: supportComplianceComparison },
        policyRecommendations: [
          'Address implementation barriers directly',
          'Provide technical and financial support',
          'Simplify compliance procedures',
          'Create phased implementation timelines'
        ]
      });
    }

    // Regional disparity analysis
    const europeAvg = regionalComparison.data
      .filter(d => d.column === 'Europe')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    const africaAvg = regionalComparison.data
      .filter(d => d.column === 'Asia Pacific')
      .reduce((sum, d) => sum + d.value, 0) / 4;
    
    if (europeAvg - africaAvg > 0.2) {
      insights.push({
        type: 'regional_disparity',
        title: 'Global Policy Support Disparities',
        description: `European researchers show ${(europeAvg * 100).toFixed(0)}% policy support compared to ${(africaAvg * 100).toFixed(0)}% in Asia Pacific, reflecting different regulatory environments and cultural contexts around data sharing policies.`,
        priority: 'medium',
        data: { leader: europeAvg, laggard: africaAvg, gap: europeAvg - africaAvg },
        policyRecommendations: [
          'Develop region-specific policy approaches',
          'Share successful implementation models',
          'Provide capacity building support',
          'Create international policy coordination mechanisms'
        ]
      });
    }

    // Sector alignment analysis
    const latestSectorData = policyAttitudes.filter(p => p.year === 2024);
    const avgIndustrySupport = latestSectorData.reduce((sum, p) => sum + (p.sectorDifferences['Industry'] || 0), 0) / latestSectorData.length;
    const avgAcademicSupport = latestSectorData.reduce((sum, p) => sum + (p.sectorDifferences['Academic'] || 0), 0) / latestSectorData.length;
    
    if (avgAcademicSupport - avgIndustrySupport > 0.25) {
      insights.push({
        type: 'sector_alignment',
        title: 'Industry-Academia Policy Alignment Challenge',
        description: `Academic researchers show ${(avgAcademicSupport * 100).toFixed(0)}% policy support versus ${(avgIndustrySupport * 100).toFixed(0)}% in industry, highlighting the need for sector-specific policy approaches that address competitive concerns.`,
        priority: 'high',
        data: { academic: avgAcademicSupport, industry: avgIndustrySupport, gap: avgAcademicSupport - avgIndustrySupport },
        policyRecommendations: [
          'Develop industry-specific data sharing frameworks',
          'Address intellectual property and competitive concerns',
          'Create public-private partnership models',
          'Establish differential policy requirements by sector'
        ]
      });
    }

    return insights;
  }, [policySupportTrends, supportComplianceComparison, regionalComparison, policyAttitudes]);

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
          data = policySupportTrends;
          break;
        case 'comparison':
          data = supportComplianceComparison;
          break;
        case 'regional':
          data = regionalComparison.data;
          break;
      }
      setChartDataAttribute(chartId, data, chartType);
    }

    exportChart(chartId, {
      format,
      filename: `policy-support-analysis-${chartType}-${new Date().toISOString().split('T')[0]}`,
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
          Policy Support Analysis
        </h1>
        <p className="text-gray-600">
          Comprehensive analysis of researcher attitudes toward data sharing mandates and policy requirements
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.priority === 'critical' ? 'border-red-500 bg-red-50' :
            insight.priority === 'high' ? 'border-orange-500 bg-orange-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {insight.type === 'mandate_acceptance' && <Scale className="w-5 h-5 text-green-500 mr-2" />}
                {insight.type === 'implementation_gap' && <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />}
                {insight.type === 'regional_disparity' && <Globe className="w-5 h-5 text-blue-500 mr-2" />}
                {insight.type === 'sector_alignment' && <Building className="w-5 h-5 text-purple-500 mr-2" />}
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-700">Policy Recommendations:</h4>
              {insight.policyRecommendations.slice(0, 2).map((rec, i) => (
                <p key={i} className="text-xs text-gray-600">• {rec}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Policy Type Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['Funder Mandates', 'Institutional Policies', 'Government Regulations', 'Publisher Requirements'].map(policyType => {
          const policyKey = policyType.toLowerCase().replace(/\s+/g, '_') as PolicyAttitude['policyType'];
          const latestData = policyAttitudes.find(p => p.policyType === policyKey && p.year === 2024);
          const support = (latestData?.support || 0) * 100;
          const compliance = (latestData?.compliance || 0) * 100;
          
          return (
            <div key={policyType} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{policyType}</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Support</span>
                    <span>{support.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${support}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Compliance</span>
                    <span>{compliance.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${compliance}%` }}
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
        {/* Policy Support Trends */}
        <ChartContainer
          title="Policy Support Trends Over Time"
          subtitle="Evolution of support for different data sharing policy types (2017-2024)"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('policy-trends-chart', 'trends', format)}
          info="Shows how researcher support for various data sharing policies has evolved over time."
        >
          <div id="policy-trends-chart">
            <TimeSeriesChart
              data={policySupportTrends}
              metrics={['funderMandates', 'institutionalPolicies', 'governmentRegulations', 'publisherRequirements', 'overallSupport']}
              showTrend={true}
              yAxisDomain={[1, 5]}
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Support vs Compliance Comparison */}
        <ChartContainer
          title="Policy Support vs Compliance Rates (2024)"
          subtitle="Comparison of support levels with actual compliance behavior"
          exportable={true}
          expandable={true}
          onExport={(format) => handleExport('support-compliance-chart', 'comparison', format)}
          info="Shows the gap between supporting a policy and actually complying with it in practice."
        >
          <div id="support-compliance-chart">
            <ComparisonChart
              data={supportComplianceComparison}
              year1={2024}
              year2={2024}
              metric="Percentage"
              showChange={true}
              sortBy="change"
              height={400}
              loading={chartData.loading}
              error={chartData.error}
            />
          </div>
        </ChartContainer>

        {/* Policy Effectiveness Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Policy Type Distribution"
            subtitle="Distribution of policy support levels"
            exportable={true}
            expandable={true}
            onExport={(format) => handleExport('policy-distribution-chart', 'distribution', format)}
            info="Shows how researchers are distributed across different levels of policy support."
          >
            <div id="policy-distribution-chart">
              <StackedBarChart
                data={policyTrends.map(trend => ({
                  category: trend.policyType,
                  strongSupport: trend.momentum > 0.3 ? 40 : 25,
                  moderateSupport: 35,
                  neutral: 20,
                  opposition: trend.controversyLevel > 0.4 ? 15 : 5
                }))}
                stackKeys={['strongSupport', 'moderateSupport', 'neutral', 'opposition']}
                percentage={true}
                orientation="horizontal"
                height={300}
                loading={chartData.loading}
                error={chartData.error}
              />
            </div>
          </ChartContainer>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Policy Momentum Assessment
            </h3>
            <div className="space-y-3">
              {policyTrends.map(trend => (
                <div key={trend.policyType} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-sm">{trend.policyType}</span>
                    <div className="text-xs text-gray-600">
                      {trend.implementationChallenges.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trend.direction === 'strongly_increasing' ? 'bg-green-100 text-green-800' :
                      trend.direction === 'increasing' ? 'bg-blue-100 text-blue-800' :
                      trend.direction === 'stable' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trend.direction.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {(trend.momentum * 100).toFixed(0)}% momentum
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Challenges Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Policy Implementation Challenges & Solutions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Implementation Challenges</h4>
              <div className="space-y-2">
                {[
                  { challenge: 'Low compliance rates', percentage: 65, severity: 'high' },
                  { challenge: 'Technical implementation barriers', percentage: 58, severity: 'medium' },
                  { challenge: 'Researcher resistance', percentage: 45, severity: 'medium' },
                  { challenge: 'Resource constraints', percentage: 42, severity: 'high' },
                  { challenge: 'Regulatory complexity', percentage: 38, severity: 'low' }
                ].map(item => (
                  <div key={item.challenge} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.challenge}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.severity === 'high' ? 'bg-red-100 text-red-800' :
                        item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommended Policy Solutions</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="p-3 bg-blue-50 rounded">
                  <strong>Incentive-Based Approaches:</strong> Combine mandates with positive incentives like funding bonuses, recognition programs, and career advancement opportunities.
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <strong>Phased Implementation:</strong> Roll out policies gradually with pilot programs, stakeholder feedback, and iterative improvements.
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <strong>Technical Support:</strong> Provide comprehensive infrastructure, training, and technical assistance for policy compliance.
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <strong>Stakeholder Engagement:</strong> Involve researchers in policy development and create clear communication about benefits and requirements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicySupportAnalysis;