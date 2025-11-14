/**
 * Meeting Report PDF Generation Service
 * Generates IEP meeting summary reports
 */

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import axios from 'axios';
import { logger } from '../utils/logger';

interface MeetingReportPDFOptions {
  studentId: string;
  iepId: string;
  meetingDate: string;
  attendees: Array<{ name: string; role: string; signature?: string }>;
  includeProgressData?: boolean;
}

/**
 * Generate Meeting Report PDF
 */
export async function generateMeetingReportPDF(options: MeetingReportPDFOptions): Promise<Buffer> {
  const { studentId, iepId, meetingDate, attendees, includeProgressData = true } = options;

  try {
    // Fetch IEP data
    const iepServiceUrl = process.env.IEP_SERVICE_URL || 'http://iep-service:4002';
    const iepResponse = await axios.get(`${iepServiceUrl}/api/ieps/${iepId}`);
    const iepData = iepResponse.data.data;

    // Fetch progress data if requested
    let progressData = null;
    if (includeProgressData) {
      const progressResponse = await axios.get(`${iepServiceUrl}/api/progress/student/${studentId}`);
      progressData = progressResponse.data.data;
    }

    // Generate HTML
    const html = generateMeetingReportHTML({
      iepData,
      progressData,
      meetingDate,
      attendees,
    });

    // Convert to PDF
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
    logger.error('Error generating meeting report PDF', { error, iepId });
    throw error;
  }
}

/**
 * Generate Meeting Report HTML
 */
function generateMeetingReportHTML(options: {
  iepData: any;
  progressData: any;
  meetingDate: string;
  attendees: any[];
}): string {
  const { iepData, progressData, meetingDate, attendees } = options;

  const template = Handlebars.compile(getMeetingReportTemplate());

  const templateData = {
    iep: iepData,
    student: iepData.student,
    progress: progressData,
    meetingDate,
    attendees,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  // Register helpers
  registerMeetingHelpers();

  return template(templateData);
}

/**
 * Meeting Report HTML Template
 */
function getMeetingReportTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IEP Meeting Report</title>
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
      color: #7c3aed;
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 25px;
      margin-bottom: 12px;
      color: #5b21b6;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 5px;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
    }

    .header-box {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
    }

    .header-title {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .header-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .attendee-section {
      background: #faf5ff;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .attendee-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    .attendee-table th {
      background: #7c3aed;
      color: white;
      padding: 10px;
      text-align: left;
    }

    .attendee-table td {
      padding: 10px;
      border-bottom: 1px solid #e9d5ff;
    }

    .decision-box {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }

    .action-item {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 10px 0;
      border-radius: 4px;
    }

    .summary-box {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 20px;
    }

    .signature-box {
      border: 1px solid #cbd5e1;
      padding: 15px;
      border-radius: 8px;
    }

    .signature-line {
      border-bottom: 2px solid #000;
      height: 40px;
      margin: 15px 0 10px 0;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #cbd5e1;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>IEP TEAM MEETING SUMMARY</h1>

  <!-- Meeting Header -->
  <div class="header-box">
    <div class="header-title">Meeting Information</div>
    <div class="header-grid">
      <div>
        <strong>Student:</strong> {{student.firstName}} {{student.lastName}}<br/>
        <strong>Student ID:</strong> {{student.studentIdNumber}}<br/>
        <strong>Grade:</strong> {{iep.gradeLevel}}
      </div>
      <div>
        <strong>Meeting Date:</strong> {{formatDate meetingDate}}<br/>
        <strong>Meeting Type:</strong> Annual Review<br/>
        <strong>IEP ID:</strong> {{iep.id}}
      </div>
    </div>
  </div>

  <!-- Attendees -->
  <h2>Meeting Attendees</h2>
  <div class="attendee-section">
    <table class="attendee-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Present</th>
        </tr>
      </thead>
      <tbody>
        {{#each attendees}}
        <tr>
          <td><strong>{{this.name}}</strong></td>
          <td>{{this.role}}</td>
          <td>✓ Yes</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <!-- Meeting Purpose -->
  <h2>Purpose of Meeting</h2>
  <p>
    The IEP team convened to review {{student.firstName}}'s progress on current IEP goals, discuss present levels of performance, and make decisions regarding continued eligibility, services, and placement for the upcoming IEP period.
  </p>

  {{#if progress}}
  <!-- Progress Summary -->
  <h2>Progress on Current IEP Goals</h2>
  <div class="summary-box">
    <p style="margin-bottom: 15px;">
      <strong>Overall Progress:</strong> {{progress.summary.overallProgress}}%
    </p>
    <p>
      <strong>Goals Status:</strong> {{progress.summary.onTrack}} of {{progress.summary.totalGoals}} goals are on track to be met.
    </p>
  </div>

  {{#each progress.goalProgress}}
  <h3>Goal {{add @index 1}}: {{this.domain}}</h3>
  <p><strong>Goal:</strong> {{this.goalText}}</p>
  <p><strong>Progress:</strong> {{this.currentLevel}} / {{this.targetLevel}} ({{calculateProgress this}}% complete)</p>
  <p><strong>Status:</strong> {{#if this.predictions.onTrack}}✓ On track{{else}}⚠ Needs adjustment{{/if}}</p>
  {{/each}}
  {{/if}}

  <!-- Team Decisions -->
  <h2>Team Decisions</h2>

  <div class="decision-box">
    <h3>✓ Eligibility</h3>
    <p>
      The team determined that {{student.firstName}} continues to meet eligibility criteria under the category of <strong>{{iep.eligibilityCategory}}</strong>.
    </p>
  </div>

  <div class="decision-box">
    <h3>✓ Services</h3>
    <p>
      The team agreed to continue special education services as outlined in the IEP, with the following frequency:
    </p>
    <ul style="margin: 10px 0 0 20px;">
      {{#each iep.services}}
      <li>{{this.type}} - {{this.frequency}}, {{this.duration}} minutes</li>
      {{/each}}
    </ul>
  </div>

  <div class="decision-box">
    <h3>✓ Placement</h3>
    <p>
      The team determined that the least restrictive environment (LRE) for {{student.firstName}} is:
      <strong>{{iep.placement}}</strong> with <strong>{{iep.timeInGeneralEd}}%</strong> time in general education.
    </p>
  </div>

  <!-- Parent Input -->
  <h2>Parent/Guardian Input</h2>
  <p>
    Parent(s) were given the opportunity to provide input throughout the meeting. Parent concerns and input were considered in all team decisions.
  </p>

  <!-- Action Items -->
  <h2>Action Items and Next Steps</h2>

  <div class="action-item">
    <strong>Action 1:</strong> Implement new IEP goals starting {{formatDate iep.startDate}}
  </div>

  <div class="action-item">
    <strong>Action 2:</strong> Schedule progress monitoring check-in for {{calculateMidpoint iep.startDate iep.endDate}}
  </div>

  <div class="action-item">
    <strong>Action 3:</strong> Next annual review scheduled for {{formatDate iep.endDate}}
  </div>

  <!-- Signatures -->
  <div class="signature-section">
    <h2>Team Member Signatures</h2>
    <p style="margin-bottom: 20px;">
      By signing below, team members acknowledge participation in this IEP meeting and receipt of a copy of the IEP document.
    </p>

    <div class="signature-grid">
      {{#each attendees}}
      <div class="signature-box">
        <div><strong>{{this.role}}</strong></div>
        <div style="margin-top: 5px;">{{this.name}}</div>
        <div class="signature-line"></div>
        <div style="font-size: 9pt; color: #64748b;">Signature</div>
        <div style="margin-top: 10px;">
          Date: _______________________
        </div>
      </div>
      {{/each}}
    </div>
  </div>

  <!-- Parent Rights -->
  <h2>Parent Rights</h2>
  <p>
    Parent(s) were provided with a copy of the Procedural Safeguards (Parent Rights) at this meeting. Parent(s) were informed of their right to request an independent educational evaluation, mediation, due process hearing, and state complaint procedures.
  </p>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Generated by PathWise IEP Copilot</strong> | {{generatedDate}}</p>
    <p>This document is confidential and protected under FERPA regulations.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Register Handlebars helpers for meeting reports
 */
function registerMeetingHelpers() {
  Handlebars.registerHelper('formatDate', (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  Handlebars.registerHelper('calculateProgress', (goal: any) => {
    if (!goal.targetLevel || !goal.startingLevel) return 0;
    const progress =
      ((goal.currentLevel - goal.startingLevel) / (goal.targetLevel - goal.startingLevel)) * 100;
    return Math.round(Math.max(0, Math.min(100, progress)));
  });

  Handlebars.registerHelper('add', (a: number, b: number) => {
    return a + b;
  });

  Handlebars.registerHelper('calculateMidpoint', (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const midpoint = new Date((start.getTime() + end.getTime()) / 2);
    return midpoint.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}

export default {
  generateMeetingReportPDF,
};
