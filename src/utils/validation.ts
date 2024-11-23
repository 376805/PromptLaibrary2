import { Role, Template } from '../types';

/**
 * Validation utilities for API keys and other sensitive data
 */

/**
 * Validates API key format and presence
 * @param apiKey - The API key to validate
 * @returns boolean indicating if the API key is valid
 */
export const validateApiKey = (apiKey?: string): boolean => {
  if (!apiKey) {
    return false;
  }

  // Check if key matches expected format (adjust pattern based on actual API key format)
  const API_KEY_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;
  return API_KEY_PATTERN.test(apiKey);
};

/**
 * Validates environment variables
 * @returns boolean indicating if all required env vars are present and valid
 */
export const validateEnvironment = (): boolean => {
  const requiredEnvVars = ['MISTRAL_API_KEY'];
  
  return requiredEnvVars.every(varName => {
    const value = process.env[varName];
    return value && value.length > 0;
  });
};

/**
 * Validates request parameters
 * @param params - The parameters to validate
 * @returns Validated and sanitized parameters
 */
export const validateRequestParams = <T extends Record<string, unknown>>(
  params: T,
  requiredFields: (keyof T)[]
): T => {
  // Check required fields
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }

  // Remove any undefined values
  const sanitized = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  ) as T;

  return sanitized;
};

/**
 * Validates and normalizes URL
 * @param url - The URL to validate
 * @returns Validated and normalized URL
 * @throws Error if URL is invalid
 */
export const validateUrl = (url: string): string => {
  try {
    const normalizedUrl = new URL(url);
    // Only allow specific protocols
    if (!['http:', 'https:'].includes(normalizedUrl.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return normalizedUrl.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

/**
 * Validates role
 * @param role - The role to validate
 * @param existingRoles - The existing roles
 * @returns boolean indicating if the role is valid
 */
export const validateRole = (role: Role, existingRoles: Role[]): boolean => {
  if (!role.id || !role.name || !role.description) {
    return false;
  }
  
  // Check for duplicate names
  const duplicateName = existingRoles.some(r => 
    r.id !== role.id && r.name.toLowerCase() === role.name.toLowerCase()
  );
  
  return !duplicateName;
};

/**
 * Validates template
 * @param template - The template to validate
 * @param existingRoles - The existing roles
 * @returns boolean indicating if the template is valid
 */
export const validateTemplate = (template: Template, existingRoles: Role[]): boolean => {
  if (!template.id || !template.name || !template.role || !template.content) {
    return false;
  }
  
  // Validate role reference
  const roleExists = existingRoles.some(r => r.id === template.role);
  if (!roleExists) {
    return false;
  }
  
  return true;
};