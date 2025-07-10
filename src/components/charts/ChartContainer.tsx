import React, { useState, useRef } from 'react';
import { 
  DownloadIcon, 
  ExpandIcon, 
  ShrinkIcon, 
  SettingsIcon,
  InfoIcon
} from 'lucide-react';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  exportable?: boolean;
  expandable?: boolean;
  configurable?: boolean;
  className?: string;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onConfigure?: () => void;
  info?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  exportable = false,
  expandable = false,
  configurable = false,
  className = '',
  onExport,
  onConfigure,
  info
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (onExport) {
      onExport(format);
    }
    setShowExportMenu(false);
  };

  const toggleExpanded = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  const containerClasses = `
    bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200
    ${isExpanded ? 'fixed inset-4 z-50 overflow-auto' : 'relative'}
    ${className}
  `;

  return (
    <>
      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleExpanded}
        />
      )}
      
      <div ref={containerRef} className={containerClasses}>
        {/* Header */}
        {(title || subtitle || exportable || expandable || configurable || info) && (
          <div className="flex items-start justify-between p-4 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {info && (
                <div className="relative">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Chart information"
                  >
                    <InfoIcon className="w-4 h-4" />
                  </button>
                  
                  {showInfo && (
                    <div className="absolute right-0 top-8 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <p className="text-xs text-gray-600">{info}</p>
                      <button
                        onClick={() => setShowInfo(false)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {configurable && (
                <button
                  onClick={onConfigure}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Configure chart"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              )}
              
              {exportable && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Export chart"
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport('png')}
                          className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Export as PNG
                        </button>
                        <button
                          onClick={() => handleExport('svg')}
                          className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Export as SVG
                        </button>
                        <button
                          onClick={() => handleExport('csv')}
                          className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {expandable && (
                <button
                  onClick={toggleExpanded}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ShrinkIcon className="w-4 h-4" />
                  ) : (
                    <ExpandIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className={`${(title || subtitle) ? 'p-4' : 'p-6'}`}>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                <p className="text-sm text-gray-500">Loading chart...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  Error Loading Chart
                </div>
                <div className="text-red-500 text-sm max-w-md mx-auto">
                  {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && children}
        </div>
      </div>
    </>
  );
};

export default ChartContainer;