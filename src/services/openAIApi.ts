/**
 * Secure implementation of OpenAI API service
 * Includes input validation, error handling, and rate limiting
 */

import { rateLimit } from '../utils/rateLimit';
import { sanitizeInput } from '../utils/security';
import { validateApiKey } from '../utils/validation';
import { config } from '../config';

const MAX_CONTENT_LENGTH = 100000; // 100KB limit
const MAX_REQUESTS_PER_MINUTE = 60;

// Rate limiter instance
const limiter = rateLimit(MAX_REQUESTS_PER_MINUTE, 60000);

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validates and sanitizes the content before submission
 * @param content - Raw content to be validated
 * @throws {Error} If content is invalid or too large
 */
const validateContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content type');
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`);
  }

  return sanitizeInput(content);
};

/**
 * Submits content to OpenAI API with security measures
 * @param content - The content to submit
 * @returns The API response
 * @throws {ApiError} If API request fails
 */
export const submitContentToOpenAI = async (content: string): Promise<string> => {
  try {
    // Check rate limit
    await limiter.checkLimit();

    // Validate API key
    const apiKey = config.OPENAI_API_KEY;
    if (!validateApiKey(apiKey)) {
      throw new ApiError(401, 'Invalid API key configuration');
    }

    // Validate and sanitize content
    const sanitizedContent = validateContent(content);

    // Make API request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Request-ID': crypto.randomUUID(), // Add request tracking
      },
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        messages: [{ role: 'user', content: sanitizedContent }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new ApiError(response.status, `API request failed: ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    // Validate response structure
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    return data.choices[0].message.content;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    throw new ApiError(500, `API request failed: ${error.message}`);
  }
};

/**
 * Enhances prompt with OpenAI service
 * @param prompt - The prompt to enhance
 * @param techniques - The techniques to use
 * @returns The enhanced prompt
 */
export const enhancePromptWithOpenAI = async (prompt: string, _techniques: string[] = []): Promise<string> => {
  try {
    const response = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
