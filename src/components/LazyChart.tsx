import React, { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver, useMemoizedChartData, performanceMonitor } from '../utils/PerformanceOptimizer';
import { Loader2 } from 'lucide-react';

interface LazyChartProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  preloadDistance?: number;
  className?: string;
  minHeight?: number;
}

export const LazyChart: React.FC<LazyChartProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  preloadDistance = 200,
  className = '',
  minHeight = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isIntersecting, hasIntersected } = useIntersectionObserver(
    containerRef,
    {
      threshold,
      rootMargin
    }
  );

  const shouldLoad = hasIntersected || isIntersecting;

  useEffect(() => {
    if (shouldLoad && !isLoaded && !hasError) {
      const endTiming = performanceMonitor.startTiming('lazy-chart-load');
      
      // Simulate async loading (in real app, this might load data)
      const loadTimer = setTimeout(() => {
        try {
          setIsLoaded(true);
          endTiming();
          onLoad?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Chart loading failed');
          setError(error);
          setHasError(true);
          onError?.(error);
        }
      }, 100);

      return () => clearTimeout(loadTimer);
    }
  }, [shouldLoad, isLoaded, hasError, onLoad, onError]);

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-gray-50 rounded-lg"
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading chart...</p>
      </div>
    </div>
  );

  const errorFallback = (
    <div 
      className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="text-center">
        <p className="text-red-600 font-medium mb-2">Failed to load chart</p>
        <p className="text-red-500 text-sm">{error?.message}</p>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
            setIsLoaded(false);
          }}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef} 
      className={`lazy-chart-container ${className}`}
      style={{ minHeight: isLoaded ? 'auto' : `${minHeight}px` }}
    >
      {hasError 
        ? errorFallback
        : isLoaded 
        ? children 
        : (fallback || defaultFallback)
      }
    </div>
  );
};

// Higher-order component for lazy chart loading
export function withLazyLoading<P extends object>(
  ChartComponent: React.ComponentType<P>,
  options: Partial<LazyChartProps> = {}
) {
  return React.memo((props: P & Partial<LazyChartProps>) => {
    const { 
      fallback, 
      threshold, 
      rootMargin, 
      onLoad, 
      onError, 
      className,
      minHeight,
      ...chartProps 
    } = props;

    return (
      <LazyChart
        fallback={fallback}
        threshold={threshold || options.threshold}
        rootMargin={rootMargin || options.rootMargin}
        onLoad={onLoad || options.onLoad}
        onError={onError || options.onError}
        className={className || options.className}
        minHeight={minHeight || options.minHeight}
      >
        <ChartComponent {...(chartProps as P)} />
      </LazyChart>
    );
  });
}

// Skeleton loader for charts
export const ChartSkeleton: React.FC<{ 
  height?: number; 
  showTitle?: boolean;
  showLegend?: boolean;
}> = ({ 
  height = 300, 
  showTitle = true, 
  showLegend = true 
}) => {
  return (
    <div className="animate-pulse">
      {showTitle && (
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      
      <div 
        className="bg-gray-200 rounded-lg mb-4"
        style={{ height: `${height}px` }}
      >
        {/* Chart area skeleton */}
        <div className="p-6 h-full flex items-end justify-around">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-300 rounded-t"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                width: '12%'
              }}
            />
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Optimized chart data processor
export function useOptimizedChartData<T, R>(
  data: T[],
  processor: (data: T[]) => R,
  dependencies: React.DependencyList = [],
  options: {
    cacheKey?: string;
    cacheTTL?: number;
    enableProfiling?: boolean;
  } = {}
): { 
  data: R | null; 
  loading: boolean; 
  error: Error | null;
  processingTime?: number;
} {
  const [result, setResult] = useState<R | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [processingTime, setProcessingTime] = useState<number>();

  const memoizedData = useMemoizedChartData(
    data,
    (inputData) => {
      const endTiming = options.enableProfiling 
        ? performanceMonitor.startTiming(`chart-data-processing-${options.cacheKey || 'default'}`)
        : undefined;

      try {
        const result = processor(inputData);
        const timing = endTiming?.();
        if (timing !== undefined) {
          setProcessingTime(timing);
        }
        return result;
      } catch (err) {
        endTiming?.();
        throw err;
      }
    },
    dependencies
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      setResult(memoizedData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Data processing failed'));
      setLoading(false);
    }
  }, [memoizedData]);

  return { 
    data: result, 
    loading, 
    error,
    processingTime: options.enableProfiling ? processingTime : undefined
  };
}

export default LazyChart;