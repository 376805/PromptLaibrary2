import { enhancePromptWithOpenAI } from './openAIApi';
import { enhancePromptWithMistral } from './mistralApi';
import { config } from '../config';

export const enhancePrompt = async (prompt: string, techniques: string[] = []): Promise<string> => {
  if (config.DEFAULT_API === 'openAI') {
    return enhancePromptWithOpenAI(prompt, techniques);
  } else {
    return enhancePromptWithMistral(prompt, techniques);
  }
}; 