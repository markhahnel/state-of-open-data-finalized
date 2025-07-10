import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, Download, Info } from 'lucide-react';

interface AccessibleChartProps {
  title: string;
  description: string;
  data: any[];
  children: React.ReactNode;
  altText: string;
  dataTable?: boolean;
  keyboardNavigation?: boolean;
  onExport?: (format: string) => void;
  ariaLabel?: string;
}

export const AccessibleChart: React.FC<AccessibleChartProps> = ({
  title,
  description,
  data,
  children,
  altText,
  dataTable = true,
  keyboardNavigation = true,
  onExport,
  ariaLabel
}) => {
  const [showDataTable, setShowDataTable] = useState(false);
  const [announceChanges, setAnnounceChanges] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Announce data changes to screen readers
  useEffect(() => {
    if (announceChanges && announcementRef.current) {
      announcementRef.current.textContent = `Chart data updated. ${altText}`;
    }
  }, [data, altText, announceChanges]);

  // Keyboard navigation for chart
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!keyboardNavigation) return;

    switch (event.key) {
      case 'Tab':
        // Allow natural tab navigation
        break;
      case 'Enter':
      case ' ':
        if (event.target === chartRef.current) {
          setShowDataTable(!showDataTable);
          event.preventDefault();
        }
        break;
      case 'd':
      case 'D':
        if (event.ctrlKey || event.metaKey) {
          setShowDataTable(!showDataTable);
          event.preventDefault();
        }
        break;
    }
  };

  const generateDataTable = () => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    
    return (
      <div className="mt-4 overflow-x-auto">
        <table 
          className="min-w-full divide-y divide-gray-200 border border-gray-300"
          role="table"
          aria-label={`Data table for ${title}`}
        >
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                  role="columnheader"
                  aria-sort="none"
                  tabIndex={0}
                >
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                role="row"
              >
                {headers.map((header, cellIndex) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {typeof row[header] === 'number' 
                      ? row[header].toFixed(2)
                      : row[header]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Chart header with accessibility controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900" id={`chart-title-${title.replace(/\s+/g, '-')}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1" id={`chart-desc-${title.replace(/\s+/g, '-')}`}>
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Accessibility controls */}
          <button
            onClick={() => setAnnounceChanges(!announceChanges)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={`${announceChanges ? 'Disable' : 'Enable'} screen reader announcements`}
            aria-label={`${announceChanges ? 'Disable' : 'Enable'} screen reader announcements`}
          >
            {announceChanges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {dataTable && (
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={`${showDataTable ? 'Hide' : 'Show'} data table`}
              aria-label={`${showDataTable ? 'Hide' : 'Show'} accessible data table`}
              aria-expanded={showDataTable}
              aria-controls={`data-table-${title.replace(/\s+/g, '-')}`}
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {onExport && (
            <button
              onClick={() => onExport('png')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Export chart"
              aria-label="Export chart as PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart container with accessibility attributes */}
      <div
        ref={chartRef}
        className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        role={keyboardNavigation ? "application" : "img"}
        aria-label={ariaLabel || altText}
        aria-describedby={`chart-title-${title.replace(/\s+/g, '-')} chart-desc-${title.replace(/\s+/g, '-')}`}
        tabIndex={keyboardNavigation ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        {children}
        
        {/* Hidden alt text for screen readers */}
        <span className="sr-only">{altText}</span>
      </div>

      {/* Keyboard shortcuts help */}
      {keyboardNavigation && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Keyboard shortcuts: Press Tab to navigate, Enter/Space or Ctrl+D to toggle data table</p>
        </div>
      )}

      {/* Accessible data table */}
      {showDataTable && dataTable && (
        <div 
          id={`data-table-${title.replace(/\s+/g, '-')}`}
          aria-label={`Data table for ${title}`}
        >
          <h4 className="text-md font-medium text-gray-900 mt-6 mb-3">
            Data Table: {title}
          </h4>
          {generateDataTable()}
        </div>
      )}
    </div>
  );
};

export default AccessibleChart;