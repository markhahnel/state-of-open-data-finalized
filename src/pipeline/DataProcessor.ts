import * as XLSX from 'xlsx';
import type { 
  RawSurveyData, 
  ProcessedResponse, 
  HarmonizedDataset, 
  QuestionMapping, 
  ValidationResult,
  ProcessingStats
} from './types';
import { QuestionMapper } from './QuestionMapper';
import { DataHarmonizer } from './harmonizers/DataHarmonizer';
import { DemographicProcessor } from './processors/DemographicProcessor';
import { AttitudeProcessor } from './processors/AttitudeProcessor';
import { MotivationProcessor } from './processors/MotivationProcessor';
import { BarrierProcessor } from './processors/BarrierProcessor';
import { FAIRProcessor } from './processors/FAIRProcessor';
import { InstitutionalProcessor } from './processors/InstitutionalProcessor';
import { DataValidator } from './validators/DataValidator';
import { StatisticsGenerator } from './StatisticsGenerator';

export class DataProcessor {
  private questionMapper: QuestionMapper;
  private dataHarmonizer: DataHarmonizer;
  private demographicProcessor: DemographicProcessor;
  private attitudeProcessor: AttitudeProcessor;
  private motivationProcessor: MotivationProcessor;
  private barrierProcessor: BarrierProcessor;
  private fairProcessor: FAIRProcessor;
  private institutionalProcessor: InstitutionalProcessor;
  private dataValidator: DataValidator;
  private statisticsGenerator: StatisticsGenerator;

  constructor() {
    this.questionMapper = new QuestionMapper();
    this.dataHarmonizer = new DataHarmonizer();
    this.demographicProcessor = new DemographicProcessor();
    this.attitudeProcessor = new AttitudeProcessor();
    this.motivationProcessor = new MotivationProcessor();
    this.barrierProcessor = new BarrierProcessor();
    this.fairProcessor = new FAIRProcessor();
    this.institutionalProcessor = new InstitutionalProcessor();
    this.dataValidator = new DataValidator();
    this.statisticsGenerator = new StatisticsGenerator();
  }

  async processDirectory(directoryPath: string): Promise<HarmonizedDataset> {
    console.log('🚀 Starting data processing pipeline...');
    
    // Step 1: Load all survey files
    const rawData = await this.loadSurveyFiles(directoryPath);
    console.log(`📁 Loaded ${rawData.length} survey files`);
    
    // Step 2: Build question mappings
    const questionMappings = await this.questionMapper.buildMappings(rawData);
    console.log(`🗺️ Created ${questionMappings.length} question mappings`);
    
    // Step 3: Process and harmonize data
    const processedResponses: ProcessedResponse[] = [];
    const processingStats: ProcessingStats[] = [];
    
    for (const yearData of rawData) {
      console.log(`🔄 Processing ${yearData.year} (${yearData.rowCount} responses)...`);
      
      const yearResponses = await this.processYearData(yearData, questionMappings);
      const yearStats = this.statisticsGenerator.generateYearStats(yearData, yearResponses);
      
      processedResponses.push(...yearResponses);
      processingStats.push(yearStats);
      
      console.log(`✅ Processed ${yearResponses.length} valid responses for ${yearData.year}`);
    }
    
    // Step 4: Validate data integrity
    const validationResult = this.dataValidator.validateDataset(processedResponses);
    if (!validationResult.isValid) {
      console.warn('⚠️ Data validation issues detected:', validationResult.errors);
    }
    
    // Step 5: Generate final dataset
    const harmonizedDataset: HarmonizedDataset = {
      responses: processedResponses,
      metadata: {
        totalResponses: processedResponses.length,
        yearRange: [
          Math.min(...rawData.map(d => d.year)),
          Math.max(...rawData.map(d => d.year))
        ],
        completenessScore: this.calculateCompleteness(processedResponses),
        processingDate: new Date(),
        sourceFiles: rawData.map(d => d.filename)
      },
      questionMappings,
      processingStats
    };
    
    console.log(`🎉 Processing complete! Generated ${harmonizedDataset.responses.length} harmonized responses`);
    return harmonizedDataset;
  }

  private async loadSurveyFiles(directoryPath: string): Promise<RawSurveyData[]> {
    const rawData: RawSurveyData[] = [];
    
    const filePaths = [
      'FINALOpenData2017anonrawdata20171110 (1).xlsx',
      'SoOD_2019_rawdata_anon_FIGSHARE SHARED (1).txt',
      'State of Open Data 2021_Master data_cleaned (1).xlsx',
      'State of Open Data 2022_data to share (1).xlsx',
      'Springer Nature_SOOD_clean_anonymised_data_2023_V1.xlsx',
      'State of Open Data 2024 - Data.xlsx',
      'AnonFullDataFigshareSurvey (1).xlsx',
      'Master data_cleaned (1).xlsx'
    ];
    
    for (const filename of filePaths) {
      const fullPath = `${directoryPath}/${filename}`;
      
      try {
        let data: RawSurveyData;
        
        if (filename.endsWith('.txt')) {
          data = await this.loadTxtFile(fullPath, filename);
        } else if (filename.endsWith('.xlsx')) {
          data = await this.loadExcelFile(fullPath, filename);
        } else {
          continue;
        }
        
        if (data.data.length > 0) {
          rawData.push(data);
        }
      } catch (error) {
        console.error(`Error loading ${filename}:`, error);
      }
    }
    
    return rawData;
  }

  private async loadExcelFile(filePath: string, filename: string): Promise<RawSurveyData> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      blankrows: false 
    }) as any[][];
    
    if (data.length === 0) {
      throw new Error(`No data found in ${filename}`);
    }
    
    const headers = data[0].map(h => String(h || '').trim());
    const rows = data.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || null;
      });
      return obj;
    });
    
    return {
      year: this.extractYear(filename),
      filename,
      data: rows,
      headers,
      rowCount: rows.length,
      source: 'excel'
    };
  }

  private async loadTxtFile(filePath: string, filename: string): Promise<RawSurveyData> {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error(`No data found in ${filename}`);
    }
    
    const headers = lines[0].split('\t').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || null;
      });
      return obj;
    });
    
    return {
      year: this.extractYear(filename),
      filename,
      data: rows,
      headers,
      rowCount: rows.length,
      source: 'csv'
    };
  }

  private extractYear(filename: string): number {
    const yearMatch = filename.match(/20\d{2}/);
    if (yearMatch) {
      return parseInt(yearMatch[0]);
    }
    
    // Handle special cases
    if (filename.includes('AnonFullDataFigshareSurvey')) return 2016;
    if (filename.includes('Master data_cleaned')) return 2020;
    
    return new Date().getFullYear();
  }

  private async processYearData(
    yearData: RawSurveyData, 
    questionMappings: QuestionMapping[]
  ): Promise<ProcessedResponse[]> {
    const processedResponses: ProcessedResponse[] = [];
    
    for (let i = 0; i < yearData.data.length; i++) {
      const rawResponse = yearData.data[i];
      
      try {
        const processedResponse: ProcessedResponse = {
          id: `${yearData.year}_${i}`,
          year: yearData.year,
          demographics: this.demographicProcessor.process(rawResponse, yearData.year, questionMappings),
          attitudes: this.attitudeProcessor.process(rawResponse, yearData.year, questionMappings),
          motivations: this.motivationProcessor.process(rawResponse, yearData.year, questionMappings),
          barriers: this.barrierProcessor.process(rawResponse, yearData.year, questionMappings),
          fairAwareness: this.fairProcessor.process(rawResponse, yearData.year, questionMappings),
          institutionalSupport: this.institutionalProcessor.process(rawResponse, yearData.year, questionMappings),
          rawData: rawResponse
        };
        
        processedResponses.push(processedResponse);
      } catch (error) {
        console.warn(`Error processing response ${i} for year ${yearData.year}:`, error);
      }
    }
    
    return processedResponses;
  }

  private calculateCompleteness(responses: ProcessedResponse[]): number {
    if (responses.length === 0) return 0;
    
    const totalFields = responses.length * 6; // 6 main categories
    let completedFields = 0;
    
    responses.forEach(response => {
      if (Object.keys(response.demographics).length > 0) completedFields++;
      if (Object.keys(response.attitudes).length > 0) completedFields++;
      if (Object.keys(response.motivations).length > 0) completedFields++;
      if (Object.keys(response.barriers).length > 0) completedFields++;
      if (Object.keys(response.fairAwareness).length > 0) completedFields++;
      if (Object.keys(response.institutionalSupport).length > 0) completedFields++;
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }
}