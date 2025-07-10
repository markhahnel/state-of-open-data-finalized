// Analytics and tracking utilities for State of Open Data
import React from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface UserProperties {
  user_type?: 'researcher' | 'administrator' | 'funder' | 'student' | 'other';
  institution_type?: 'r1_university' | 'r2_university' | 'liberal_arts' | 'government' | 'industry' | 'nonprofit';
  discipline?: string;
  career_stage?: 'early' | 'mid' | 'senior';
  region?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

class Analytics {
  private static instance: Analytics;
  private isInitialized = false;
  private trackingId: string;
  private isEnabled: boolean;

  private constructor() {
    this.trackingId = import.meta.env.VITE_GA_TRACKING_ID || '';
    this.isEnabled = !!this.trackingId && import.meta.env.PROD;
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (!this.isEnabled || this.isInitialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer!.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.trackingId, {
      page_title: 'State of Open Data',
      page_location: window.location.href,
      custom_map: {
        custom_dimension_1: 'user_type',
        custom_dimension_2: 'institution_type',
        custom_dimension_3: 'discipline',
        custom_dimension_4: 'career_stage'
      }
    });

    this.isInitialized = true;
  }

  /**
   * Track custom events
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled || !window.gtag) return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }
  }

  /**
   * Track page views
   */
  trackPageView(page_title: string, page_location?: string): void {
    if (!this.isEnabled || !window.gtag) return;

    window.gtag('config', this.trackingId, {
      page_title,
      page_location: page_location || window.location.href
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isEnabled || !window.gtag) return;

    window.gtag('config', this.trackingId, {
      custom_map: {
        custom_dimension_1: properties.user_type,
        custom_dimension_2: properties.institution_type,
        custom_dimension_3: properties.discipline,
        custom_dimension_4: properties.career_stage
      }
    });
  }

  /**
   * Track chart interactions
   */
  trackChartInteraction(chartType: string, action: string, filters?: any): void {
    this.trackEvent({
      action: 'chart_interaction',
      category: 'engagement',
      label: `${chartType}_${action}`,
      custom_parameters: {
        chart_type: chartType,
        interaction_type: action,
        filters: filters ? JSON.stringify(filters) : undefined
      }
    });
  }

  /**
   * Track story progression
   */
  trackStoryProgress(storyType: string, chapter: string | number, progress: number): void {
    this.trackEvent({
      action: 'story_progress',
      category: 'engagement',
      label: `${storyType}_${chapter}`,
      value: Math.round(progress * 100),
      custom_parameters: {
        story_type: storyType,
        chapter: chapter.toString(),
        progress_percent: progress
      }
    });
  }

  /**
   * Track export actions
   */
  trackExport(exportType: string, format: string, filters?: any): void {
    this.trackEvent({
      action: 'export',
      category: 'conversion',
      label: `${exportType}_${format}`,
      custom_parameters: {
        export_type: exportType,
        format,
        filters: filters ? JSON.stringify(filters) : undefined
      }
    });
  }

  /**
   * Track sharing actions
   */
  trackShare(contentType: string, method: string, url?: string): void {
    this.trackEvent({
      action: 'share',
      category: 'engagement',
      label: `${contentType}_${method}`,
      custom_parameters: {
        content_type: contentType,
        share_method: method,
        shared_url: url
      }
    });
  }

  /**
   * Track search actions
   */
  trackSearch(query: string, resultsCount: number, filters?: any): void {
    this.trackEvent({
      action: 'search',
      category: 'engagement',
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_query: query,
        results_count: resultsCount,
        filters: filters ? JSON.stringify(filters) : undefined
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, category: string = 'performance'): void {
    this.trackEvent({
      action: 'performance_metric',
      category,
      label: metric,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        metric_value: value
      }
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context: string = 'unknown'): void {
    this.trackEvent({
      action: 'error',
      category: 'technical',
      label: `${context}_${error.name}`,
      custom_parameters: {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Limit stack trace length
        error_context: context
      }
    });
  }

  /**
   * Track user engagement metrics
   */
  trackEngagement(action: string, timeSpent?: number, elementsViewed?: number): void {
    this.trackEvent({
      action: 'engagement',
      category: 'user_behavior',
      label: action,
      value: timeSpent ? Math.round(timeSpent / 1000) : undefined, // Convert to seconds
      custom_parameters: {
        time_spent_ms: timeSpent,
        elements_viewed: elementsViewed,
        engagement_action: action
      }
    });
  }
}

// URL sharing utilities
export class URLSharing {
  private static baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  /**
   * Generate shareable URL for current analysis state
   */
  static generateShareableURL(params: {
    view?: string;
    filters?: any;
    story?: string;
    chapter?: string | number;
    customConfig?: any;
  }): string {
    const urlParams = new URLSearchParams();

    if (params.view) urlParams.set('view', params.view);
    if (params.story) urlParams.set('story', params.story);
    if (params.chapter) urlParams.set('chapter', params.chapter.toString());
    
    if (params.filters) {
      const filtersString = btoa(JSON.stringify(params.filters));
      urlParams.set('filters', filtersString);
    }

    if (params.customConfig) {
      const configString = btoa(JSON.stringify(params.customConfig));
      urlParams.set('config', configString);
    }

    // Add timestamp for cache busting
    urlParams.set('t', Date.now().toString());

    const url = `${this.baseUrl}${window.location.pathname}?${urlParams.toString()}`;
    
    // Track sharing action
    analytics.trackShare('analysis_view', 'url_generation', url);
    
    return url;
  }

  /**
   * Parse URL parameters to restore application state
   */
  static parseURLParameters(): {
    view?: string;
    filters?: any;
    story?: string;
    chapter?: string;
    customConfig?: any;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    const result: any = {};

    if (urlParams.has('view')) result.view = urlParams.get('view');
    if (urlParams.has('story')) result.story = urlParams.get('story');
    if (urlParams.has('chapter')) result.chapter = urlParams.get('chapter');

    if (urlParams.has('filters')) {
      try {
        result.filters = JSON.parse(atob(urlParams.get('filters')!));
      } catch (error) {
        console.warn('Failed to parse filters from URL:', error);
      }
    }

    if (urlParams.has('config')) {
      try {
        result.customConfig = JSON.parse(atob(urlParams.get('config')!));
      } catch (error) {
        console.warn('Failed to parse config from URL:', error);
      }
    }

    return result;
  }

  /**
   * Copy URL to clipboard
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      analytics.trackShare('analysis_view', 'clipboard_copy', url);
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      analytics.trackError(error as Error, 'clipboard_copy');
      return false;
    }
  }

  /**
   * Generate social media sharing URLs
   */
  static generateSocialShareURLs(url: string, title: string, description?: string) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || 'Explore insights from the State of Open Data research');

    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    };
  }
}

// React hooks for analytics
export function useAnalytics() {
  const analytics = Analytics.getInstance();

  React.useEffect(() => {
    analytics.initialize();
  }, []);

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackChartInteraction: analytics.trackChartInteraction.bind(analytics),
    trackStoryProgress: analytics.trackStoryProgress.bind(analytics),
    trackExport: analytics.trackExport.bind(analytics),
    trackShare: analytics.trackShare.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics)
  };
}

// Engagement tracking hook
export function useEngagementTracking(elementId: string, category: string = 'content') {
  const { trackEngagement } = useAnalytics();
  const startTimeRef = React.useRef<number>(Date.now());
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTimeRef.current = Date.now();
        } else {
          const timeSpent = Date.now() - startTimeRef.current;
          if (timeSpent > 1000) { // Only track if viewed for more than 1 second
            trackEngagement(`${category}_view`, timeSpent);
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent > 1000) {
        trackEngagement(`${category}_final_view`, timeSpent);
      }
    };
  }, [elementId, category, trackEngagement]);

  return elementRef;
}

// Export singleton instance
export const analytics = Analytics.getInstance();

export default analytics;