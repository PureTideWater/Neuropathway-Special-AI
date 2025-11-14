import { NextRequest, NextResponse } from 'next/server';

/**
 * AI-Powered Observation Processing
 * Extracts: student name, skill category, related IEP goals
 *
 * This is a MOCK for now - will connect to real AI engine later
 */

export async function POST(request: NextRequest) {
  try {
    const { text, studentId } = await request.json();

    // Mock AI processing (replace with actual AI call to backend)
    const processedData = await mockAIProcessing(text, studentId);

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Observation processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process observation' },
      { status: 500 }
    );
  }
}

// Mock AI processing - replace with actual AI engine call
async function mockAIProcessing(text: string, studentId: string) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Extract key information from text
  const lowerText = text.toLowerCase();

  // Determine category based on keywords
  let category = 'General';
  if (lowerText.includes('read') || lowerText.includes('comprehension')) {
    category = 'Reading';
  } else if (lowerText.includes('math') || lowerText.includes('counting')) {
    category = 'Mathematics';
  } else if (lowerText.includes('write') || lowerText.includes('writing')) {
    category = 'Writing';
  } else if (lowerText.includes('behavior') || lowerText.includes('social')) {
    category = 'Behavior/Social';
  } else if (lowerText.includes('speech') || lowerText.includes('language')) {
    category = 'Speech/Language';
  }

  // Mock related goals
  const relatedGoals = category !== 'General' ? [
    `Improve ${category} skills`,
    `Demonstrate progress in ${category}`,
  ] : [];

  // Extract student name from text if present
  const studentName = studentId || extractStudentName(text);

  return {
    studentName,
    category,
    relatedGoals,
    confidence: 0.87,
    suggestedActions: [
      `Review ${category} IEP goals`,
      'Consider targeted intervention',
    ],
  };
}

function extractStudentName(text: string): string {
  // Simple name extraction (can be improved with NLP)
  const names = ['Johnny', 'Sarah', 'Michael', 'Emily', 'David'];

  for (const name of names) {
    if (text.includes(name)) {
      return name + ' Doe';
    }
  }

  return 'Unknown Student';
}
