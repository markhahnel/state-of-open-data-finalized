import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

interface BreakpointContext {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

export const useBreakpoint = (): BreakpointContext => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024 && dimensions.width < 1280,
    isLargeDesktop: dimensions.width >= 1280,
    width: dimensions.width,
    height: dimensions.height
  };
};

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const breakpoint = useBreakpoint();

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (breakpoint.isMobile) {
      setSidebarOpen(false);
    }
  }, [breakpoint.isMobile]);

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (breakpoint.isTablet) {
      setSidebarCollapsed(true);
    } else if (breakpoint.isDesktop || breakpoint.isLargeDesktop) {
      setSidebarCollapsed(false);
    }
  }, [breakpoint.isTablet, breakpoint.isDesktop, breakpoint.isLargeDesktop]);

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const mainMargin = sidebar ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : '';

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar overlay */}
      {sidebar && sidebarOpen && breakpoint.isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <div
          className={`
            fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${breakpoint.isMobile
              ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
              : 'translate-x-0'
            }
            ${breakpoint.isMobile ? 'w-64' : sidebarWidth}
          `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            )}
            
            {/* Desktop sidebar toggle */}
            {!breakpoint.isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile sidebar close */}
            {breakpoint.isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            {React.cloneElement(sidebar as React.ReactElement, {
              collapsed: sidebarCollapsed && !breakpoint.isMobile,
              onNavigate: () => breakpoint.isMobile && setSidebarOpen(false)
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col ${mainMargin} transition-all duration-300`}>
        {/* Header */}
        {header && (
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              {sidebar && breakpoint.isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Header content */}
              <div className="flex-1">
                {header}
              </div>
            </div>
          </header>
        )}

        {/* Main content area */}
        <main className="flex-1 relative">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    largeDesktop: 4
  },
  gap = 'gap-6',
  className = ''
}) => {
  const gridCols = `
    grid-cols-${cols.mobile || 1}
    md:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 3}
    xl:grid-cols-${cols.largeDesktop || 4}
  `;

  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = '2xl',
  padding = true,
  className = ''
}) => {
  const maxWidthClass = maxWidth === 'full' ? 'max-w-full' : `max-w-${maxWidth}`;
  const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`mx-auto ${maxWidthClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-first Chart Container
interface ResponsiveChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  height?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export const ResponsiveChartContainer: React.FC<ResponsiveChartContainerProps> = ({
  children,
  title,
  subtitle,
  height = {
    mobile: 300,
    tablet: 400,
    desktop: 500
  },
  className = ''
}) => {
  const breakpoint = useBreakpoint();
  
  const chartHeight = breakpoint.isMobile 
    ? height.mobile 
    : breakpoint.isTablet 
    ? height.tablet 
    : height.desktop;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          {title && (
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div style={{ height: `${chartHeight}px` }} className="w-full">
          {React.cloneElement(children as React.ReactElement, {
            height: chartHeight,
            responsive: true
          })}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;