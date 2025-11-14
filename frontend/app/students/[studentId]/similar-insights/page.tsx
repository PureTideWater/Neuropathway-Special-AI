'use client';

/**
 * Similar Student Insights Dashboard
 *
 * PATENT-WORTHY FEATURE 🏆 - NETWORK EFFECT MOAT
 * "Netflix for Special Education" - Collaborative filtering for IEP insights
 *
 * COMPETITIVE ADVANTAGE:
 * - Only possible with large dataset (100K+ student profiles)
 * - Network effects: More users = Better recommendations
 * - 5+ years to replicate (need massive user base)
 *
 * REVENUE IMPACT:
 * - Enterprise tier exclusive: $50K-150K/year
 * - Justifies 3-5x pricing premium vs basic tier
 * - Creates "fear of missing out" sales driver
 *
 * BUSINESS VALUE:
 * - Evidence-based recommendations (not guesswork)
 * - Reduces trial-and-error (faster student outcomes)
 * - Creates lock-in (can't get this elsewhere)
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  UsersIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

interface SimilarStudent {
  studentId: string;
  anonymizedId: string;
  similarityScore: number;
  matchingFactors: string[];
  outcomes: {
    goalSuccessRate: number;
    averageProgress: number;
    timeToGoalAchievement: number;
  };
}

interface Recommendation {
  type: 'accommodation' | 'intervention' | 'goal_strategy';
  name: string;
  description: string;
  evidenceStrength: 'strong' | 'moderate' | 'limited';
  successRate: number;
  sampleSize: number;
  expectedImpact: string;
  implementationGuidance: string;
}

interface Benchmark {
  metric: string;
  studentValue: number;
  similarStudentsAverage: number;
  districtAverage: number;
  nationalAverage?: number;
  trend: 'above' | 'at' | 'below';
}

export default function SimilarStudentInsightsPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [similarStudents, setSimilarStudents] = useState<SimilarStudent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [networkSize, setNetworkSize] = useState(0);

  useEffect(() => {
    fetchSimilarInsights();
  }, [studentId]);

  const fetchSimilarInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/similar-insights`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudentProfile(data.data.targetStudent);
          setSimilarStudents(data.data.similarStudents || []);
          setRecommendations(data.data.recommendations || []);
          setBenchmarks(data.data.benchmarks || []);
          setNetworkSize(data.data.networkSize || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching similar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEvidenceBadgeColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'limited': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'above') return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    if (trend === 'below') return <ArrowTrendingUpIcon className="h-5 w-5 text-red-600 rotate-180" />;
    return <CheckCircleIcon className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
                  <UsersIcon className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Similar Student Insights</h1>
                  <p className="text-purple-100 mt-1">
                    Evidence-based recommendations from {networkSize.toLocaleString()}+ students
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <SparklesIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Network Effect AI v2.0</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-300/30">
                <FireIcon className="h-5 w-5 text-yellow-200" />
                <span className="text-sm font-medium">Enterprise Feature</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <SparklesIcon className="h-20 w-20 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-600 font-medium">Analyzing {networkSize.toLocaleString()}+ student profiles...</p>
            <p className="text-sm text-gray-500 mt-2">Finding students with similar profiles and successful outcomes</p>
          </div>
        ) : (
          <>
            {/* Student Profile Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {studentProfile?.firstName} {studentProfile?.lastName}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
                      Grade {studentProfile?.grade}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                      {studentProfile?.primaryDisability}
                    </span>
                    <span className="px-3 py-1 bg-green-50 rounded-full border border-green-200">
                      Reading: Level {studentProfile?.readingLevel}
                    </span>
                    <span className="px-3 py-1 bg-orange-50 rounded-full border border-orange-200">
                      Math: Level {studentProfile?.mathLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Similar Students Found</p>
                  <p className="text-4xl font-bold text-purple-600">{similarStudents.length}</p>
                </div>
              </div>
            </div>

            {/* Network Value Callout */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-lg rounded-xl">
                  <ShieldCheckIcon className="h-12 w-12" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Powered by the Nation's Largest Special Education Dataset</h3>
                  <p className="text-purple-100 mb-4">
                    Our recommendations are based on anonymized data from over {networkSize.toLocaleString()} students across hundreds of districts.
                    The more districts that join PathWise, the better our recommendations become.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">{similarStudents.length}</p>
                      <p className="text-sm text-purple-100">Similar students analyzed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">{recommendations.length}</p>
                      <p className="text-sm text-purple-100">Evidence-based recommendations</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">
                        {similarStudents[0]?.similarityScore
                          ? (similarStudents[0].similarityScore * 100).toFixed(0)
                          : 0}%
                      </p>
                      <p className="text-sm text-purple-100">Top match similarity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence-Based Recommendations */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <LightBulbIcon className="h-8 w-8 text-yellow-500" />
                Evidence-Based Recommendations
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{rec.name}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getEvidenceBadgeColor(rec.evidenceStrength)}`}>
                            {rec.evidenceStrength.toUpperCase()} EVIDENCE
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{rec.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-800 font-medium mb-1">Success Rate</p>
                        <p className="text-3xl font-bold text-green-900">{rec.successRate}%</p>
                        <p className="text-xs text-green-700 mt-1">of similar students succeeded</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-1">Sample Size</p>
                        <p className="text-3xl font-bold text-blue-900">{rec.sampleSize}</p>
                        <p className="text-xs text-blue-700 mt-1">students in analysis</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-purple-800 font-medium mb-1">Expected Impact</p>
                        <p className="text-lg font-bold text-purple-900">{rec.expectedImpact}</p>
                        <p className="text-xs text-purple-700 mt-1">predicted improvement</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-2">📋 Implementation Guidance</p>
                      <p className="text-sm text-gray-700">{rec.implementationGuidance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
                How This Student Compares
              </h2>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metric</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Student</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Similar Students Avg</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">District Avg</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {benchmarks.map((benchmark, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{benchmark.metric}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-purple-600">{benchmark.studentValue}%</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-700">{benchmark.similarStudentsAverage}%</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-700">{benchmark.districtAverage}%</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getTrendIcon(benchmark.trend)}
                              <span className={`text-sm font-medium ${
                                benchmark.trend === 'above' ? 'text-green-600' :
                                benchmark.trend === 'below' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {benchmark.trend}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Similar Students Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <UsersIcon className="h-8 w-8 text-indigo-500" />
                Top Similar Students (Anonymized)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarStudents.slice(0, 9).map((student, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Match #{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${student.similarityScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-purple-600">
                          {(student.similarityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Matching Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.matchingFactors.slice(0, 3).map((factor, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Goal Success</p>
                        <p className="text-lg font-bold text-green-600">{student.outcomes.goalSuccessRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Avg Progress</p>
                        <p className="text-lg font-bold text-blue-600">{student.outcomes.averageProgress}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Time to Goal</p>
                        <p className="text-lg font-bold text-purple-600">{student.outcomes.timeToGoalAchievement}mo</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <ExclamationCircleIcon className="h-6 w-6 text-blue-600" />
                Why Similar Student Insights Matter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Evidence-Based Decisions</h4>
                  <p>Instead of guessing what might work, see what actually worked for students with similar profiles. This reduces trial-and-error and accelerates student progress.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Data-Driven Interventions</h4>
                  <p>Every recommendation is backed by real outcome data from hundreds of similar students. Know the success rate before you implement.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">⚡ Faster Results</h4>
                  <p>Learn from the successes (and failures) of similar students. Skip interventions that didn't work and focus on proven strategies.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🔒 Unique to PathWise</h4>
                  <p>Only available through PathWise's network of {networkSize.toLocaleString()}+ students. This insight is impossible to replicate without a massive dataset.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
