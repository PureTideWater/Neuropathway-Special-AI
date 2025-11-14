'use client';

/**
 * IEP Meeting Prep Automation
 * COMPETITIVE ADVANTAGE: 2-3 hours → 5 minutes
 *
 * Auto-generates:
 * - Meeting agenda
 * - Progress summary
 * - Revised goal suggestions
 * - Parent-friendly summary
 * - Meeting minutes template
 * - Email invitations
 */

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  EnvelopeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface MeetingPrep {
  meetingDate: Date;
  meetingType: string;
  participants: string[];
  agenda: string[];
  progressSummary: {
    goalsOnTrack: number;
    goalsBehind: number;
    overallProgress: number;
  };
  suggestedRevisions: Array<{
    goalName: string;
    currentStatus: string;
    suggestedAction: string;
  }>;
  generatedDocuments: Array<{
    name: string;
    type: string;
    ready: boolean;
  }>;
}

export default function MeetingPrepPage() {
  const params = useParams();
  const iepId = params.iepId as string;

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [prepData, setPrepData] = useState<MeetingPrep | null>(null);

  const generateMeetingPrep = async () => {
    setGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock generated data
    const mockPrepData: MeetingPrep = {
      meetingDate: new Date('2024-12-15'),
      meetingType: 'Annual IEP Review',
      participants: [
        'Ms. Sarah Johnson (Teacher)',
        'Mr. John Doe (Parent)',
        'Mrs. Jane Doe (Parent)',
        'Dr. Lisa Smith (School Psychologist)',
        'Mr. Mike Brown (Special Ed Coordinator)',
      ],
      agenda: [
        'Welcome and Introductions',
        'Review Current IEP Goals Progress',
        'Discuss Student Strengths and Challenges',
        'Present Assessment Results',
        'Propose Revised Goals for Next Year',
        'Review Accommodations and Modifications',
        'Determine Placement and Services',
        'Parent Questions and Concerns',
        'Next Steps and Timeline',
      ],
      progressSummary: {
        goalsOnTrack: 6,
        goalsBehind: 2,
        overallProgress: 75,
      },
      suggestedRevisions: [
        {
          goalName: 'Reading Comprehension',
          currentStatus: 'On track - 75% progress',
          suggestedAction: 'Increase complexity level for next year',
        },
        {
          goalName: 'Math Problem Solving',
          currentStatus: 'Behind - 45% progress',
          suggestedAction: 'Maintain goal, add visual supports',
        },
        {
          goalName: 'Social Skills',
          currentStatus: 'Exceeded - 95% progress',
          suggestedAction: 'Goal met - consider new focus area',
        },
      ],
      generatedDocuments: [
        { name: 'Meeting Agenda', type: 'PDF', ready: true },
        { name: 'Progress Summary Report', type: 'PDF', ready: true },
        { name: 'Parent-Friendly Summary', type: 'PDF', ready: true },
        { name: 'Revised IEP Draft', type: 'PDF', ready: true },
        { name: 'Meeting Minutes Template', type: 'DOCX', ready: true },
        { name: 'Attendance Sheet', type: 'PDF', ready: true },
      ],
    };

    setPrepData(mockPrepData);
    setGenerated(true);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">IEP Meeting Prep</h1>
              <p className="mt-2 text-indigo-100">
                Generate your complete meeting packet in 30 seconds
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <p className="text-sm font-medium">Time Saved</p>
              <p className="text-3xl font-bold">2.5 hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!generated ? (
          /* Generation Interface */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Prep Your IEP Meeting?
                </h2>
                <p className="text-gray-600">
                  We'll analyze all student data and generate a complete meeting packet including:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Meeting Agenda</p>
                    <p className="text-sm text-gray-600">Customized for this meeting</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Progress Summary</p>
                    <p className="text-sm text-gray-600">Data-driven insights</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Revised Goals</p>
                    <p className="text-sm text-gray-600">AI-suggested updates</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Parent Summary</p>
                    <p className="text-sm text-gray-600">Easy-to-read format</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Meeting Template</p>
                    <p className="text-sm text-gray-600">For taking notes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Email Invites</p>
                    <p className="text-sm text-gray-600">Auto-generated</p>
                  </div>
                </div>
              </div>

              <button
                onClick={generateMeetingPrep}
                disabled={generating}
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <SparklesIcon className="h-6 w-6 animate-spin" />
                    Generating Meeting Prep...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6" />
                    Generate Meeting Prep (30 seconds)
                  </>
                )}
              </button>

              {generating && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-900 font-medium mb-2">
                    AI is analyzing student data...
                  </p>
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Generated Results */
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Meeting Prep Complete! 🎉
                  </h3>
                  <p className="text-green-700">
                    Your complete meeting packet is ready. Saved you 2.5 hours of work!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Meeting Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Meeting Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meeting Type</p>
                      <p className="text-gray-900">{prepData?.meetingType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Date & Time</p>
                      <p className="text-gray-900">
                        {prepData?.meetingDate.toLocaleDateString()} @ 2:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Participants</p>
                    <div className="space-y-2">
                      {prepData?.participants.map((participant, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <UserGroupIcon className="h-4 w-4 text-gray-400" />
                          {participant}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Meeting Agenda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Agenda</h2>
                  <ol className="space-y-2">
                    {prepData?.agenda.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Progress Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h2>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-3xl font-bold text-green-600">
                        {prepData?.progressSummary.goalsOnTrack}
                      </p>
                      <p className="text-sm text-green-800 mt-1">Goals On Track</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-3xl font-bold text-yellow-600">
                        {prepData?.progressSummary.goalsBehind}
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">Need Attention</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-3xl font-bold text-blue-600">
                        {prepData?.progressSummary.overallProgress}%
                      </p>
                      <p className="text-sm text-blue-800 mt-1">Overall Progress</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Suggested Goal Revisions
                  </h3>
                  <div className="space-y-3">
                    {prepData?.suggestedRevisions.map((revision, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-1">{revision.goalName}</p>
                        <p className="text-sm text-gray-600 mb-2">{revision.currentStatus}</p>
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4 text-purple-600" />
                          <p className="text-sm text-purple-700 font-medium">
                            {revision.suggestedAction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Generated Documents */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Documents</h2>

                  <div className="space-y-3 mb-6">
                    {prepData?.generatedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      Download All (ZIP)
                    </button>

                    <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <PrinterIcon className="h-5 w-5" />
                      Print Packet
                    </button>

                    <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <EnvelopeIcon className="h-5 w-5" />
                      Email to Participants
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      ⏱️ Time Breakdown
                    </p>
                    <div className="text-xs text-purple-800 space-y-1">
                      <p>Traditional prep: 2.5 hours</p>
                      <p>PathWise AI: 30 seconds</p>
                      <p className="font-semibold pt-1 border-t border-purple-300 mt-2">
                        Saved: 2 hours 29.5 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
