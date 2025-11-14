/**
 * PDF Export Routes
 * COMPETITIVE ADVANTAGE: Professional PDF exports for IEPs and reports
 * MagicSchool doesn't have IEP-specific export functionality
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { logger } from '../utils/logger';
import { generateIEPPDF } from '../services/iep-pdf.service';
import { generateProgressReportPDF } from '../services/progress-pdf.service';
import { generateMeetingReportPDF } from '../services/meeting-pdf.service';

export const pdfRouter = Router();

/**
 * POST /api/pdf/iep/:iepId
 * Generate PDF export of complete IEP
 * Includes goals, accommodations, services, signatures
 */
pdfRouter.post(
  '/iep/:iepId',
  [
    param('iepId').isString().notEmpty(),
    body('includeSignatures').optional().isBoolean(),
    body('includeAppendices').optional().isBoolean(),
    body('brandingOptions').optional().isObject(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { iepId } = req.params;
      const { includeSignatures = true, includeAppendices = true, brandingOptions } = req.body;

      logger.info('Generating IEP PDF', { iepId, includeSignatures, includeAppendices });

      // Generate PDF
      const pdfBuffer = await generateIEPPDF({
        iepId,
        includeSignatures,
        includeAppendices,
        brandingOptions,
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=IEP-${iepId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

      logger.info('IEP PDF generated successfully', { iepId, sizeKb: (pdfBuffer.length / 1024).toFixed(2) });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/pdf/progress-report
 * Generate progress report PDF for IEP meeting
 * Includes charts, data points, AI insights
 */
pdfRouter.post(
  '/progress-report',
  [
    body('studentId').isString().notEmpty(),
    body('iepId').isString().notEmpty(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('includeGraphs').optional().isBoolean(),
    body('includeInsights').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, iepId, startDate, endDate, includeGraphs = true, includeInsights = true } = req.body;

      logger.info('Generating progress report PDF', { studentId, iepId, startDate, endDate });

      // Generate PDF with charts
      const pdfBuffer = await generateProgressReportPDF({
        studentId,
        iepId,
        startDate,
        endDate,
        includeGraphs,
        includeInsights,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Progress-Report-${studentId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

      logger.info('Progress report PDF generated', { studentId, sizeKb: (pdfBuffer.length / 1024).toFixed(2) });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/pdf/meeting-report
 * Generate comprehensive IEP meeting report
 * Perfect for sharing with parents and team
 */
pdfRouter.post(
  '/meeting-report',
  [
    body('studentId').isString().notEmpty(),
    body('iepId').isString().notEmpty(),
    body('meetingDate').isISO8601(),
    body('attendees').isArray(),
    body('includeProgressData').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, iepId, meetingDate, attendees, includeProgressData = true } = req.body;

      logger.info('Generating meeting report PDF', { studentId, iepId, meetingDate });

      const pdfBuffer = await generateMeetingReportPDF({
        studentId,
        iepId,
        meetingDate,
        attendees,
        includeProgressData,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Meeting-Report-${iepId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

      logger.info('Meeting report PDF generated', { iepId, sizeKb: (pdfBuffer.length / 1024).toFixed(2) });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/pdf/bulk-export
 * Bulk export multiple IEPs (for annual reviews, audits, etc.)
 * UNIQUE FEATURE - MagicSchool can't do this
 */
pdfRouter.post(
  '/bulk-export',
  [body('iepIds').isArray().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { iepIds } = req.body;

      logger.info('Bulk PDF export started', { count: iepIds.length });

      // Generate all PDFs
      const pdfBuffers = await Promise.all(
        iepIds.map((iepId: string) =>
          generateIEPPDF({ iepId, includeSignatures: true, includeAppendices: true })
        )
      );

      // Create ZIP file with all PDFs
      const { createZip } = await import('../utils/zip-helper');
      const zipBuffer = await createZip(
        iepIds.map((iepId: string, index: number) => ({
          filename: `IEP-${iepId}.pdf`,
          buffer: pdfBuffers[index],
        }))
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=IEPs-Export-${Date.now()}.zip`);
      res.setHeader('Content-Length', zipBuffer.length);

      res.send(zipBuffer);

      logger.info('Bulk export completed', { count: iepIds.length, sizeKb: (zipBuffer.length / 1024).toFixed(2) });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/pdf/preview/:iepId
 * Generate preview HTML of IEP (for browser view before download)
 */
pdfRouter.get(
  '/preview/:iepId',
  [param('iepId').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { iepId } = req.params;

      logger.info('Generating IEP preview', { iepId });

      const { generateIEPHTML } = await import('../services/iep-pdf.service');
      const html = await generateIEPHTML({ iepId });

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      next(error);
    }
  }
);

export default pdfRouter;
