import html2canvas from 'html2canvas';
import type { ChartExportOptions } from '../../types/chart-types';

export const exportChart = async (
  elementId: string, 
  options: ChartExportOptions
): Promise<void> => {
  const { format, filename = 'chart', includeData = false } = options;
  
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Chart element not found');
  }

  switch (format) {
    case 'png':
      await exportAsPNG(element, filename);
      break;
    case 'svg':
      await exportAsSVG(element, filename);
      break;
    case 'pdf':
      await exportAsPDF(element, filename);
      break;
    case 'csv':
      await exportAsCSV(element, filename, includeData);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportAsPNG = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export chart as PNG');
  }
};

const exportAsSVG = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Find SVG element within the chart container
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart');
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Add XML namespace
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Convert to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export chart as SVG');
  }
};

const exportAsPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // For PDF export, we'll convert to canvas first, then to PDF
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    // Create a new window/tab with the image for printing to PDF
    const imgData = canvas.toDataURL('image/png');
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Chart" />
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(windowContent);
      printWindow.document.close();
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export chart as PDF');
  }
};

const exportAsCSV = async (
  element: HTMLElement, 
  filename: string, 
  includeData: boolean
): Promise<void> => {
  try {
    let csvContent = '';
    
    if (includeData) {
      // Try to extract data from the chart element
      // This is a simplified approach - in a real app, you'd want to pass the actual data
      const dataAttribute = element.getAttribute('data-chart-data');
      if (dataAttribute) {
        const data = JSON.parse(dataAttribute);
        csvContent = convertToCSV(data);
      } else {
        // Fallback: extract visible text data
        csvContent = extractVisibleData(element);
      }
    } else {
      csvContent = 'No data available for export';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${filename}.csv`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export chart data as CSV');
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if necessary
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

const extractVisibleData = (element: HTMLElement): string => {
  // This is a basic implementation to extract visible text data
  // In a production app, you'd want to be more specific about data extraction
  const textContent = element.textContent || '';
  const lines = textContent.split('\n').filter(line => line.trim().length > 0);
  
  // Try to format as CSV-like structure
  return lines.map(line => `"${line.trim()}"`).join('\n');
};

// Utility function to prepare chart data for export
export const prepareChartDataForExport = (
  chartData: any[], 
  chartType: string
): any[] => {
  switch (chartType) {
    case 'timeSeries':
      return chartData.map(item => ({
        Year: item.year,
        'Open Access': item.openAccess,
        'Open Data': item.openData,
        'Open Peer Review': item.openPeerReview,
        'Preprints': item.preprints,
        'Open Science': item.openScience,
        'Data Sharing': item.dataSharing
      }));
      
    case 'stackedBar':
      return chartData.map(item => ({
        Category: item.category,
        'Very High': item.veryHigh || 0,
        'High': item.high || 0,
        'Moderate': item.moderate || 0,
        'Low': item.low || 0,
        'Very Low': item.veryLow || 0
      }));
      
    case 'heatmap':
      return chartData.data.map(item => ({
        Row: item.row,
        Column: item.column,
        Value: item.value,
        Percentage: item.percentage || 0
      }));
      
    case 'comparison':
      return chartData.map(item => ({
        Category: item.category,
        'Year 1': item.year1Value,
        'Year 2': item.year2Value,
        Change: item.change || 0,
        'Change %': item.changePercentage || 0
      }));
      
    default:
      return chartData;
  }
};

// Utility to set chart data attribute for export
export const setChartDataAttribute = (
  elementId: string, 
  data: any[], 
  chartType: string
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const exportData = prepareChartDataForExport(data, chartType);
    element.setAttribute('data-chart-data', JSON.stringify(exportData));
  }
};

export default exportChart;