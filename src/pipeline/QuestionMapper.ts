import type { RawSurveyData, QuestionMapping } from './types';

export class QuestionMapper {
  private questionMappings: QuestionMapping[] = [];

  async buildMappings(rawData: RawSurveyData[]): Promise<QuestionMapping[]> {
    console.log('🗺️ Building question mappings...');
    
    // Initialize core mappings based on our analysis
    this.initializeCoreQuestionMappings();
    
    // Analyze headers across all years to identify patterns
    const headerAnalysis = this.analyzeHeaders(rawData);
    
    // Build mappings for each category
    this.buildDemographicMappings(headerAnalysis);
    this.buildAttitudeMappings(headerAnalysis);
    this.buildMotivationMappings(headerAnalysis);
    this.buildBarrierMappings(headerAnalysis);
    this.buildFAIRMappings(headerAnalysis);
    this.buildInstitutionalMappings(headerAnalysis);
    
    console.log(`✅ Built ${this.questionMappings.length} question mappings`);
    return this.questionMappings;
  }

  private initializeCoreQuestionMappings(): void {
    // Core attitude questions (most consistent across years)
    this.addMapping({
      id: 'attitude_open_access',
      category: 'attitudes',
      subcategory: 'open_access',
      question: 'Attitudes towards open access',
      responseType: 'likert',
      mappings: {
        2021: ['How do you feel about open access to research publications?'],
        2022: ['How do you feel about open access to research publications?'],
        2023: ['How do you feel about open access to research publications?'],
        2024: ['How do you feel about open access to research publications?']
      }
    });

    this.addMapping({
      id: 'attitude_open_data',
      category: 'attitudes',
      subcategory: 'open_data',
      question: 'Attitudes towards open data',
      responseType: 'likert',
      mappings: {
        2021: ['How do you feel about open data?'],
        2022: ['How do you feel about open data?'],
        2023: ['How do you feel about open data?'],
        2024: ['How do you feel about open data?']
      }
    });

    this.addMapping({
      id: 'attitude_open_peer_review',
      category: 'attitudes',
      subcategory: 'open_peer_review',
      question: 'Attitudes towards open peer review',
      responseType: 'likert',
      mappings: {
        2021: ['How do you feel about open peer review?'],
        2022: ['How do you feel about open peer review?'],
        2023: ['How do you feel about open peer review?'],
        2024: ['How do you feel about open peer review?']
      }
    });

    this.addMapping({
      id: 'attitude_preprints',
      category: 'attitudes',
      subcategory: 'preprints',
      question: 'Attitudes towards preprints',
      responseType: 'likert',
      mappings: {
        2021: ['How do you feel about preprints?'],
        2022: ['How do you feel about preprints?'],
        2023: ['How do you feel about preprints?'],
        2024: ['How do you feel about preprints?']
      }
    });
  }

  private analyzeHeaders(rawData: RawSurveyData[]): Record<number, string[]> {
    const headersByYear: Record<number, string[]> = {};
    
    rawData.forEach(data => {
      headersByYear[data.year] = data.headers;
    });
    
    return headersByYear;
  }

  private buildDemographicMappings(headerAnalysis: Record<number, string[]>): void {
    // Age mappings
    this.addMapping({
      id: 'demo_age',
      category: 'demographics',
      subcategory: 'age',
      question: 'Age',
      responseType: 'multiple_choice',
      mappings: {
        2017: ['Age'],
        2019: ['Age'],
        2021: ['Age'],
        2022: ['Age'],
        2023: ['Age'],
        2024: ['Age']
      }
    });

    // Gender mappings
    this.addMapping({
      id: 'demo_gender',
      category: 'demographics',
      subcategory: 'gender',
      question: 'Gender',
      responseType: 'multiple_choice',
      mappings: {
        2017: ['Gender'],
        2019: ['Gender'],
        2021: ['Gender'],
        2022: ['Gender'],
        2023: ['Gender'],
        2024: ['Gender']
      }
    });

    // Country mappings
    this.addMapping({
      id: 'demo_country',
      category: 'demographics',
      subcategory: 'country',
      question: 'Country',
      responseType: 'multiple_choice',
      mappings: {
        2017: ['Country'],
        2019: ['Country'],
        2021: ['Country'],
        2022: ['Country'],
        2023: ['Country'],
        2024: ['Country']
      }
    });

    // Discipline mappings
    this.addMapping({
      id: 'demo_discipline',
      category: 'demographics',
      subcategory: 'discipline',
      question: 'Research discipline',
      responseType: 'multiple_choice',
      mappings: {
        2017: ['Research discipline'],
        2019: ['Research discipline'],
        2021: ['Research discipline'],
        2022: ['Research discipline'],
        2023: ['Research discipline'],
        2024: ['Research discipline']
      }
    });

    // Job title mappings
    this.addMapping({
      id: 'demo_job_title',
      category: 'demographics',
      subcategory: 'job_title',
      question: 'Job title',
      responseType: 'multiple_choice',
      mappings: {
        2017: ['Job title'],
        2019: ['Job title'],
        2021: ['Job title'],
        2022: ['Job title'],
        2023: ['Job title'],
        2024: ['Job title']
      }
    });
  }

  private buildAttitudeMappings(headerAnalysis: Record<number, string[]>): void {
    // Attitudes are already initialized in initializeCoreQuestionMappings
    // This method can be extended for additional attitude questions
  }

  private buildMotivationMappings(headerAnalysis: Record<number, string[]>): void {
    // Reproducibility motivation
    this.addMapping({
      id: 'motivation_reproducibility',
      category: 'motivations',
      subcategory: 'reproducibility',
      question: 'Motivation: Reproducibility',
      responseType: 'likert',
      mappings: {
        2017: ['Reproducibility'],
        2019: ['Reproducibility'],
        2021: ['Reproducibility'],
        2022: ['Reproducibility']
      }
    });

    // Collaboration motivation
    this.addMapping({
      id: 'motivation_collaboration',
      category: 'motivations',
      subcategory: 'collaboration',
      question: 'Motivation: Collaboration',
      responseType: 'likert',
      mappings: {
        2017: ['Collaboration'],
        2019: ['Collaboration'],
        2021: ['Collaboration'],
        2022: ['Collaboration']
      }
    });

    // Transparency motivation
    this.addMapping({
      id: 'motivation_transparency',
      category: 'motivations',
      subcategory: 'transparency',
      question: 'Motivation: Transparency',
      responseType: 'likert',
      mappings: {
        2017: ['Transparency'],
        2019: ['Transparency'],
        2021: ['Transparency'],
        2022: ['Transparency']
      }
    });
  }

  private buildBarrierMappings(headerAnalysis: Record<number, string[]>): void {
    // Time constraints barrier
    this.addMapping({
      id: 'barrier_time',
      category: 'barriers',
      subcategory: 'time_constraints',
      question: 'Barrier: Time constraints',
      responseType: 'likert',
      mappings: {
        2017: ['Time constraints'],
        2019: ['Time constraints'],
        2021: ['Time constraints'],
        2022: ['Time constraints']
      }
    });

    // Privacy concerns barrier
    this.addMapping({
      id: 'barrier_privacy',
      category: 'barriers',
      subcategory: 'privacy_concerns',
      question: 'Barrier: Privacy concerns',
      responseType: 'likert',
      mappings: {
        2017: ['Privacy concerns'],
        2019: ['Privacy concerns'],
        2021: ['Privacy concerns'],
        2022: ['Privacy concerns']
      }
    });

    // Competitive advantage barrier
    this.addMapping({
      id: 'barrier_competitive',
      category: 'barriers',
      subcategory: 'competitive_advantage',
      question: 'Barrier: Competitive advantage',
      responseType: 'likert',
      mappings: {
        2017: ['Competitive advantage'],
        2019: ['Competitive advantage'],
        2021: ['Competitive advantage'],
        2022: ['Competitive advantage']
      }
    });
  }

  private buildFAIRMappings(headerAnalysis: Record<number, string[]>): void {
    // FAIR principles awareness
    this.addMapping({
      id: 'fair_awareness',
      category: 'fair',
      subcategory: 'awareness',
      question: 'FAIR principles awareness',
      responseType: 'likert',
      mappings: {
        2019: ['FAIR principles awareness'],
        2021: ['FAIR principles awareness'],
        2022: ['FAIR principles awareness'],
        2023: ['FAIR principles awareness']
      }
    });

    // FAIR implementation
    this.addMapping({
      id: 'fair_implementation',
      category: 'fair',
      subcategory: 'implementation',
      question: 'FAIR principles implementation',
      responseType: 'likert',
      mappings: {
        2019: ['FAIR principles implementation'],
        2021: ['FAIR principles implementation'],
        2022: ['FAIR principles implementation'],
        2023: ['FAIR principles implementation']
      }
    });
  }

  private buildInstitutionalMappings(headerAnalysis: Record<number, string[]>): void {
    // Institutional policy
    this.addMapping({
      id: 'institutional_policy',
      category: 'institutional',
      subcategory: 'policy',
      question: 'Institutional data policy exists',
      responseType: 'boolean',
      mappings: {
        2017: ['Institutional data policy'],
        2019: ['Institutional data policy'],
        2021: ['Institutional data policy'],
        2022: ['Institutional data policy'],
        2023: ['Institutional data policy']
      }
    });

    // Institutional support
    this.addMapping({
      id: 'institutional_support',
      category: 'institutional',
      subcategory: 'support',
      question: 'Institutional support available',
      responseType: 'boolean',
      mappings: {
        2017: ['Institutional support'],
        2019: ['Institutional support'],
        2021: ['Institutional support'],
        2022: ['Institutional support'],
        2023: ['Institutional support']
      }
    });
  }

  private addMapping(mapping: QuestionMapping): void {
    this.questionMappings.push(mapping);
  }

  getMapping(id: string): QuestionMapping | undefined {
    return this.questionMappings.find(m => m.id === id);
  }

  getMappingsByCategory(category: string): QuestionMapping[] {
    return this.questionMappings.filter(m => m.category === category);
  }

  findBestMatch(header: string, year: number): QuestionMapping | undefined {
    const normalizedHeader = this.normalizeHeader(header);
    
    for (const mapping of this.questionMappings) {
      const yearMappings = mapping.mappings[year];
      if (yearMappings) {
        for (const mappedHeader of yearMappings) {
          const normalizedMapped = this.normalizeHeader(mappedHeader);
          if (normalizedHeader.includes(normalizedMapped) || normalizedMapped.includes(normalizedHeader)) {
            return mapping;
          }
        }
      }
    }
    
    return undefined;
  }

  private normalizeHeader(header: string): string {
    return header.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}