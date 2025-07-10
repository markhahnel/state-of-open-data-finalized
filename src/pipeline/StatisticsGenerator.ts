import type { RawSurveyData, ProcessedResponse, ProcessingStats, FieldStats } from './types';

export class StatisticsGenerator {
  generateYearStats(rawData: RawSurveyData, processedResponses: ProcessedResponse[]): ProcessingStats {
    console.log(`📊 Generating statistics for ${rawData.year}...`);
    
    const totalRows = rawData.rowCount;
    const validRows = processedResponses.length;
    const missingDataRate = Math.round(((totalRows - validRows) / totalRows) * 100);
    
    // Calculate completeness score
    const completenessScore = this.calculateCompleteness(processedResponses);
    
    // Generate field statistics
    const fieldStats = this.generateFieldStatistics(processedResponses, rawData.year);
    
    return {
      year: rawData.year,
      totalRows,
      validRows,
      missingDataRate,
      completenessScore,
      fieldStats
    };
  }

  generateDatasetStats(responses: ProcessedResponse[]): Record<string, any> {
    console.log('📈 Generating comprehensive dataset statistics...');
    
    const stats = {
      overview: this.generateOverviewStats(responses),
      demographics: this.generateDemographicStats(responses),
      attitudes: this.generateAttitudeStats(responses),
      motivations: this.generateMotivationStats(responses),
      barriers: this.generateBarrierStats(responses),
      fairAwareness: this.generateFAIRStats(responses),
      institutionalSupport: this.generateInstitutionalStats(responses),
      yearlyTrends: this.generateYearlyTrends(responses)
    };
    
    console.log('✅ Statistics generation complete');
    return stats;
  }

  private calculateCompleteness(responses: ProcessedResponse[]): number {
    if (responses.length === 0) return 0;
    
    const totalFields = responses.length * 6; // 6 main categories
    let completedFields = 0;
    
    responses.forEach(response => {
      const categories = [
        response.demographics,
        response.attitudes,
        response.motivations,
        response.barriers,
        response.fairAwareness,
        response.institutionalSupport
      ];
      
      categories.forEach(category => {
        const validFields = Object.values(category).filter(v => v !== null && v !== undefined && v !== '').length;
        if (validFields > 0) completedFields++;
      });
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }

  private generateFieldStatistics(responses: ProcessedResponse[], year: number): Record<string, FieldStats> {
    const fieldStats: Record<string, FieldStats> = {};
    
    // Analyze demographics fields
    this.analyzeFields(responses, 'demographics', fieldStats);
    this.analyzeFields(responses, 'attitudes', fieldStats);
    this.analyzeFields(responses, 'motivations', fieldStats);
    this.analyzeFields(responses, 'barriers', fieldStats);
    this.analyzeFields(responses, 'fairAwareness', fieldStats);
    this.analyzeFields(responses, 'institutionalSupport', fieldStats);
    
    return fieldStats;
  }

  private analyzeFields(
    responses: ProcessedResponse[], 
    category: string, 
    fieldStats: Record<string, FieldStats>
  ): void {
    const allFields = new Set<string>();
    responses.forEach(response => {
      Object.keys((response as any)[category]).forEach(field => allFields.add(field));
    });

    allFields.forEach(fieldName => {
      const values = responses
        .map(response => (response as any)[category][fieldName])
        .filter(v => v !== null && v !== undefined && v !== '');
      
      const totalResponses = responses.length;
      const validResponses = values.length;
      const missingCount = totalResponses - validResponses;
      const missingRate = Math.round((missingCount / totalResponses) * 100);
      const uniqueValues = new Set(values).size;

      // Calculate top values
      const valueCounts: Record<string, number> = {};
      values.forEach(value => {
        const key = String(value);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });

      const topValues = Object.entries(valueCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      fieldStats[`${category}.${fieldName}`] = {
        fieldName: `${category}.${fieldName}`,
        totalResponses,
        validResponses,
        missingCount,
        missingRate,
        uniqueValues,
        topValues
      };
    });
  }

  private generateOverviewStats(responses: ProcessedResponse[]): any {
    const years = [...new Set(responses.map(r => r.year))].sort();
    const yearDistribution: Record<number, number> = {};
    
    responses.forEach(response => {
      yearDistribution[response.year] = (yearDistribution[response.year] || 0) + 1;
    });

    return {
      totalResponses: responses.length,
      yearRange: [Math.min(...years), Math.max(...years)],
      yearsWithData: years,
      averageResponsesPerYear: Math.round(responses.length / years.length),
      yearDistribution
    };
  }

  private generateDemographicStats(responses: ProcessedResponse[]): any {
    const demographics = responses.map(r => r.demographics);
    
    return {
      ageDistribution: this.calculateDistribution(demographics, 'age'),
      genderDistribution: this.calculateDistribution(demographics, 'gender'),
      countryDistribution: this.calculateDistribution(demographics, 'country'),
      disciplineDistribution: this.calculateDistribution(demographics, 'discipline'),
      jobTitleDistribution: this.calculateDistribution(demographics, 'jobTitle'),
      careerStageDistribution: this.calculateDistribution(demographics, 'careerStage'),
      regionDistribution: this.calculateDistribution(demographics, 'region')
    };
  }

  private generateAttitudeStats(responses: ProcessedResponse[]): any {
    const attitudes = responses.map(r => r.attitudes);
    
    return {
      openAccessMean: this.calculateMean(attitudes, 'openAccess'),
      openDataMean: this.calculateMean(attitudes, 'openData'),
      openPeerReviewMean: this.calculateMean(attitudes, 'openPeerReview'),
      preprintsMean: this.calculateMean(attitudes, 'preprints'),
      openScienceMean: this.calculateMean(attitudes, 'openScience'),
      dataSharingMean: this.calculateMean(attitudes, 'dataSharing'),
      overallAttitudeMean: this.calculateOverallMean(attitudes)
    };
  }

  private generateMotivationStats(responses: ProcessedResponse[]): any {
    const motivations = responses.map(r => r.motivations);
    
    return {
      reproducibilityMean: this.calculateMean(motivations, 'reproducibility'),
      collaborationMean: this.calculateMean(motivations, 'collaboration'),
      transparencyMean: this.calculateMean(motivations, 'transparency'),
      mandateComplianceMean: this.calculateMean(motivations, 'mandateCompliance'),
      increasedCitationsMean: this.calculateMean(motivations, 'increasedCitations'),
      personalValuesMean: this.calculateMean(motivations, 'personalValues'),
      communityExpectationsMean: this.calculateMean(motivations, 'communityExpectations'),
      overallMotivationMean: this.calculateOverallMean(motivations)
    };
  }

  private generateBarrierStats(responses: ProcessedResponse[]): any {
    const barriers = responses.map(r => r.barriers);
    
    return {
      timeConstraintsMean: this.calculateMean(barriers, 'timeConstraints'),
      privacyConcernsMean: this.calculateMean(barriers, 'privacyConcerns'),
      competitiveAdvantageMean: this.calculateMean(barriers, 'competitiveAdvantage'),
      lackOfIncentivesMean: this.calculateMean(barriers, 'lackOfIncentives'),
      technicalChallengesMean: this.calculateMean(barriers, 'technicalChallenges'),
      lackOfTrainingMean: this.calculateMean(barriers, 'lackOfTraining'),
      intellectualPropertyMean: this.calculateMean(barriers, 'intellectualProperty'),
      institutionalPolicyMean: this.calculateMean(barriers, 'institutionalPolicy'),
      overallBarrierMean: this.calculateOverallMean(barriers)
    };
  }

  private generateFAIRStats(responses: ProcessedResponse[]): any {
    const fairAwareness = responses.map(r => r.fairAwareness);
    
    return {
      overallAwarenessMean: this.calculateMean(fairAwareness, 'overallAwareness'),
      findableMean: this.calculateMean(fairAwareness, 'findable'),
      accessibleMean: this.calculateMean(fairAwareness, 'accessible'),
      interoperableMean: this.calculateMean(fairAwareness, 'interoperable'),
      reusableMean: this.calculateMean(fairAwareness, 'reusable'),
      implementationMean: this.calculateMean(fairAwareness, 'implementation'),
      maturityLevels: this.calculateFAIRMaturityDistribution(responses)
    };
  }

  private generateInstitutionalStats(responses: ProcessedResponse[]): any {
    const institutional = responses.map(r => r.institutionalSupport);
    
    return {
      policyExistsPercentage: this.calculateBooleanPercentage(institutional, 'policyExists'),
      mandateExistsPercentage: this.calculateBooleanPercentage(institutional, 'mandateExists'),
      trainingProvidedPercentage: this.calculateBooleanPercentage(institutional, 'trainingProvided'),
      supportStaffAvailablePercentage: this.calculateBooleanPercentage(institutional, 'supportStaffAvailable'),
      fundingSupportPercentage: this.calculateBooleanPercentage(institutional, 'fundingSupport'),
      repositoryAccessPercentage: this.calculateBooleanPercentage(institutional, 'repositoryAccess'),
      overallSupportScore: this.calculateOverallSupportScore(institutional)
    };
  }

  private generateYearlyTrends(responses: ProcessedResponse[]): any {
    const years = [...new Set(responses.map(r => r.year))].sort();
    const trends: Record<string, any> = {};

    years.forEach(year => {
      const yearResponses = responses.filter(r => r.year === year);
      trends[year] = {
        responseCount: yearResponses.length,
        attitudes: this.generateAttitudeStats(yearResponses),
        motivations: this.generateMotivationStats(yearResponses),
        barriers: this.generateBarrierStats(yearResponses),
        fairAwareness: this.generateFAIRStats(yearResponses),
        institutionalSupport: this.generateInstitutionalStats(yearResponses)
      };
    });

    return trends;
  }

  private calculateDistribution(data: any[], field: string): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      const value = item[field];
      if (value !== null && value !== undefined && value !== '') {
        const key = String(value);
        distribution[key] = (distribution[key] || 0) + 1;
      }
    });

    return distribution;
  }

  private calculateMean(data: any[], field: string): number | null {
    const values = data
      .map(item => item[field])
      .filter(value => value !== null && value !== undefined && typeof value === 'number');
    
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  private calculateOverallMean(data: any[]): number | null {
    const allValues: number[] = [];
    
    data.forEach(item => {
      Object.values(item).forEach(value => {
        if (value !== null && value !== undefined && typeof value === 'number') {
          allValues.push(value);
        }
      });
    });

    if (allValues.length === 0) return null;
    
    const sum = allValues.reduce((a, b) => a + b, 0);
    return Math.round((sum / allValues.length) * 100) / 100;
  }

  private calculateBooleanPercentage(data: any[], field: string): number | null {
    const values = data
      .map(item => item[field])
      .filter(value => value !== null && value !== undefined && typeof value === 'boolean');
    
    if (values.length === 0) return null;
    
    const trueCount = values.filter(value => value === true).length;
    return Math.round((trueCount / values.length) * 100);
  }

  private calculateFAIRMaturityDistribution(responses: ProcessedResponse[]): Record<string, number> {
    const maturityLevels: Record<string, number> = {
      'Novice': 0,
      'Beginner': 0,
      'Intermediate': 0,
      'Advanced': 0,
      'Expert': 0,
      'Unknown': 0
    };

    responses.forEach(response => {
      const fairValues = Object.values(response.fairAwareness)
        .filter(v => v !== null && v !== undefined && typeof v === 'number') as number[];
      
      if (fairValues.length === 0) {
        maturityLevels['Unknown']++;
        return;
      }

      const averageScore = fairValues.reduce((a, b) => a + b, 0) / fairValues.length;
      
      if (averageScore >= 4.5) maturityLevels['Expert']++;
      else if (averageScore >= 3.5) maturityLevels['Advanced']++;
      else if (averageScore >= 2.5) maturityLevels['Intermediate']++;
      else if (averageScore >= 1.5) maturityLevels['Beginner']++;
      else maturityLevels['Novice']++;
    });

    return maturityLevels;
  }

  private calculateOverallSupportScore(data: any[]): number | null {
    const scores: number[] = [];
    
    data.forEach(item => {
      const values = Object.values(item)
        .filter(value => value !== null && value !== undefined && typeof value === 'boolean') as boolean[];
      
      if (values.length > 0) {
        const trueCount = values.filter(value => value === true).length;
        const score = Math.round((trueCount / values.length) * 100);
        scores.push(score);
      }
    });

    if (scores.length === 0) return null;
    
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }

  // Helper method to export statistics as JSON
  exportStatistics(stats: Record<string, any>): string {
    return JSON.stringify(stats, null, 2);
  }

  // Helper method to generate summary report
  generateSummaryReport(stats: Record<string, any>): string {
    let report = '# State of Open Data - Statistical Summary\n\n';
    
    report += `## Overview\n`;
    report += `- **Total Responses**: ${stats.overview.totalResponses.toLocaleString()}\n`;
    report += `- **Year Range**: ${stats.overview.yearRange[0]}-${stats.overview.yearRange[1]}\n`;
    report += `- **Years with Data**: ${stats.overview.yearsWithData.length}\n`;
    report += `- **Average Responses per Year**: ${stats.overview.averageResponsesPerYear.toLocaleString()}\n\n`;

    report += `## Key Findings\n`;
    if (stats.attitudes.overallAttitudeMean) {
      report += `- **Overall Attitude to Open Science**: ${stats.attitudes.overallAttitudeMean}/5\n`;
    }
    if (stats.motivations.overallMotivationMean) {
      report += `- **Overall Motivation Level**: ${stats.motivations.overallMotivationMean}/5\n`;
    }
    if (stats.barriers.overallBarrierMean) {
      report += `- **Overall Barrier Level**: ${stats.barriers.overallBarrierMean}/5\n`;
    }
    if (stats.institutionalSupport.overallSupportScore) {
      report += `- **Institutional Support Score**: ${stats.institutionalSupport.overallSupportScore}%\n`;
    }

    return report;
  }
}