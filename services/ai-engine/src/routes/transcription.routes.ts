/**
 * Meeting Transcription Routes
 * COMPETITIVE ADVANTAGE: FERPA-compliant AI transcription with speaker identification
 * PATENT OPPORTUNITY: Speech-to-IEP-document pipeline with automatic decision extraction
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  transcribeAudio,
  generateMeetingMinutes,
  extractDecisions,
  identifySpeakers,
} from '../services/meeting-minutes.service';
import { logger } from '../utils/logger';

export const transcriptionRouter = Router();

/**
 * POST /api/transcription/transcribe
 * Transcribe audio file using OpenAI Whisper API
 *
 * Request body:
 * {
 *   "audioUrl": "https://s3.../meeting-audio.mp3",
 *   "meetingId": "meeting-uuid-123",
 *   "attendees": ["Teacher", "Parent", "Psychologist", "Admin"]
 * }
 */
transcriptionRouter.post(
  '/transcribe',
  [
    body('audioUrl').isURL().withMessage('Valid audio URL required'),
    body('meetingId').isUUID().withMessage('Valid meeting ID required'),
    body('attendees').isArray().withMessage('Attendees array required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { audioUrl, meetingId, attendees } = req.body;

      logger.info('Starting audio transcription', {
        meetingId,
        audioUrl,
        attendeesCount: attendees.length,
      });

      // Step 1: Transcribe audio using Whisper
      const transcript = await transcribeAudio(audioUrl);

      logger.info('Transcription completed', {
        meetingId,
        transcriptLength: transcript.text.length,
        duration: transcript.duration,
      });

      res.json({
        success: true,
        data: {
          meetingId,
          transcript: transcript.text,
          duration: transcript.duration,
          language: transcript.language || 'en',
          segments: transcript.segments, // Timestamped segments
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/transcription/identify-speakers
 * Use AI to identify who said what (speaker diarization)
 */
transcriptionRouter.post(
  '/identify-speakers',
  [
    body('transcript').isString().notEmpty().withMessage('Transcript required'),
    body('attendees').isArray().withMessage('Attendees array required'),
    body('meetingId').isUUID().withMessage('Valid meeting ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transcript, attendees, meetingId } = req.body;

      logger.info('Identifying speakers in transcript', {
        meetingId,
        transcriptLength: transcript.length,
        attendeesCount: attendees.length,
      });

      // Use AI to guess who said what based on context
      const speakerSegments = await identifySpeakers(transcript, attendees);

      logger.info('Speaker identification completed', {
        meetingId,
        segmentsCount: speakerSegments.length,
      });

      res.json({
        success: true,
        data: {
          meetingId,
          speakerSegments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/transcription/generate-minutes
 * Generate official meeting minutes from transcript
 * This is the KEY feature - AI extracts decisions and formats as official document
 */
transcriptionRouter.post(
  '/generate-minutes',
  [
    body('meetingId').isUUID().withMessage('Valid meeting ID required'),
    body('transcript').isString().notEmpty().withMessage('Transcript required'),
    body('attendees').isArray().withMessage('Attendees array required'),
    body('iepId').isUUID().optional().withMessage('Valid IEP ID if provided'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { meetingId, transcript, attendees, iepId, meetingType } = req.body;

      logger.info('Generating meeting minutes', {
        meetingId,
        transcriptLength: transcript.length,
        attendeesCount: attendees.length,
        iepId,
        meetingType: meetingType || 'IEP Review',
      });

      // Use AI to generate structured meeting minutes
      const minutes = await generateMeetingMinutes({
        meetingId,
        transcript,
        attendees,
        iepId,
        meetingType,
      });

      logger.info('Meeting minutes generated', {
        meetingId,
        decisionsCount: minutes.decisions.length,
        actionItemsCount: minutes.actionItems.length,
      });

      res.json({
        success: true,
        data: minutes,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/transcription/extract-decisions
 * Extract key decisions and action items from transcript
 * Critical for legal compliance - what was decided?
 */
transcriptionRouter.post(
  '/extract-decisions',
  [
    body('transcript').isString().notEmpty().withMessage('Transcript required'),
    body('meetingId').isUUID().withMessage('Valid meeting ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transcript, meetingId } = req.body;

      logger.info('Extracting decisions from transcript', {
        meetingId,
        transcriptLength: transcript.length,
      });

      const decisions = await extractDecisions(transcript);

      logger.info('Decisions extracted', {
        meetingId,
        decisionsCount: decisions.length,
      });

      res.json({
        success: true,
        data: {
          meetingId,
          decisions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/transcription/meeting/:meetingId/minutes
 * Get previously generated meeting minutes
 */
transcriptionRouter.get(
  '/meeting/:meetingId/minutes',
  [param('meetingId').isUUID().withMessage('Valid meeting ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { meetingId } = req.params;

      logger.info('Fetching meeting minutes', { meetingId });

      // In production: Query meeting_recordings table
      const mockMinutes = {
        meetingId,
        meetingDate: new Date(),
        meetingType: 'Annual IEP Review',
        attendees: [
          { name: 'Ms. Rodriguez', role: 'Special Education Teacher' },
          { name: 'Mr. & Mrs. Doe', role: 'Parents' },
          { name: 'Dr. Chen', role: 'School Psychologist' },
          { name: 'Ms. Johnson', role: 'IEP Coordinator' },
        ],
        transcript: 'Full transcript here...',
        summary: 'Team reviewed Johnny\'s progress on reading and math goals...',
        decisions: [
          {
            id: 'decision-1',
            timestamp: new Date(),
            decision: 'Increase reading intervention from 3x to 5x per week',
            agreedBy: ['Teacher', 'Parents', 'Psychologist'],
          },
          {
            id: 'decision-2',
            timestamp: new Date(),
            decision: 'Add visual supports accommodation for math',
            agreedBy: ['Teacher', 'Parents'],
          },
        ],
        actionItems: [
          {
            id: 'action-1',
            action: 'Teacher will implement new visual supports by next week',
            assignedTo: 'Ms. Rodriguez',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
        generatedAt: new Date(),
      };

      res.json({
        success: true,
        data: mockMinutes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default transcriptionRouter;
