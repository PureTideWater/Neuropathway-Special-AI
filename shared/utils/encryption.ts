/**
 * PathWise - Encryption Utilities
 * AES-256 encryption for PII and sensitive data (FERPA compliance)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives an encryption key from a password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encrypt(plaintext: string, password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Combine: salt + iv + encrypted + tag
  return Buffer.concat([salt, iv, Buffer.from(encrypted, 'hex'), tag]).toString('base64');
}

/**
 * Decrypts data using AES-256-GCM
 */
export function decrypt(ciphertext: string, password: string): string {
  const buffer = Buffer.from(ciphertext, 'base64');

  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH, -TAG_LENGTH);
  const tag = buffer.slice(-TAG_LENGTH);

  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Creates a SHA-256 hash of data (for AI audit logs)
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generates a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Masks PII for logging (keeps first and last character, masks middle)
 */
export function maskPII(value: string, visibleChars: number = 2): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }

  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const masked = '*'.repeat(value.length - visibleChars * 2);

  return `${start}${masked}${end}`;
}

/**
 * Encrypts a JSON object
 */
export function encryptObject<T>(obj: T, password: string): string {
  return encrypt(JSON.stringify(obj), password);
}

/**
 * Decrypts to a JSON object
 */
export function decryptObject<T>(ciphertext: string, password: string): T {
  return JSON.parse(decrypt(ciphertext, password));
}
