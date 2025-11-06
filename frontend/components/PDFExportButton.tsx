'use client';

/**
 * PDF Export Button Component
 * Reusable component for exporting IEPs and reports to PDF
 * COMPETITIVE ADVANTAGE: Professional PDF exports
 */

import { useState } from 'react';

interface PDFExportButtonProps {
  type: 'iep' | 'progress-report' | 'meeting-report';
  data: any;
  filename?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  includeOptions?: boolean;
}

export default function PDFExportButton({
  type,
  data,
  filename,
  buttonText = 'Export PDF',
  variant = 'primary',
  size = 'md',
  includeOptions = true,
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    includeSignatures: true,
    includeAppendices: true,
    includeGraphs: true,
    includeInsights: true,
    includeProgressData: true,
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let endpoint = '';
      let body: any = {};

      switch (type) {
        case 'iep':
          endpoint = `http://localhost:4005/api/pdf/iep/${data.iepId}`;
          body = {
            includeSignatures: options.includeSignatures,
            includeAppendices: options.includeAppendices,
          };
          break;

        case 'progress-report':
          endpoint = 'http://localhost:4005/api/pdf/progress-report';
          body = {
            studentId: data.studentId,
            iepId: data.iepId,
            startDate: data.startDate,
            endDate: data.endDate,
            includeGraphs: options.includeGraphs,
            includeInsights: options.includeInsights,
          };
          break;

        case 'meeting-report':
          endpoint = 'http://localhost:4005/api/pdf/meeting-report';
          body = {
            studentId: data.studentId,
            iepId: data.iepId,
            meetingDate: data.meetingDate,
            attendees: data.attendees,
            includeProgressData: options.includeProgressData,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `${type}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Success notification (you can replace with your toast system)
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  const variantStyles = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className="relative">
      {/* Main Export Button */}
      <button
        onClick={() => {
          if (includeOptions) {
            setShowOptions(!showOptions);
          } else {
            handleExport();
          }
        }}
        disabled={isExporting}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          font-semibold rounded-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors shadow-sm
          flex items-center gap-2
        `}
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Options Dropdown */}
      {includeOptions && showOptions && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-80">
          <h4 className="font-semibold text-gray-900 mb-3">Export Options</h4>

          <div className="space-y-2 mb-4">
            {type === 'iep' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeSignatures}
                    onChange={(e) =>
                      setOptions({ ...options, includeSignatures: e.target.checked })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Include signature pages</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeAppendices}
                    onChange={(e) =>
                      setOptions({ ...options, includeAppendices: e.target.checked })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Include appendices</span>
                </label>
              </>
            )}

            {type === 'progress-report' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeGraphs}
                    onChange={(e) =>
                      setOptions({ ...options, includeGraphs: e.target.checked })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Include progress graphs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeInsights}
                    onChange={(e) =>
                      setOptions({ ...options, includeInsights: e.target.checked })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Include AI insights</span>
                </label>
              </>
            )}

            {type === 'meeting-report' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeProgressData}
                  onChange={(e) =>
                    setOptions({ ...options, includeProgressData: e.target.checked })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Include progress data</span>
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Export
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            💡 PDF will be formatted for printing and sharing
          </p>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
