import type { Demographics, QuestionMapping } from '../types';

export class DemographicProcessor {
  private ageMapping: Record<string, string> = {
    // Standardized age groups
    '18-24': '18-24',
    '25-34': '25-34',
    '35-44': '35-44',
    '45-54': '45-54',
    '55-64': '55-64',
    '65+': '65+',
    'Under 18': '<18',
    'Over 65': '65+',
    'Prefer not to say': 'Prefer not to say'
  };

  private genderMapping: Record<string, string> = {
    'Male': 'Male',
    'Female': 'Female',
    'Non-binary': 'Non-binary',
    'Other': 'Other',
    'Prefer not to say': 'Prefer not to say',
    'Prefer not to answer': 'Prefer not to say'
  };

  private disciplineMapping: Record<string, string> = {
    // Life Sciences
    'Life Sciences': 'Life Sciences',
    'Biology': 'Life Sciences',
    'Medicine': 'Life Sciences',
    'Biomedical Sciences': 'Life Sciences',
    'Health Sciences': 'Life Sciences',
    'Neuroscience': 'Life Sciences',
    'Genetics': 'Life Sciences',
    
    // Physical Sciences
    'Physical Sciences': 'Physical Sciences',
    'Physics': 'Physical Sciences',
    'Chemistry': 'Physical Sciences',
    'Earth Sciences': 'Physical Sciences',
    'Astronomy': 'Physical Sciences',
    'Materials Science': 'Physical Sciences',
    
    // Engineering
    'Engineering': 'Engineering',
    'Computer Science': 'Engineering',
    'Information Technology': 'Engineering',
    'Data Science': 'Engineering',
    
    // Social Sciences
    'Social Sciences': 'Social Sciences',
    'Psychology': 'Social Sciences',
    'Sociology': 'Social Sciences',
    'Economics': 'Social Sciences',
    'Political Science': 'Social Sciences',
    'Anthropology': 'Social Sciences',
    
    // Humanities
    'Humanities': 'Humanities',
    'History': 'Humanities',
    'Literature': 'Humanities',
    'Philosophy': 'Humanities',
    'Arts': 'Humanities',
    
    // Mathematics
    'Mathematics': 'Mathematics',
    'Statistics': 'Mathematics',
    
    // Other
    'Other': 'Other',
    'Interdisciplinary': 'Other'
  };

  private jobTitleMapping: Record<string, string> = {
    // Academic positions
    'Professor': 'Professor',
    'Associate Professor': 'Associate Professor',
    'Assistant Professor': 'Assistant Professor',
    'Lecturer': 'Lecturer',
    'Senior Lecturer': 'Lecturer',
    'Research Fellow': 'Research Fellow',
    'Postdoc': 'Postdoc',
    'Postdoctoral Researcher': 'Postdoc',
    'PhD Student': 'PhD Student',
    'Graduate Student': 'Graduate Student',
    'Research Student': 'Graduate Student',
    'Undergraduate Student': 'Undergraduate Student',
    
    // Industry/Government
    'Researcher': 'Researcher',
    'Data Scientist': 'Data Scientist',
    'Research Analyst': 'Research Analyst',
    'Consultant': 'Consultant',
    'Manager': 'Manager',
    
    // Other
    'Other': 'Other',
    'Retired': 'Other'
  };

  private countryMapping: Record<string, string> = {
    // Major countries - standardized names
    'United States': 'United States',
    'USA': 'United States',
    'US': 'United States',
    'United Kingdom': 'United Kingdom',
    'UK': 'United Kingdom',
    'Germany': 'Germany',
    'Canada': 'Canada',
    'Australia': 'Australia',
    'France': 'France',
    'Netherlands': 'Netherlands',
    'Switzerland': 'Switzerland',
    'Sweden': 'Sweden',
    'Norway': 'Norway',
    'Denmark': 'Denmark',
    'Finland': 'Finland',
    'Italy': 'Italy',
    'Spain': 'Spain',
    'Brazil': 'Brazil',
    'Japan': 'Japan',
    'China': 'China',
    'India': 'India',
    'South Africa': 'South Africa',
    'Other': 'Other'
  };

  process(rawData: Record<string, any>, year: number, questionMappings: QuestionMapping[]): Demographics {
    const demographics: Demographics = {};

    // Process age
    const age = this.extractAge(rawData, year);
    if (age) {
      demographics.age = this.standardizeAge(age);
    }

    // Process gender
    const gender = this.extractGender(rawData, year);
    if (gender) {
      demographics.gender = this.standardizeGender(gender);
    }

    // Process country
    const country = this.extractCountry(rawData, year);
    if (country) {
      demographics.country = this.standardizeCountry(country);
      demographics.region = this.getRegionFromCountry(country);
    }

    // Process discipline
    const discipline = this.extractDiscipline(rawData, year);
    if (discipline) {
      demographics.discipline = this.standardizeDiscipline(discipline);
    }

    // Process job title
    const jobTitle = this.extractJobTitle(rawData, year);
    if (jobTitle) {
      demographics.jobTitle = this.standardizeJobTitle(jobTitle);
      demographics.careerStage = this.getCareerStageFromJobTitle(jobTitle);
    }

    // Process institution type
    const institutionType = this.extractInstitutionType(rawData, year);
    if (institutionType) {
      demographics.institutionType = institutionType;
    }

    return demographics;
  }

  private extractAge(rawData: Record<string, any>, year: number): string | null {
    const ageFields = ['Age', 'age', 'Age Group', 'age_group'];
    
    for (const field of ageFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private extractGender(rawData: Record<string, any>, year: number): string | null {
    const genderFields = ['Gender', 'gender', 'Sex', 'sex'];
    
    for (const field of genderFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private extractCountry(rawData: Record<string, any>, year: number): string | null {
    const countryFields = ['Country', 'country', 'Country of residence', 'country_of_residence'];
    
    for (const field of countryFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private extractDiscipline(rawData: Record<string, any>, year: number): string | null {
    const disciplineFields = [
      'Research discipline', 'research_discipline', 'Discipline', 'discipline',
      'Field of study', 'field_of_study', 'Primary research area', 'primary_research_area'
    ];
    
    for (const field of disciplineFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private extractJobTitle(rawData: Record<string, any>, year: number): string | null {
    const jobTitleFields = [
      'Job title', 'job_title', 'Position', 'position',
      'Current position', 'current_position', 'Role', 'role'
    ];
    
    for (const field of jobTitleFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private extractInstitutionType(rawData: Record<string, any>, year: number): string | null {
    const institutionFields = [
      'Institution type', 'institution_type', 'Organization type', 'organization_type'
    ];
    
    for (const field of institutionFields) {
      if (rawData[field]) {
        return String(rawData[field]).trim();
      }
    }
    
    return null;
  }

  private standardizeAge(age: string): string {
    // Try exact match first
    if (this.ageMapping[age]) {
      return this.ageMapping[age];
    }

    // Try fuzzy matching
    const lowerAge = age.toLowerCase();
    for (const [key, value] of Object.entries(this.ageMapping)) {
      if (lowerAge.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerAge)) {
        return value;
      }
    }

    return age; // Return original if no match found
  }

  private standardizeGender(gender: string): string {
    // Try exact match first
    if (this.genderMapping[gender]) {
      return this.genderMapping[gender];
    }

    // Try fuzzy matching
    const lowerGender = gender.toLowerCase();
    for (const [key, value] of Object.entries(this.genderMapping)) {
      if (lowerGender.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerGender)) {
        return value;
      }
    }

    return gender; // Return original if no match found
  }

  private standardizeCountry(country: string): string {
    // Try exact match first
    if (this.countryMapping[country]) {
      return this.countryMapping[country];
    }

    // Try fuzzy matching
    const lowerCountry = country.toLowerCase();
    for (const [key, value] of Object.entries(this.countryMapping)) {
      if (lowerCountry.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCountry)) {
        return value;
      }
    }

    return country; // Return original if no match found
  }

  private standardizeDiscipline(discipline: string): string {
    // Try exact match first
    if (this.disciplineMapping[discipline]) {
      return this.disciplineMapping[discipline];
    }

    // Try fuzzy matching
    const lowerDiscipline = discipline.toLowerCase();
    for (const [key, value] of Object.entries(this.disciplineMapping)) {
      if (lowerDiscipline.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDiscipline)) {
        return value;
      }
    }

    return discipline; // Return original if no match found
  }

  private standardizeJobTitle(jobTitle: string): string {
    // Try exact match first
    if (this.jobTitleMapping[jobTitle]) {
      return this.jobTitleMapping[jobTitle];
    }

    // Try fuzzy matching
    const lowerJobTitle = jobTitle.toLowerCase();
    for (const [key, value] of Object.entries(this.jobTitleMapping)) {
      if (lowerJobTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerJobTitle)) {
        return value;
      }
    }

    return jobTitle; // Return original if no match found
  }

  private getRegionFromCountry(country: string): string {
    const regionMapping: Record<string, string> = {
      'United States': 'North America',
      'Canada': 'North America',
      'United Kingdom': 'Europe',
      'Germany': 'Europe',
      'France': 'Europe',
      'Netherlands': 'Europe',
      'Switzerland': 'Europe',
      'Sweden': 'Europe',
      'Norway': 'Europe',
      'Denmark': 'Europe',
      'Finland': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Australia': 'Oceania',
      'Japan': 'Asia',
      'China': 'Asia',
      'India': 'Asia',
      'Brazil': 'South America',
      'South Africa': 'Africa'
    };

    return regionMapping[country] || 'Other';
  }

  private getCareerStageFromJobTitle(jobTitle: string): string {
    const careerStageMapping: Record<string, string> = {
      'PhD Student': 'Early Career',
      'Graduate Student': 'Early Career',
      'Undergraduate Student': 'Early Career',
      'Postdoc': 'Early Career',
      'Research Fellow': 'Early Career',
      'Assistant Professor': 'Mid Career',
      'Lecturer': 'Mid Career',
      'Associate Professor': 'Senior',
      'Professor': 'Senior',
      'Manager': 'Senior'
    };

    return careerStageMapping[jobTitle] || 'Other';
  }
}