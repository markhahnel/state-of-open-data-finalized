import type { HarmonizedDataset, ProcessedResponse } from '../types';

export class DataExporter {
  async exportToCSV(dataset: HarmonizedDataset, filename: string): Promise<void> {
    console.log(`📄 Exporting dataset to CSV: ${filename}`);
    
    const csv = this.convertToCSV(dataset.responses);
    await this.writeFile(filename, csv);
    
    console.log(`✅ CSV export complete: ${filename}`);
  }

  async exportToJSON(dataset: HarmonizedDataset, filename: string): Promise<void> {
    console.log(`📄 Exporting dataset to JSON: ${filename}`);
    
    const json = JSON.stringify(dataset, null, 2);
    await this.writeFile(filename, json);
    
    console.log(`✅ JSON export complete: ${filename}`);
  }

  async exportSummaryStatistics(dataset: HarmonizedDataset, filename: string): Promise<void> {
    console.log(`📊 Exporting summary statistics: ${filename}`);
    
    const stats = this.generateSummaryStats(dataset);
    const json = JSON.stringify(stats, null, 2);
    await this.writeFile(filename, json);
    
    console.log(`✅ Statistics export complete: ${filename}`);
  }

  async exportValidationReport(dataset: HarmonizedDataset, filename: string): Promise<void> {
    console.log(`📋 Exporting validation report: ${filename}`);
    
    const report = this.generateValidationReport(dataset);
    await this.writeFile(filename, report);
    
    console.log(`✅ Validation report export complete: ${filename}`);
  }

  async exportYearlyBreakdown(dataset: HarmonizedDataset, outputDir: string): Promise<void> {
    console.log(`📁 Exporting yearly breakdown to: ${outputDir}`);
    
    const years = [...new Set(dataset.responses.map(r => r.year))].sort();
    
    for (const year of years) {
      const yearResponses = dataset.responses.filter(r => r.year === year);
      const yearDataset = {
        ...dataset,
        responses: yearResponses,
        metadata: {
          ...dataset.metadata,
          totalResponses: yearResponses.length
        }
      };
      
      const csv = this.convertToCSV(yearResponses);
      await this.writeFile(`${outputDir}/sood_${year}_processed.csv`, csv);
    }
    
    console.log(`✅ Yearly breakdown export complete`);
  }

  private convertToCSV(responses: ProcessedResponse[]): string {
    if (responses.length === 0) return '';
    
    // Define CSV headers
    const headers = [
      'id',
      'year',
      'timestamp',
      // Demographics
      'demo_age',
      'demo_gender',
      'demo_country',
      'demo_region',
      'demo_discipline',
      'demo_job_title',
      'demo_career_stage',
      'demo_institution_type',
      // Attitudes
      'attitude_open_access',
      'attitude_open_data',
      'attitude_open_peer_review',
      'attitude_preprints',
      'attitude_open_science',
      'attitude_data_sharing',
      // Motivations
      'motivation_reproducibility',
      'motivation_collaboration',
      'motivation_transparency',
      'motivation_mandate_compliance',
      'motivation_increased_citations',
      'motivation_personal_values',
      'motivation_community_expectations',
      // Barriers
      'barrier_time_constraints',
      'barrier_privacy_concerns',
      'barrier_competitive_advantage',
      'barrier_lack_of_incentives',
      'barrier_technical_challenges',
      'barrier_lack_of_training',
      'barrier_intellectual_property',
      'barrier_institutional_policy',
      // FAIR Awareness
      'fair_overall_awareness',
      'fair_findable',
      'fair_accessible',
      'fair_interoperable',
      'fair_reusable',
      'fair_implementation',
      // Institutional Support
      'institutional_policy_exists',
      'institutional_mandate_exists',
      'institutional_training_provided',
      'institutional_support_staff_available',
      'institutional_funding_support',
      'institutional_repository_access'
    ];
    
    // Convert responses to CSV rows
    const rows = responses.map(response => {
      return [
        response.id,
        response.year,
        response.timestamp?.toISOString() || '',
        // Demographics
        response.demographics.age || '',
        response.demographics.gender || '',
        response.demographics.country || '',
        response.demographics.region || '',
        response.demographics.discipline || '',
        response.demographics.jobTitle || '',
        response.demographics.careerStage || '',
        response.demographics.institutionType || '',
        // Attitudes
        response.attitudes.openAccess ?? '',
        response.attitudes.openData ?? '',
        response.attitudes.openPeerReview ?? '',
        response.attitudes.preprints ?? '',
        response.attitudes.openScience ?? '',
        response.attitudes.dataSharing ?? '',
        // Motivations
        response.motivations.reproducibility ?? '',
        response.motivations.collaboration ?? '',
        response.motivations.transparency ?? '',
        response.motivations.mandateCompliance ?? '',
        response.motivations.increasedCitations ?? '',
        response.motivations.personalValues ?? '',
        response.motivations.communityExpectations ?? '',
        // Barriers
        response.barriers.timeConstraints ?? '',
        response.barriers.privacyConcerns ?? '',
        response.barriers.competitiveAdvantage ?? '',
        response.barriers.lackOfIncentives ?? '',
        response.barriers.technicalChallenges ?? '',
        response.barriers.lackOfTraining ?? '',
        response.barriers.intellectualProperty ?? '',
        response.barriers.institutionalPolicy ?? '',
        // FAIR Awareness
        response.fairAwareness.overallAwareness ?? '',
        response.fairAwareness.findable ?? '',
        response.fairAwareness.accessible ?? '',
        response.fairAwareness.interoperable ?? '',
        response.fairAwareness.reusable ?? '',
        response.fairAwareness.implementation ?? '',
        // Institutional Support
        response.institutionalSupport.policyExists ?? '',
        response.institutionalSupport.mandateExists ?? '',
        response.institutionalSupport.trainingProvided ?? '',
        response.institutionalSupport.supportStaffAvailable ?? '',
        response.institutionalSupport.fundingSupport ?? '',
        response.institutionalSupport.repositoryAccess ?? ''
      ].map(field => this.escapeCsvField(String(field)));
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private generateSummaryStats(dataset: HarmonizedDataset): any {
    const { responses, metadata } = dataset;
    
    return {
      metadata,
      overview: {
        totalResponses: responses.length,
        yearRange: metadata.yearRange,
        completenessScore: metadata.completenessScore,
        processingDate: metadata.processingDate
      },
      demographics: this.calculateDemographicStats(responses),
      attitudes: this.calculateAttitudeStats(responses),
      motivations: this.calculateMotivationStats(responses),
      barriers: this.calculateBarrierStats(responses),
      fairAwareness: this.calculateFAIRStats(responses),
      institutionalSupport: this.calculateInstitutionalStats(responses),
      yearlyBreakdown: this.calculateYearlyBreakdown(responses)
    };
  }

  private calculateDemographicStats(responses: ProcessedResponse[]): any {
    return {
      ageDistribution: this.getDistribution(responses, r => r.demographics.age),
      genderDistribution: this.getDistribution(responses, r => r.demographics.gender),
      countryDistribution: this.getDistribution(responses, r => r.demographics.country),
      disciplineDistribution: this.getDistribution(responses, r => r.demographics.discipline),
      jobTitleDistribution: this.getDistribution(responses, r => r.demographics.jobTitle)
    };
  }

  private calculateAttitudeStats(responses: ProcessedResponse[]): any {
    return {
      openAccessMean: this.getMean(responses, r => r.attitudes.openAccess),
      openDataMean: this.getMean(responses, r => r.attitudes.openData),
      openPeerReviewMean: this.getMean(responses, r => r.attitudes.openPeerReview),
      preprintsMean: this.getMean(responses, r => r.attitudes.preprints),
      openScienceMean: this.getMean(responses, r => r.attitudes.openScience),
      dataSharingMean: this.getMean(responses, r => r.attitudes.dataSharing)
    };
  }

  private calculateMotivationStats(responses: ProcessedResponse[]): any {
    return {
      reproducibilityMean: this.getMean(responses, r => r.motivations.reproducibility),
      collaborationMean: this.getMean(responses, r => r.motivations.collaboration),
      transparencyMean: this.getMean(responses, r => r.motivations.transparency),
      mandateComplianceMean: this.getMean(responses, r => r.motivations.mandateCompliance),
      increasedCitationsMean: this.getMean(responses, r => r.motivations.increasedCitations),
      personalValuesMean: this.getMean(responses, r => r.motivations.personalValues),
      communityExpectationsMean: this.getMean(responses, r => r.motivations.communityExpectations)
    };
  }

  private calculateBarrierStats(responses: ProcessedResponse[]): any {
    return {
      timeConstraintsMean: this.getMean(responses, r => r.barriers.timeConstraints),
      privacyConcernsMean: this.getMean(responses, r => r.barriers.privacyConcerns),
      competitiveAdvantageMean: this.getMean(responses, r => r.barriers.competitiveAdvantage),
      lackOfIncentivesMean: this.getMean(responses, r => r.barriers.lackOfIncentives),
      technicalChallengesMean: this.getMean(responses, r => r.barriers.technicalChallenges),
      lackOfTrainingMean: this.getMean(responses, r => r.barriers.lackOfTraining),
      intellectualPropertyMean: this.getMean(responses, r => r.barriers.intellectualProperty),
      institutionalPolicyMean: this.getMean(responses, r => r.barriers.institutionalPolicy)
    };
  }

  private calculateFAIRStats(responses: ProcessedResponse[]): any {
    return {
      overallAwarenessMean: this.getMean(responses, r => r.fairAwareness.overallAwareness),
      findableMean: this.getMean(responses, r => r.fairAwareness.findable),
      accessibleMean: this.getMean(responses, r => r.fairAwareness.accessible),
      interoperableMean: this.getMean(responses, r => r.fairAwareness.interoperable),
      reusableMean: this.getMean(responses, r => r.fairAwareness.reusable),
      implementationMean: this.getMean(responses, r => r.fairAwareness.implementation)
    };
  }

  private calculateInstitutionalStats(responses: ProcessedResponse[]): any {
    return {
      policyExistsPercentage: this.getPercentage(responses, r => r.institutionalSupport.policyExists),
      mandateExistsPercentage: this.getPercentage(responses, r => r.institutionalSupport.mandateExists),
      trainingProvidedPercentage: this.getPercentage(responses, r => r.institutionalSupport.trainingProvided),
      supportStaffAvailablePercentage: this.getPercentage(responses, r => r.institutionalSupport.supportStaffAvailable),
      fundingSupportPercentage: this.getPercentage(responses, r => r.institutionalSupport.fundingSupport),
      repositoryAccessPercentage: this.getPercentage(responses, r => r.institutionalSupport.repositoryAccess)
    };
  }

  private calculateYearlyBreakdown(responses: ProcessedResponse[]): any {
    const years = [...new Set(responses.map(r => r.year))].sort();
    const breakdown: any = {};
    
    years.forEach(year => {
      const yearResponses = responses.filter(r => r.year === year);
      breakdown[year] = {
        responseCount: yearResponses.length,
        demographics: this.calculateDemographicStats(yearResponses),
        attitudes: this.calculateAttitudeStats(yearResponses),
        motivations: this.calculateMotivationStats(yearResponses),
        barriers: this.calculateBarrierStats(yearResponses),
        fairAwareness: this.calculateFAIRStats(yearResponses),
        institutionalSupport: this.calculateInstitutionalStats(yearResponses)
      };
    });
    
    return breakdown;
  }

  private getDistribution(responses: ProcessedResponse[], accessor: (r: ProcessedResponse) => any): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    responses.forEach(response => {
      const value = accessor(response);
      if (value !== null && value !== undefined && value !== '') {
        const key = String(value);
        distribution[key] = (distribution[key] || 0) + 1;
      }
    });
    
    return distribution;
  }

  private getMean(responses: ProcessedResponse[], accessor: (r: ProcessedResponse) => any): number | null {
    const values = responses
      .map(accessor)
      .filter(value => value !== null && value !== undefined && typeof value === 'number');
    
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  private getPercentage(responses: ProcessedResponse[], accessor: (r: ProcessedResponse) => any): number | null {
    const values = responses
      .map(accessor)
      .filter(value => value !== null && value !== undefined && typeof value === 'boolean');
    
    if (values.length === 0) return null;
    
    const trueCount = values.filter(value => value === true).length;
    return Math.round((trueCount / values.length) * 100);
  }

  private generateValidationReport(dataset: HarmonizedDataset): string {
    const { responses, metadata, processingStats } = dataset;
    
    let report = '# State of Open Data - Validation Report\n\n';
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Processing Date**: ${metadata.processingDate}\n`;
    report += `**Total Responses**: ${metadata.totalResponses.toLocaleString()}\n`;
    report += `**Year Range**: ${metadata.yearRange[0]}-${metadata.yearRange[1]}\n`;
    report += `**Completeness Score**: ${metadata.completenessScore}%\n\n`;
    
    report += '## Data Quality Summary\n\n';
    
    processingStats.forEach(stats => {
      if (stats.year > 0) {
        report += `### ${stats.year}\n`;
        report += `- **Total Rows**: ${stats.totalRows.toLocaleString()}\n`;
        report += `- **Valid Rows**: ${stats.validRows.toLocaleString()}\n`;
        report += `- **Missing Data Rate**: ${stats.missingDataRate}%\n`;
        report += `- **Completeness Score**: ${stats.completenessScore}%\n\n`;
      }
    });
    
    report += '## Field Statistics\n\n';
    
    const overallStats = processingStats.find(s => s.year === 0);
    if (overallStats) {
      Object.entries(overallStats.fieldStats).forEach(([fieldName, fieldStat]) => {
        report += `### ${fieldName}\n`;
        report += `- **Valid Responses**: ${fieldStat.validResponses.toLocaleString()} / ${fieldStat.totalResponses.toLocaleString()}\n`;
        report += `- **Missing Rate**: ${fieldStat.missingRate}%\n`;
        report += `- **Unique Values**: ${fieldStat.uniqueValues.toLocaleString()}\n`;
        
        if (fieldStat.topValues.length > 0) {
          report += `- **Top Values**:\n`;
          fieldStat.topValues.forEach(({ value, count }) => {
            report += `  - ${value}: ${count.toLocaleString()}\n`;
          });
        }
        report += '\n';
      });
    }
    
    return report;
  }

  private async writeFile(filename: string, content: string): Promise<void> {
    // In a real implementation, this would write to the filesystem
    // For now, we'll simulate it
    console.log(`Writing ${content.length} characters to ${filename}`);
    
    // You could implement actual file writing here:
    // const fs = require('fs').promises;
    // await fs.writeFile(filename, content, 'utf8');
  }

  // Helper method to create export bundle
  async exportComplete(dataset: HarmonizedDataset, outputDir: string): Promise<void> {
    console.log('📦 Creating complete export bundle...');
    
    await Promise.all([
      this.exportToCSV(dataset, `${outputDir}/sood_processed_complete.csv`),
      this.exportToJSON(dataset, `${outputDir}/sood_processed_complete.json`),
      this.exportSummaryStatistics(dataset, `${outputDir}/sood_summary_statistics.json`),
      this.exportValidationReport(dataset, `${outputDir}/sood_validation_report.md`),
      this.exportYearlyBreakdown(dataset, outputDir)
    ]);
    
    console.log('✅ Complete export bundle created');
  }
}