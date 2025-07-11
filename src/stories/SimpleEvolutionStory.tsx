import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Share } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface StoryChapter {
  id: string;
  title: string;
  narrative: string;
  year?: number;
  timeRange?: [number, number];
  insights: string[];
  callouts: {
    type: 'achievement' | 'concern' | 'trend' | 'prediction';
    text: string;
    data?: any;
  }[];
}

const storyChapters: StoryChapter[] = [
  {
    id: 'introduction',
    title: 'The Beginning: 2017 Baseline',
    narrative: 'In 2017, the research landscape was at a crossroads. Open data sharing was still emerging, with many researchers uncertain about benefits, barriers, and best practices. This is where our story begins.',
    year: 2017,
    insights: [
      'Only 31% of researchers were familiar with FAIR principles',
      'Open access had moderate support at 65%',
      'Time constraints were already the primary barrier',
      'Technical challenges were significant for 73% of researchers'
    ],
    callouts: [
      {
        type: 'concern',
        text: 'Low FAIR awareness (31%) indicated need for education',
        data: { metric: 'FAIR Awareness', value: 31, trend: 'baseline' }
      }
    ]
  },
  {
    id: 'early-growth',
    title: 'Early Momentum: 2017-2019',
    narrative: 'The first two years showed promising signs. Policy initiatives, funding mandates, and community advocacy began to shift attitudes. Early adopters started sharing their success stories.',
    timeRange: [2017, 2019],
    insights: [
      'FAIR awareness increased by 34% to 41%',
      'Open access support grew from 65% to 71%',
      'Policy support began emerging (38%)',
      'Cloud adoption started accelerating (+23%)'
    ],
    callouts: [
      {
        type: 'achievement',
        text: 'FAIR awareness breakthrough: +34% in just 2 years',
        data: { metric: 'FAIR Awareness', change: 34, period: '2017-2019' }
      },
      {
        type: 'trend',
        text: 'Cloud infrastructure adoption began transforming workflows',
        data: { metric: 'Cloud Adoption', change: 23, period: '2017-2019' }
      }
    ]
  },
  {
    id: 'acceleration',
    title: 'The Tipping Point: 2019-2021',
    narrative: 'The pandemic years unexpectedly accelerated open science adoption. Remote collaboration necessities, increased funding requirements, and global research urgency created perfect conditions for change.',
    timeRange: [2019, 2021],
    insights: [
      'Open science attitudes reached 78% support',
      'Collaboration motivation spiked due to remote work',
      'Cloud adoption increased by 45% during pandemic',
      'FAIR implementation grew from 23% to 41%'
    ],
    callouts: [
      {
        type: 'achievement',
        text: 'Pandemic accelerated open science adoption by 3 years',
        data: { metric: 'Open Science Support', change: 45, period: '2019-2021' }
      },
      {
        type: 'trend',
        text: 'Remote collaboration became the new normal',
        data: { metric: 'Collaboration Tools', change: 67, period: '2019-2021' }
      }
    ]
  },
  {
    id: 'maturation',
    title: 'Mainstreaming: 2021-2023',
    narrative: 'Open data practices moved from experimental to standard. Institutions developed policies, researchers gained experience, and tools became more user-friendly. The movement reached critical mass.',
    timeRange: [2021, 2023],
    insights: [
      'FAIR implementation crossed 50% threshold',
      'Institutional support policies reached 67%',
      'Technical barriers decreased by 42%',
      'Practice maturity scores improved across all disciplines'
    ],
    callouts: [
      {
        type: 'achievement',
        text: 'FAIR implementation reached critical mass (50%+)',
        data: { metric: 'FAIR Implementation', value: 52, milestone: 'Critical Mass' }
      },
      {
        type: 'trend',
        text: 'Technical barriers finally declining (-42%)',
        data: { metric: 'Technical Barriers', change: -42, period: '2021-2023' }
      }
    ]
  },
  {
    id: 'current-state',
    title: 'Today\'s Landscape: 2024',
    narrative: 'We now see a transformed research ecosystem. Open data sharing has become expected rather than exceptional. New challenges emerge around quality, sustainability, and equity, but the foundation is solid.',
    year: 2024,
    insights: [
      '76% of researchers now familiar with FAIR principles',
      '55% actively implementing FAIR practices',
      '82% support institutional open data policies',
      'Cross-disciplinary differences narrowing'
    ],
    callouts: [
      {
        type: 'achievement',
        text: 'Open data transformation: From 31% to 76% FAIR awareness',
        data: { metric: 'FAIR Awareness', start: 31, end: 76, change: 145 }
      },
      {
        type: 'concern',
        text: 'Implementation gap persists (76% aware, 55% implementing)',
        data: { gap: 21, awareness: 76, implementation: 55 }
      }
    ]
  },
  {
    id: 'future-outlook',
    title: 'Looking Ahead: 2025-2030',
    narrative: 'Based on current trends, we project continued growth with focus shifting to quality, automation, and global equity. The next frontier involves AI-assisted data management and real-time sharing.',
    timeRange: [2024, 2030],
    insights: [
      'FAIR implementation projected to reach 75% by 2027',
      'AI-assisted data management emerging trend',
      'Global South participation expected to double',
      'Automated sharing workflows becoming standard'
    ],
    callouts: [
      {
        type: 'prediction',
        text: 'FAIR implementation could reach 75% by 2027',
        data: { metric: 'FAIR Implementation', projected: 75, year: 2027, confidence: 78 }
      },
      {
        type: 'trend',
        text: 'AI and automation will drive next wave of adoption',
        data: { trend: 'AI-Assisted Data Management', growth: 'Emerging' }
      }
    ]
  }
];

// Sample data for charts
const evolutionData = [
  { year: 2017, fairAwareness: 31, openAccess: 65, openData: 23, collaboration: 45 },
  { year: 2018, fairAwareness: 35, openAccess: 68, openData: 28, collaboration: 48 },
  { year: 2019, fairAwareness: 41, openAccess: 71, openData: 34, collaboration: 52 },
  { year: 2020, fairAwareness: 48, openAccess: 75, openData: 42, collaboration: 67 },
  { year: 2021, fairAwareness: 55, openAccess: 78, openData: 49, collaboration: 72 },
  { year: 2022, fairAwareness: 63, openAccess: 81, openData: 54, collaboration: 75 },
  { year: 2023, fairAwareness: 71, openAccess: 84, openData: 58, collaboration: 78 },
  { year: 2024, fairAwareness: 76, openAccess: 87, openData: 62, collaboration: 81 }
];

const barrierData = [
  { barrier: 'Time Constraints', 2017: 73, 2019: 71, 2021: 68, 2024: 65 },
  { barrier: 'Technical Skills', 2017: 67, 2019: 58, 2021: 49, 2024: 42 },
  { barrier: 'Policy Uncertainty', 2017: 54, 2019: 48, 2021: 38, 2024: 28 },
  { barrier: 'Lack of Support', 2017: 61, 2019: 55, 2021: 44, 2024: 35 }
];

export const SimpleEvolutionStory: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const chapter = storyChapters[currentChapter];

  const nextChapter = () => {
    if (currentChapter < storyChapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetStory = () => {
    setCurrentChapter(0);
    setIsPlaying(false);
  };

  const shareStory = () => {
    const url = `${window.location.origin}/stories/evolution?chapter=${currentChapter}`;
    navigator.clipboard.writeText(url);
    alert('Story URL copied to clipboard!');
  };

  const renderChart = () => {
    const filteredData = chapter.year 
      ? evolutionData.filter(d => d.year === chapter.year)
      : chapter.timeRange 
      ? evolutionData.filter(d => d.year >= chapter.timeRange![0] && d.year <= chapter.timeRange![1])
      : evolutionData;

    switch (currentChapter) {
      case 0: // Introduction - Single year snapshot
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="fairAwareness" fill="#3b82f6" name="FAIR Awareness %" />
              <Bar dataKey="openAccess" fill="#10b981" name="Open Access %" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 1: // Early Growth - Comparison
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fairAwareness" stroke="#3b82f6" strokeWidth={3} name="FAIR Awareness %" />
              <Line type="monotone" dataKey="openAccess" stroke="#10b981" strokeWidth={3} name="Open Access %" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 2: // Tipping Point - Acceleration
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="collaboration" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Collaboration %" />
              <Area type="monotone" dataKey="openData" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Open Data %" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 3: // Maturation - All metrics
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fairAwareness" stroke="#3b82f6" strokeWidth={2} name="FAIR Awareness %" />
              <Line type="monotone" dataKey="openAccess" stroke="#10b981" strokeWidth={2} name="Open Access %" />
              <Line type="monotone" dataKey="openData" stroke="#f59e0b" strokeWidth={2} name="Open Data %" />
              <Line type="monotone" dataKey="collaboration" stroke="#8b5cf6" strokeWidth={2} name="Collaboration %" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 4: // Current State - Barriers declining
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barrierData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="barrier" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="2017" fill="#ef4444" name="2017" />
              <Bar dataKey="2024" fill="#22c55e" name="2024" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 5: // Future - Projections
        const futureData = [
          ...evolutionData,
          { year: 2025, fairAwareness: 78, openAccess: 89, openData: 65, collaboration: 83 },
          { year: 2026, fairAwareness: 80, openAccess: 91, openData: 68, collaboration: 85 },
          { year: 2027, fairAwareness: 82, openAccess: 93, openData: 71, collaboration: 87 },
          { year: 2028, fairAwareness: 84, openAccess: 94, openData: 73, collaboration: 89 },
          { year: 2029, fairAwareness: 86, openAccess: 95, openData: 75, collaboration: 91 },
          { year: 2030, fairAwareness: 88, openAccess: 96, openData: 77, collaboration: 93 }
        ];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={futureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="fairAwareness" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="FAIR Awareness % (Projected)" />
              <Area type="monotone" dataKey="openData" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Open Data % (Projected)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fairAwareness" stroke="#3b82f6" strokeWidth={2} name="FAIR Awareness %" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Story Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          The Evolution of Open Data Attitudes
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          A 9-year journey through the transformation of research data sharing, 
          from reluctant compliance to enthusiastic adoption.
        </p>
      </div>

      {/* Story Controls */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={resetStory}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Reset to beginning"
          aria-label="Reset story to beginning"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button
          onClick={prevChapter}
          disabled={currentChapter === 0}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous chapter"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlayback}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          aria-label={isPlaying ? 'Pause story' : 'Play story'}
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={nextChapter}
          disabled={currentChapter === storyChapters.length - 1}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next chapter"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={shareStory}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Share this chapter"
          aria-label="Share current chapter"
        >
          <Share className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex space-x-2">
          {storyChapters.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentChapter(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentChapter
                  ? 'bg-blue-600'
                  : index < currentChapter
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to chapter ${index + 1}`}
            />
          ))}
        </div>
        <span className="ml-4 text-sm text-gray-500">
          {currentChapter + 1} of {storyChapters.length}
        </span>
      </div>

      {/* Main Story Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Story Narrative */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {chapter.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {chapter.narrative}
            </p>
          </div>

          {/* Key Insights */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Key Insights
            </h3>
            <ul className="space-y-2">
              {chapter.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Callouts */}
          <div className="space-y-3">
            {chapter.callouts.map((callout, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  callout.type === 'achievement'
                    ? 'border-green-500 bg-green-50'
                    : callout.type === 'concern'
                    ? 'border-red-500 bg-red-50'
                    : callout.type === 'prediction'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      callout.type === 'achievement'
                        ? 'bg-green-100 text-green-800'
                        : callout.type === 'concern'
                        ? 'bg-red-100 text-red-800'
                        : callout.type === 'prediction'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {callout.type.charAt(0).toUpperCase() + callout.type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{callout.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data Visualization - {chapter.year || `${chapter.timeRange?.[0]}-${chapter.timeRange?.[1]}`}
          </h3>
          <div className="h-80">
            {renderChart()}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>📊 Interactive chart showing evolution of open data attitudes over time</p>
          </div>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <div>
          {currentChapter > 0 && (
            <button
              onClick={prevChapter}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {storyChapters[currentChapter - 1].title}
              </span>
            </button>
          )}
        </div>
        
        <div>
          {currentChapter < storyChapters.length - 1 && (
            <button
              onClick={nextChapter}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="text-sm">
                {storyChapters[currentChapter + 1].title}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleEvolutionStory;