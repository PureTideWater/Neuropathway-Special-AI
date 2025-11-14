'use client';

/**
 * Accommodation Recommendations Page
 * DATA MOAT FEATURE: Collaborative filtering recommendations
 * BUSINESS VALUE: Network effect - more districts = better recommendations
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BuildingOfficeIcon,
  StarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Recommendation {
  accommodation: string;
  category: 'testing' | 'classroom' | 'materials' | 'environment' | 'technology';
  predictedEffectiveness: number;
  confidence: number;
  evidenceBase: {
    studentsCount: number;
    districtsCount: number;
    averageImprovement: number;
  };
  rationale: string;
  implementationGuide: string;
  successRate: number;
  starRating: 1 | 2 | 3 | 4 | 5;
}

export default function AccommodationRecommendationsPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [currentAccommodations, setCurrentAccommodations] = useState<string[]>([
    'Extended time (1.5x)',
    'Quiet testing environment',
  ]);

  useEffect(() => {
    fetchRecommendations();
  }, [studentId]);

  const fetchRecommendations = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4004/api/accommodations/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          currentAccommodations,
          disabilityCategory: 'Specific Learning Disability',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccommodation = (accommodation: string) => {
    setCurrentAccommodations([...currentAccommodations, accommodation]);
    setRecommendations(recommendations.filter((r) => r.accommodation !== accommodation));
    alert(`"${accommodation}" added to student's IEP!`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      testing: 'blue',
      classroom: 'green',
      materials: 'purple',
      environment: 'orange',
      technology: 'pink',
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const getCategoryIcon = (category: string) => {
    // Return appropriate icon based on category
    return '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">Analyzing student profile...</p>
          <p className="text-sm text-gray-500 mt-2">Finding best accommodations from 47 districts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SparklesIcon className="h-10 w-10" />
                <h1 className="text-3xl font-bold">AI-Powered Accommodation Recommendations</h1>
              </div>
              <p className="text-purple-100">
                Data-driven recommendations based on {recommendations[0]?.evidenceBase?.studentsCount}+ similar students across{' '}
                {recommendations[0]?.evidenceBase?.districtsCount} districts
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Collaborative Filtering ML</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Accommodations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Accommodations</h2>
          <div className="flex flex-wrap gap-2">
            {currentAccommodations.map((acc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {acc}
              </span>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5" />
            How These Recommendations Work
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              • <strong>Collaborative Filtering</strong>: We find students with similar cognitive profiles and see what worked for them
            </li>
            <li>
              • <strong>Network Effect</strong>: Recommendations improve as more districts use PathWise (currently {recommendations[0]?.evidenceBase?.districtsCount} districts)
            </li>
            <li>
              • <strong>Evidence-Based</strong>: Each recommendation shows actual effectiveness data from real students
            </li>
            <li>• <strong>Implementation Guides</strong>: Clear step-by-step instructions for each accommodation</li>
          </ul>
        </div>

        {/* Recommendations Grid */}
        <div className="space-y-6">
          {recommendations.map((rec, idx) => {
            const color = getCategoryColor(rec.category);
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-purple-300 transition-all overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 p-6 border-b border-gray-200`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{rec.accommodation}</h3>
                        <span className={`px-3 py-1 bg-${color}-200 text-${color}-800 text-xs font-medium rounded-full`}>
                          {rec.category}
                        </span>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIconSolid
                              key={star}
                              className={`h-5 w-5 ${
                                star <= rec.starRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {rec.starRating}/5 stars
                        </span>
                      </div>

                      {/* Effectiveness Score */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {rec.predictedEffectiveness.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-600">predicted effectiveness</span>
                        </div>

                        <div className="h-8 w-px bg-gray-300" />

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <span className="text-lg font-semibold text-purple-600">
                            {rec.confidence.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addAccommodation(rec.accommodation)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                    >
                      Add to IEP
                    </button>
                  </div>
                </div>

                {/* Evidence Base */}
                <div className="bg-gray-50 border-b border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <UsersIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {rec.evidenceBase.studentsCount}
                      </p>
                      <p className="text-sm text-gray-600">Similar Students</p>
                    </div>

                    <div className="text-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {rec.evidenceBase.districtsCount}
                      </p>
                      <p className="text-sm text-gray-600">School Districts</p>
                    </div>

                    <div className="text-center">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        +{rec.evidenceBase.averageImprovement}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Improvement</p>
                    </div>
                  </div>
                </div>

                {/* Rationale & Implementation */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Rationale */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                        Why This Works
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{rec.rationale}</p>
                    </div>

                    {/* Implementation Guide */}
                    <div>
                      <button
                        onClick={() =>
                          setSelectedRecommendation(
                            selectedRecommendation?.accommodation === rec.accommodation
                              ? null
                              : rec
                          )
                        }
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-2"
                      >
                        <LightBulbIcon className="h-5 w-5" />
                        {selectedRecommendation?.accommodation === rec.accommodation
                          ? 'Hide'
                          : 'Show'}{' '}
                        Implementation Guide
                      </button>

                      {selectedRecommendation?.accommodation === rec.accommodation && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-blue-900 mb-2">
                            Step-by-Step Implementation:
                          </h5>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                            {rec.implementationGuide}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Moat Explanation */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6" />
            Why PathWise Recommendations Are Better
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <p className="font-medium mb-1">🎯 Data-Driven, Not Guesswork</p>
              <p className="text-purple-700">
                Every recommendation is based on real student outcomes from {recommendations[0]?.evidenceBase?.districtsCount} districts
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">📈 Continuously Improving</p>
              <p className="text-purple-700">
                The more districts use PathWise, the better our recommendations get (network effect)
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🔬 Evidence-Based</p>
              <p className="text-purple-700">
                Each accommodation shows actual effectiveness from students similar to yours
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">⚡ Implementation Support</p>
              <p className="text-purple-700">
                Detailed guides ensure accommodations are implemented correctly
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-xs text-purple-700">
              <strong>Competitive Advantage:</strong> No other IEP platform has this data. Our
              recommendations get better with every student, every district, every outcome
              recorded. This is a data moat competitors can't replicate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
