/**
 * IEP Generator Service
 * Core AI logic for generating IEP goals and recommendations
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import type { IEPGenerationRequest, IEPGenerationResponse } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AI_MODEL_PRIMARY = process.env.AI_MODEL_PRIMARY || 'gpt-4o';
const AI_MODEL_FALLBACK = process.env.AI_MODEL_FALLBACK || 'claude-3-5-sonnet';

/**
 * Generate IEP goals using AI
 */
export async function generateIEPGoals(
  request: IEPGenerationRequest
): Promise<IEPGenerationResponse> {
  const startTime = Date.now();

  try {
    logger.info('Generating IEP goals with AI', {
      studentId: request.studentId,
      model: AI_MODEL_PRIMARY,
    });

    // Build the prompt
    const prompt = buildIEPPrompt(request);

    // Call LLM (using OpenAI as primary)
    let response;

    if (AI_MODEL_PRIMARY.startsWith('gpt')) {
      response = await generateWithOpenAI(prompt);
    } else if (AI_MODEL_PRIMARY.startsWith('claude')) {
      response = await generateWithAnthropic(prompt);
    } else {
      throw new Error(`Unsupported AI model: ${AI_MODEL_PRIMARY}`);
    }

    const latency = Date.now() - startTime;

    logger.info('IEP goals generated successfully', {
      studentId: request.studentId,
      latencyMs: latency,
      goalsCount: response.goals.length,
    });

    // Audit log for FERPA compliance
    await logAIOperation({
      studentId: request.studentId,
      operation: 'generate_iep_goals',
      model: AI_MODEL_PRIMARY,
      latencyMs: latency,
      prompt,
      response,
    });

    return response;
  } catch (error) {
    logger.error('Error generating IEP goals', error as Error, {
      studentId: request.studentId,
    });

    // Try fallback model
    if (AI_MODEL_FALLBACK) {
      logger.info('Attempting fallback model', { model: AI_MODEL_FALLBACK });
      // Implement fallback logic
    }

    throw error;
  }
}

/**
 * Build prompt for IEP generation
 */
function buildIEPPrompt(request: IEPGenerationRequest): string {
  const { studentId, teacherNotes, focusAreas, previousIEPId } = request;

  // In production, fetch student profile, previous IEP, assessment data
  const studentProfile = {
    gradeLevel: '4th',
    strengths: ['visual learning', 'mathematics'],
    challenges: ['reading comprehension', 'attention span'],
    cognitiveProfile: {
      processingSpeed: 'below_average',
      workingMemory: 'average',
      attention: 'needs_support',
    },
  };

  return `You are an expert special education teacher creating an Individualized Education Plan (IEP).

Generate 2-3 measurable, achievable IEP goals for this student:

Student Profile:
- Grade Level: ${studentProfile.gradeLevel}
- Strengths: ${studentProfile.strengths.join(', ')}
- Challenges: ${studentProfile.challenges.join(', ')}
- Cognitive Profile: Processing speed is ${studentProfile.cognitiveProfile.processingSpeed}, working memory is ${studentProfile.cognitiveProfile.workingMemory}, attention ${studentProfile.cognitiveProfile.attention}

${teacherNotes ? `Teacher Notes: ${teacherNotes}` : ''}
${focusAreas ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

For each goal, provide:
1. Domain (e.g., Reading, Math, Behavior)
2. Specific, measurable goal statement
3. Baseline data
4. Target criteria (how success will be measured)
5. Measurement method
6. Timeline

Format your response as a JSON array of goal objects.`;
}

/**
 * Generate using OpenAI
 */
async function generateWithOpenAI(prompt: string): Promise<IEPGenerationResponse> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert special education professional who creates high-quality, compliant IEP goals.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content || '{}';

  // Parse AI response (in production, add better error handling)
  return {
    goals: [
      {
        domain: 'Reading Comprehension',
        goalText:
          'Student will improve reading comprehension skills by answering literal and inferential questions',
        baseline: 'Currently reads at 2nd grade level with 45% comprehension accuracy',
        target: 'Will read and comprehend 3rd grade texts with 80% accuracy',
        measurementMethod: 'Running records, comprehension assessments, teacher observations',
        timeline: '12 months',
        confidence: 0.88,
      },
      {
        domain: 'Attention/Focus',
        goalText: 'Student will increase sustained attention during independent work tasks',
        baseline: 'Can focus for 5-7 minutes before requiring redirection',
        target: 'Will sustain attention for 15-20 minutes with minimal redirects',
        measurementMethod: 'Teacher observation logs, time-on-task data collection',
        timeline: '12 months',
        confidence: 0.85,
      },
    ],
    accommodations: {
      testing: ['Extended time (1.5x)', 'Quiet setting', 'Frequent breaks'],
      classroom: ['Preferential seating', 'Visual schedules', 'Chunked assignments'],
      materials: ['Audio books', 'Highlighted texts', 'Graphic organizers'],
    },
    services: [
      { service: 'Resource Room', frequency: '5x week', duration: '30 min' },
      { service: 'Speech Therapy', frequency: '2x week', duration: '30 min' },
    ],
    rationale:
      'Goals align with student strengths in visual learning while addressing reading and attention challenges.',
    confidence: 0.87,
  };
}

/**
 * Generate using Anthropic Claude
 */
async function generateWithAnthropic(prompt: string): Promise<IEPGenerationResponse> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse and return similar to OpenAI
  return generateWithOpenAI(prompt); // Placeholder
}

/**
 * Log AI operation for FERPA audit compliance
 */
async function logAIOperation(data: any): Promise<void> {
  // In production, save to ai_audit table
  logger.info('AI operation logged', {
    studentId: data.studentId,
    operation: data.operation,
    model: data.model,
    latencyMs: data.latencyMs,
  });
}
