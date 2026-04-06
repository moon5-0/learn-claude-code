// Rate Limiting for Authentication Endpoints
// Prevents brute force attacks

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: Date;
  lockedUntil?: Date;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  retryAfter?: number; // seconds
}

/**
 * Check if request is rate limited
 * @param identifier - Email or IP address to rate limit
 * @param success - Whether the last attempt was successful
 * @returns RateLimitResult
 */
export async function checkRateLimit(
  identifier: string,
  success: boolean = false
): Promise<RateLimitResult> {
  const key = identifier.toLowerCase();
  const now = new Date();
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  const lockoutMs = LOCKOUT_MINUTES * 60 * 1000;
  
  const entry = rateLimitStore.get(key);
  
  // If no previous entry, create one
  if (!entry) {
    rateLimitStore.set(key, {
      attempts: success ? 0 : 1,
      firstAttemptAt: now,
    });
    
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - 1,
    };
  }
  
  // Check if currently locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfter = Math.ceil(
      (entry.lockedUntil.getTime() - now.getTime()) / 1000
    );
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfter,
    };
  }
  
  // Check if window has expired - reset counter
  const windowExpired = (now.getTime() - entry.firstAttemptAt.getTime()) > windowMs;
  
  if (windowExpired) {
    rateLimitStore.set(key, {
      attempts: success ? 0 : 1,
      firstAttemptAt: now,
    });
    
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - 1,
    };
  }
  
  // If last attempt was successful, reset counter
  if (success) {
    rateLimitStore.set(key, {
      attempts: 0,
      firstAttemptAt: now,
    });
    
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS,
    };
  }
  
  // Increment attempts
  entry.attempts += 1;
  
  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + lockoutMs);
    
    rateLimitStore.set(key, {
      ...entry,
      attempts: entry.attempts,
      lockedUntil,
    });
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfter: LOCKOUT_MINUTES * 60,
    };
  }
  
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - entry.attempts,
  };
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  rateLimitStore.delete(identifier.toLowerCase());
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupExpiredEntries(): number {
  const now = new Date();
  let cleaned = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    const isExpired = (now.getTime() - entry.firstAttemptAt.getTime()) > 
                      (WINDOW_MINUTES * 60 * 1000);
    const isLockoutExpired = !entry.lockedUntil || entry.lockedUntil < now;
    
    if (isExpired && isLockoutExpired) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * Get rate limit status for an identifier
 */
export async function getRateLimitStatus(
  identifier: string
): Promise<RateLimitResult> {
  const key = identifier.toLowerCase();
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS,
    };
  }
  
  const now = new Date();
  
  // Check if currently locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfter = Math.ceil(
      (entry.lockedUntil.getTime() - now.getTime()) / 1000
    );
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfter,
    };
  }
  
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  
  return {
    allowed: attemptsRemaining > 0,
    attemptsRemaining,
  };
}
