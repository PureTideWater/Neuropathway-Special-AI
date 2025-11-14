/**
 * Goal Prediction API Proxy
 * Routes frontend requests to AI Engine prediction service
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:4004';

/**
 * POST /api/goals/predict
 * Predict if student will meet IEP goal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Goal ID is required',
        },
        { status: 400 }
      );
    }

    // Call AI Engine prediction service
    const response = await fetch(`${AI_ENGINE_URL}/api/predictions/goal/${goalId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AI Engine returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error predicting goal outcome:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to predict goal outcome',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals/predict/at-risk
 * Get all goals at risk (for compliance dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const threshold = searchParams.get('threshold') || '70';

    const queryParams = new URLSearchParams();
    if (districtId) queryParams.set('districtId', districtId);
    queryParams.set('threshold', threshold);

    const response = await fetch(
      `${AI_ENGINE_URL}/api/predictions/goals/at-risk?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`AI Engine returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching at-risk goals:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch at-risk goals',
      },
      { status: 500 }
    );
  }
}
