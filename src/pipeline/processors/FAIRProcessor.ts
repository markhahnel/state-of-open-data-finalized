import type { FAIRAwareness, QuestionMapping } from '../types';

export class FAIRProcessor {
  private awarenessMapping: Record<string, number> = {
    'Very familiar': 5,
    'Familiar': 4,
    'Somewhat familiar': 3,
    'Slightly familiar': 2,
    'Not familiar': 1,
    'Never heard of it': 1,
    'Expert level': 5,
    'Good understanding': 4,
    'Basic understanding': 3,
    'Limited understanding': 2,
    'No understanding': 1,
    'Always': 5,
    'Often': 4,
    'Sometimes': 3,
    'Rarely': 2,
    'Never': 1
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): FAIRAwareness {
    const fairAwareness: FAIRAwareness = {};

    // Process overall FAIR awareness
    const overallAwareness = this.extractOverallFAIRAwareness(rawData, year);
    if (overallAwareness !== null) {
      fairAwareness.overallAwareness = overallAwareness;
    }

    // Process Findable awareness
    const findable = this.extractFindableAwareness(rawData, year);
    if (findable !== null) {
      fairAwareness.findable = findable;
    }

    // Process Accessible awareness
    const accessible = this.extractAccessibleAwareness(rawData, year);
    if (accessible !== null) {
      fairAwareness.accessible = accessible;
    }

    // Process Interoperable awareness
    const interoperable = this.extractInteroperableAwareness(rawData, year);
    if (interoperable !== null) {
      fairAwareness.interoperable = interoperable;
    }

    // Process Reusable awareness
    const reusable = this.extractReusableAwareness(rawData, year);
    if (reusable !== null) {
      fairAwareness.reusable = reusable;
    }

    // Process FAIR implementation
    const implementation = this.extractFAIRImplementation(rawData, year);
    if (implementation !== null) {
      fairAwareness.implementation = implementation;
    }

    return fairAwareness;
  }

  private extractOverallFAIRAwareness(rawData: Record<string, any>, year: number): number | null {
    const fairFields = [
      'FAIR principles awareness',
      'FAIR awareness',
      'How familiar are you with FAIR principles?',
      'Familiarity with FAIR principles',
      'FAIR principles knowledge',
      'FAIR data principles',
      'FAIR principles understanding'
    ];

    return this.extractAwarenessValue(rawData, fairFields);
  }

  private extractFindableAwareness(rawData: Record<string, any>, year: number): number | null {
    const findableFields = [
      'Findable awareness',
      'Findable principle',
      'How familiar are you with Findable?',
      'Findable data',
      'Data findability',
      'Metadata standards',
      'Persistent identifiers'
    ];

    return this.extractAwarenessValue(rawData, findableFields);
  }

  private extractAccessibleAwareness(rawData: Record<string, any>, year: number): number | null {
    const accessibleFields = [
      'Accessible awareness',
      'Accessible principle',
      'How familiar are you with Accessible?',
      'Accessible data',
      'Data accessibility',
      'Open access data',
      'Data repositories'
    ];

    return this.extractAwarenessValue(rawData, accessibleFields);
  }

  private extractInteroperableAwareness(rawData: Record<string, any>, year: number): number | null {
    const interoperableFields = [
      'Interoperable awareness',
      'Interoperable principle',
      'How familiar are you with Interoperable?',
      'Interoperable data',
      'Data interoperability',
      'Data formats',
      'Standards compliance'
    ];

    return this.extractAwarenessValue(rawData, interoperableFields);
  }

  private extractReusableAwareness(rawData: Record<string, any>, year: number): number | null {
    const reusableFields = [
      'Reusable awareness',
      'Reusable principle',
      'How familiar are you with Reusable?',
      'Reusable data',
      'Data reusability',
      'Data licensing',
      'Usage rights'
    ];

    return this.extractAwarenessValue(rawData, reusableFields);
  }

  private extractFAIRImplementation(rawData: Record<string, any>, year: number): number | null {
    const implementationFields = [
      'FAIR implementation',
      'FAIR principles implementation',
      'How often do you implement FAIR?',
      'FAIR practices',
      'Apply FAIR principles',
      'Use FAIR principles',
      'Follow FAIR guidelines'
    ];

    return this.extractAwarenessValue(rawData, implementationFields);
  }

  private extractAwarenessValue(rawData: Record<string, any>, fieldNames: string[]): number | null {
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
    if (this.awarenessMapping[stringValue]) {
      return this.awarenessMapping[stringValue];
    }

    // Try fuzzy matching
    const lowerValue = stringValue.toLowerCase();
    for (const [key, numValue] of Object.entries(this.awarenessMapping)) {
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

  // Helper method to calculate overall FAIR score
  calculateOverallFAIRScore(fairAwareness: FAIRAwareness): number | null {
    const values = Object.values(fairAwareness).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to calculate FAIR principle scores
  calculateFAIRPrincipleScores(fairAwareness: FAIRAwareness): Record<string, number> {
    const scores: Record<string, number> = {};
    
    if (fairAwareness.findable !== null && fairAwareness.findable !== undefined) {
      scores.findable = fairAwareness.findable;
    }
    if (fairAwareness.accessible !== null && fairAwareness.accessible !== undefined) {
      scores.accessible = fairAwareness.accessible;
    }
    if (fairAwareness.interoperable !== null && fairAwareness.interoperable !== undefined) {
      scores.interoperable = fairAwareness.interoperable;
    }
    if (fairAwareness.reusable !== null && fairAwareness.reusable !== undefined) {
      scores.reusable = fairAwareness.reusable;
    }
    
    return scores;
  }

  // Helper method to identify FAIR maturity level
  assessFAIRMaturity(fairAwareness: FAIRAwareness): string {
    const overallScore = this.calculateOverallFAIRScore(fairAwareness);
    
    if (overallScore === null) return 'Unknown';
    
    if (overallScore >= 4.5) return 'Expert';
    if (overallScore >= 3.5) return 'Advanced';
    if (overallScore >= 2.5) return 'Intermediate';
    if (overallScore >= 1.5) return 'Beginner';
    return 'Novice';
  }

  // Helper method to identify FAIR gaps
  identifyFAIRGaps(fairAwareness: FAIRAwareness): string[] {
    const gaps: string[] = [];
    const principleScores = this.calculateFAIRPrincipleScores(fairAwareness);
    
    Object.entries(principleScores).forEach(([principle, score]) => {
      if (score < 3) {
        gaps.push(`Low ${principle} awareness`);
      }
    });
    
    if (fairAwareness.implementation !== null && fairAwareness.implementation !== undefined) {
      if (fairAwareness.implementation < 3) {
        gaps.push('Low implementation practice');
      }
    }
    
    return gaps;
  }

  // Helper method to categorize FAIR awareness level
  categorizeFAIRAwareness(score: number): string {
    if (score >= 4.5) return 'Very High';
    if (score >= 3.5) return 'High';
    if (score >= 2.5) return 'Moderate';
    if (score >= 1.5) return 'Low';
    return 'Very Low';
  }

  // Helper method to get FAIR recommendations
  getFAIRRecommendations(fairAwareness: FAIRAwareness): string[] {
    const recommendations: string[] = [];
    const gaps = this.identifyFAIRGaps(fairAwareness);
    
    if (gaps.includes('Low findable awareness')) {
      recommendations.push('Learn about persistent identifiers and metadata standards');
    }
    if (gaps.includes('Low accessible awareness')) {
      recommendations.push('Explore data repositories and access protocols');
    }
    if (gaps.includes('Low interoperable awareness')) {
      recommendations.push('Study data formats and standardization practices');
    }
    if (gaps.includes('Low reusable awareness')) {
      recommendations.push('Understand data licensing and documentation requirements');
    }
    if (gaps.includes('Low implementation practice')) {
      recommendations.push('Start implementing FAIR principles in your research workflow');
    }
    
    return recommendations;
  }
}