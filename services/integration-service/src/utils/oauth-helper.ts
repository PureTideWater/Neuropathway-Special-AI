/**
 * OAuth Helper for Google Classroom Integration
 * Handles OAuth 2.0 flow with Google
 */

import { google } from 'googleapis';
import { logger } from './logger';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/integrations/google-classroom/callback';

// Scopes needed for Google Classroom integration
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly', // View courses
  'https://www.googleapis.com/auth/classroom.rosters.readonly', // View students
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly', // View assignments
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly', // View grades
  'https://www.googleapis.com/auth/userinfo.email', // User email
  'https://www.googleapis.com/auth/userinfo.profile', // User profile
];

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate authorization URL for OAuth flow
 */
export function generateAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: SCOPES,
    state: state || '', // Anti-CSRF token
    prompt: 'consent', // Force consent screen to get refresh token
  });

  logger.info('Generated OAuth authorization URL', { state });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}> {
  const oauth2Client = createOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);

    logger.info('Successfully exchanged code for tokens', {
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });

    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date!,
    };
  } catch (error) {
    logger.error('Failed to exchange code for tokens', error as Error);
    throw new Error('Failed to authenticate with Google');
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    logger.info('Successfully refreshed access token');

    return {
      access_token: credentials.access_token!,
      expiry_date: credentials.expiry_date!,
    };
  } catch (error) {
    logger.error('Failed to refresh access token', error as Error);
    throw new Error('Failed to refresh Google access token');
  }
}

/**
 * Get authenticated Google Classroom API client
 */
export function getClassroomClient(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.classroom({ version: 'v1', auth: oauth2Client });
}

/**
 * Verify token is still valid
 */
export async function verifyToken(accessToken: string): Promise<boolean> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    return tokenInfo.expiry_date! > Date.now();
  } catch (error) {
    return false;
  }
}
