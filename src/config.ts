// Configuration for API keys and other sensitive data
// DO NOT commit actual API keys to version control

// Helper function to get environment variables safely
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Try to get from window.__ENV__ if it exists (for extension context)
  const windowEnv = (window as any).__ENV__;
  if (windowEnv && windowEnv[key]) {
    return windowEnv[key];
  }
  
  // Try to get from import.meta.env (for Vite development)
  const viteEnv = (import.meta as any).env;
  if (viteEnv && viteEnv[key]) {
    return viteEnv[key];
  }

  // Fallback to default value
  return defaultValue;
};

// Default values for API keys
const DEFAULT_MISTRAL_KEY = 'Lu7xpXn9EScc0UkfDxGFY6HOpAlsFFRR';
const DEFAULT_OPENAI_KEY = 'g4a-M1E8QwVyb3Pw9VAuSwtM88Fa8Bl9ehOjU18';

export const config = {
  // Mistral Configuration
  MISTRAL_API_KEY: getEnvVar('VITE_MISTRAL_API_KEY', DEFAULT_MISTRAL_KEY),
  
  // OpenAI Configuration
  OPENAI_API_KEY: getEnvVar('VITE_OPENAI_API_KEY', DEFAULT_OPENAI_KEY),
  OPENAI_BASE_URL: getEnvVar('VITE_OPENAI_BASE_URL', 'https://api.gpt4-all.xyz/v1'),
  OPENAI_MODEL: getEnvVar('VITE_OPENAI_MODEL', 'gpt-4o-mini'),
  DEFAULT_API: 'openAI' // Set default API to 'openAI' or 'mistral'
};
