import type { Motivations, QuestionMapping } from '../types';

export class MotivationProcessor {
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
    'Strongly disagree': 1
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): Motivations {
    const motivations: Motivations = {};

    // Process reproducibility motivation
    const reproducibility = this.extractReproducibilityMotivation(rawData, year);
    if (reproducibility !== null) {
      motivations.reproducibility = reproducibility;
    }

    // Process collaboration motivation
    const collaboration = this.extractCollaborationMotivation(rawData, year);
    if (collaboration !== null) {
      motivations.collaboration = collaboration;
    }

    // Process transparency motivation
    const transparency = this.extractTransparencyMotivation(rawData, year);
    if (transparency !== null) {
      motivations.transparency = transparency;
    }

    // Process mandate compliance motivation
    const mandateCompliance = this.extractMandateComplianceMotivation(rawData, year);
    if (mandateCompliance !== null) {
      motivations.mandateCompliance = mandateCompliance;
    }

    // Process increased citations motivation
    const increasedCitations = this.extractIncreasedCitationsMotivation(rawData, year);
    if (increasedCitations !== null) {
      motivations.increasedCitations = increasedCitations;
    }

    // Process personal values motivation
    const personalValues = this.extractPersonalValuesMotivation(rawData, year);
    if (personalValues !== null) {
      motivations.personalValues = personalValues;
    }

    // Process community expectations motivation
    const communityExpectations = this.extractCommunityExpectationsMotivation(rawData, year);
    if (communityExpectations !== null) {
      motivations.communityExpectations = communityExpectations;
    }

    return motivations;
  }

  private extractReproducibilityMotivation(rawData: Record<string, any>, year: number): number | null {
    const reproducibilityFields = [
      'Reproducibility',
      'To enable reproducibility',
      'Enable reproducibility of research',
      'Reproducibility of research',
      'Research reproducibility',
      'To make research reproducible',
      'Reproducible research'
    ];

    return this.extractImportanceValue(rawData, reproducibilityFields);
  }

  private extractCollaborationMotivation(rawData: Record<string, any>, year: number): number | null {
    const collaborationFields = [
      'Collaboration',
      'To enable collaboration',
      'Enable collaboration',
      'Facilitate collaboration',
      'Collaborative research',
      'To collaborate with others',
      'Collaboration with other researchers'
    ];

    return this.extractImportanceValue(rawData, collaborationFields);
  }

  private extractTransparencyMotivation(rawData: Record<string, any>, year: number): number | null {
    const transparencyFields = [
      'Transparency',
      'To increase transparency',
      'Research transparency',
      'Transparent research',
      'To be transparent',
      'Increase transparency in research'
    ];

    return this.extractImportanceValue(rawData, transparencyFields);
  }

  private extractMandateComplianceMotivation(rawData: Record<string, any>, year: number): number | null {
    const mandateFields = [
      'Mandate compliance',
      'Funder requirement',
      'Funder mandate',
      'Institutional requirement',
      'Institutional mandate',
      'Required by funder',
      'Required by institution',
      'Publisher requirement',
      'Journal requirement'
    ];

    return this.extractImportanceValue(rawData, mandateFields);
  }

  private extractIncreasedCitationsMotivation(rawData: Record<string, any>, year: number): number | null {
    const citationFields = [
      'Increased citations',
      'To increase citations',
      'Higher citation rates',
      'More citations',
      'Citation advantage',
      'Increased visibility',
      'Greater impact'
    ];

    return this.extractImportanceValue(rawData, citationFields);
  }

  private extractPersonalValuesMotivation(rawData: Record<string, any>, year: number): number | null {
    const personalValuesFields = [
      'Personal values',
      'Personal beliefs',
      'Ethical reasons',
      'Moral obligation',
      'Personal conviction',
      'Believe in open science',
      'Right thing to do'
    ];

    return this.extractImportanceValue(rawData, personalValuesFields);
  }

  private extractCommunityExpectationsMotivation(rawData: Record<string, any>, year: number): number | null {
    const communityFields = [
      'Community expectations',
      'Community norms',
      'Field expectations',
      'Discipline expectations',
      'Peer expectations',
      'Professional expectations',
      'Research community pressure'
    ];

    return this.extractImportanceValue(rawData, communityFields);
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

  // Helper method to calculate overall motivation score
  calculateOverallMotivation(motivations: Motivations): number | null {
    const values = Object.values(motivations).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to identify top motivations
  getTopMotivations(motivations: Motivations, limit: number = 3): Array<{motivation: string, score: number}> {
    const motivationEntries = Object.entries(motivations)
      .filter(([_, score]) => score !== null && score !== undefined)
      .map(([motivation, score]) => ({ motivation, score: score as number }))
      .sort((a, b) => b.score - a.score);

    return motivationEntries.slice(0, limit);
  }

  // Helper method to categorize motivation level
  categorizeMotivation(score: number): string {
    if (score >= 4.5) return 'Very High';
    if (score >= 3.5) return 'High';
    if (score >= 2.5) return 'Moderate';
    if (score >= 1.5) return 'Low';
    return 'Very Low';
  }
}