import type { Attitudes, QuestionMapping } from '../types';

export class AttitudeProcessor {
  private likertMapping: Record<string, number> = {
    'Strongly agree': 5,
    'Agree': 4,
    'Neither agree nor disagree': 3,
    'Neutral': 3,
    'Disagree': 2,
    'Strongly disagree': 1,
    'Very positive': 5,
    'Positive': 4,
    'Neutral': 3,
    'Negative': 2,
    'Very negative': 1,
    'Extremely important': 5,
    'Very important': 4,
    'Moderately important': 3,
    'Slightly important': 2,
    'Not important': 1
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): Attitudes {
    const attitudes: Attitudes = {};

    // Process open access attitudes
    const openAccessAttitude = this.extractOpenAccessAttitude(rawData, year);
    if (openAccessAttitude !== null) {
      attitudes.openAccess = openAccessAttitude;
    }

    // Process open data attitudes
    const openDataAttitude = this.extractOpenDataAttitude(rawData, year);
    if (openDataAttitude !== null) {
      attitudes.openData = openDataAttitude;
    }

    // Process open peer review attitudes
    const openPeerReviewAttitude = this.extractOpenPeerReviewAttitude(rawData, year);
    if (openPeerReviewAttitude !== null) {
      attitudes.openPeerReview = openPeerReviewAttitude;
    }

    // Process preprint attitudes
    const preprintAttitude = this.extractPreprintAttitude(rawData, year);
    if (preprintAttitude !== null) {
      attitudes.preprints = preprintAttitude;
    }

    // Process general open science attitudes
    const openScienceAttitude = this.extractOpenScienceAttitude(rawData, year);
    if (openScienceAttitude !== null) {
      attitudes.openScience = openScienceAttitude;
    }

    // Process data sharing attitudes
    const dataSharingAttitude = this.extractDataSharingAttitude(rawData, year);
    if (dataSharingAttitude !== null) {
      attitudes.dataSharing = dataSharingAttitude;
    }

    return attitudes;
  }

  private extractOpenAccessAttitude(rawData: Record<string, any>, year: number): number | null {
    const openAccessFields = [
      'How do you feel about open access to research publications?',
      'Open access attitude',
      'Attitude to open access',
      'Open access publishing',
      'OA_attitude'
    ];

    return this.extractLikertValue(rawData, openAccessFields);
  }

  private extractOpenDataAttitude(rawData: Record<string, any>, year: number): number | null {
    const openDataFields = [
      'How do you feel about open data?',
      'Open data attitude',
      'Attitude to open data',
      'Open data sharing',
      'OD_attitude'
    ];

    return this.extractLikertValue(rawData, openDataFields);
  }

  private extractOpenPeerReviewAttitude(rawData: Record<string, any>, year: number): number | null {
    const openPeerReviewFields = [
      'How do you feel about open peer review?',
      'Open peer review attitude',
      'Attitude to open peer review',
      'Open peer review',
      'OPR_attitude'
    ];

    return this.extractLikertValue(rawData, openPeerReviewFields);
  }

  private extractPreprintAttitude(rawData: Record<string, any>, year: number): number | null {
    const preprintFields = [
      'How do you feel about preprints?',
      'Preprint attitude',
      'Attitude to preprints',
      'Preprints',
      'PP_attitude'
    ];

    return this.extractLikertValue(rawData, preprintFields);
  }

  private extractOpenScienceAttitude(rawData: Record<string, any>, year: number): number | null {
    const openScienceFields = [
      'How do you feel about open science?',
      'Open science attitude',
      'Attitude to open science',
      'Open science',
      'OS_attitude'
    ];

    return this.extractLikertValue(rawData, openScienceFields);
  }

  private extractDataSharingAttitude(rawData: Record<string, any>, year: number): number | null {
    const dataSharingFields = [
      'How do you feel about data sharing?',
      'Data sharing attitude',
      'Attitude to data sharing',
      'Data sharing',
      'DS_attitude'
    ];

    return this.extractLikertValue(rawData, dataSharingFields);
  }

  private extractLikertValue(rawData: Record<string, any>, fieldNames: string[]): number | null {
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
    if (this.likertMapping[stringValue]) {
      return this.likertMapping[stringValue];
    }

    // Try fuzzy matching
    const lowerValue = stringValue.toLowerCase();
    for (const [key, numValue] of Object.entries(this.likertMapping)) {
      if (lowerValue.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerValue)) {
        return numValue;
      }
    }

    // Try parsing as number
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      return Math.round(numValue);
    }

    // Handle reverse scales (some surveys might use 1=positive, 5=negative)
    if (stringValue.includes('1') && stringValue.includes('5')) {
      // This might be a scale description, not a value
      return null;
    }

    return null;
  }

  // Helper method to calculate average attitude across all categories
  calculateOverallAttitude(attitudes: Attitudes): number | null {
    const values = Object.values(attitudes).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to identify attitude trends
  categorizeAttitude(score: number): string {
    if (score >= 4.5) return 'Very Positive';
    if (score >= 3.5) return 'Positive';
    if (score >= 2.5) return 'Neutral';
    if (score >= 1.5) return 'Negative';
    return 'Very Negative';
  }
}