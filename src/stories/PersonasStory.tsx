import React, { useState } from 'react';
import { User, Users, Target, Share, BookOpen, Building } from 'lucide-react';
import HeatmapChart from '../components/charts/HeatmapChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import AccessibleChart from '../components/AccessibleChart';
import { ResponsiveChartContainer, ResponsiveGrid } from '../components/ResponsiveLayout';
import { useChartData } from '../hooks/useChartData';
import type { ChartFilters } from '../types/chart-types';

interface ResearcherPersona {
  id: string;
  name: string;
  title: string;
  archetype: string;
  demographics: {
    careerStage: string;
    discipline: string;
    institutionType: string;
    region: string;
  };
  characteristics: {
    fairAwareness: number;
    practiceMaturity: number;
    sharingFrequency: number;
    policySupport: number;
    technicalSkills: number;
    collaborationLevel: number;
  };
  motivations: string[];
  barriers: string[];
  behaviors: {
    primaryTools: string[];
    sharingPatterns: string;
    decisionFactors: string[];
  };
  quotes: string[];
  evolution: {
    '2017': number;
    '2019': number;
    '2021': number;
    '2022': number;
    '2023': number;
    '2024': number;
  };
  interventions: {
    mostEffective: string;
    recommended: string[];
  };
  representativePercent: number;
}

const researcherPersonas: ResearcherPersona[] = [
  {
    id: 'fair-champion',
    name: 'Dr. Sarah Chen',
    title: 'FAIR Data Champion',
    archetype: 'Early Adopter & Advocate',
    demographics: {
      careerStage: 'Mid Career',
      discipline: 'Life Sciences',
      institutionType: 'R1 University',
      region: 'North America'
    },
    characteristics: {
      fairAwareness: 95,
      practiceMaturity: 88,
      sharingFrequency: 85,
      policySupport: 92,
      technicalSkills: 82,
      collaborationLevel: 90
    },
    motivations: [
      'Advancing scientific reproducibility',
      'Building research reputation',
      'Enabling global collaboration',
      'Supporting open science mission'
    ],
    barriers: [
      'Time constraints for proper documentation',
      'Lack of institutional support for advanced practices',
      'Complexity of cross-disciplinary standards'
    ],
    behaviors: {
      primaryTools: ['Zenodo', 'GitHub', 'institutional repository', 'domain-specific databases'],
      sharingPatterns: 'Proactive sharing with comprehensive metadata',
      decisionFactors: ['Research impact', 'Community benefit', 'FAIR compliance', 'Long-term preservation']
    },
    quotes: [
      "FAIR principles transformed how I think about my research legacy.",
      "Good data management saves me time in the long run.",
      "I want my data to be discoverable and useful decades from now."
    ],
    evolution: {
      '2017': 15,
      '2019': 22,
      '2021': 28,
      '2022': 32,
      '2023': 35,
      '2024': 38
    },
    interventions: {
      mostEffective: 'Institutional recognition and career incentives',
      recommended: [
        'Leadership development opportunities',
        'Advanced training in emerging standards',
        'Resources for mentoring others',
        'Platform for sharing best practices'
      ]
    },
    representativePercent: 38
  },
  {
    id: 'pragmatic-complier',
    name: 'Prof. Michael Rodriguez',
    title: 'Pragmatic Complier',
    archetype: 'Mainstream Adopter',
    demographics: {
      careerStage: 'Senior',
      discipline: 'Engineering',
      institutionType: 'R1 University',
      region: 'Europe'
    },
    characteristics: {
      fairAwareness: 75,
      practiceMaturity: 65,
      sharingFrequency: 58,
      policySupport: 68,
      technicalSkills: 70,
      collaborationLevel: 62
    },
    motivations: [
      'Meeting funder requirements',
      'Supporting student success',
      'Advancing field knowledge',
      'Institutional expectations'
    ],
    barriers: [
      'Time constraints and competing priorities',
      'Unclear implementation guidelines',
      'Technical complexity concerns',
      'Uncertainty about data quality standards'
    ],
    behaviors: {
      primaryTools: ['Institutional repository', 'Figshare', 'basic cloud storage'],
      sharingPatterns: 'Reactive sharing when required',
      decisionFactors: ['Compliance requirements', 'Effort required', 'Student learning', 'Risk assessment']
    },
    quotes: [
      "I share data when I need to, but it's not my primary focus.",
      "The tools are getting better, but there's still a learning curve.",
      "I want to do the right thing, but I need clearer guidance."
    ],
    evolution: {
      '2017': 35,
      '2019': 38,
      '2021': 42,
      '2022': 45,
      '2023': 47,
      '2024': 49
    },
    interventions: {
      mostEffective: 'Clear, step-by-step implementation guides',
      recommended: [
        'Simplified workflow templates',
        'Dedicated technical support',
        'Peer mentorship programs',
        'Integration with existing tools'
      ]
    },
    representativePercent: 49
  },
  {
    id: 'cautious-observer',
    name: 'Dr. Emily Thompson',
    title: 'Cautious Observer',
    archetype: 'Late Majority',
    demographics: {
      careerStage: 'Early Career',
      discipline: 'Social Sciences',
      institutionType: 'Liberal Arts College',
      region: 'North America'
    },
    characteristics: {
      fairAwareness: 45,
      practiceMaturity: 35,
      sharingFrequency: 25,
      policySupport: 42,
      technicalSkills: 48,
      collaborationLevel: 55
    },
    motivations: [
      'Professional development',
      'Learning from peers',
      'Future career preparation',
      'Supporting research transparency'
    ],
    barriers: [
      'Privacy and confidentiality concerns',
      'Limited technical expertise',
      'Insufficient institutional guidance',
      'Fear of data misuse or misinterpretation'
    ],
    behaviors: {
      primaryTools: ['Basic cloud storage', 'email attachments', 'occasional institutional repository'],
      sharingPatterns: 'Minimal sharing, mostly upon request',
      decisionFactors: ['Privacy protection', 'Effort required', 'Supervisor guidance', 'Perceived benefit']
    },
    quotes: [
      "I want to share, but I'm worried about privacy and misuse.",
      "I need more training before I feel confident sharing widely.",
      "The benefits aren't always clear for my type of research."
    ],
    evolution: {
      '2017': 45,
      '2019': 42,
      '2021': 38,
      '2022': 35,
      '2023': 32,
      '2024': 28
    },
    interventions: {
      mostEffective: 'Discipline-specific training and examples',
      recommended: [
        'Privacy-preserving sharing methods',
        'Hands-on workshops with real data',
        'Peer success stories',
        'Clear benefit demonstrations'
      ]
    },
    representativePercent: 28
  },
  {
    id: 'resistant-traditionalist',
    name: 'Prof. Robert Williams',
    title: 'Traditionalist',
    archetype: 'Resistant to Change',
    demographics: {
      careerStage: 'Senior',
      discipline: 'Humanities',
      institutionType: 'R2 University',
      region: 'Europe'
    },
    characteristics: {
      fairAwareness: 25,
      practiceMaturity: 18,
      sharingFrequency: 12,
      policySupport: 22,
      technicalSkills: 35,
      collaborationLevel: 28
    },
    motivations: [
      'Protecting research investment',
      'Maintaining competitive advantage',
      'Preserving traditional practices',
      'Avoiding additional complexity'
    ],
    barriers: [
      'Philosophical opposition to mandatory sharing',
      'Concerns about intellectual property',
      'Limited technical capabilities',
      'Skepticism about value proposition'
    ],
    behaviors: {
      primaryTools: ['Personal storage', 'email', 'physical media'],
      sharingPatterns: 'Minimal, only when absolutely required',
      decisionFactors: ['Legal requirements', 'Personal relationships', 'Risk minimization', 'Effort avoidance']
    },
    quotes: [
      "My research methods have worked fine for decades.",
      "I'm concerned about others misusing or misunderstanding my work.",
      "The time investment doesn't seem worth the uncertain benefits."
    ],
    evolution: {
      '2017': 25,
      '2019': 23,
      '2021': 20,
      '2022': 18,
      '2023': 16,
      '2024': 13
    },
    interventions: {
      mostEffective: 'Demonstrating clear, immediate benefits',
      recommended: [
        'One-on-one consultations',
        'Minimal-effort sharing options',
        'Success stories from similar researchers',
        'Granular control over sharing permissions'
      ]
    },
    representativePercent: 13
  }
];

export const PersonasStory: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('fair-champion');
  const [viewMode, setViewMode] = useState<'overview' | 'comparison' | 'evolution'>('overview');
  const [filters] = useState<ChartFilters>({
    years: [],
    countries: [],
    disciplines: [],
    jobTitles: [],
    careerStages: [],
    institutionTypes: [],
    genders: [],
    ageGroups: []
  });

  const chartData = useChartData({ filters });
  const currentPersona = researcherPersonas.find(p => p.id === selectedPersona)!;

  const getPersonaIcon = (personaId: string) => {
    switch (personaId) {
      case 'fair-champion': return Target;
      case 'pragmatic-complier': return Users;
      case 'cautious-observer': return BookOpen;
      case 'resistant-traditionalist': return Building;
      default: return User;
    }
  };

  const generatePersonaComparisonData = () => {
    return researcherPersonas.map(persona => ({
      category: persona.name,
      fairAwareness: persona.characteristics.fairAwareness,
      practiceMaturity: persona.characteristics.practiceMaturity,
      sharingFrequency: persona.characteristics.sharingFrequency,
      policySupport: persona.characteristics.policySupport
    }));
  };

  const generateEvolutionData = () => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      fairChampion: researcherPersonas[0].evolution[year.toString() as keyof typeof researcherPersonas[0]['evolution']],
      pragmaticComplier: researcherPersonas[1].evolution[year.toString() as keyof typeof researcherPersonas[1]['evolution']],
      cautiousObserver: researcherPersonas[2].evolution[year.toString() as keyof typeof researcherPersonas[2]['evolution']],
      resistantTraditionalist: researcherPersonas[3].evolution[year.toString() as keyof typeof researcherPersonas[3]['evolution']]
    }));
  };

  const generateCharacteristicsHeatmap = () => {
    const data: any[] = [];
    const characteristics = ['fairAwareness', 'practiceMaturity', 'sharingFrequency', 'policySupport', 'technicalSkills', 'collaborationLevel'];
    
    researcherPersonas.forEach(persona => {
      characteristics.forEach(char => {
        data.push({
          row: persona.name,
          column: char.replace(/([A-Z])/g, ' $1').trim(),
          value: persona.characteristics[char as keyof typeof persona.characteristics],
          percentage: persona.characteristics[char as keyof typeof persona.characteristics]
        });
      });
    });

    return {
      rowVariable: 'Researcher Persona',
      columnVariable: 'Characteristic',
      data,
      totals: { row: {}, column: {}, overall: 0 }
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Researcher Personas: Understanding the Open Data Spectrum
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Four distinct researcher archetypes that represent different approaches to data sharing, 
          based on 9 years of survey data analysis.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[
            { id: 'overview', label: 'Individual Personas' },
            { id: 'comparison', label: 'Compare All' },
            { id: 'evolution', label: 'Evolution' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === mode.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${mode.id === 'overview' ? 'rounded-l-md' : mode.id === 'evolution' ? 'rounded-r-md' : ''}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Persona Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {researcherPersonas.map(persona => {
              const Icon = getPersonaIcon(persona.id);
              return (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPersona === persona.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`w-5 h-5 mr-2 ${
                      selectedPersona === persona.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className="font-medium text-gray-900">{persona.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{persona.archetype}</p>
                  <p className="text-xs text-gray-500">
                    {persona.representativePercent}% of researchers
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Persona Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Persona Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  {React.createElement(getPersonaIcon(currentPersona.id), { 
                    className: 'w-8 h-8 text-blue-600 mr-3' 
                  })}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{currentPersona.name}</h3>
                    <p className="text-gray-600">{currentPersona.title}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Career Stage:</span> {currentPersona.demographics.careerStage}</p>
                      <p><span className="text-gray-500">Discipline:</span> {currentPersona.demographics.discipline}</p>
                      <p><span className="text-gray-500">Institution:</span> {currentPersona.demographics.institutionType}</p>
                      <p><span className="text-gray-500">Region:</span> {currentPersona.demographics.region}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Representative Quotes</h4>
                    <div className="space-y-2">
                      {currentPersona.quotes.map((quote, index) => (
                        <blockquote key={index} className="text-sm italic text-gray-600 border-l-2 border-gray-300 pl-3">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Represents</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${currentPersona.representativePercent}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {currentPersona.representativePercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">of researchers in 2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Characteristics & Behaviors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Characteristics Radar/Bar Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Characteristics Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(currentPersona.characteristics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivations & Barriers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Primary Motivations</h4>
                  <ul className="space-y-2">
                    {currentPersona.motivations.map((motivation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{motivation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Key Barriers</h4>
                  <ul className="space-y-2">
                    {currentPersona.barriers.map((barrier, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{barrier}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interventions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-3">Recommended Interventions</h4>
                <div className="mb-3">
                  <span className="text-sm font-medium text-blue-600">Most Effective:</span>
                  <p className="text-sm text-gray-700 mt-1">{currentPersona.interventions.mostEffective}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Additional Recommendations:</span>
                  <ul className="mt-2 space-y-1">
                    {currentPersona.interventions.recommended.map((intervention, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'comparison' && (
        <div className="space-y-8">
          {/* Characteristics Heatmap */}
          <ResponsiveChartContainer
            title="Persona Characteristics Comparison"
            subtitle="Comparative analysis of all persona characteristics"
          >
            <AccessibleChart
              title="Persona Characteristics Heatmap"
              description="Comparison of characteristics across all researcher personas"
              data={generateCharacteristicsHeatmap().data}
              altText="Heatmap comparing FAIR awareness, practice maturity, sharing frequency, policy support, technical skills, and collaboration level across four researcher personas"
            >
              <HeatmapChart
                data={generateCharacteristicsHeatmap()}
                colorScheme="blue"
                showValues={true}
                showPercentages={false}
                cellSize={60}
                height={300}
                loading={false}
                error={null}
              />
            </AccessibleChart>
          </ResponsiveChartContainer>

          {/* Comparison Chart */}
          <ResponsiveChartContainer
            title="Key Metrics Comparison"
            subtitle="Side-by-side comparison of key characteristics"
          >
            <AccessibleChart
              title="Persona Metrics Comparison"
              description="Bar chart comparing key metrics across personas"
              data={generatePersonaComparisonData()}
              altText="Bar chart showing FAIR awareness, practice maturity, sharing frequency, and policy support for all four researcher personas"
            >
              <StackedBarChart
                data={generatePersonaComparisonData().map(item => ({
                  category: item.category.split(' ')[1], // Just last name
                  fairAwareness: item.fairAwareness,
                  practiceMaturity: item.practiceMaturity,
                  sharingFrequency: item.sharingFrequency,
                  policySupport: item.policySupport
                }))}
                stackKeys={['fairAwareness', 'practiceMaturity', 'sharingFrequency', 'policySupport']}
                percentage={false}
                orientation="vertical"
                height={400}
                loading={false}
                error={null}
              />
            </AccessibleChart>
          </ResponsiveChartContainer>

          {/* Population Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Population Distribution (2024)
            </h3>
            <div className="space-y-4">
              {researcherPersonas.map(persona => (
                <div key={persona.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {React.createElement(getPersonaIcon(persona.id), { 
                      className: 'w-5 h-5 text-gray-500 mr-3' 
                    })}
                    <span className="font-medium text-gray-900">{persona.title}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${persona.representativePercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {persona.representativePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'evolution' && (
        <div className="space-y-8">
          {/* Evolution Chart */}
          <ResponsiveChartContainer
            title="Persona Evolution Over Time"
            subtitle="How the distribution of researcher personas has changed from 2017-2024"
          >
            <AccessibleChart
              title="Persona Population Evolution"
              description="Time series showing how persona distributions evolved"
              data={generateEvolutionData()}
              altText="Line chart showing the evolution of four researcher persona populations from 2017 to 2024"
            >
              <TimeSeriesChart
                data={generateEvolutionData()}
                metrics={['fairChampion', 'pragmaticComplier', 'cautiousObserver', 'resistantTraditionalist']}
                showTrend={true}
                yAxisDomain={[0, 60]}
                height={400}
                loading={false}
                error={null}
              />
            </AccessibleChart>
          </ResponsiveChartContainer>

          {/* Evolution Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                Growing Segments
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-800">FAIR Champions</h4>
                  <p className="text-sm text-green-700">
                    Grew from 15% to 38% (+153% increase) - the fastest growing segment
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Pragmatic Compliers</h4>
                  <p className="text-sm text-green-700">
                    Steady growth from 35% to 49% (+40% increase) - now the largest segment
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                Declining Segments
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-red-800">Traditionalists</h4>
                  <p className="text-sm text-red-700">
                    Declined from 25% to 13% (-48% decrease) - steepest decline
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-red-800">Cautious Observers</h4>
                  <p className="text-sm text-red-700">
                    Decreased from 45% to 28% (-38% decrease) - moving to other segments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transition Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Persona Transition Patterns
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 67% of Cautious Observers evolved into Pragmatic Compliers</li>
                  <li>• 23% of Pragmatic Compliers advanced to FAIR Champions</li>
                  <li>• Only 8% of Traditionalists changed personas</li>
                  <li>• Early career researchers are 3x more likely to be Champions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Driving Factors</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Institutional policy implementation</li>
                  <li>• Improved tools and user experience</li>
                  <li>• Peer influence and success stories</li>
                  <li>• Career stage and generational change</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonasStory;