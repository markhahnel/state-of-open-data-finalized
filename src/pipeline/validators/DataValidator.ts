import type { ProcessedResponse, ValidationResult, ProcessingStats, FieldStats } from '../types';

export class DataValidator {
  private validationRules: Record<string, any> = {
    attitudes: {
      range: [1, 5],
      required: false,
      type: 'number'
    },
    motivations: {
      range: [1, 5],
      required: false,
      type: 'number'
    },
    barriers: {
      range: [1, 5],
      required: false,
      type: 'number'
    },
    fairAwareness: {
      range: [1, 5],
      required: false,
      type: 'number'
    },
    institutionalSupport: {
      required: false,
      type: 'boolean'
    },
    demographics: {
      required: false,
      type: 'string'
    }
  };

  validateDataset(responses: ProcessedResponse[]): ValidationResult {
    console.log('🔍 Validating dataset integrity...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    // Basic dataset checks
    if (responses.length === 0) {
      errors.push('Dataset is empty');
      isValid = false;
    }

    // Year distribution checks
    const yearDistribution = this.analyzeYearDistribution(responses);
    if (yearDistribution.gaps.length > 0) {
      warnings.push(`Missing data for years: ${yearDistribution.gaps.join(', ')}`);
    }

    // Data quality checks for each response
    const qualityResults = this.validateResponseQuality(responses);
    errors.push(...qualityResults.errors);
    warnings.push(...qualityResults.warnings);
    
    if (qualityResults.errors.length > 0) {
      isValid = false;
    }

    // Generate processing statistics
    const stats = this.generateProcessingStats(responses);

    // Overall data completeness check
    if (stats.completenessScore < 50) {
      warnings.push(`Low data completeness: ${stats.completenessScore}%`);
    }

    console.log(`✅ Validation complete. Valid: ${isValid}, Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return {
      isValid,
      errors,
      warnings,
      stats
    };
  }

  private analyzeYearDistribution(responses: ProcessedResponse[]): {
    years: number[],
    gaps: number[],
    distribution: Record<number, number>
  } {
    const years = [...new Set(responses.map(r => r.year))].sort();
    const distribution: Record<number, number> = {};
    
    // Count responses per year
    responses.forEach(response => {
      distribution[response.year] = (distribution[response.year] || 0) + 1;
    });

    // Identify gaps
    const gaps: number[] = [];
    if (years.length > 1) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      
      for (let year = minYear; year <= maxYear; year++) {
        if (!years.includes(year)) {
          gaps.push(year);
        }
      }
    }

    return { years, gaps, distribution };
  }

  private validateResponseQuality(responses: ProcessedResponse[]): {
    errors: string[],
    warnings: string[]
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let invalidResponses = 0;
    let lowQualityResponses = 0;

    responses.forEach((response, index) => {
      const responseErrors = this.validateSingleResponse(response, index);
      
      if (responseErrors.length > 0) {
        invalidResponses++;
        if (responseErrors.some(e => e.includes('Invalid'))) {
          errors.push(`Response ${index}: ${responseErrors.join(', ')}`);
        } else {
          warnings.push(`Response ${index}: ${responseErrors.join(', ')}`);
        }
      }

      // Check response completeness
      const completenessScore = this.calculateResponseCompleteness(response);
      if (completenessScore < 25) {
        lowQualityResponses++;
      }
    });

    // Aggregate warnings
    if (invalidResponses > responses.length * 0.1) {
      warnings.push(`High number of invalid responses: ${invalidResponses}/${responses.length} (${Math.round(invalidResponses/responses.length*100)}%)`);
    }

    if (lowQualityResponses > responses.length * 0.2) {
      warnings.push(`High number of low-quality responses: ${lowQualityResponses}/${responses.length} (${Math.round(lowQualityResponses/responses.length*100)}%)`);
    }

    return { errors, warnings };
  }

  private validateSingleResponse(response: ProcessedResponse, index: number): string[] {
    const errors: string[] = [];

    // Validate ID
    if (!response.id || response.id.trim() === '') {
      errors.push('Missing or empty ID');
    }

    // Validate year
    if (!response.year || response.year < 2010 || response.year > new Date().getFullYear()) {
      errors.push(`Invalid year: ${response.year}`);
    }

    // Validate attitudes
    const attitudeErrors = this.validateNumericFields(response.attitudes, 'attitudes', [1, 5]);
    errors.push(...attitudeErrors);

    // Validate motivations
    const motivationErrors = this.validateNumericFields(response.motivations, 'motivations', [1, 5]);
    errors.push(...motivationErrors);

    // Validate barriers
    const barrierErrors = this.validateNumericFields(response.barriers, 'barriers', [1, 5]);
    errors.push(...barrierErrors);

    // Validate FAIR awareness
    const fairErrors = this.validateNumericFields(response.fairAwareness, 'fairAwareness', [1, 5]);
    errors.push(...fairErrors);

    // Validate institutional support
    const institutionalErrors = this.validateBooleanFields(response.institutionalSupport, 'institutionalSupport');
    errors.push(...institutionalErrors);

    return errors;
  }

  private validateNumericFields(fields: any, category: string, range: [number, number]): string[] {
    const errors: string[] = [];
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'number') {
          errors.push(`${category}.${key}: Expected number, got ${typeof value}`);
        } else if (value < range[0] || value > range[1]) {
          errors.push(`${category}.${key}: Value ${value} outside valid range [${range[0]}, ${range[1]}]`);
        }
      }
    });

    return errors;
  }

  private validateBooleanFields(fields: any, category: string): string[] {
    const errors: string[] = [];
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && typeof value !== 'boolean') {
        errors.push(`${category}.${key}: Expected boolean, got ${typeof value}`);
      }
    });

    return errors;
  }

  private calculateResponseCompleteness(response: ProcessedResponse): number {
    const categories = [
      response.demographics,
      response.attitudes,
      response.motivations,
      response.barriers,
      response.fairAwareness,
      response.institutionalSupport
    ];

    let totalFields = 0;
    let completedFields = 0;

    categories.forEach(category => {
      Object.entries(category).forEach(([key, value]) => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          completedFields++;
        }
      });
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }

  private generateProcessingStats(responses: ProcessedResponse[]): ProcessingStats {
    const totalRows = responses.length;
    const validRows = responses.filter(r => this.validateSingleResponse(r, 0).length === 0).length;
    
    // Calculate overall completeness
    const completenessScores = responses.map(r => this.calculateResponseCompleteness(r));
    const completenessScore = completenessScores.length > 0 
      ? Math.round(completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length)
      : 0;

    // Calculate missing data rate
    const missingDataRate = Math.round(((totalRows - validRows) / totalRows) * 100);

    // Generate field statistics
    const fieldStats = this.generateFieldStats(responses);

    return {
      year: 0, // Overall stats
      totalRows,
      validRows,
      missingDataRate,
      completenessScore,
      fieldStats
    };
  }

  private generateFieldStats(responses: ProcessedResponse[]): Record<string, FieldStats> {
    const fieldStats: Record<string, FieldStats> = {};

    // Analyze each field category
    this.analyzeFieldCategory(responses, 'demographics', fieldStats);
    this.analyzeFieldCategory(responses, 'attitudes', fieldStats);
    this.analyzeFieldCategory(responses, 'motivations', fieldStats);
    this.analyzeFieldCategory(responses, 'barriers', fieldStats);
    this.analyzeFieldCategory(responses, 'fairAwareness', fieldStats);
    this.analyzeFieldCategory(responses, 'institutionalSupport', fieldStats);

    return fieldStats;
  }

  private analyzeFieldCategory(
    responses: ProcessedResponse[], 
    category: string, 
    fieldStats: Record<string, FieldStats>
  ): void {
    const categoryData = responses.map(r => (r as any)[category]);
    
    // Get all unique field names in this category
    const allFields = new Set<string>();
    categoryData.forEach(data => {
      Object.keys(data).forEach(field => allFields.add(field));
    });

    allFields.forEach(fieldName => {
      const values = categoryData.map(data => data[fieldName]).filter(v => v !== null && v !== undefined && v !== '');
      const totalResponses = responses.length;
      const validResponses = values.length;
      const missingCount = totalResponses - validResponses;
      const missingRate = Math.round((missingCount / totalResponses) * 100);

      // Count unique values
      const uniqueValues = new Set(values).size;

      // Get top values
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

  // Helper method to generate validation summary
  generateValidationSummary(validationResult: ValidationResult): string {
    const { isValid, errors, warnings, stats } = validationResult;
    
    let summary = `## Data Validation Summary\n\n`;
    summary += `**Status**: ${isValid ? '✅ Valid' : '❌ Invalid'}\n`;
    summary += `**Total Responses**: ${stats.totalRows.toLocaleString()}\n`;
    summary += `**Valid Responses**: ${stats.validRows.toLocaleString()}\n`;
    summary += `**Completeness Score**: ${stats.completenessScore}%\n`;
    summary += `**Missing Data Rate**: ${stats.missingDataRate}%\n\n`;

    if (errors.length > 0) {
      summary += `### Errors (${errors.length})\n`;
      errors.forEach(error => {
        summary += `- ${error}\n`;
      });
      summary += '\n';
    }

    if (warnings.length > 0) {
      summary += `### Warnings (${warnings.length})\n`;
      warnings.forEach(warning => {
        summary += `- ${warning}\n`;
      });
      summary += '\n';
    }

    return summary;
  }
}