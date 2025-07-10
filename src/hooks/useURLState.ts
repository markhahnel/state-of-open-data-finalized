import { useState, useEffect, useCallback } from 'react';
import { URLSharing, useAnalytics } from '../utils/analytics';
import type { ChartFilters } from '../types/chart-types';

interface URLState {
  view?: string;
  filters?: ChartFilters;
  story?: string;
  chapter?: string;
  customConfig?: any;
}

interface UseURLStateOptions {
  defaultView?: string;
  defaultFilters?: ChartFilters;
  trackChanges?: boolean;
}

export function useURLState(options: UseURLStateOptions = {}) {
  const { trackPageView } = useAnalytics();
  const [state, setState] = useState<URLState>(() => {
    // Initialize from URL parameters
    const urlParams = URLSharing.parseURLParameters();
    return {
      view: urlParams.view || options.defaultView,
      filters: urlParams.filters || options.defaultFilters,
      story: urlParams.story,
      chapter: urlParams.chapter,
      customConfig: urlParams.customConfig
    };
  });

  // Update URL when state changes
  const updateURL = useCallback((newState: Partial<URLState>, replace = false) => {
    const updatedState = { ...state, ...newState };
    const url = URLSharing.generateShareableURL(updatedState);
    
    if (replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }

    setState(updatedState);

    // Track page view changes
    if (options.trackChanges) {
      const pageTitle = `${newState.view || 'Analysis'}${newState.story ? ` - ${newState.story}` : ''}`;
      trackPageView(pageTitle, url);
    }
  }, [state, options.trackChanges, trackPageView]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = URLSharing.parseURLParameters();
      setState({
        view: urlParams.view || options.defaultView,
        filters: urlParams.filters || options.defaultFilters,
        story: urlParams.story,
        chapter: urlParams.chapter,
        customConfig: urlParams.customConfig
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [options.defaultView, options.defaultFilters]);

  // Update specific parts of state
  const setView = useCallback((view: string) => {
    updateURL({ view });
  }, [updateURL]);

  const setFilters = useCallback((filters: ChartFilters) => {
    updateURL({ filters });
  }, [updateURL]);

  const setStory = useCallback((story: string, chapter?: string) => {
    updateURL({ story, chapter });
  }, [updateURL]);

  const setChapter = useCallback((chapter: string) => {
    updateURL({ chapter });
  }, [updateURL]);

  const setCustomConfig = useCallback((customConfig: any) => {
    updateURL({ customConfig });
  }, [updateURL]);

  // Generate shareable URL for current state
  const getShareableURL = useCallback(() => {
    return URLSharing.generateShareableURL(state);
  }, [state]);

  // Reset to default state
  const reset = useCallback(() => {
    const defaultState: URLState = {
      view: options.defaultView,
      filters: options.defaultFilters
    };
    updateURL(defaultState, true);
  }, [options.defaultView, options.defaultFilters, updateURL]);

  return {
    // Current state
    view: state.view,
    filters: state.filters,
    story: state.story,
    chapter: state.chapter,
    customConfig: state.customConfig,
    
    // State setters
    setView,
    setFilters,
    setStory,
    setChapter,
    setCustomConfig,
    updateURL,
    
    // Utilities
    getShareableURL,
    reset,
    
    // Full state for convenience
    state
  };
}

// Hook for managing story navigation state
export function useStoryURLState(storyId: string) {
  const { story, chapter, setStory, setChapter, getShareableURL } = useURLState({
    trackChanges: true
  });

  // Initialize story if not set
  useEffect(() => {
    if (!story) {
      setStory(storyId, '0');
    }
  }, [story, storyId, setStory]);

  const currentChapter = chapter ? parseInt(chapter, 10) : 0;

  const navigateToChapter = useCallback((chapterIndex: number) => {
    setChapter(chapterIndex.toString());
  }, [setChapter]);

  const getChapterShareURL = useCallback((chapterIndex?: number) => {
    const currentState = URLSharing.parseURLParameters();
    return URLSharing.generateShareableURL({
      ...currentState,
      story: storyId,
      chapter: (chapterIndex ?? currentChapter).toString()
    });
  }, [storyId, currentChapter]);

  return {
    currentChapter,
    navigateToChapter,
    getChapterShareURL,
    getShareableURL,
    isCurrentStory: story === storyId
  };
}

// Hook for managing filter state in URLs
export function useFilterURLState(defaultFilters: ChartFilters) {
  const { filters, setFilters, getShareableURL } = useURLState({
    defaultFilters,
    trackChanges: false // Don't track every filter change
  });

  const updateFilter = useCallback(<K extends keyof ChartFilters>(
    key: K,
    value: ChartFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters, defaultFilters]);

  const hasActiveFilters = useCallback(() => {
    if (!filters) return false;
    
    return Object.entries(filters).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null;
    });
  }, [filters]);

  return {
    filters: filters || defaultFilters,
    updateFilter,
    setFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    getShareableURL
  };
}

export default useURLState;