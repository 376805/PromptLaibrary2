/**
 * Secure implementation of Mistral API service
 * Includes input validation, error handling, and rate limiting
 */

import { rateLimit } from '../utils/rateLimit';
import { sanitizeInput } from '../utils/security';
import { validateApiKey } from '../utils/validation';
import { config } from '../config';

const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
const MAX_CONTENT_LENGTH = 100000; // 100KB limit
const MAX_REQUESTS_PER_MINUTE = 60;

// Rate limiter instance
const limiter = rateLimit(MAX_REQUESTS_PER_MINUTE, 60000);

interface MistralResponse {
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
 * Submits content to Mistral API with security measures
 * @param content - The content to submit
 * @returns The API response
 * @throws {ApiError} If API request fails
 */
export const submitContentToMistral = async (content: string): Promise<string> => {
  try {
    // Check rate limit
    await limiter.checkLimit();

    // Validate API key
    const apiKey = config.MISTRAL_API_KEY;
    if (!validateApiKey(apiKey)) {
      throw new ApiError(401, 'Invalid API key configuration');
    }

    // Validate and sanitize content
    const sanitizedContent = validateContent(content);

    // Make API request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Request-ID': crypto.randomUUID(), // Add request tracking
      },
      body: JSON.stringify({
        model: 'mistral-medium',
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

    const data: MistralResponse = await response.json();
    
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
 * Enhances prompt with Mistral API service
 * @param prompt - The prompt to enhance
 * @param techniques - The techniques to use
 * @returns The enhanced prompt
 */
export const enhancePromptWithMistral = async (
  prompt: string,
  _techniques: string[] = []
): Promise<string> => {
  try {
    console.log('Making Mistral API request...');
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Convert the following prompt into the RACE format with Best Practices:

Role: [Role - Who should perform this task]
Action: [Action - What needs to be done]
Context: [Context - Background information and requirements]
Execute: [Execution - Step by step instructions]
Best Practices:
- [Best Practice 1]
- [Best Practice 2]
- [Best Practice 3]`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await fetch(MISTRAL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-medium',
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API Response:', data);
        throw new Error('Invalid API response structure');
      }

      return data.choices[0].message.content;
    } catch (fetchError) {
      console.error('Fetch Error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Mistral API Error:', error);
    throw error;
  }
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}