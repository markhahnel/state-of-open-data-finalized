import { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Database, Calendar, BarChart3 } from 'lucide-react';
import inventoryData from '../data/inventory.json';

interface InventoryFile {
  filename: string;
  year: number | null;
  type: string;
  size: number;
  status: string;
  structure?: {
    totalRows: number;
    totalColumns: number;
    note?: string;
  };
  issue?: string;
}

const DataInventory = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const files = inventoryData.files as InventoryFile[];
  const summary = inventoryData.summary;
  const dataQuality = inventoryData.dataQuality;

  const filteredFiles = files.filter(file => {
    const yearMatch = selectedYear === 'all' || file.year === selectedYear;
    const typeMatch = selectedType === 'all' || file.type === selectedType;
    return yearMatch && typeMatch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'corrupted':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'csv':
        return <BarChart3 className="h-5 w-5 text-green-500" />;
      case 'documentation':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const years = Array.from(new Set(files.map(f => f.year).filter(y => y !== null))).sort();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{summary.totalResponses.toLocaleString()}</div>
                <div className="text-sm text-blue-600">Total Responses</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900">{inventoryData.metadata.totalFiles}</div>
                <div className="text-sm text-green-600">Total Files</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{summary.validYears.length}</div>
                <div className="text-sm text-purple-600">Valid Years</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{dataQuality.completenessScore}%</div>
                <div className="text-sm text-orange-600">Completeness</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="excel">Excel Files</option>
              <option value="csv">CSV Files</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Files ({filteredFiles.length})</h3>
        
        <div className="space-y-3">
          {filteredFiles.map((file, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(file.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{file.filename}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Year: {file.year || 'Unknown'}</span>
                      <span>Size: {formatFileSize(file.size)}</span>
                      <span className="capitalize">{file.type}</span>
                      {file.structure && (
                        <span>{file.structure.totalRows.toLocaleString()} rows × {file.structure.totalColumns} columns</span>
                      )}
                    </div>
                    {file.structure?.note && (
                      <p className="text-sm text-blue-600 mt-1">{file.structure.note}</p>
                    )}
                    {file.issue && (
                      <p className="text-sm text-red-600 mt-1">{file.issue}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <span className="text-sm font-medium capitalize text-gray-700">{file.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Assessment</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Issues Identified</h4>
            <ul className="space-y-1">
              {dataQuality.issues.map((issue, index) => (
                <li key={index} className="flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {dataQuality.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInventory;