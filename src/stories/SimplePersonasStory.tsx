import React, { useState } from 'react';
import { User, Users, Target, BookOpen, Building } from 'lucide-react';

interface ResearcherPersona {
  id: string;
  name: string;
  title: string;
  archetype: string;
  characteristics: {
    fairAwareness: number;
    practiceMaturity: number;
    sharingFrequency: number;
    policySupport: number;
  };
  motivations: string[];
  barriers: string[];
  quotes: string[];
  representativePercent: number;
}

const researcherPersonas: ResearcherPersona[] = [
  {
    id: 'fair-champion',
    name: 'Dr. Sarah Chen',
    title: 'FAIR Data Champion',
    archetype: 'Early Adopter & Advocate',
    characteristics: {
      fairAwareness: 95,
      practiceMaturity: 88,
      sharingFrequency: 85,
      policySupport: 92
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
    quotes: [
      "FAIR principles transformed how I think about my research legacy.",
      "Good data management saves me time in the long run.",
      "I want my data to be discoverable and useful decades from now."
    ],
    representativePercent: 38
  },
  {
    id: 'pragmatic-complier',
    name: 'Prof. Michael Rodriguez',
    title: 'Pragmatic Complier',
    archetype: 'Mainstream Adopter',
    characteristics: {
      fairAwareness: 75,
      practiceMaturity: 65,
      sharingFrequency: 58,
      policySupport: 68
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
    quotes: [
      "I share data when I need to, but it's not my primary focus.",
      "The tools are getting better, but there's still a learning curve.",
      "I want to do the right thing, but I need clearer guidance."
    ],
    representativePercent: 49
  },
  {
    id: 'cautious-observer',
    name: 'Dr. Emily Thompson',
    title: 'Cautious Observer',
    archetype: 'Late Majority',
    characteristics: {
      fairAwareness: 45,
      practiceMaturity: 35,
      sharingFrequency: 25,
      policySupport: 42
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
    quotes: [
      "I want to share, but I'm worried about privacy and misuse.",
      "I need more training before I feel confident sharing widely.",
      "The benefits aren't always clear for my type of research."
    ],
    representativePercent: 28
  },
  {
    id: 'resistant-traditionalist',
    name: 'Prof. Robert Williams',
    title: 'Traditionalist',
    archetype: 'Resistant to Change',
    characteristics: {
      fairAwareness: 25,
      practiceMaturity: 18,
      sharingFrequency: 12,
      policySupport: 22
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
    quotes: [
      "My research methods have worked fine for decades.",
      "I'm concerned about others misusing or misunderstanding my work.",
      "The time investment doesn't seem worth the uncertain benefits."
    ],
    representativePercent: 13
  }
];

export const SimplePersonasStory: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('fair-champion');
  const [viewMode, setViewMode] = useState<'overview' | 'comparison'>('overview');

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
            { id: 'comparison', label: 'Compare All' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === mode.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${mode.id === 'overview' ? 'rounded-l-md' : 'rounded-r-md'}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Persona Profile */}
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
                  <h4 className="font-medium text-gray-900 mb-2">Characteristics</h4>
                  <div className="space-y-2">
                    {Object.entries(currentPersona.characteristics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
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
              </div>
            </div>

            {/* Motivations & Barriers */}
            <div className="space-y-6">
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
          </div>
        </>
      )}

      {viewMode === 'comparison' && (
        <div className="space-y-8">
          {/* Comparison Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Characteristics Comparison
            </h3>
            <div className="space-y-4">
              {['fairAwareness', 'practiceMaturity', 'sharingFrequency', 'policySupport'].map(characteristic => (
                <div key={characteristic}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {characteristic.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="space-y-2">
                    {researcherPersonas.map(persona => (
                      <div key={persona.id} className="flex items-center">
                        <div className="w-24 text-sm text-gray-600 mr-3">
                          {persona.title.split(' ')[0]}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: `${persona.characteristics[characteristic as keyof typeof persona.characteristics]}%` }}
                          />
                        </div>
                        <div className="w-8 text-sm font-medium text-gray-900">
                          {persona.characteristics[characteristic as keyof typeof persona.characteristics]}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
    </div>
  );
};

export default SimplePersonasStory;