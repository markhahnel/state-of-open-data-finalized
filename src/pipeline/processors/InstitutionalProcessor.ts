import type { InstitutionalSupport, QuestionMapping } from '../types';

export class InstitutionalProcessor {
  private booleanMapping: Record<string, boolean> = {
    'Yes': true,
    'No': false,
    'True': true,
    'False': false,
    '1': true,
    '0': false,
    'Available': true,
    'Not available': false,
    'Exists': true,
    'Does not exist': false,
    'Provided': true,
    'Not provided': false
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): InstitutionalSupport {
    const institutionalSupport: InstitutionalSupport = {};

    // Process policy existence
    const policyExists = this.extractPolicyExists(rawData, year);
    if (policyExists !== null) {
      institutionalSupport.policyExists = policyExists;
    }

    // Process mandate existence
    const mandateExists = this.extractMandateExists(rawData, year);
    if (mandateExists !== null) {
      institutionalSupport.mandateExists = mandateExists;
    }

    // Process training provision
    const trainingProvided = this.extractTrainingProvided(rawData, year);
    if (trainingProvided !== null) {
      institutionalSupport.trainingProvided = trainingProvided;
    }

    // Process support staff availability
    const supportStaffAvailable = this.extractSupportStaffAvailable(rawData, year);
    if (supportStaffAvailable !== null) {
      institutionalSupport.supportStaffAvailable = supportStaffAvailable;
    }

    // Process funding support
    const fundingSupport = this.extractFundingSupport(rawData, year);
    if (fundingSupport !== null) {
      institutionalSupport.fundingSupport = fundingSupport;
    }

    // Process repository access
    const repositoryAccess = this.extractRepositoryAccess(rawData, year);
    if (repositoryAccess !== null) {
      institutionalSupport.repositoryAccess = repositoryAccess;
    }

    return institutionalSupport;
  }

  private extractPolicyExists(rawData: Record<string, any>, year: number): boolean | null {
    const policyFields = [
      'Does your institution have a data policy?',
      'Institutional data policy',
      'Data policy exists',
      'Institution policy',
      'Organizational data policy',
      'Data management policy',
      'Open data policy',
      'Research data policy'
    ];

    return this.extractBooleanValue(rawData, policyFields);
  }

  private extractMandateExists(rawData: Record<string, any>, year: number): boolean | null {
    const mandateFields = [
      'Does your institution have a data sharing mandate?',
      'Institutional mandate',
      'Data sharing mandate',
      'Mandatory data sharing',
      'Required data sharing',
      'Institutional requirement',
      'Data sharing requirement',
      'Open data mandate'
    ];

    return this.extractBooleanValue(rawData, mandateFields);
  }

  private extractTrainingProvided(rawData: Record<string, any>, year: number): boolean | null {
    const trainingFields = [
      'Does your institution provide data management training?',
      'Training provided',
      'Data management training',
      'Training available',
      'Educational support',
      'Skills training',
      'Capacity building',
      'Professional development'
    ];

    return this.extractBooleanValue(rawData, trainingFields);
  }

  private extractSupportStaffAvailable(rawData: Record<string, any>, year: number): boolean | null {
    const supportFields = [
      'Are support staff available for data management?',
      'Support staff available',
      'Data management support',
      'Technical support',
      'Professional support',
      'Help desk',
      'Support services',
      'Research support'
    ];

    return this.extractBooleanValue(rawData, supportFields);
  }

  private extractFundingSupport(rawData: Record<string, any>, year: number): boolean | null {
    const fundingFields = [
      'Does your institution provide funding for data management?',
      'Funding support',
      'Financial support',
      'Data management funding',
      'Research funding',
      'Infrastructure funding',
      'Resource allocation',
      'Budget support'
    ];

    return this.extractBooleanValue(rawData, fundingFields);
  }

  private extractRepositoryAccess(rawData: Record<string, any>, year: number): boolean | null {
    const repositoryFields = [
      'Do you have access to institutional repositories?',
      'Repository access',
      'Data repository',
      'Institutional repository',
      'Storage infrastructure',
      'Data storage',
      'Repository services',
      'Data infrastructure'
    ];

    return this.extractBooleanValue(rawData, repositoryFields);
  }

  private extractBooleanValue(rawData: Record<string, any>, fieldNames: string[]): boolean | null {
    for (const field of fieldNames) {
      const value = rawData[field];
      if (value !== null && value !== undefined && value !== '') {
        const booleanValue = this.convertToBoolean(value);
        if (booleanValue !== null) {
          return booleanValue;
        }
      }
    }
    return null;
  }

  private convertToBoolean(value: any): boolean | null {
    // If already boolean
    if (typeof value === 'boolean') {
      return value;
    }

    // Convert string to boolean
    const stringValue = String(value).trim();
    
    // Try direct mapping first
    if (this.booleanMapping.hasOwnProperty(stringValue)) {
      return this.booleanMapping[stringValue];
    }

    // Try fuzzy matching
    const lowerValue = stringValue.toLowerCase();
    for (const [key, boolValue] of Object.entries(this.booleanMapping)) {
      if (lowerValue.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerValue)) {
        return boolValue;
      }
    }

    // Handle numeric values
    if (typeof value === 'number') {
      return value > 0;
    }

    // Try parsing as number
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      return numValue > 0;
    }

    return null;
  }

  // Helper method to calculate institutional support score
  calculateSupportScore(institutionalSupport: InstitutionalSupport): number {
    const supportItems = [
      institutionalSupport.policyExists,
      institutionalSupport.mandateExists,
      institutionalSupport.trainingProvided,
      institutionalSupport.supportStaffAvailable,
      institutionalSupport.fundingSupport,
      institutionalSupport.repositoryAccess
    ];

    const validItems = supportItems.filter(item => item !== null && item !== undefined);
    if (validItems.length === 0) return 0;

    const trueCount = validItems.filter(item => item === true).length;
    return Math.round((trueCount / validItems.length) * 100);
  }

  // Helper method to identify support gaps
  identifySupportGaps(institutionalSupport: InstitutionalSupport): string[] {
    const gaps: string[] = [];

    if (institutionalSupport.policyExists === false) {
      gaps.push('No institutional data policy');
    }
    if (institutionalSupport.mandateExists === false) {
      gaps.push('No data sharing mandate');
    }
    if (institutionalSupport.trainingProvided === false) {
      gaps.push('No data management training');
    }
    if (institutionalSupport.supportStaffAvailable === false) {
      gaps.push('No support staff available');
    }
    if (institutionalSupport.fundingSupport === false) {
      gaps.push('No funding support');
    }
    if (institutionalSupport.repositoryAccess === false) {
      gaps.push('No repository access');
    }

    return gaps;
  }

  // Helper method to categorize institutional support level
  categorizeSupport(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Limited';
    return 'Poor';
  }

  // Helper method to get support recommendations
  getSupportRecommendations(institutionalSupport: InstitutionalSupport): string[] {
    const recommendations: string[] = [];
    const gaps = this.identifySupportGaps(institutionalSupport);

    if (gaps.includes('No institutional data policy')) {
      recommendations.push('Develop and implement institutional data policy');
    }
    if (gaps.includes('No data sharing mandate')) {
      recommendations.push('Consider implementing data sharing requirements');
    }
    if (gaps.includes('No data management training')) {
      recommendations.push('Provide data management training programs');
    }
    if (gaps.includes('No support staff available')) {
      recommendations.push('Hire or train data management support staff');
    }
    if (gaps.includes('No funding support')) {
      recommendations.push('Allocate funding for data management activities');
    }
    if (gaps.includes('No repository access')) {
      recommendations.push('Provide access to data repositories');
    }

    return recommendations;
  }

  // Helper method to get support strengths
  getSupportStrengths(institutionalSupport: InstitutionalSupport): string[] {
    const strengths: string[] = [];

    if (institutionalSupport.policyExists === true) {
      strengths.push('Institutional data policy in place');
    }
    if (institutionalSupport.mandateExists === true) {
      strengths.push('Data sharing mandate established');
    }
    if (institutionalSupport.trainingProvided === true) {
      strengths.push('Data management training available');
    }
    if (institutionalSupport.supportStaffAvailable === true) {
      strengths.push('Support staff available');
    }
    if (institutionalSupport.fundingSupport === true) {
      strengths.push('Funding support provided');
    }
    if (institutionalSupport.repositoryAccess === true) {
      strengths.push('Repository access available');
    }

    return strengths;
  }
}