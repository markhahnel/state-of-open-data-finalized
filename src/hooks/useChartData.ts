import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { 
  ChartFilters, 
  AttitudeTrend, 
  StackedBarDataPoint, 
  CrossTabulation, 
  ComparisonDataPoint,
  TrendMetric 
} from '../types/chart-types';

interface UseChartDataOptions {
  filters?: Partial<ChartFilters>;
  refreshInterval?: number;
}

interface ChartDataState {
  attitudeTrends: AttitudeTrend[];
  motivationDistribution: StackedBarDataPoint[];
  barrierDistribution: StackedBarDataPoint[];
  demographicBreakdown: StackedBarDataPoint[];
  crossTabulations: Record<string, CrossTabulation>;
  comparisonData: ComparisonDataPoint[];
  keyMetrics: TrendMetric[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useChartData = (options: UseChartDataOptions = {}): ChartDataState => {
  const { filters = {}, refreshInterval } = options;
  
  const { surveyData, loading: storeLoading, error: storeError } = useSelector(
    (state: RootState) => state.data
  );
  
  const [chartData, setChartData] = useState<ChartDataState>({
    attitudeTrends: [],
    motivationDistribution: [],
    barrierDistribution: [],
    demographicBreakdown: [],
    crossTabulations: {},
    comparisonData: [],
    keyMetrics: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Filter survey data based on current filters
  const filteredData = useMemo(() => {
    if (!surveyData || surveyData.length === 0) return [];
    
    return surveyData.filter(yearData => {
      // Apply year filter
      if (filters.years && filters.years.length > 0) {
        if (!filters.years.includes(yearData.year)) return false;
      }
      
      // Apply other filters to responses within each year
      const filteredResponses = yearData.responses.filter(response => {
        // Country filter
        if (filters.countries && filters.countries.length > 0) {
          if (!filters.countries.includes(response.demographics?.country || '')) return false;
        }
        
        // Discipline filter
        if (filters.disciplines && filters.disciplines.length > 0) {
          if (!filters.disciplines.includes(response.demographics?.discipline || '')) return false;
        }
        
        // Job title filter
        if (filters.jobTitles && filters.jobTitles.length > 0) {
          if (!filters.jobTitles.includes(response.demographics?.jobTitle || '')) return false;
        }
        
        // Career stage filter
        if (filters.careerStages && filters.careerStages.length > 0) {
          if (!filters.careerStages.includes(response.demographics?.careerStage || '')) return false;
        }
        
        // Institution type filter
        if (filters.institutionTypes && filters.institutionTypes.length > 0) {
          if (!filters.institutionTypes.includes(response.demographics?.institutionType || '')) return false;
        }
        
        // Gender filter
        if (filters.genders && filters.genders.length > 0) {
          if (!filters.genders.includes(response.demographics?.gender || '')) return false;
        }
        
        // Age group filter
        if (filters.ageGroups && filters.ageGroups.length > 0) {
          if (!filters.ageGroups.includes(response.demographics?.age || '')) return false;
        }
        
        return true;
      });
      
      // Only include years that have responses after filtering
      return filteredResponses.length > 0 ? { ...yearData, responses: filteredResponses } : false;
    }).filter(Boolean);
  }, [surveyData, filters]);

  // Generate attitude trends data
  const generateAttitudeTrends = useMemo((): AttitudeTrend[] => {
    return filteredData.map(yearData => {
      const responses = yearData.responses;
      const attitudeFields = ['openAccess', 'openData', 'openPeerReview', 'preprints', 'openScience', 'dataSharing'];
      
      const averages = attitudeFields.reduce((acc, field) => {
        const values = responses
          .map(r => r.attitudes?.[field as keyof typeof r.attitudes])
          .filter((v): v is number => typeof v === 'number');
        
        acc[field] = values.length > 0 
          ? values.reduce((sum, val) => sum + val, 0) / values.length 
          : 0;
        
        return acc;
      }, {} as Record<string, number>);
      
      return {
        year: yearData.year,
        openAccess: averages.openAccess,
        openData: averages.openData,
        openPeerReview: averages.openPeerReview,
        preprints: averages.preprints,
        openScience: averages.openScience,
        dataSharing: averages.dataSharing
      };
    }).sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Generate stacked bar data for motivations
  const generateMotivationDistribution = useMemo((): StackedBarDataPoint[] => {
    const motivationCategories = [
      'reproducibility',
      'collaboration', 
      'transparency',
      'mandateCompliance',
      'increasedCitations',
      'personalValues',
      'communityExpectations'
    ];
    
    return motivationCategories.map(category => {
      const categoryData: StackedBarDataPoint = {
        category: category.charAt(0).toUpperCase() + category.slice(1)
      };
      
      // Count responses by score (1-5)
      const scoreCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      filteredData.forEach(yearData => {
        yearData.responses.forEach(response => {
          const score = response.motivations?.[category as keyof typeof response.motivations];
          if (typeof score === 'number' && score >= 1 && score <= 5) {
            scoreCounts[score as keyof typeof scoreCounts]++;
          }
        });
      });
      
      categoryData.veryLow = scoreCounts[1];
      categoryData.low = scoreCounts[2];
      categoryData.moderate = scoreCounts[3];
      categoryData.high = scoreCounts[4];
      categoryData.veryHigh = scoreCounts[5];
      
      return categoryData;
    });
  }, [filteredData]);

  // Generate stacked bar data for barriers
  const generateBarrierDistribution = useMemo((): StackedBarDataPoint[] => {
    const barrierCategories = [
      'timeConstraints',
      'privacyConcerns',
      'competitiveAdvantage',
      'lackOfIncentives',
      'technicalChallenges',
      'lackOfTraining',
      'intellectualProperty',
      'institutionalPolicy'
    ];
    
    return barrierCategories.map(category => {
      const categoryData: StackedBarDataPoint = {
        category: category.charAt(0).toUpperCase() + category.slice(1)
      };
      
      // Count responses by score (1-5)
      const scoreCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      filteredData.forEach(yearData => {
        yearData.responses.forEach(response => {
          const score = response.barriers?.[category as keyof typeof response.barriers];
          if (typeof score === 'number' && score >= 1 && score <= 5) {
            scoreCounts[score as keyof typeof scoreCounts]++;
          }
        });
      });
      
      categoryData.notABarrier = scoreCounts[1];
      categoryData.minorBarrier = scoreCounts[2];
      categoryData.moderateBarrier = scoreCounts[3];
      categoryData.significantBarrier = scoreCounts[4];
      categoryData.majorBarrier = scoreCounts[5];
      
      return categoryData;
    });
  }, [filteredData]);

  // Generate demographic breakdown
  const generateDemographicBreakdown = useMemo((): StackedBarDataPoint[] => {
    const categories = [
      { field: 'discipline', label: 'Research Discipline' },
      { field: 'careerStage', label: 'Career Stage' },
      { field: 'institutionType', label: 'Institution Type' },
      { field: 'gender', label: 'Gender' }
    ];
    
    return categories.map(({ field, label }) => {
      const categoryData: StackedBarDataPoint = { category: label };
      const counts: Record<string, number> = {};
      
      filteredData.forEach(yearData => {
        yearData.responses.forEach(response => {
          const value = response.demographics?.[field as keyof typeof response.demographics];
          if (value) {
            counts[value] = (counts[value] || 0) + 1;
          }
        });
      });
      
      // Add top values to categoryData
      Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([key, value], index) => {
          categoryData[key] = value;
        });
      
      return categoryData;
    });
  }, [filteredData]);

  // Generate cross-tabulation data
  const generateCrossTabulations = useMemo((): Record<string, CrossTabulation> => {
    const crossTabs: Record<string, CrossTabulation> = {};
    
    // Discipline vs Data Sharing Attitudes
    const disciplineDataSharing = {
      rowVariable: 'Research Discipline',
      columnVariable: 'Data Sharing Attitude',
      data: [] as any[],
      totals: { row: {}, column: {}, overall: 0 }
    };
    
    const disciplineCounts: Record<string, Record<string, number>> = {};
    
    filteredData.forEach(yearData => {
      yearData.responses.forEach(response => {
        const discipline = response.demographics?.discipline;
        const attitude = response.attitudes?.dataSharing;
        
        if (discipline && typeof attitude === 'number') {
          const attitudeCategory = attitude >= 4 ? 'Positive' : 
                                  attitude >= 3 ? 'Neutral' : 'Negative';
          
          if (!disciplineCounts[discipline]) {
            disciplineCounts[discipline] = {};
          }
          disciplineCounts[discipline][attitudeCategory] = 
            (disciplineCounts[discipline][attitudeCategory] || 0) + 1;
        }
      });
    });
    
    // Convert to heatmap format
    Object.entries(disciplineCounts).forEach(([discipline, attitudes]) => {
      Object.entries(attitudes).forEach(([attitude, count]) => {
        disciplineDataSharing.data.push({
          row: discipline,
          column: attitude,
          value: count,
          percentage: (count / Object.values(attitudes).reduce((a, b) => a + b, 0)) * 100
        });
      });
    });
    
    crossTabs['disciplineDataSharing'] = disciplineDataSharing;
    
    return crossTabs;
  }, [filteredData]);

  // Generate comparison data
  const generateComparisonData = useMemo((): ComparisonDataPoint[] => {
    if (filteredData.length < 2) return [];
    
    const years = filteredData.map(d => d.year).sort();
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    
    const firstYearData = filteredData.find(d => d.year === firstYear);
    const lastYearData = filteredData.find(d => d.year === lastYear);
    
    if (!firstYearData || !lastYearData) return [];
    
    const categories = ['openAccess', 'openData', 'openPeerReview', 'preprints'];
    
    return categories.map(category => {
      const firstValue = firstYearData.responses
        .map(r => r.attitudes?.[category as keyof typeof r.attitudes])
        .filter((v): v is number => typeof v === 'number')
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      const lastValue = lastYearData.responses
        .map(r => r.attitudes?.[category as keyof typeof r.attitudes])
        .filter((v): v is number => typeof v === 'number')
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      const change = lastValue - firstValue;
      const changePercentage = firstValue > 0 ? (change / firstValue) * 100 : 0;
      
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        year1Value: firstValue,
        year2Value: lastValue,
        change,
        changePercentage
      };
    });
  }, [filteredData]);

  // Generate key metrics
  const generateKeyMetrics = useMemo((): TrendMetric[] => {
    if (filteredData.length === 0) return [];
    
    const latestYear = filteredData[filteredData.length - 1];
    const previousYear = filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;
    
    const calculateAverage = (responses: any[], field: string, subfield?: string) => {
      const values = responses
        .map(r => subfield ? r[field]?.[subfield] : r[field])
        .filter((v): v is number => typeof v === 'number');
      
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    };
    
    const calculatePercentage = (responses: any[], field: string, subfield?: string) => {
      const values = responses
        .map(r => subfield ? r[field]?.[subfield] : r[field])
        .filter(v => typeof v === 'boolean');
      
      if (values.length === 0) return 0;
      const trueCount = values.filter(v => v === true).length;
      return (trueCount / values.length) * 100;
    };
    
    // Open Data Support
    const currentOpenDataSupport = calculateAverage(latestYear.responses, 'attitudes', 'openData');
    const previousOpenDataSupport = previousYear ? 
      calculateAverage(previousYear.responses, 'attitudes', 'openData') : undefined;
    
    // FAIR Awareness
    const currentFairAwareness = calculateAverage(latestYear.responses, 'fairAwareness', 'overallAwareness');
    const previousFairAwareness = previousYear ?
      calculateAverage(previousYear.responses, 'fairAwareness', 'overallAwareness') : undefined;
    
    // Institutional Support
    const currentInstitutionalSupport = calculatePercentage(latestYear.responses, 'institutionalSupport', 'policyExists');
    const previousInstitutionalSupport = previousYear ?
      calculatePercentage(previousYear.responses, 'institutionalSupport', 'policyExists') : undefined;
    
    return [
      {
        title: 'Open Data Support',
        value: (currentOpenDataSupport / 5) * 100, // Convert to percentage
        previousValue: previousOpenDataSupport ? (previousOpenDataSupport / 5) * 100 : undefined,
        change: previousOpenDataSupport ? 
          ((currentOpenDataSupport - previousOpenDataSupport) / 5) * 100 : undefined,
        trend: previousOpenDataSupport ? 
          (currentOpenDataSupport > previousOpenDataSupport ? 'up' : 
           currentOpenDataSupport < previousOpenDataSupport ? 'down' : 'stable') : 'stable',
        format: 'percentage',
        description: 'Researcher support for open data practices'
      },
      {
        title: 'FAIR Awareness',
        value: currentFairAwareness,
        previousValue: previousFairAwareness,
        change: previousFairAwareness ? currentFairAwareness - previousFairAwareness : undefined,
        trend: previousFairAwareness ?
          (currentFairAwareness > previousFairAwareness ? 'up' :
           currentFairAwareness < previousFairAwareness ? 'down' : 'stable') : 'stable',
        format: 'score',
        description: 'Average FAIR principles awareness score'
      },
      {
        title: 'Institutional Support',
        value: currentInstitutionalSupport,
        previousValue: previousInstitutionalSupport,
        change: previousInstitutionalSupport ? 
          currentInstitutionalSupport - previousInstitutionalSupport : undefined,
        trend: previousInstitutionalSupport ?
          (currentInstitutionalSupport > previousInstitutionalSupport ? 'up' :
           currentInstitutionalSupport < previousInstitutionalSupport ? 'down' : 'stable') : 'stable',
        format: 'percentage',
        description: 'Researchers with institutional data policies'
      }
    ];
  }, [filteredData]);

  // Update chart data when dependencies change
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      loading: storeLoading,
      error: storeError,
      lastUpdated: new Date()
    }));
    
    if (!storeLoading && !storeError && filteredData.length > 0) {
      setChartData(prev => ({
        ...prev,
        attitudeTrends: generateAttitudeTrends,
        motivationDistribution: generateMotivationDistribution,
        barrierDistribution: generateBarrierDistribution,
        demographicBreakdown: generateDemographicBreakdown,
        crossTabulations: generateCrossTabulations,
        comparisonData: generateComparisonData,
        keyMetrics: generateKeyMetrics,
        loading: false,
        error: null
      }));
    }
  }, [
    storeLoading,
    storeError,
    filteredData,
    generateAttitudeTrends,
    generateMotivationDistribution,
    generateBarrierDistribution,
    generateDemographicBreakdown,
    generateCrossTabulations,
    generateComparisonData,
    generateKeyMetrics
  ]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        // Trigger data refresh
        setChartData(prev => ({ ...prev, lastUpdated: new Date() }));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return chartData;
};

export default useChartData;