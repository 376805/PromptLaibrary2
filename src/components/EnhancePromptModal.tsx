import React, { useState, useEffect } from 'react';
import { X, Wand2, Copy, CheckCircle, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { enhancePromptWithMistral } from '../services/mistralApi';
import { Modal } from '../components/Modal';

const ENHANCEMENT_CATEGORIES = {
  'Framework Techniques': [
    {
      id: 'createFramework',
      name: 'CREATE Framework',
      description: 'Format prompts using the CREATE framework',
      helpText: `Character: Define the persona, e.g., developer, client, etc.\nRequest: Specify the task for the AI model\nExamples: Provide examples of the expected result format\nAdjustment: Define any changes to the model's reply\nType of Output: Specify the format of the response\nExtras: Add any further context or information`,
    },
    {
      id: 'riseFramework',
      name: 'RISE Framework',
      description: 'Format prompts using the RISE framework',
      helpText: `Role: Describe the position of the language model\nInput: Provide the task's background information\nSteps: Describe the precise actions that the model needs to take\nExecution: Describe the outcome you want`,
    },
    {
      id: 'glueFramework',
      name: 'GLUE Framework',
      description: 'Format prompts using the GLUE framework',
      helpText: `Goal: Specify the main result expected\nList: Give a list of guidelines or instructions\nUnpack: Divide ideas into manageable chunks\nExamine: Provide standards for judging the response`,
    },
    {
      id: 'itapFramework',
      name: 'ITAP Framework',
      description: 'Format prompts using the ITAP framework',
      helpText: `Input: Define the data the model will interact with\nTask: Explain the specific task to carry out\nAnnotation: Add suitable tags or labels\nPrediction: Select the format to generate`,
    },
    {
      id: 'apeFramework',
      name: 'APE Framework',
      description: 'Format prompts using the APE framework',
      helpText: `Action: Define the precise steps to take\nPurpose: State the task's objective\nExpectation: Define the designed result`,
    },
    {
      id: 'coastFramework',
      name: 'COAST Framework',
      description: 'Format prompts using the COAST framework',
      helpText: `Character: Define the character's role and traits\nObjective: State the main goal\nAction: List specific actions to take\nScope: Define boundaries and limitations\nTone: Set the communication style`,
    },
    {
      id: 'tagFramework',
      name: 'TAG Framework',
      description: 'Format prompts using the TAG framework',
      helpText: `Task: Specify the task\nAction: Define the precise steps\nGoal: State the prompt's main objective`,
    },
    {
      id: 'starFramework',
      name: 'STAR Framework',
      description: 'Format prompts using the STAR framework',
      helpText: `Situation: Define the context\nTask: Specify the task\nAction: Describe the actions\nResult: Define the expected outcome`,
    },
    {
      id: 'raceFramework',
      name: 'RACE Framework',
      description: 'Format prompts using the RACE (Role, Action, Context, Execute) structure',
      helpText: `Transforms prompts into a structured RACE format.\n\nExample:\nOriginal: "act as qa and create test cases in bdd format"\nRACE Format:\nRole: Act as BDD Expert\nAction: Create Feature and Scenario\nContext: [User story]\nExecute: Feature file as output\n\nBest Practices:\nCover negative scenarios`,
    },
    {
      id: 'pareFramework',
      name: 'PARE Framework',
      description: 'Build high-quality prompts using the PARE framework',
      helpText: `The PARE framework consists of four parts: Prime, Augment, Refresh, Evaluate.\n\nPrime: Provide relevant context to the language model to prevent hallucination.\nAugment: Validate and enhance the model's knowledge with additional data.\nRefresh: Reassess the model's understanding with the augmented information.\nEvaluate: Test the model's performance with specific tasks and questions.\n\nExample:\nTo evaluate legislation, prime the model with laws, augment with questions, refresh its knowledge, and evaluate against known legislation outcomes.`,
    }
  ],
  'Input Semantics': [
    {
      id: 'metaLanguage',
      name: 'Meta Language Creation',
      description: 'Develop a meta language to enhance input semantics',
      helpText: `Creates a specialized language structure for more precise communication.

Example:
Original: "Write code for a login form"
Enhanced: "CREATE_COMPONENT(LoginForm) {
  INCLUDE: EmailInput, PasswordInput, SubmitButton
  VALIDATE: Email format, Password strength
  HANDLE: Form submission, Error states
}"`,
    }
  ],
  'Output Formatter': [
    {
      id: 'outputAutomater',
      name: 'Output Automater',
      description: 'Automate the output generation process',
      helpText: `Structures the output format for consistent and automated responses.

Example:
Original: "Generate test cases"
Enhanced: "Generate test cases following this structure:
1. Test ID: TC_{feature}_{number}
2. Description: [action]_[component]_[expected result]
3. Steps: Numbered list with preconditions
4. Expected Results: Clearly defined outcomes"`,
    },
    {
      id: 'persona',
      name: 'Persona',
      description: 'Create a persona for the AI to adopt',
      helpText: `Defines a specific role or character for the AI to better understand context.

Example:
Original: "Review this code"
Enhanced: "As a senior software architect with 15 years of experience in enterprise applications, review this code focusing on:
- Architecture patterns
- Scalability considerations
- Best practices
- Potential improvements"`,
    }
  ],
  'Error Identification': [
    {
      id: 'factCheckList',
      name: 'Fact Check List',
      description: 'Create a checklist for verifying facts',
      helpText: `Develops a systematic approach to verify information accuracy.

Example:
Original: "Verify the API documentation"
Enhanced: "Review the API documentation against this fact-check list:
1. Endpoint URLs match implementation
2. Request/response formats are accurate
3. Authentication requirements are correct
4. Rate limits are properly documented
5. Error codes are accurately described"`,
    },
    {
      id: 'reflection',
      name: 'Reflection',
      description: 'Encourage reflection on the output',
      helpText: `Adds self-review and validation steps to the process.

Example:
Original: "Write unit tests"
Enhanced: "Write unit tests and then reflect on:
1. Test coverage completeness
2. Edge cases consideration
3. Test independence
4. Maintenance implications
5. Documentation clarity"`,
    }
  ],
  'Prompt Improvement': [
    {
      id: 'advancedRatingEnhancement',
      name: 'Advanced Rating & Enhancement',
      description: 'Rate and enhance prompts with safe, optimal, and experimental versions',
      helpText: `Provides three versions of enhancement with increasing levels of modification.

Example:
Original: "Write test cases"
Safe: "Write functional test cases for the login feature"
Optimal: "Create comprehensive test cases for the login feature including positive, negative, and edge cases"
Experimental: "Design an innovative test suite for the login system incorporating AI-driven test generation and risk-based testing approaches"`,
    },
    {
      id: 'stepByStepRefinement',
      name: 'Step-by-Step Refinement',
      description: 'Systematic 9-step process for prompt optimization',
      helpText: `Applies a methodical approach to improve prompts through multiple refinement steps.

Example:
Original: "Create API documentation"
Steps:
1. Clarity Analysis: Add specific API version
2. Context Enhancement: Include authentication requirements
3. Specificity Check: Detail endpoint parameters
4. Structure Optimization: Organize by resource types
5. Validation Points: Add response codes
6. Error Prevention: Include error handling
7. Completeness Review: Verify all endpoints covered
8. Actionability Check: Add example requests/responses
9. Final Polish: Format consistently`,
    },
    {
      id: 'quickRefinement',
      name: 'Quick Refinement',
      description: 'Rapid analysis and improvement of prompts',
      helpText: `Provides quick improvements focusing on clarity, structure, and effectiveness.

Example:
Original: "test the app"
Enhanced: "Perform functional testing of the mobile app's latest version (v2.1.0), focusing on:
1. Core features
2. User flows
3. Performance metrics
4. Bug reporting"`,
    },
    {
      id: 'questionRefinement',
      name: 'Question Refinement',
      description: 'Refine questions for clarity and precision',
      helpText: `Improves the quality and specificity of questions.

Example:
Original: "How does the system work?"
Enhanced: "Please describe:
1. The system's core components
2. Data flow between components
3. Key interfaces and integrations
4. Error handling mechanisms
5. Performance considerations"`,
    },
    {
      id: 'alternativeApproaches',
      name: 'Alternative Approaches',
      description: 'Explore different methods to solve a problem',
      helpText: `Generates multiple solution strategies for comparison.

Example:
Original: "How to implement caching?"
Enhanced: "Analyze these caching approaches:
1. In-memory caching (Redis/Memcached)
2. Browser caching strategies
3. CDN caching options
4. Database query caching
Compare their pros, cons, and use cases."`,
    },
    {
      id: 'cognitiveVerifier',
      name: 'Cognitive Verifier',
      description: 'Verify the cognitive processes involved',
      helpText: `Ensures thorough understanding and logical progression.

Example:
Original: "Debug this issue"
Enhanced: "Follow this cognitive process for debugging:
1. Understand the expected behavior
2. Identify actual behavior
3. Analyze potential causes
4. Test hypotheses systematically
5. Verify solution completeness"`,
    },
    {
      id: 'refusalBreaker',
      name: 'Refusal Breaker',
      description: 'Overcome refusals and objections',
      helpText: `Helps handle potential limitations or restrictions constructively.

Example:
Original: "Generate SQL queries"
Enhanced: "Generate SQL queries with these safeguards:
1. Use read-only operations
2. Include query limitations
3. Add safety comments
4. Provide usage context
5. Note potential risks"`,
    }
  ],
  'Interaction': [
    {
      id: 'flippedInteraction',
      name: 'Flipped Interaction',
      description: 'Reverse the roles in the interaction',
      helpText: `Changes perspective by reversing roles between user and AI.

Example:
Original: "Review my code"
Enhanced: "Let's approach this as if I'm the senior developer and you're presenting your code for review. Walk me through:
1. Your implementation decisions
2. Design patterns used
3. Performance considerations
4. Potential improvements"`,
    },
    {
      id: 'gamePlay',
      name: 'Game Play',
      description: 'Incorporate game-like elements into the interaction',
      helpText: `Adds interactive and engaging elements to the process.

Example:
Original: "Test this feature"
Enhanced: "Let's test this feature as a game:
Level 1: Basic functionality
Level 2: Edge cases
Level 3: Performance challenges
Level 4: Security scenarios
Final Boss: Integration tests"`,
    },
    {
      id: 'infiniteGeneration',
      name: 'Infinite Generation',
      description: 'Enable continuous generation of content',
      helpText: `Creates self-sustaining content generation processes.

Example:
Original: "Generate test data"
Enhanced: "Create a recursive test data generator that:
1. Generates initial dataset
2. Identifies patterns for expansion
3. Creates variations automatically
4. Maintains relationships
5. Scales progressively"`,
    }
  ],
  'Context Control': [
    {
      id: 'contextManager',
      name: 'Context Manager',
      description: 'Manage and control the context of the interaction',
      helpText: `Provides structured context management for complex interactions.

Example:
Original: "Update the system"
Enhanced: "Context-Managed System Update:
1. Current System State: [Define current state]
2. Update Scope: [Specify changes]
3. Dependencies: [List affected components]
4. Validation: [Define success criteria]
5. Rollback: [Specify recovery steps]"`,
    }
  ]
};

// Update LLM provider type
type LLMProvider = 'mistral' | 'ollama' | 'azure';

export const EnhancePromptModal = () => {
  const { isManageModalOpen, toggleManageModal, modalMode } = useStore();
  const [inputPrompt, setInputPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(['raceFramework']);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomTechniques, setShowCustomTechniques] = useState(false);

  useEffect(() => {
    if (isManageModalOpen && modalMode === 'enhance') {
      resetForm();
    }
  }, [isManageModalOpen, modalMode]);

  const resetForm = () => {
    setInputPrompt('');
    setEnhancedPrompt('');
    setSelectedTechniques(['raceFramework']);
    setIsEnhancing(false);
    setCopied(false);
    setError(null);
  };

  const handleTechniqueToggle = (techniqueId: string) => {
    setSelectedTechniques(prev =>
      prev.includes(techniqueId)
        ? prev.filter(id => id !== techniqueId)
        : [...prev, techniqueId]
    );
  };

  const enhancePrompt = async () => {
    setError(null);
    setIsEnhancing(true);
    try {
      let enhancedText = inputPrompt;

      if (selectedTechniques.includes('raceFramework')) {
        let llmService = enhancePromptWithMistral;
        enhancedText = await llmService(`Convert the following prompt into the RACE format:

Role: [Role]
Action: [Action]
Context: [Context]
Execute: [Execution]

Original Prompt: ${inputPrompt}`);
      }

      if (selectedTechniques.some(t => t !== 'raceFramework')) {
        let llmService = enhancePromptWithMistral;
        enhancedText = await llmService(enhancedText, 
          selectedTechniques.filter(t => t !== 'raceFramework')
        );
      }

      setEnhancedPrompt(enhancedText);
    } catch (error) {
      console.error('Enhancement failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to enhance prompt. Please try again.');
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    resetForm();
    toggleManageModal();
  };

  const handleShowEnhancedPrompt = () => {
    const enhancedPromptWindow = window.open('', '_blank', 'width=800,height=600');
    if (enhancedPromptWindow) {
      enhancedPromptWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enhanced Prompt</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.5;
                padding: 2rem;
                margin: 0;
                background: #f9fafb;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
              }
              .title {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1f2937;
              }
              .highlight {
                background: #e0f7fa;
                padding: 0.5rem;
                border: 1px solid #00acc1;
                border-radius: 0.375rem;
                margin: 0.5rem 0;
              }
              button {
                background: #4f46e5;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                cursor: pointer;
              }
              button:hover {
                background: #4338ca;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">Enhanced Prompt</div>
                <button onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent)">
                  Copy to Clipboard
                </button>
              </div>
              ${parseAndDisplayResponse(enhancedPrompt)}
            </div>
          </body>
        </html>
      `);
      enhancedPromptWindow.document.close();
    }
  };

  const parseAndDisplayResponse = (text: string) => {
    const finalVersionMatch = text.match(/Final Enhanced Version:[\s\S]*?\n\n(.*?)(?=\n\n|$)/);
    const enhancementAnalysisMatch = text.match(/1\. Enhancement Analysis:[\s\S]*?(?=\n\n|$)/);
    const individualTechniqueMatch = text.match(/2\. Individual Technique Application:[\s\S]*?(?=\n\n|$)/);
    const qualityAssessmentMatch = text.match(/4\. Quality Assessment:[\s\S]*?(?=\n\n|$)/);

    const formatRACE = (text: string) => {
      return text.replace(/(Role|Action|Context|Execute):/g, '\n$1:').replace(/\n\n/g, '\n');
    };

    return (
      <div>
        {finalVersionMatch && (
          <div className="highlight">
            <strong>Final Enhanced Version:</strong>
            <pre>{formatRACE(finalVersionMatch[1])}</pre>
          </div>
        )}
        {enhancementAnalysisMatch && (
          <details>
            <summary>Enhancement Analysis</summary>
            <pre>{enhancementAnalysisMatch[0]}</pre>
          </details>
        )}
        {individualTechniqueMatch && (
          <details>
            <summary>Individual Technique Application</summary>
            <pre>{individualTechniqueMatch[0]}</pre>
          </details>
        )}
        {qualityAssessmentMatch && (
          <details>
            <summary>Quality Assessment</summary>
            <pre>{qualityAssessmentMatch[0]}</pre>
          </details>
        )}
      </div>
    );
  };

  const renderEnhancedPrompt = () => {
    if (!enhancedPrompt) return null;

    // Extract the final version
    const finalVersion = extractFinalVersion(enhancedPrompt);

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Enhanced Prompt</label>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              title="Copy entire output"
            >
              <Copy className="w-4 h-4" />
              Copy All
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Applied Techniques</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTechniques.map((technique) => (
                <span
                  key={technique}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                >
                  {technique}
                </span>
              ))}
            </div>
          </div>

          <pre className="w-full p-4 bg-gray-50 border rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
            {enhancedPrompt.split(/(?=Enhancement Technique:)/).map((section, index) => {
              if (section.startsWith('Final Enhanced Version:') && finalVersion) {
                // Ensure this block is only executed once
                if (index === 0) {
                  const explanationMatch = section.match(/(?:"[^"]+")(.+)$/s);
                  const explanation = explanationMatch ? explanationMatch[1].trim() : '';
                
                  return (
                    <React.Fragment key={index}>
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={handleCopyFinalVersion}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                          title="Copy final version"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied Final Version!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Final Version
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-indigo-100 border-l-4 border-indigo-500 p-4 my-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-indigo-800">Final Enhanced Version:</span>
                        </div>
                        <div className="text-gray-800 font-medium">
                          "{finalVersion}"
                        </div>
                      </div>
                      {explanation && <div className="mt-4">{explanation}</div>}
                    </React.Fragment>
                  );
                }
                return null;
              }

              if (section.includes('Final Version:')) {
                const techniqueName = section.split('\n')[0];
                return (
                  <React.Fragment key={index}>
                    {section.split('Final Version:').map((part, partIndex) => {
                      if (partIndex === 0) return part;
                      return (
                        <React.Fragment key={`${index}-${partIndex}`}>
                          <div className="flex justify-between items-center bg-purple-50 p-2 -mx-4">
                            <span className="font-semibold text-purple-700">Final Version:</span>
                          </div>
                          {part}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }

              return <React.Fragment key={index}>{section}</React.Fragment>;
            })}
          </pre>
        </div>
      </div>
    );
  };

  const extractFinalVersion = (text: string): string | null => {
    const match = text.match(/Final Enhanced Version:\s*"([^"]+)"/);
    return match ? match[1] : null;
  };

  const handleCopyFinalVersion = async () => {
    try {
      const finalVersion = extractFinalVersion(enhancedPrompt);
      if (finalVersion) {
        await navigator.clipboard.writeText(finalVersion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy final version:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const handleCreateTemplateFromEnhanced = () => {
    // Extract RACE components from the enhanced prompt
    const raceComponents = extractRaceComponents(enhancedPrompt);
    if (!raceComponents) {
      setError('Failed to extract RACE components from the enhanced prompt.');
      return;
    }

    // Populate the form data in CreateTemplateModal
       // @ts-ignore
    setSelectedTemplate({
      name: 'New Template from Enhanced Version',
      description: 'Automatically generated from enhanced prompt',
      role: raceComponents.role,
      raceRole: raceComponents.role,
      raceAction: raceComponents.action,
      raceContext: raceComponents.context,
      raceExpectation: raceComponents.execute,
      bestPractices: raceComponents.bestPractices,
         // @ts-ignore
      createdBy: currentUser?.username || 'unknown'
    });

    // Open the CreateTemplateModal
   // @ts-ignore
  toggleCreateModal();
  };

  const extractRaceComponents = (enhancedText: string) => {
    try {
      const roleMatch = enhancedText.match(/Role: (.+)/);
      const actionMatch = enhancedText.match(/Action: (.+)/);
      const contextMatch = enhancedText.match(/Context: (.+)/);
      const executeMatch = enhancedText.match(/Execute: (.+)/);
      const bestPracticesMatch = enhancedText.match(/Best Practices:\n((?:- .+\n)+)/);

      if (!roleMatch || !actionMatch || !contextMatch || !executeMatch) {
        return null;
      }

      const bestPractices = bestPracticesMatch ? bestPracticesMatch[1].trim().split('\n').map(bp => bp.slice(2)) : [];

      return {
        role: roleMatch[1].trim(),
        action: actionMatch[1].trim(),
        context: contextMatch[1].trim(),
        execute: executeMatch[1].trim(),
        bestPractices
      };
    } catch (error) {
      console.error('Error extracting RACE components:', error);
      return null;
    }
  };

  const renderTechniqueButton = (technique: any) => (
    <button
      key={technique.id}
      onClick={() => handleTechniqueToggle(technique.id)}
      className={`p-3 text-left border dark:border-dark-border rounded-lg transition-colors ${
        selectedTechniques.includes(technique.id)
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400'
          : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-hover'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{technique.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{technique.description}</div>
        </div>
        {technique.helpText && (
          <div className="relative inline-block">
            <div className="group">
              <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
              <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white dark:bg-dark-card border dark:border-dark-border rounded-lg shadow-lg transform -translate-x-[calc(100%-1rem)] top-0 left-0">
                <div 
                  className="absolute w-2 h-2 bg-white dark:bg-dark-card border-t border-l dark:border-dark-border transform rotate-45 -translate-y-1"
                  style={{ right: '0.75rem' }}
                />
                <pre className="text-xs whitespace-pre-wrap relative z-10 bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100">
                  {technique.helpText}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  );

  const handleShowCustomTechniques = () => {
    setShowCustomTechniques(!showCustomTechniques);
  };

  if (!isManageModalOpen || modalMode !== 'enhance') return null;

  return (
    <Modal
      isOpen={isManageModalOpen && modalMode === 'enhance'}
      onClose={handleClose}
      title="Enhance Prompt"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Input Prompt
          </label>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-32 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Enhancement Techniques */}
        <div>
          <div className="flex justify-between items-center mb-4">
            {showCustomTechniques && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Enhancement Techniques</h3>
            )}
            <button
              onClick={handleShowCustomTechniques}
              className={`text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 ${!showCustomTechniques ? 'ml-auto' : ''}`}
            >
              {showCustomTechniques ? 'Hide Techniques' : 'Show Techniques'}
            </button>
          </div>

          {showCustomTechniques && (
            <div className="space-y-6">
              {Object.entries(ENHANCEMENT_CATEGORIES).map(([category, techniques]) => (
                <div key={category}>
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {techniques.map((technique) => renderTechniqueButton(technique))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex-1">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={enhancePrompt}
              disabled={!inputPrompt.trim() || isEnhancing}
              className={`px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 ${
                (!inputPrompt.trim() || isEnhancing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {isEnhancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Enhance
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Output */}
        {enhancedPrompt && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enhanced Prompt
              </label>
              <button
                onClick={handleCopy}
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                {enhancedPrompt}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};