export interface RACEComponents {
  role: string;
  action: string;
  context: string;
  execute: string;
}

export interface PAREComponents {
  prime: string;
  augment: string;
  refresh: string;
  evaluate: string;
}

export interface BestPracticesComponents {
  practices: string[];
}

export const enhanceWithRACE = (prompt: string, components: Partial<RACEComponents>): string => {
  let enhancedPrompt = '';

  // Role
  if (components.role) {
    enhancedPrompt += `Role:\n${components.role}\n\n`;
  }

  // Action
  if (components.action) {
    enhancedPrompt += `Action:\n${components.action}\n\n`;
  }

  // Context
  if (components.context) {
    enhancedPrompt += `Context:\n${components.context}\n\n`;
  }

  // Execute
  if (components.execute) {
    enhancedPrompt += `Execute:\n${components.execute}\n\n`;
  }

  enhancedPrompt += `Original Prompt:\n${prompt}`;
  return enhancedPrompt;
};

export const enhanceWithPARE = (prompt: string, components: Partial<PAREComponents>): string => {
  let enhancedPrompt = '';

  // Prime
  if (components.prime) {
    enhancedPrompt += `Prime:\n${components.prime}\n\n`;
  }

  // Augment
  if (components.augment) {
    enhancedPrompt += `Augment:\n${components.augment}\n\n`;
  }

  // Refresh
  if (components.refresh) {
    enhancedPrompt += `Refresh:\n${components.refresh}\n\n`;
  }

  // Evaluate
  if (components.evaluate) {
    enhancedPrompt += `Evaluate:\n${components.evaluate}\n\n`;
  }

  enhancedPrompt += `Original Prompt:\n${prompt}`;
  return enhancedPrompt;
};

export const enhanceWithBestPractices = (prompt: string, practices: string[]): string => {
  let enhancedPrompt = '';

  if (practices && practices.length > 0) {
    enhancedPrompt += `Strictly Follow Best Practices:\n`;
    practices.forEach((practice, index) => {
      if (practice.trim()) {
        enhancedPrompt += `${index + 1}. ${practice}\n`;
      }
    });
    enhancedPrompt += '\n';
  }

  enhancedPrompt += `Original Prompt:\n${prompt}`;
  return enhancedPrompt;
}; 