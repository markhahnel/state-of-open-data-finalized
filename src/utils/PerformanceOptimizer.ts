import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const dataCache = new DataCache();

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Memoized chart data processing
export function useMemoizedChartData<T, R>(
  data: T[],
  processor: (data: T[]) => R,
  dependencies: React.DependencyList = []
): R {
  return useMemo(() => {
    if (!data || data.length === 0) return processor([]);
    
    const cacheKey = `chart-data-${JSON.stringify(dependencies)}-${data.length}`;
    const cached = dataCache.get<R>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = processor(data);
    dataCache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes cache
    
    return result;
  }, [data, ...dependencies]);
}

// Virtual scrolling hook
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, ReturnType<PerformanceMonitor['getMetrics']>> {
    const result: Record<string, any> = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React component performance wrapper
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const renderTime = useRef<() => number>();

    useEffect(() => {
      renderTime.current = performanceMonitor.startTiming(`${componentName}-render`);
      
      return () => {
        if (renderTime.current) {
          renderTime.current();
        }
      };
    });

    return React.createElement(Component, props);
  });
}

// Data prefetching utility
export class DataPrefetcher {
  private prefetchQueue: Set<string> = new Set();
  private isProcessing = false;

  async prefetch(key: string, fetcher: () => Promise<any>): Promise<void> {
    if (dataCache.get(key) || this.prefetchQueue.has(key)) {
      return;
    }

    this.prefetchQueue.add(key);
    
    if (!this.isProcessing) {
      this.processPrefetchQueue();
    }
  }

  private async processPrefetchQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.prefetchQueue.size > 0) {
      const promises = Array.from(this.prefetchQueue)
        .slice(0, 3) // Process 3 at a time
        .map(async key => {
          try {
            // This would normally call the actual fetcher
            // For now, we'll simulate with a timeout
            await new Promise(resolve => setTimeout(resolve, 100));
            this.prefetchQueue.delete(key);
          } catch (error) {
            console.warn(`Prefetch failed for ${key}:`, error);
            this.prefetchQueue.delete(key);
          }
        });

      await Promise.all(promises);
    }

    this.isProcessing = false;
  }
}

export const dataPrefetcher = new DataPrefetcher();

// Bundle splitting utilities
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFn);
  
  if (fallback) {
    const FallbackComponent = fallback;
    return React.memo((props: React.ComponentProps<T>) => (
      React.createElement(React.Suspense, { fallback: React.createElement(FallbackComponent) },
        React.createElement(LazyComponent, props)
      )
    )) as React.LazyExoticComponent<T>;
  }

  return LazyComponent;
}

// Memory management
export function useMemoryCleanup(cleanup: () => void, dependencies: React.DependencyList = []) {
  useEffect(() => {
    return cleanup;
  }, dependencies);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, good time to cleanup
        cleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [cleanup]);
}

// Optimized event handlers
export function useOptimizedEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 100
): T {
  const handlerRef = useRef<T>(handler);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handlerRef.current(...args);
    }, delay);
  }) as T, [delay]);
}

// Resource preloading
export function preloadResource(url: string, type: 'script' | 'style' | 'font' | 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'image':
        link.as = 'image';
        break;
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    
    document.head.appendChild(link);
  });
}

// Automatic cache cleanup
setInterval(() => {
  dataCache.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

export default {
  dataCache,
  performanceMonitor,
  dataPrefetcher,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useMemoizedChartData,
  useVirtualScrolling,
  withPerformanceTracking,
  lazyLoadComponent,
  useMemoryCleanup,
  useOptimizedEventHandler,
  preloadResource
};