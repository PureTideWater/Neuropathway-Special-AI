/**
 * Progress Report PDF Generation Service
 * Generates progress monitoring reports with charts and AI insights
 */

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import axios from 'axios';
import { logger } from '../utils/logger';

interface ProgressReportPDFOptions {
  studentId: string;
  iepId: string;
  startDate?: string;
  endDate?: string;
  includeGraphs?: boolean;
  includeInsights?: boolean;
}

/**
 * Generate Progress Report PDF
 */
export async function generateProgressReportPDF(options: ProgressReportPDFOptions): Promise<Buffer> {
  const { studentId, iepId, startDate, endDate, includeGraphs = true, includeInsights = true } = options;

  try {
    // Fetch progress data from IEP service
    const iepServiceUrl = process.env.IEP_SERVICE_URL || 'http://iep-service:4002';
    const response = await axios.get(`${iepServiceUrl}/api/progress/student/${studentId}`, {
      params: { startDate, endDate },
    });
    const progressData = response.data.data;

    // Fetch IEP data for context
    const iepResponse = await axios.get(`${iepServiceUrl}/api/ieps/${iepId}`);
    const iepData = iepResponse.data.data;

    // Generate HTML from template
    const html = generateProgressReportHTML({
      progressData,
      iepData,
      includeGraphs,
      includeInsights,
    });

    // Convert HTML to PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    logger.error('Error generating progress report PDF', { error, studentId });
    throw error;
  }
}

/**
 * Generate Progress Report HTML
 */
function generateProgressReportHTML(options: {
  progressData: any;
  iepData: any;
  includeGraphs: boolean;
  includeInsights: boolean;
}): string {
  const { progressData, iepData, includeGraphs, includeInsights } = options;

  const template = Handlebars.compile(getProgressReportTemplate());

  const templateData = {
    student: progressData,
    iep: iepData,
    summary: progressData.summary,
    goals: progressData.goalProgress,
    insights: includeInsights ? progressData.aiInsights : [],
    includeGraphs,
    includeInsights,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  // Register helpers
  registerProgressHelpers();

  return template(templateData);
}

/**
 * Progress Report HTML Template
 */
function getProgressReportTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IEP Progress Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 0.75in;
    }

    h1 {
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      color: #0ea5e9;
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 25px;
      margin-bottom: 12px;
      color: #0c4a6e;
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 5px;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
      color: #334155;
    }

    .header-section {
      background: #f0f9ff;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .info-item {
      display: flex;
    }

    .info-label {
      font-weight: bold;
      margin-right: 8px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .summary-card {
      background: linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }

    .card-value {
      font-size: 28pt;
      font-weight: bold;
      margin: 10px 0;
    }

    .card-label {
      font-size: 10pt;
      opacity: 0.9;
    }

    .goal-section {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .goal-header {
      background: #0ea5e9;
      color: white;
      padding: 10px 15px;
      margin: -20px -20px 20px -20px;
      border-radius: 8px 8px 0 0;
      font-size: 14pt;
      font-weight: bold;
    }

    .progress-bar {
      width: 100%;
      height: 30px;
      background: #e2e8f0;
      border-radius: 15px;
      overflow: hidden;
      margin: 15px 0;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #22c55e 100%);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: bold;
    }

    .status-on-track {
      background: #d1fae5;
      color: #065f46;
    }

    .status-needs-attention {
      background: #fef3c7;
      color: #92400e;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }

    .data-table th {
      background: #f1f5f9;
      padding: 8px;
      text-align: left;
      border: 1px solid #cbd5e1;
      font-weight: bold;
    }

    .data-table td {
      padding: 8px;
      border: 1px solid #cbd5e1;
    }

    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .chart-placeholder {
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px dashed #0ea5e9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12pt;
      color: #0c4a6e;
      margin: 20px 0;
    }

    .insight-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }

    .insight-icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: #f59e0b;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-right: 10px;
      font-weight: bold;
    }

    .recommendation-box {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #cbd5e1;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <!-- Title -->
  <h1>IEP PROGRESS MONITORING REPORT</h1>

  <!-- Header Information -->
  <div class="header-section">
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Student:</span>
        <span>{{student.studentName}}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Report Period:</span>
        <span>{{formatDateRange summary.reportPeriod}}</span>
      </div>
      <div class="info-item">
        <span class="info-label">IEP ID:</span>
        <span>{{student.iepId}}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Generated:</span>
        <span>{{generatedDate}}</span>
      </div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-cards">
    <div class="summary-card">
      <div class="card-label">Total Goals</div>
      <div class="card-value">{{summary.totalGoals}}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">On Track</div>
      <div class="card-value">{{summary.onTrack}}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Needs Attention</div>
      <div class="card-value">{{summary.needsAttention}}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Overall Progress</div>
      <div class="card-value">{{summary.overallProgress}}%</div>
    </div>
  </div>

  <!-- Overall Summary -->
  <h2>Executive Summary</h2>
  <p>
    {{student.studentName}} has {{summary.totalGoals}} active IEP goals. Currently, {{summary.onTrack}} {{pluralize summary.onTrack "goal is" "goals are"}} on track to be met by the annual review date. The student has shown an overall progress rate of {{summary.overallProgress}}% towards goal mastery.
  </p>

  <!-- Goal-by-Goal Progress -->
  <h2>Goal Progress Details</h2>

  {{#each goals}}
  <div class="goal-section">
    <div class="goal-header">
      Goal {{add @index 1}}: {{this.domain}}
    </div>

    <div style="margin-bottom: 15px;">
      <strong>Goal Statement:</strong> {{this.goalText}}
    </div>

    <div style="margin-bottom: 15px;">
      <strong>Status:</strong>
      <span class="status-badge {{#if this.predictions.onTrack}}status-on-track{{else}}status-needs-attention{{/if}}">
        {{#if this.predictions.onTrack}}✓ On Track{{else}}⚠ Needs Attention{{/if}}
      </span>
    </div>

    <!-- Progress Bar -->
    <div>
      <strong>Current Progress:</strong>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {{calculateProgress this}}%">
          {{this.currentLevel}} / {{this.targetLevel}} ({{calculateProgress this}}%)
        </div>
      </div>
    </div>

    <div style="margin: 15px 0;">
      <strong>Baseline:</strong> {{this.startingLevel}} →
      <strong>Current:</strong> {{this.currentLevel}} →
      <strong>Target:</strong> {{this.targetLevel}}
      <span style="color: #10b981; font-weight: bold;">(+{{this.improvement}} improvement)</span>
    </div>

    {{#if ../includeGraphs}}
    <div class="chart-placeholder">
      📈 Progress Chart: {{this.domain}}
      <br/>
      <small>({{this.dataPoints.length}} data points collected)</small>
    </div>
    {{/if}}

    <!-- Data Points Table -->
    <h3>Recent Progress Data</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Value</th>
          <th>Source</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {{#each this.dataPoints}}
        <tr>
          <td>{{formatShortDate this.date}}</td>
          <td><strong>{{this.value}}</strong></td>
          <td>{{formatSource this.source}}</td>
          <td>{{this.note}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Accommodations Effectiveness -->
    <h3>Accommodation Effectiveness</h3>
    <ul>
      {{#each this.accommodationsUsed}}
      <li>
        <strong>{{this}}</strong> - {{getEffectiveness ../accommodationEffectiveness this}}% effective
      </li>
      {{/each}}
    </ul>

    <!-- Recommendations -->
    <div class="recommendation-box">
      <strong>📋 Recommended Next Steps:</strong>
      <ul style="margin: 10px 0 0 20px;">
        {{#each this.predictions.recommendedActions}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </div>
  {{/each}}

  {{#if includeInsights}}
  <div class="page-break"></div>

  <!-- AI Insights -->
  <h2>AI-Powered Insights</h2>
  <p style="margin-bottom: 20px;">
    Based on analysis of {{student.summary.totalGoals}} goals and {{calculateTotalDataPoints goals}} data points, our AI has identified the following insights:
  </p>

  {{#each insights}}
  <div class="insight-box">
    <span class="insight-icon">💡</span>
    <strong>{{formatInsightType this.type}}:</strong> {{this.message}}
    <br/>
    <small style="color: #92400e;">Confidence: {{multiply this.confidence 100}}%</small>
  </div>
  {{/each}}
  {{/if}}

  <!-- Meeting Readiness -->
  <h2>IEP Meeting Preparation</h2>
  <p>
    This progress report is ready for IEP team review. Data collection has been consistent with {{student.meetingReady.dataPoints}} data points per goal on average. Evidence quality is rated as <strong>{{student.meetingReady.evidenceQuality}}</strong>.
  </p>

  <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <strong>Parent-Friendly Summary:</strong>
    <p style="margin-top: 10px;">{{student.meetingReady.parentSummary}}</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Generated by PathWise IEP Copilot</strong> | {{generatedDate}}</p>
    <p>This report is confidential and protected under FERPA regulations.</p>
    <p>For questions about this report, please contact your IEP case manager.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Register Handlebars helpers for progress reports
 */
function registerProgressHelpers() {
  Handlebars.registerHelper('formatShortDate', (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  Handlebars.registerHelper('formatDateRange', (range: string) => {
    return range || 'Full IEP Period';
  });

  Handlebars.registerHelper('formatSource', (source: string) => {
    const sourceMap: any = {
      adaptive_session: 'Adaptive Session',
      teacher_observation: 'Teacher Observation',
      formal_assessment: 'Formal Assessment',
      baseline_assessment: 'Baseline Assessment',
      baseline_observation: 'Baseline Observation',
    };
    return sourceMap[source] || source;
  });

  Handlebars.registerHelper('formatInsightType', (type: string) => {
    const typeMap: any = {
      positive_trend: 'Positive Trend',
      intervention_suggestion: 'Intervention Suggestion',
      accommodation_recommendation: 'Accommodation Recommendation',
      needs_attention: 'Needs Attention',
    };
    return typeMap[type] || type;
  });

  Handlebars.registerHelper('calculateProgress', (goal: any) => {
    if (!goal.targetLevel || !goal.startingLevel) return 0;
    const progress =
      ((goal.currentLevel - goal.startingLevel) / (goal.targetLevel - goal.startingLevel)) * 100;
    return Math.round(Math.max(0, Math.min(100, progress)));
  });

  Handlebars.registerHelper('getEffectiveness', (effectivenessObj: any, accommodation: string) => {
    const value = effectivenessObj[accommodation];
    return value ? Math.round(value * 100) : 0;
  });

  Handlebars.registerHelper('multiply', (a: number, b: number) => {
    return Math.round(a * b);
  });

  Handlebars.registerHelper('add', (a: number, b: number) => {
    return a + b;
  });

  Handlebars.registerHelper('pluralize', (count: number, singular: string, plural: string) => {
    return count === 1 ? singular : plural;
  });

  Handlebars.registerHelper('calculateTotalDataPoints', (goals: any[]) => {
    return goals.reduce((total, goal) => total + (goal.dataPoints?.length || 0), 0);
  });
}

export default {
  generateProgressReportPDF,
};
