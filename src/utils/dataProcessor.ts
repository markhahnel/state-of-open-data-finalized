import * as XLSX from 'xlsx';
import type { DataFile, SheetInfo, ColumnInfo, DataInventory, QualityAssessment, QuestionMapping } from '../types';

export class DataProcessor {
  private files: DataFile[] = [];
  private dataInventory: DataInventory | null = null;

  async processExcelFile(file: File): Promise<DataFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const sheets: SheetInfo[] = workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const columns: ColumnInfo[] = [];
            if (jsonData.length > 0) {
              const headers = jsonData[0] as string[];
              headers.forEach((header, index) => {
                const columnData = jsonData.slice(1).map(row => (row as any[])[index]);
                const sampleValues = columnData.slice(0, 5).filter(val => val !== undefined);
                
                columns.push({
                  name: header || `Column ${index + 1}`,
                  type: this.inferColumnType(columnData),
                  sampleValues: sampleValues.map(val => String(val)),
                });
              });
            }
            
            return {
              name: sheetName,
              rowCount: jsonData.length - 1,
              columns,
            };
          });
          
          const dataFile: DataFile = {
            filename: file.name,
            year: this.extractYearFromFilename(file.name),
            type: 'excel',
            sheets,
            structure: {
              totalRows: sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
              totalColumns: sheets.reduce((sum, sheet) => sum + sheet.columns.length, 0),
              sheets,
            },
          };
          
          resolve(dataFile);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }

  private inferColumnType(data: any[]): string {
    const nonEmptyData = data.filter(val => val !== undefined && val !== null && val !== '');
    
    if (nonEmptyData.length === 0) return 'empty';
    
    const numericCount = nonEmptyData.filter(val => !isNaN(Number(val))).length;
    const dateCount = nonEmptyData.filter(val => !isNaN(Date.parse(val))).length;
    
    if (numericCount / nonEmptyData.length > 0.8) return 'numeric';
    if (dateCount / nonEmptyData.length > 0.8) return 'date';
    
    return 'text';
  }

  private extractYearFromFilename(filename: string): number {
    const yearMatch = filename.match(/20\d{2}/);
    return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
  }

  async processDirectory(files: File[]): Promise<DataInventory> {
    this.files = [];
    
    for (const file of files) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const dataFile = await this.processExcelFile(file);
          this.files.push(dataFile);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
        }
      }
    }
    
    const qualityAssessment = this.assessDataQuality();
    const questionMappings = this.mapCommonQuestions();
    
    this.dataInventory = {
      files: this.files,
      questions: questionMappings,
      qualityAssessment,
    };
    
    return this.dataInventory;
  }

  private assessDataQuality(): QualityAssessment {
    const years = this.files.map(f => f.year).filter(year => year > 0);
    const yearRange: [number, number] = years.length > 0 
      ? [Math.min(...years), Math.max(...years)]
      : [0, 0];
    
    const totalResponses = this.files.reduce((sum, file) => {
      return sum + (file.structure?.totalRows || 0);
    }, 0);
    
    const expectedFiles = yearRange[1] - yearRange[0] + 1;
    const actualFiles = this.files.length;
    const completenessScore = Math.round((actualFiles / expectedFiles) * 100);
    
    const dataIssues: string[] = [];
    if (completenessScore < 100) {
      dataIssues.push(`Missing data for ${expectedFiles - actualFiles} years`);
    }
    
    this.files.forEach(file => {
      if ((file.structure?.totalRows || 0) < 100) {
        dataIssues.push(`Low response count in ${file.filename}`);
      }
    });
    
    return {
      totalFiles: this.files.length,
      totalResponses,
      yearRange,
      completenessScore,
      commonQuestions: this.identifyCommonQuestions(),
      dataIssues,
    };
  }

  private mapCommonQuestions(): QuestionMapping[] {
    const questionMap = new Map<string, QuestionMapping>();
    
    this.files.forEach(file => {
      file.sheets?.forEach(sheet => {
        sheet.columns.forEach(column => {
          const normalizedQuestion = this.normalizeQuestionText(column.name);
          const category = this.categorizeQuestion(column.name);
          
          if (!questionMap.has(normalizedQuestion)) {
            questionMap.set(normalizedQuestion, {
              questionId: this.generateQuestionId(normalizedQuestion),
              questionText: column.name,
              category,
              years: [],
              columnMappings: {},
            });
          }
          
          const mapping = questionMap.get(normalizedQuestion)!;
          if (!mapping.years.includes(file.year)) {
            mapping.years.push(file.year);
          }
          mapping.columnMappings[file.year] = column.name;
        });
      });
    });
    
    return Array.from(questionMap.values())
      .filter(mapping => mapping.years.length > 1)
      .sort((a, b) => b.years.length - a.years.length);
  }

  private identifyCommonQuestions(): QuestionMapping[] {
    return this.mapCommonQuestions().slice(0, 10);
  }

  private normalizeQuestionText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private categorizeQuestion(questionText: string): string {
    const text = questionText.toLowerCase();
    
    if (text.includes('motivat') || text.includes('reason') || text.includes('why')) {
      return 'motivations';
    }
    if (text.includes('barrier') || text.includes('challenge') || text.includes('obstacle')) {
      return 'barriers';
    }
    if (text.includes('tool') || text.includes('platform') || text.includes('repository')) {
      return 'tools';
    }
    if (text.includes('policy') || text.includes('practice') || text.includes('procedure')) {
      return 'policies';
    }
    if (text.includes('age') || text.includes('gender') || text.includes('country') || text.includes('discipline')) {
      return 'demographics';
    }
    
    return 'general';
  }

  private generateQuestionId(normalizedText: string): string {
    return normalizedText.replace(/\s+/g, '-').substring(0, 50);
  }

  getDataInventory(): DataInventory | null {
    return this.dataInventory;
  }
}