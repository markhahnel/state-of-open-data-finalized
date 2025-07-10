import React, { useState } from 'react';
import { ChevronDownIcon, XMarkIcon, FilterIcon } from 'lucide-react';
import type { ChartFilters, FilterConfig, FilterOption } from '../../types/chart-types';

interface FilterPanelProps {
  filters: ChartFilters;
  filterConfigs: FilterConfig[];
  onFiltersChange: (filters: Partial<ChartFilters>) => void;
  onResetFilters: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  filterConfigs,
  onFiltersChange,
  onResetFilters,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

  const toggleFilterExpansion = (filterId: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterId)) {
      newExpanded.delete(filterId);
    } else {
      newExpanded.add(filterId);
    }
    setExpandedFilters(newExpanded);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (!Array.isArray(value) && value !== undefined && value !== null) count++;
    });
    return count;
  };

  const handleFilterChange = (filterId: string, value: any) => {
    onFiltersChange({ [filterId]: value });
  };

  const handleMultiSelectChange = (filterId: string, option: string, checked: boolean) => {
    const currentValues = (filters as any)[filterId] || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v: string) => v !== option);
    
    handleFilterChange(filterId, newValues);
  };

  const removeFilterValue = (filterId: string, value: string) => {
    const currentValues = (filters as any)[filterId] || [];
    const newValues = currentValues.filter((v: string) => v !== value);
    handleFilterChange(filterId, newValues);
  };

  const MultiSelectFilter: React.FC<{ config: FilterConfig }> = ({ config }) => {
    const selectedValues = (filters as any)[config.id] || [];
    const isExpanded = expandedFilters.has(config.id);

    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleFilterExpansion(config.id)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div>
            <span className="font-medium text-gray-900">{config.label}</span>
            {selectedValues.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {selectedValues.length}
              </span>
            )}
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-200 p-4">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {config.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) =>
                      handleMultiSelectChange(config.id, option.value, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
            
            {selectedValues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleFilterChange(config.id, [])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SelectFilter: React.FC<{ config: FilterConfig }> = ({ config }) => {
    const selectedValue = (filters as any)[config.id];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {config.label}
        </label>
        <select
          value={selectedValue || ''}
          onChange={(e) => handleFilterChange(config.id, e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All {config.label}</option>
          {config.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.count && ` (${option.count})`}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const RangeFilter: React.FC<{ config: FilterConfig }> = ({ config }) => {
    const selectedValue = (filters as any)[config.id] || config.defaultValue;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {config.label}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={config.options[0]?.value}
            max={config.options[config.options.length - 1]?.value}
            value={selectedValue}
            onChange={(e) => handleFilterChange(config.id, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{config.options[0]?.label}</span>
            <span className="font-medium">{selectedValue}</span>
            <span>{config.options[config.options.length - 1]?.label}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFilter = (config: FilterConfig) => {
    switch (config.type) {
      case 'multiselect':
        return <MultiSelectFilter key={config.id} config={config} />;
      case 'select':
        return <SelectFilter key={config.id} config={config} />;
      case 'range':
        return <RangeFilter key={config.id} config={config} />;
      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <XMarkIcon className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {!isCollapsed && activeFilterCount > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const config = filterConfigs.find(c => c.id === key);
              if (!config) return null;
              
              if (Array.isArray(value)) {
                return value.map((val: string) => (
                  <span
                    key={`${key}-${val}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {config.label}: {val}
                    <button
                      onClick={() => removeFilterValue(key, val)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ));
              } else {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {config.label}: {value}
                    <button
                      onClick={() => handleFilterChange(key, undefined)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Filter controls */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {filterConfigs.map(renderFilter)}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;