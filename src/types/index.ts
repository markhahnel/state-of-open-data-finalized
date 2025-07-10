export interface SurveyData {
  year: number;
  responses: SurveyResponse[];
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  responses: Record<string, any>;
}

export interface DataFile {
  filename: string;
  year: number;
  type: 'excel' | 'csv' | 'documentation';
  sheets?: SheetInfo[];
  structure?: FileStructure;
}

export interface SheetInfo {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  sampleValues?: string[];
}

export interface FileStructure {
  totalRows: number;
  totalColumns: number;
  sheets: SheetInfo[];
}

export interface QuestionMapping {
  questionId: string;
  questionText: string;
  category: string;
  years: number[];
  columnMappings: Record<number, string>;
}

export interface DataInventory {
  files: DataFile[];
  questions: QuestionMapping[];
  qualityAssessment: QualityAssessment;
}

export interface QualityAssessment {
  totalFiles: number;
  totalResponses: number;
  yearRange: [number, number];
  completenessScore: number;
  commonQuestions: QuestionMapping[];
  dataIssues: string[];
}