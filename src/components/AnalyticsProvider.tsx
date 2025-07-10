import React, { createContext, useContext, useEffect, useState } from 'react';
import { analytics, useAnalytics, type UserProperties } from '../utils/analytics';

interface AnalyticsContextValue {
  isInitialized: boolean;
  userProperties: UserProperties | null;
  setUserProperties: (properties: UserProperties) => void;
  trackEvent: typeof analytics.trackEvent;
  trackPageView: typeof analytics.trackPageView;
  trackChartInteraction: typeof analytics.trackChartInteraction;
  trackStoryProgress: typeof analytics.trackStoryProgress;
  trackExport: typeof analytics.trackExport;
  trackShare: typeof analytics.trackShare;
  trackSearch: typeof analytics.trackSearch;
  trackPerformance: typeof analytics.trackPerformance;
  trackError: typeof analytics.trackError;
  trackEngagement: typeof analytics.trackEngagement;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enableInDevelopment?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  enableInDevelopment = false
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProperties, setUserPropertiesState] = useState<UserProperties | null>(null);
  
  const analyticsHook = useAnalytics();

  useEffect(() => {
    // Initialize analytics
    analytics.initialize();
    setIsInitialized(true);

    // Track initial page load
    analyticsHook.trackPageView('Application Load', window.location.href);

    // Set up error tracking
    const handleError = (event: ErrorEvent) => {
      analyticsHook.trackError(new Error(event.message), 'global_error_handler');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsHook.trackError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'promise_rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analyticsHook.trackEngagement('page_hidden');
      } else {
        analyticsHook.trackEngagement('page_visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Set user properties with local state management
  const setUserProperties = (properties: UserProperties) => {
    setUserPropertiesState(properties);
    analyticsHook.setUserProperties(properties);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('analytics_user_properties', JSON.stringify(properties));
    } catch (error) {
      console.warn('Failed to store user properties:', error);
    }
  };

  // Load user properties from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('analytics_user_properties');
      if (stored) {
        const properties = JSON.parse(stored);
        setUserPropertiesState(properties);
        analyticsHook.setUserProperties(properties);
      }
    } catch (error) {
      console.warn('Failed to load stored user properties:', error);
    }
  }, []);

  const contextValue: AnalyticsContextValue = {
    isInitialized,
    userProperties,
    setUserProperties,
    trackEvent: analyticsHook.trackEvent,
    trackPageView: analyticsHook.trackPageView,
    trackChartInteraction: analyticsHook.trackChartInteraction,
    trackStoryProgress: analyticsHook.trackStoryProgress,
    trackExport: analyticsHook.trackExport,
    trackShare: analyticsHook.trackShare,
    trackSearch: analyticsHook.trackSearch,
    trackPerformance: analyticsHook.trackPerformance,
    trackError: analyticsHook.trackError,
    trackEngagement: analyticsHook.trackEngagement
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics context
export const useAnalyticsContext = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

// Higher-order component for automatic page tracking
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  return React.memo((props: P) => {
    const { trackPageView } = useAnalyticsContext();

    useEffect(() => {
      trackPageView(pageName);
    }, [pageName, trackPageView]);

    return <Component {...props} />;
  });
}

// Component for tracking user properties form
export const UserPropertiesForm: React.FC<{
  onComplete?: () => void;
  className?: string;
}> = ({ onComplete, className = '' }) => {
  const { setUserProperties, userProperties } = useAnalyticsContext();
  const [formData, setFormData] = useState<UserProperties>(userProperties || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProperties(formData);
    onComplete?.();
  };

  const handleChange = (field: keyof UserProperties, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Type
        </label>
        <select
          value={formData.user_type || ''}
          onChange={(e) => handleChange('user_type', e.target.value as any)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select...</option>
          <option value="researcher">Researcher</option>
          <option value="administrator">Administrator</option>
          <option value="funder">Funder</option>
          <option value="student">Student</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institution Type
        </label>
        <select
          value={formData.institution_type || ''}
          onChange={(e) => handleChange('institution_type', e.target.value as any)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select...</option>
          <option value="r1_university">R1 University</option>
          <option value="r2_university">R2 University</option>
          <option value="liberal_arts">Liberal Arts College</option>
          <option value="government">Government</option>
          <option value="industry">Industry</option>
          <option value="nonprofit">Nonprofit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discipline
        </label>
        <input
          type="text"
          value={formData.discipline || ''}
          onChange={(e) => handleChange('discipline', e.target.value)}
          placeholder="e.g., Life Sciences, Engineering, Social Sciences"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Career Stage
        </label>
        <select
          value={formData.career_stage || ''}
          onChange={(e) => handleChange('career_stage', e.target.value as any)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select...</option>
          <option value="early">Early Career</option>
          <option value="mid">Mid Career</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <input
          type="text"
          value={formData.region || ''}
          onChange={(e) => handleChange('region', e.target.value)}
          placeholder="e.g., North America, Europe, Asia"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Save Preferences
      </button>
    </form>
  );
};

export default AnalyticsProvider;