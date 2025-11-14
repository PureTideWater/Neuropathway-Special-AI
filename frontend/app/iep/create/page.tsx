'use client';

/**
 * IEP Creation Page - AI-Powered
 * This is our KILLER FEATURE - complete IEP in 15 minutes
 * vs 6-8 hours manual (vs MagicSchool's generic goal templates)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function CreateIEPPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    teacherNotes: '',
    focusAreas: [] as string[],
  });

  const handleGenerate = async () => {
    setGenerating(true);

    // Call our AI engine
    try {
      const response = await fetch('http://localhost:4002/api/ieps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to editor with generated IEP
        router.push(`/iep/edit/${data.data.iep.id}?generated=true`);
      }
    } catch (error) {
      console.error('Failed to generate IEP:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New IEP</h1>
              <p className="mt-1 text-gray-600">AI-powered IEP generation in minutes, not hours</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <ClockIcon className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-primary-600">Est. time: 15 minutes</span>
              <span className="text-gray-400">vs 6-8 hours manual</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, name: 'Student Info', icon: DocumentTextIcon },
              { num: 2, name: 'Teacher Input', icon: SparklesIcon },
              { num: 3, name: 'AI Generation', icon: SparklesIcon },
              { num: 4, name: 'Review & Edit', icon: CheckCircleIcon },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step >= s.num ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="ml-2 font-medium">{s.name}</span>
                </div>
                {idx < 3 && (
                  <ArrowRightIcon className={`h-5 w-5 mx-4 ${step > s.num ? 'text-primary-600' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="card">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Student</h2>

              <div className="space-y-4">
                {/* Student Search/Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    className="input"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  >
                    <option value="">Select a student...</option>
                    <option value="20000000-0000-0000-0000-000000000001">Emma Williams - 4th Grade</option>
                    <option value="20000000-0000-0000-0000-000000000002">Lucas Brown - 5th Grade</option>
                    <option value="20000000-0000-0000-0000-000000000003">Sophia Martinez - 3rd Grade</option>
                  </select>
                </div>

                {formData.studentId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
                    <h3 className="font-medium text-blue-900 mb-2">Student Profile Summary</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Grade:</strong> 4th</p>
                      <p><strong>Primary Challenges:</strong> Reading comprehension, Attention span</p>
                      <p><strong>Learning Style:</strong> Visual learner</p>
                      <p><strong>Current Services:</strong> Resource Room (5x/week)</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.studentId}
                    className="btn-primary"
                  >
                    Next: Add Your Input
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Input (Optional but Helpful)</h2>

              <div className="space-y-6">
                {/* Teacher Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Observations & Notes
                  </label>
                  <textarea
                    className="input"
                    rows={6}
                    placeholder="Example: Emma struggles with reading comprehension, especially with inferential questions. She does well with visual supports and graphic organizers. Recently showing improvement with chunked reading assignments..."
                    value={formData.teacherNotes}
                    onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The more context you provide, the better the AI-generated goals will be
                  </p>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Focus Areas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Reading',
                      'Writing',
                      'Math',
                      'Behavior',
                      'Social Skills',
                      'Communication',
                      'Attention/Focus',
                      'Executive Function',
                      'Motor Skills',
                    ].map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.focusAreas.includes(area.toLowerCase())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                focusAreas: [...formData.focusAreas, area.toLowerCase()],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                focusAreas: formData.focusAreas.filter((a) => a !== area.toLowerCase()),
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="btn-ghost">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary">
                    Next: Generate IEP
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center py-12">
                {!generating ? (
                  <>
                    <div className="mb-6">
                      <SparklesIcon className="h-20 w-20 text-primary-600 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Generate Complete IEP with AI
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                      PathWise AI will analyze the student profile, your notes, and focus areas to create:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left max-w-3xl mx-auto">
                      {[
                        { icon: CheckCircleIcon, text: 'Measurable annual goals' },
                        { icon: CheckCircleIcon, text: 'Baseline & target data' },
                        { icon: CheckCircleIcon, text: 'Evidence-based accommodations' },
                        { icon: CheckCircleIcon, text: 'Service recommendations' },
                        { icon: CheckCircleIcon, text: 'Progress monitoring methods' },
                        { icon: CheckCircleIcon, text: 'Compliance checking (95%+ score)' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <item.icon className="h-6 w-6 text-success-600 flex-shrink-0" />
                          <span className="text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                      <p className="text-sm font-semibold text-primary-900 mb-2">
                        ⏱️ Time Savings
                      </p>
                      <p className="text-3xl font-bold text-primary-600 mb-1">5 hours 45 minutes</p>
                      <p className="text-sm text-primary-700">vs manual IEP creation</p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <button onClick={() => setStep(2)} className="btn-outline">
                        Back to Edit
                      </button>
                      <button onClick={handleGenerate} className="btn-primary text-lg px-8">
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Generate Complete IEP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      AI is Creating Your IEP...
                    </h2>
                    <div className="space-y-3 text-left max-w-md mx-auto">
                      {[
                        { text: 'Analyzing student profile...', done: true },
                        { text: 'Generating measurable goals...', done: true },
                        { text: 'Suggesting accommodations...', done: false },
                        { text: 'Checking state compliance...', done: false },
                        { text: 'Finalizing IEP draft...', done: false },
                      ].map((task, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          {task.done ? (
                            <CheckCircleIcon className="h-6 w-6 text-success-600" />
                          ) : (
                            <div className="w-6 h-6 spinner border-2"></div>
                          )}
                          <span className={task.done ? 'text-gray-900' : 'text-gray-500'}>{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feature Comparison (Marketing) */}
        <div className="mt-8 card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why PathWise Beats Generic AI Tools
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-purple-900 mb-1">MagicSchool</p>
              <p className="text-purple-700">❌ Generic goal templates</p>
              <p className="text-purple-700">❌ No compliance checking</p>
              <p className="text-purple-700">❌ No progress tracking</p>
            </div>
            <div>
              <p className="font-medium text-blue-900 mb-1">Traditional IEP Software</p>
              <p className="text-blue-700">❌ Manual data entry</p>
              <p className="text-blue-700">❌ 6-8 hours per IEP</p>
              <p className="text-blue-700">❌ No AI assistance</p>
            </div>
            <div>
              <p className="font-medium text-success-900 mb-1">PathWise</p>
              <p className="text-success-700">✅ Complete IEP in 15 min</p>
              <p className="text-success-700">✅ State compliance (95%+)</p>
              <p className="text-success-700">✅ Auto progress monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
