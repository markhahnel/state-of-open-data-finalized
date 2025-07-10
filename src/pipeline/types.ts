export interface RawSurveyData {
  year: number;
  filename: string;
  data: Record<string, any>[];
  headers: string[];
  rowCount: number;
  source: 'excel' | 'csv';
}

export interface ProcessedResponse {
  id: string;
  year: number;
  timestamp?: Date;
  demographics: Demographics;
  attitudes: Attitudes;
  motivations: Motivations;
  barriers: Barriers;
  fairAwareness: FAIRAwareness;
  institutionalSupport: InstitutionalSupport;
  rawData: Record<string, any>;
}

export interface Demographics {
  age?: string;
  gender?: string;
  country?: string;
  region?: string;
  discipline?: string;
  jobTitle?: string;
  careerStage?: string;
  yearsExperience?: number;
  institutionType?: string;
  sectorType?: string;
}

export interface Attitudes {
  openAccess?: number;
  openData?: number;
  openPeerReview?: number;
  preprints?: number;
  openScience?: number;
  dataSharing?: number;
}

export interface Motivations {
  reproducibility?: number;
  collaboration?: number;
  transparency?: number;
  mandateCompliance?: number;
  increasedCitations?: number;
  personalValues?: number;
  communityExpectations?: number;
}

export interface Barriers {
  timeConstraints?: number;
  privacyConcerns?: number;
  competitiveAdvantage?: number;
  lackOfIncentives?: number;
  technicalChallenges?: number;
  lackOfTraining?: number;
  intellectualProperty?: number;
  institutionalPolicy?: number;
}

export interface FAIRAwareness {
  findable?: number;
  accessible?: number;
  interoperable?: number;
  reusable?: number;
  overallAwareness?: number;
  implementation?: number;
}

export interface InstitutionalSupport {
  policyExists?: boolean;
  mandateExists?: boolean;
  trainingProvided?: boolean;
  supportStaffAvailable?: boolean;
  fundingSupport?: boolean;
  repositoryAccess?: boolean;
}

export interface QuestionMapping {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  mappings: Record<number, string[]>;
  responseType: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean';
  standardizedResponses?: Record<string, any>;
}

export interface ProcessingStats {
  year: number;
  totalRows: number;
  validRows: number;
  missingDataRate: number;
  completenessScore: number;
  fieldStats: Record<string, FieldStats>;
}

export interface FieldStats {
  fieldName: string;
  totalResponses: number;
  validResponses: number;
  missingCount: number;
  missingRate: number;
  uniqueValues: number;
  topValues: Array<{value: any, count: number}>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: ProcessingStats;
}

export interface HarmonizedDataset {
  responses: ProcessedResponse[];
  metadata: {
    totalResponses: number;
    yearRange: [number, number];
    completenessScore: number;
    processingDate: Date;
    sourceFiles: string[];
  };
  questionMappings: QuestionMapping[];
  processingStats: ProcessingStats[];
}