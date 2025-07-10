import type { Barriers, QuestionMapping } from '../types';

export class BarrierProcessor {
  private importanceMapping: Record<string, number> = {
    'Extremely important': 5,
    'Very important': 4,
    'Moderately important': 3,
    'Slightly important': 2,
    'Not important': 1,
    'Not at all important': 1,
    'Strongly agree': 5,
    'Agree': 4,
    'Neither agree nor disagree': 3,
    'Neutral': 3,
    'Disagree': 2,
    'Strongly disagree': 1,
    'Major barrier': 5,
    'Significant barrier': 4,
    'Moderate barrier': 3,
    'Minor barrier': 2,
    'Not a barrier': 1
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): Barriers {
    const barriers: Barriers = {};

    // Process time constraints barrier
    const timeConstraints = this.extractTimeConstraintsBarrier(rawData, year);
    if (timeConstraints !== null) {
      barriers.timeConstraints = timeConstraints;
    }

    // Process privacy concerns barrier
    const privacyConcerns = this.extractPrivacyConcernsBarrier(rawData, year);
    if (privacyConcerns !== null) {
      barriers.privacyConcerns = privacyConcerns;
    }

    // Process competitive advantage barrier
    const competitiveAdvantage = this.extractCompetitiveAdvantageBarrier(rawData, year);
    if (competitiveAdvantage !== null) {
      barriers.competitiveAdvantage = competitiveAdvantage;
    }

    // Process lack of incentives barrier
    const lackOfIncentives = this.extractLackOfIncentivesBarrier(rawData, year);
    if (lackOfIncentives !== null) {
      barriers.lackOfIncentives = lackOfIncentives;
    }

    // Process technical challenges barrier
    const technicalChallenges = this.extractTechnicalChallengesBarrier(rawData, year);
    if (technicalChallenges !== null) {
      barriers.technicalChallenges = technicalChallenges;
    }

    // Process lack of training barrier
    const lackOfTraining = this.extractLackOfTrainingBarrier(rawData, year);
    if (lackOfTraining !== null) {
      barriers.lackOfTraining = lackOfTraining;
    }

    // Process intellectual property barrier
    const intellectualProperty = this.extractIntellectualPropertyBarrier(rawData, year);
    if (intellectualProperty !== null) {
      barriers.intellectualProperty = intellectualProperty;
    }

    // Process institutional policy barrier
    const institutionalPolicy = this.extractInstitutionalPolicyBarrier(rawData, year);
    if (institutionalPolicy !== null) {
      barriers.institutionalPolicy = institutionalPolicy;
    }

    return barriers;
  }

  private extractTimeConstraintsBarrier(rawData: Record<string, any>, year: number): number | null {
    const timeFields = [
      'Time constraints',
      'Lack of time',
      'Time required',
      'Time intensive',
      'Takes too much time',
      'Time burden',
      'Time pressure',
      'Insufficient time'
    ];

    return this.extractImportanceValue(rawData, timeFields);
  }

  private extractPrivacyConcernsBarrier(rawData: Record<string, any>, year: number): number | null {
    const privacyFields = [
      'Privacy concerns',
      'Privacy issues',
      'Data privacy',
      'Confidentiality',
      'Sensitive data',
      'Personal data',
      'Data protection',
      'Privacy restrictions'
    ];

    return this.extractImportanceValue(rawData, privacyFields);
  }

  private extractCompetitiveAdvantageBarrier(rawData: Record<string, any>, year: number): number | null {
    const competitiveFields = [
      'Competitive advantage',
      'Competitive edge',
      'Competition',
      'Competitive concerns',
      'Loss of competitive advantage',
      'Research advantage',
      'Commercial advantage',
      'Fear of competition'
    ];

    return this.extractImportanceValue(rawData, competitiveFields);
  }

  private extractLackOfIncentivesBarrier(rawData: Record<string, any>, year: number): number | null {
    const incentiveFields = [
      'Lack of incentives',
      'No incentives',
      'Insufficient incentives',
      'No rewards',
      'Lack of recognition',
      'No career benefit',
      'No professional benefit',
      'Lack of motivation'
    ];

    return this.extractImportanceValue(rawData, incentiveFields);
  }

  private extractTechnicalChallengesBarrier(rawData: Record<string, any>, year: number): number | null {
    const technicalFields = [
      'Technical challenges',
      'Technical difficulties',
      'Technical barriers',
      'Technical issues',
      'Technology problems',
      'Technical complexity',
      'Technical skills',
      'Technical knowledge'
    ];

    return this.extractImportanceValue(rawData, technicalFields);
  }

  private extractLackOfTrainingBarrier(rawData: Record<string, any>, year: number): number | null {
    const trainingFields = [
      'Lack of training',
      'No training',
      'Insufficient training',
      'Training needs',
      'Skills gap',
      'Knowledge gap',
      'Lack of knowledge',
      'Need for training'
    ];

    return this.extractImportanceValue(rawData, trainingFields);
  }

  private extractIntellectualPropertyBarrier(rawData: Record<string, any>, year: number): number | null {
    const ipFields = [
      'Intellectual property',
      'IP concerns',
      'IP issues',
      'Patent concerns',
      'Copyright issues',
      'Ownership concerns',
      'IP rights',
      'Legal concerns'
    ];

    return this.extractImportanceValue(rawData, ipFields);
  }

  private extractInstitutionalPolicyBarrier(rawData: Record<string, any>, year: number): number | null {
    const policyFields = [
      'Institutional policy',
      'Institution policy',
      'Policy barriers',
      'Institutional barriers',
      'Organizational barriers',
      'Policy restrictions',
      'Institutional restrictions',
      'Policy issues'
    ];

    return this.extractImportanceValue(rawData, policyFields);
  }

  private extractImportanceValue(rawData: Record<string, any>, fieldNames: string[]): number | null {
    for (const field of fieldNames) {
      const value = rawData[field];
      if (value !== null && value !== undefined && value !== '') {
        const numericValue = this.convertToNumeric(value);
        if (numericValue !== null) {
          return numericValue;
        }
      }
    }
    return null;
  }

  private convertToNumeric(value: any): number | null {
    // If already numeric, validate range
    if (typeof value === 'number') {
      if (value >= 1 && value <= 5) {
        return value;
      }
      return null;
    }

    // Convert string to number
    const stringValue = String(value).trim();
    
    // Try direct mapping first
    if (this.importanceMapping[stringValue]) {
      return this.importanceMapping[stringValue];
    }

    // Try fuzzy matching
    const lowerValue = stringValue.toLowerCase();
    for (const [key, numValue] of Object.entries(this.importanceMapping)) {
      if (lowerValue.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerValue)) {
        return numValue;
      }
    }

    // Try parsing as number
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      return Math.round(numValue);
    }

    return null;
  }

  // Helper method to calculate overall barrier score
  calculateOverallBarrier(barriers: Barriers): number | null {
    const values = Object.values(barriers).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to identify top barriers
  getTopBarriers(barriers: Barriers, limit: number = 3): Array<{barrier: string, score: number}> {
    const barrierEntries = Object.entries(barriers)
      .filter(([_, score]) => score !== null && score !== undefined)
      .map(([barrier, score]) => ({ barrier, score: score as number }))
      .sort((a, b) => b.score - a.score);

    return barrierEntries.slice(0, limit);
  }

  // Helper method to categorize barrier level
  categorizeBarrier(score: number): string {
    if (score >= 4.5) return 'Major Barrier';
    if (score >= 3.5) return 'Significant Barrier';
    if (score >= 2.5) return 'Moderate Barrier';
    if (score >= 1.5) return 'Minor Barrier';
    return 'Not a Barrier';
  }

  // Helper method to identify barrier themes
  getBarrierThemes(barriers: Barriers): Record<string, number> {
    const themes: Record<string, number> = {
      'Resource Constraints': 0,
      'Technical Issues': 0,
      'Policy/Legal': 0,
      'Competitive Concerns': 0
    };

    if (barriers.timeConstraints) themes['Resource Constraints'] += barriers.timeConstraints;
    if (barriers.lackOfTraining) themes['Resource Constraints'] += barriers.lackOfTraining;
    if (barriers.lackOfIncentives) themes['Resource Constraints'] += barriers.lackOfIncentives;

    if (barriers.technicalChallenges) themes['Technical Issues'] += barriers.technicalChallenges;

    if (barriers.privacyConcerns) themes['Policy/Legal'] += barriers.privacyConcerns;
    if (barriers.intellectualProperty) themes['Policy/Legal'] += barriers.intellectualProperty;
    if (barriers.institutionalPolicy) themes['Policy/Legal'] += barriers.institutionalPolicy;

    if (barriers.competitiveAdvantage) themes['Competitive Concerns'] += barriers.competitiveAdvantage;

    // Calculate averages
    Object.keys(themes).forEach(theme => {
      const count = Object.entries(barriers).filter(([key, value]) => {
        if (value === null || value === undefined) return false;
        if (theme === 'Resource Constraints') {
          return ['timeConstraints', 'lackOfTraining', 'lackOfIncentives'].includes(key);
        }
        if (theme === 'Technical Issues') {
          return ['technicalChallenges'].includes(key);
        }
        if (theme === 'Policy/Legal') {
          return ['privacyConcerns', 'intellectualProperty', 'institutionalPolicy'].includes(key);
        }
        if (theme === 'Competitive Concerns') {
          return ['competitiveAdvantage'].includes(key);
        }
        return false;
      }).length;
      
      if (count > 0) {
        themes[theme] = Math.round((themes[theme] / count) * 100) / 100;
      }
    });

    return themes;
  }
}