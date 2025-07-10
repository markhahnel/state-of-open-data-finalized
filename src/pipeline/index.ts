export { DataProcessor } from './DataProcessor';
export { QuestionMapper } from './QuestionMapper';
export { DataHarmonizer } from './harmonizers/DataHarmonizer';
export { DataValidator } from './validators/DataValidator';
export { StatisticsGenerator } from './StatisticsGenerator';
export { DataExporter } from './exporters/DataExporter';

// Processors
export { DemographicProcessor } from './processors/DemographicProcessor';
export { AttitudeProcessor } from './processors/AttitudeProcessor';
export { MotivationProcessor } from './processors/MotivationProcessor';
export { BarrierProcessor } from './processors/BarrierProcessor';
export { FAIRProcessor } from './processors/FAIRProcessor';
export { InstitutionalProcessor } from './processors/InstitutionalProcessor';

// Types
export type * from './types';

// Main pipeline function
export async function processStateOfOpenDataSurvey(
  dataDirectory: string,
  outputDirectory: string = './output'
): Promise<void> {
  console.log('🚀 Starting State of Open Data survey processing pipeline...');
  
  const processor = new DataProcessor();
  
  try {
    // Process the data
    const harmonizedDataset = await processor.processDirectory(dataDirectory);
    
    // Export results
    const exporter = new DataExporter();
    await exporter.exportComplete(harmonizedDataset, outputDirectory);
    
    console.log('🎉 Pipeline completed successfully!');
    console.log(`📊 Processed ${harmonizedDataset.responses.length} responses`);
    console.log(`📁 Exports saved to: ${outputDirectory}`);
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    throw error;
  }
}