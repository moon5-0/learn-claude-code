// Input Validation Utilities
// Implements security measures from threat model

import validator from 'validator';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');
  
  // Escape HTML entities
  sanitized = validator.escape(sanitized);
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 1000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
    return { valid: false, errors };
  }
  
  const sanitized = sanitizeInput(email);
  
  if (!validator.isEmail(sanitized)) {
    errors.push('Invalid email format');
  }
  
  // Additional length check
  if (sanitized.length > 255) {
    errors.push('Email must be less than 255 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common weak passwords
  const commonPasswords = [
    'password', 'Password1!', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'Password123!',
  ];
  
  if (commonPasswords.includes(password)) {
    errors.push('Password is too weak. Please choose a stronger password');
  }
  
  // Maximum length to prevent DoS
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
    return { valid: false, errors };
  }
  
  const sanitized = sanitizeInput(username);
  
  // Must start with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    errors.push('Username must start with a letter');
  }
  
  // Must be alphanumeric with underscores and hyphens
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(sanitized)) {
    errors.push('Username must contain only letters, numbers, underscores, and hyphens');
  }
  
  // Minimum length
  if (sanitized.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  // Maximum length
  if (sanitized.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password confirmation matches
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  const errors: string[] = [];
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate registration data
 */
export function validateRegistrationData(data: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const emailResult = validateEmail(data.email);
  const usernameResult = validateUsername(data.username);
  const passwordResult = validatePassword(data.password);
  const passwordMatchResult = validatePasswordMatch(data.password, data.confirmPassword);
  
  errors.push(...emailResult.errors);
  errors.push(...usernameResult.errors);
  errors.push(...passwordResult.errors);
  errors.push(...passwordMatchResult.errors);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login data
 */
export function validateLoginData(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  }
  
  if (!data.password || data.password.length === 0) {
    errors.push('Password is required');
  }
  
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid && data.email) {
    errors.push(...emailResult.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
