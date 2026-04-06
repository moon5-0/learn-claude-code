// Password hashing and verification utilities
// Uses bcrypt with high cost factor for security

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // High cost factor for security

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Verify a password against a hash
 * Uses constant-time comparison to prevent timing attacks
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Log error but don't expose details
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if a hash needs rehashing (e.g., if cost factor changed)
 * @param hash - Existing hash to check
 * @returns boolean - True if hash needs rehashing
 */
export function needsRehash(hash: string): boolean {
  try {
    const saltRounds = parseInt(hash.split('$')[2]);
    return saltRounds < SALT_ROUNDS;
  } catch {
    return true;
  }
}
