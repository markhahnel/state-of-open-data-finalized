import type { ProcessedResponse, QuestionMapping } from '../types';

export class DataHarmonizer {
  private missingDataStrategies: Record<string, string> = {
    'demographics': 'preserve', // Keep as null for analysis
    'attitudes': 'median_impute', // Use median for Likert scales
    'motivations': 'median_impute',
    'barriers': 'median_impute',
    'fair': 'preserve', // FAIR awareness should be explicit
    'institutional': 'mode_impute' // Use most common value for boolean
  };

  private responseNormalizationRules: Record<string, Record<string, any>> = {
    'likert_5': {
      'Strongly disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly agree': 5
    },
    'importance_5': {
      'Not important': 1,
      'Slightly important': 2,
      'Moderately important': 3,
      'Very important': 4,
      'Extremely important': 5
    },
    'frequency_5': {
      'Never': 1,
      'Rarely': 2,
      'Sometimes': 3,
      'Often': 4,
      'Always': 5
    }
  };

  harmonizeDataset(responses: ProcessedResponse[]): ProcessedResponse[] {
    console.log('🔄 Harmonizing dataset...');
    
    const harmonizedResponses = responses.map(response => this.harmonizeResponse(response));
    
    // Apply missing data strategies
    const imputedResponses = this.applyMissingDataStrategies(harmonizedResponses);
    
    // Standardize response formats
    const standardizedResponses = this.standardizeResponseFormats(imputedResponses);
    
    console.log(`✅ Harmonized ${standardizedResponses.length} responses`);
    return standardizedResponses;
  }

  private harmonizeResponse(response: ProcessedResponse): ProcessedResponse {
    return {
      ...response,
      demographics: this.harmonizeDemographics(response.demographics),
      attitudes: this.harmonizeAttitudes(response.attitudes),
      motivations: this.harmonizeMotivations(response.motivations),
      barriers: this.harmonizeBarriers(response.barriers),
      fairAwareness: this.harmonizeFAIRAwareness(response.fairAwareness),
      institutionalSupport: this.harmonizeInstitutionalSupport(response.institutionalSupport)
    };
  }

  private harmonizeDemographics(demographics: any): any {
    const harmonized = { ...demographics };
    
    // Standardize age groups
    if (harmonized.age) {
      harmonized.age = this.standardizeAgeGroup(harmonized.age);
    }
    
    // Standardize gender
    if (harmonized.gender) {
      harmonized.gender = this.standardizeGender(harmonized.gender);
    }
    
    // Standardize country names
    if (harmonized.country) {
      harmonized.country = this.standardizeCountry(harmonized.country);
    }
    
    // Standardize disciplines
    if (harmonized.discipline) {
      harmonized.discipline = this.standardizeDiscipline(harmonized.discipline);
    }
    
    return harmonized;
  }

  private harmonizeAttitudes(attitudes: any): any {
    const harmonized = { ...attitudes };
    
    // Ensure all attitude scores are in 1-5 range
    Object.keys(harmonized).forEach(key => {
      if (harmonized[key] !== null && harmonized[key] !== undefined) {
        harmonized[key] = this.normalizeToLikertScale(harmonized[key]);
      }
    });
    
    return harmonized;
  }

  private harmonizeMotivations(motivations: any): any {
    const harmonized = { ...motivations };
    
    // Ensure all motivation scores are in 1-5 range
    Object.keys(harmonized).forEach(key => {
      if (harmonized[key] !== null && harmonized[key] !== undefined) {
        harmonized[key] = this.normalizeToLikertScale(harmonized[key]);
      }
    });
    
    return harmonized;
  }

  private harmonizeBarriers(barriers: any): any {
    const harmonized = { ...barriers };
    
    // Ensure all barrier scores are in 1-5 range
    Object.keys(harmonized).forEach(key => {
      if (harmonized[key] !== null && harmonized[key] !== undefined) {
        harmonized[key] = this.normalizeToLikertScale(harmonized[key]);
      }
    });
    
    return harmonized;
  }

  private harmonizeFAIRAwareness(fairAwareness: any): any {
    const harmonized = { ...fairAwareness };
    
    // Ensure all FAIR scores are in 1-5 range
    Object.keys(harmonized).forEach(key => {
      if (harmonized[key] !== null && harmonized[key] !== undefined) {
        harmonized[key] = this.normalizeToLikertScale(harmonized[key]);
      }
    });
    
    return harmonized;
  }

  private harmonizeInstitutionalSupport(institutionalSupport: any): any {
    const harmonized = { ...institutionalSupport };
    
    // Ensure all institutional support values are boolean
    Object.keys(harmonized).forEach(key => {
      if (harmonized[key] !== null && harmonized[key] !== undefined) {
        harmonized[key] = this.normalizeToBoolean(harmonized[key]);
      }
    });
    
    return harmonized;
  }

  private applyMissingDataStrategies(responses: ProcessedResponse[]): ProcessedResponse[] {
    const strategizedResponses = [...responses];
    
    // Calculate medians and modes for imputation
    const medians = this.calculateMedians(responses);
    const modes = this.calculateModes(responses);
    
    strategizedResponses.forEach(response => {
      // Apply missing data strategies for each category
      response.attitudes = this.applyMissingDataStrategy(
        response.attitudes, 
        'attitudes', 
        medians.attitudes
      );
      
      response.motivations = this.applyMissingDataStrategy(
        response.motivations, 
        'motivations', 
        medians.motivations
      );
      
      response.barriers = this.applyMissingDataStrategy(
        response.barriers, 
        'barriers', 
        medians.barriers
      );
      
      response.institutionalSupport = this.applyMissingDataStrategy(
        response.institutionalSupport, 
        'institutional', 
        modes.institutional
      );
    });
    
    return strategizedResponses;
  }

  private applyMissingDataStrategy(
    data: any, 
    category: string, 
    imputationValues: any
  ): any {
    const strategy = this.missingDataStrategies[category];
    
    if (strategy === 'preserve') {
      return data;
    }
    
    const processed = { ...data };
    
    Object.keys(processed).forEach(key => {
      if (processed[key] === null || processed[key] === undefined) {
        if (strategy === 'median_impute' && imputationValues[key] !== undefined) {
          processed[key] = imputationValues[key];
        } else if (strategy === 'mode_impute' && imputationValues[key] !== undefined) {
          processed[key] = imputationValues[key];
        }
      }
    });
    
    return processed;
  }

  private calculateMedians(responses: ProcessedResponse[]): any {
    const medians: any = {
      attitudes: {},
      motivations: {},
      barriers: {}
    };
    
    // Calculate medians for attitudes
    const attitudeKeys = ['openAccess', 'openData', 'openPeerReview', 'preprints', 'openScience', 'dataSharing'];
    attitudeKeys.forEach(key => {
      const values = responses
        .map(r => r.attitudes[key])
        .filter(v => v !== null && v !== undefined)
        .sort((a, b) => a - b);
      
      if (values.length > 0) {
        const mid = Math.floor(values.length / 2);
        medians.attitudes[key] = values.length % 2 === 0 
          ? (values[mid - 1] + values[mid]) / 2 
          : values[mid];
      }
    });
    
    // Calculate medians for motivations
    const motivationKeys = ['reproducibility', 'collaboration', 'transparency', 'mandateCompliance', 'increasedCitations', 'personalValues', 'communityExpectations'];
    motivationKeys.forEach(key => {
      const values = responses
        .map(r => r.motivations[key])
        .filter(v => v !== null && v !== undefined)
        .sort((a, b) => a - b);
      
      if (values.length > 0) {
        const mid = Math.floor(values.length / 2);
        medians.motivations[key] = values.length % 2 === 0 
          ? (values[mid - 1] + values[mid]) / 2 
          : values[mid];
      }
    });
    
    // Calculate medians for barriers
    const barrierKeys = ['timeConstraints', 'privacyConcerns', 'competitiveAdvantage', 'lackOfIncentives', 'technicalChallenges', 'lackOfTraining', 'intellectualProperty', 'institutionalPolicy'];
    barrierKeys.forEach(key => {
      const values = responses
        .map(r => r.barriers[key])
        .filter(v => v !== null && v !== undefined)
        .sort((a, b) => a - b);
      
      if (values.length > 0) {
        const mid = Math.floor(values.length / 2);
        medians.barriers[key] = values.length % 2 === 0 
          ? (values[mid - 1] + values[mid]) / 2 
          : values[mid];
      }
    });
    
    return medians;
  }

  private calculateModes(responses: ProcessedResponse[]): any {
    const modes: any = {
      institutional: {}
    };
    
    const institutionalKeys = ['policyExists', 'mandateExists', 'trainingProvided', 'supportStaffAvailable', 'fundingSupport', 'repositoryAccess'];
    institutionalKeys.forEach(key => {
      const values = responses
        .map(r => r.institutionalSupport[key])
        .filter(v => v !== null && v !== undefined);
      
      if (values.length > 0) {
        const counts = values.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mode = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
        modes.institutional[key] = mode === 'true';
      }
    });
    
    return modes;
  }

  private standardizeResponseFormats(responses: ProcessedResponse[]): ProcessedResponse[] {
    return responses.map(response => ({
      ...response,
      // Add standardized computed fields
      computedFields: {
        overallAttitudeScore: this.calculateOverallScore(response.attitudes),
        overallMotivationScore: this.calculateOverallScore(response.motivations),
        overallBarrierScore: this.calculateOverallScore(response.barriers),
        fairMaturityLevel: this.calculateFAIRMaturity(response.fairAwareness),
        institutionalSupportScore: this.calculateInstitutionalScore(response.institutionalSupport)
      }
    }));
  }

  private calculateOverallScore(scoreObject: any): number | null {
    const values = Object.values(scoreObject).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  private calculateFAIRMaturity(fairAwareness: any): string {
    const overallScore = this.calculateOverallScore(fairAwareness);
    
    if (overallScore === null) return 'Unknown';
    if (overallScore >= 4.5) return 'Expert';
    if (overallScore >= 3.5) return 'Advanced';
    if (overallScore >= 2.5) return 'Intermediate';
    if (overallScore >= 1.5) return 'Beginner';
    return 'Novice';
  }

  private calculateInstitutionalScore(institutionalSupport: any): number {
    const values = Object.values(institutionalSupport).filter(v => v !== null && v !== undefined) as boolean[];
    if (values.length === 0) return 0;
    
    const trueCount = values.filter(v => v === true).length;
    return Math.round((trueCount / values.length) * 100);
  }

  private standardizeAgeGroup(age: string): string {
    const ageMapping: Record<string, string> = {
      '18-24': '18-24',
      '25-34': '25-34',
      '35-44': '35-44',
      '45-54': '45-54',
      '55-64': '55-64',
      '65+': '65+'
    };
    
    return ageMapping[age] || age;
  }

  private standardizeGender(gender: string): string {
    const genderMapping: Record<string, string> = {
      'Male': 'Male',
      'Female': 'Female',
      'Non-binary': 'Non-binary',
      'Other': 'Other',
      'Prefer not to say': 'Prefer not to say'
    };
    
    return genderMapping[gender] || gender;
  }

  private standardizeCountry(country: string): string {
    // This would contain a comprehensive country mapping
    // For now, return as-is
    return country;
  }

  private standardizeDiscipline(discipline: string): string {
    const disciplineMapping: Record<string, string> = {
      'Life Sciences': 'Life Sciences',
      'Physical Sciences': 'Physical Sciences',
      'Engineering': 'Engineering',
      'Social Sciences': 'Social Sciences',
      'Humanities': 'Humanities',
      'Mathematics': 'Mathematics',
      'Other': 'Other'
    };
    
    return disciplineMapping[discipline] || discipline;
  }

  private normalizeToLikertScale(value: any): number {
    if (typeof value === 'number') {
      return Math.max(1, Math.min(5, Math.round(value)));
    }
    return value;
  }

  private normalizeToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    return false;
  }
}