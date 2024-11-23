/**
 * Security utilities for input sanitization and validation
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes input string to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove any null bytes
  let sanitized = input.replace(/\0/g, '');

  // Sanitize HTML/JS content
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });

  // Remove potential SQL injection patterns
  sanitized = sanitized.replace(/(\b(select|insert|update|delete|drop|union|exec|eval)\b)/gi, '');

  // Remove potential command injection characters
  sanitized = sanitized.replace(/[;&|`]/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');

  return sanitized;
};

/**
 * Sanitizes a filename to prevent directory traversal and ensure safe file operations
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') {
    throw new Error('Filename must be a string');
  }

  // Remove directory traversal and special characters
  let sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim();

  // Ensure filename isn't empty after sanitization
  if (!sanitized) {
    sanitized = 'unnamed_file';
  }

  // Limit filename length
  const MAX_FILENAME_LENGTH = 255;
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.split('.').pop() || '';
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length - 1) + '.' + ext;
  }

  return sanitized;
};

/**
 * Validates and sanitizes file content before saving
 * @param content - The file content to validate
 * @returns Sanitized content
 */
export const validateFileContent = (content: string): string => {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }

  // Remove null bytes and control characters
  let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Remove potential dangerous patterns
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return sanitized;
};
