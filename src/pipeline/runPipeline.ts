import { processStateOfOpenDataSurvey } from './index';

/**
 * Example script to run the data processing pipeline
 * 
 * This script demonstrates how to use the pipeline to process
 * the State of Open Data survey files and generate harmonized outputs.
 */

async function main() {
  const dataDirectory = '/Users/markhahnel/Desktop/State of Open Data 10 Years/';
  const outputDirectory = './output/processed_data';
  
  console.log('🔬 State of Open Data Processing Pipeline');
  console.log('=========================================');
  console.log(`📁 Data Directory: ${dataDirectory}`);
  console.log(`📤 Output Directory: ${outputDirectory}`);
  console.log('');
  
  try {
    await processStateOfOpenDataSurvey(dataDirectory, outputDirectory);
    
    console.log('');
    console.log('✅ Processing completed successfully!');
    console.log('');
    console.log('📋 Generated files:');
    console.log('- sood_processed_complete.csv    (Full harmonized dataset)');
    console.log('- sood_processed_complete.json   (Full dataset with metadata)');
    console.log('- sood_summary_statistics.json   (Statistical summary)');
    console.log('- sood_validation_report.md      (Data quality report)');
    console.log('- sood_YYYY_processed.csv        (Yearly breakdowns)');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('- Review the validation report for data quality issues');
    console.log('- Import CSV files into your analysis tools');
    console.log('- Use the JSON metadata for understanding the harmonization process');
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

// Run the pipeline if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runPipeline };