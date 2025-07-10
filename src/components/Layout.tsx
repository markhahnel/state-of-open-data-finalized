import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, GitCompare, Search, Target, Users, Shield, Database, Scale, BookOpen, Crown, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const [analysisDropdownOpen, setAnalysisDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Executive', href: '/executive', icon: Crown },
    { name: 'Trends', href: '/trends', icon: TrendingUp },
    { name: 'Comparisons', href: '/comparisons', icon: GitCompare },
    { name: 'Deep Dive', href: '/deep-dive', icon: Search },
  ];

  const analysisModules = [
    { name: 'Motivations', href: '/analysis/motivations', icon: Target, description: 'What drives data sharing?' },
    { name: 'Barriers', href: '/analysis/barriers', icon: Shield, description: 'Obstacles to sharing' },
    { name: 'FAIR Principles', href: '/analysis/fair', icon: BookOpen, description: 'Adoption & implementation' },
    { name: 'Data Management', href: '/analysis/data-management', icon: Database, description: 'Practice evolution' },
    { name: 'Policy Support', href: '/analysis/policy-support', icon: Scale, description: 'Mandate attitudes' },
  ];

  const isAnalysisActive = location.pathname.startsWith('/analysis');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  State of Open Data
                </h1>
              </div>
              <div className="ml-10 flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Analysis Modules Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAnalysisDropdownOpen(!analysisDropdownOpen)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isAnalysisActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Analysis Modules
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  
                  {analysisDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-2">
                        {analysisModules.map((module) => {
                          const Icon = module.icon;
                          const isActive = location.pathname === module.href;
                          return (
                            <Link
                              key={module.name}
                              to={module.href}
                              onClick={() => setAnalysisDropdownOpen(false)}
                              className={`flex items-start p-3 rounded-md hover:bg-gray-50 ${
                                isActive ? 'bg-blue-50 border border-blue-200' : ''
                              }`}
                            >
                              <Icon className={`w-5 h-5 mr-3 mt-0.5 ${
                                isActive ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                              <div>
                                <div className={`font-medium text-sm ${
                                  isActive ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {module.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {module.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Close dropdown when clicking outside */}
      {analysisDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setAnalysisDropdownOpen(false)}
        />
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;