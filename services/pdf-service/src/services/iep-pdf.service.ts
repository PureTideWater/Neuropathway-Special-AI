/**
 * IEP PDF Generation Service
 * Generates professional, compliant IEP documents
 */

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import axios from 'axios';
import { logger } from '../utils/logger';

interface IEPPDFOptions {
  iepId: string;
  includeSignatures?: boolean;
  includeAppendices?: boolean;
  brandingOptions?: {
    districtLogo?: string;
    districtName?: string;
    primaryColor?: string;
  };
}

/**
 * Generate IEP PDF from data
 */
export async function generateIEPPDF(options: IEPPDFOptions): Promise<Buffer> {
  const { iepId, includeSignatures = true, includeAppendices = true, brandingOptions } = options;

  try {
    // Fetch IEP data from IEP service
    const iepServiceUrl = process.env.IEP_SERVICE_URL || 'http://iep-service:4002';
    const response = await axios.get(`${iepServiceUrl}/api/ieps/${iepId}`);
    const iepData = response.data.data;

    // Generate HTML from template
    const html = await generateIEPHTML({
      iepId,
      iepData,
      includeSignatures,
      includeAppendices,
      brandingOptions,
    });

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with proper formatting
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      displayHeaderFooter: true,
      headerTemplate: generateHeaderTemplate(brandingOptions),
      footerTemplate: generateFooterTemplate(),
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    logger.error('Error generating IEP PDF', { error, iepId });
    throw error;
  }
}

/**
 * Generate IEP HTML (for preview or PDF generation)
 */
export async function generateIEPHTML(options: {
  iepId: string;
  iepData?: any;
  includeSignatures?: boolean;
  includeAppendices?: boolean;
  brandingOptions?: any;
}): Promise<string> {
  const { iepId, iepData, includeSignatures = true, includeAppendices = true, brandingOptions } = options;

  // If iepData not provided, fetch it
  let data = iepData;
  if (!data) {
    const iepServiceUrl = process.env.IEP_SERVICE_URL || 'http://iep-service:4002';
    const response = await axios.get(`${iepServiceUrl}/api/ieps/${iepId}`);
    data = response.data.data;
  }

  // Load Handlebars template
  const template = Handlebars.compile(getIEPTemplate());

  // Prepare template data
  const templateData = {
    iep: data,
    student: data.student,
    includeSignatures,
    includeAppendices,
    branding: brandingOptions || {},
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  // Register Handlebars helpers
  registerHandlebarsHelpers();

  // Render HTML
  const html = template(templateData);

  return html;
}

/**
 * IEP HTML Template
 * Professional, compliant format
 */
function getIEPTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Individualized Education Program (IEP)</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
    }

    .page {
      padding: 0.75in;
    }

    h1 {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      color: {{branding.primaryColor}};
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      border-bottom: 2px solid #333;
      padding-bottom: 5px;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
    }

    .header-info {
      margin-bottom: 30px;
    }

    .info-row {
      display: flex;
      margin-bottom: 8px;
    }

    .info-label {
      font-weight: bold;
      width: 180px;
    }

    .info-value {
      flex: 1;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .goal-box {
      border: 1px solid #666;
      padding: 15px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .goal-header {
      background: #f0f0f0;
      padding: 8px;
      font-weight: bold;
      margin: -15px -15px 15px -15px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    table th {
      background: #e0e0e0;
      font-weight: bold;
      padding: 8px;
      border: 1px solid #666;
      text-align: left;
    }

    table td {
      padding: 8px;
      border: 1px solid #666;
    }

    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }

    .signature-box {
      margin-bottom: 30px;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      width: 250px;
      display: inline-block;
      margin-right: 40px;
    }

    .page-break {
      page-break-after: always;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: rgba(200, 200, 200, 0.2);
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <h1>INDIVIDUALIZED EDUCATION PROGRAM (IEP)</h1>

    <!-- Student Information -->
    <div class="header-info">
      <div class="info-row">
        <span class="info-label">Student Name:</span>
        <span class="info-value">{{student.firstName}} {{student.lastName}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date of Birth:</span>
        <span class="info-value">{{formatDate student.dateOfBirth}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Student ID:</span>
        <span class="info-value">{{student.studentIdNumber}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Grade:</span>
        <span class="info-value">{{iep.gradeLevel}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IEP Start Date:</span>
        <span class="info-value">{{formatDate iep.startDate}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IEP End Date:</span>
        <span class="info-value">{{formatDate iep.endDate}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IEP Meeting Date:</span>
        <span class="info-value">{{formatDate iep.meetingDate}}</span>
      </div>
    </div>

    <!-- Present Levels of Performance -->
    <div class="section">
      <h2>I. PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE (PLOP)</h2>
      <p>{{iep.presentLevels}}</p>
    </div>

    <!-- Annual Goals -->
    <div class="section">
      <h2>II. MEASURABLE ANNUAL GOALS</h2>
      {{#each iep.goals}}
      <div class="goal-box">
        <div class="goal-header">Goal {{@index}} - {{this.domain}}</div>

        <div style="margin-bottom: 10px;">
          <strong>Goal:</strong> {{this.description}}
        </div>

        <div style="margin-bottom: 10px;">
          <strong>Baseline:</strong> {{this.baseline}}
        </div>

        <div style="margin-bottom: 10px;">
          <strong>Target:</strong> {{this.target}}
        </div>

        <div style="margin-bottom: 10px;">
          <strong>Measurement Method:</strong> {{this.measurementMethod}}
        </div>

        <div>
          <strong>Progress Monitoring:</strong> {{this.progressMonitoringSchedule}}
        </div>
      </div>
      {{/each}}
    </div>

    <!-- Special Education Services -->
    <div class="section">
      <h2>III. SPECIAL EDUCATION AND RELATED SERVICES</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Location</th>
            <th>Provider</th>
          </tr>
        </thead>
        <tbody>
          {{#each iep.services}}
          <tr>
            <td>{{this.type}}</td>
            <td>{{this.frequency}}</td>
            <td>{{this.duration}}</td>
            <td>{{this.location}}</td>
            <td>{{this.provider}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <!-- Accommodations and Modifications -->
    <div class="section">
      <h2>IV. ACCOMMODATIONS AND MODIFICATIONS</h2>
      <h3>Classroom Accommodations:</h3>
      <ul>
        {{#each iep.accommodations.classroom}}
        <li>{{this}}</li>
        {{/each}}
      </ul>

      <h3>Testing Accommodations:</h3>
      <ul>
        {{#each iep.accommodations.testing}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>

    <!-- Least Restrictive Environment -->
    <div class="section">
      <h2>V. LEAST RESTRICTIVE ENVIRONMENT (LRE)</h2>
      <p><strong>Placement:</strong> {{iep.placement}}</p>
      <p><strong>Justification:</strong> {{iep.lreJustification}}</p>
      <p><strong>Time in General Education:</strong> {{iep.timeInGeneralEd}}%</p>
    </div>

    {{#if includeSignatures}}
    <div class="page-break"></div>

    <!-- IEP Team Signatures -->
    <div class="signature-section">
      <h2>VI. IEP TEAM SIGNATURES</h2>
      <p style="margin-bottom: 20px;">
        The following individuals participated in the development of this IEP:
      </p>

      <div class="signature-box">
        <div><strong>Parent/Guardian:</strong></div>
        <div class="signature-line"></div>
        <span style="margin-left: 20px;">Date: ____________</span>
      </div>

      <div class="signature-box">
        <div><strong>Special Education Teacher:</strong></div>
        <div class="signature-line"></div>
        <span style="margin-left: 20px;">Date: ____________</span>
      </div>

      <div class="signature-box">
        <div><strong>General Education Teacher:</strong></div>
        <div class="signature-line"></div>
        <span style="margin-left: 20px;">Date: ____________</span>
      </div>

      <div class="signature-box">
        <div><strong>LEA Representative:</strong></div>
        <div class="signature-line"></div>
        <span style="margin-left: 20px;">Date: ____________</span>
      </div>

      <div class="signature-box">
        <div><strong>Assessment Professional:</strong></div>
        <div class="signature-line"></div>
        <span style="margin-left: 20px;">Date: ____________</span>
      </div>
    </div>
    {{/if}}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 9pt; color: #666;">
      <p>Generated by PathWise IEP Copilot on {{generatedDate}}</p>
      <p>This document is confidential and protected under FERPA regulations.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Register Handlebars helpers
 */
function registerHandlebarsHelpers() {
  Handlebars.registerHelper('formatDate', (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}

/**
 * Generate PDF header template
 */
function generateHeaderTemplate(brandingOptions?: any): string {
  const districtName = brandingOptions?.districtName || '';
  return `
    <div style="font-size: 9pt; padding: 0 0.75in; width: 100%; text-align: center;">
      <span>${districtName}</span>
    </div>
  `;
}

/**
 * Generate PDF footer template
 */
function generateFooterTemplate(): string {
  return `
    <div style="font-size: 9pt; padding: 0 0.75in; width: 100%; display: flex; justify-content: space-between;">
      <span>Confidential - Protected under FERPA</span>
      <span class="pageNumber"></span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;
}

export default {
  generateIEPPDF,
  generateIEPHTML,
};
