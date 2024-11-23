import { Template } from '../types';

export const defaultTemplates: Template[] = [
  {
    id: '5d1dba53-7661-4df2-957a-49b4cf20028a',
    name: 'Code Completion',
    role: 'code-developer',
    description: 'Generate high-quality code completion based on context and requirements, following TDD principles.',
    content: '',
    raceRole: 'Act as a software developer with extensive experience in Test Driven Development (TDD).',
    raceAction: 'Your task is to complete the code based on the provided context and requirements.',
    raceContext: '[Code Context]',
    raceExpectation: 'Generate production-ready code that follows best practices and is well-documented.',
    raceExecute: 'Complete the code implementation while ensuring:',
    bestPractices: [
      {
        description: 'Maintain consistent variable naming throughout the code',
        label: 'Consistent Naming'
      },
      {
        description: 'Include all necessary imports and dependencies',
        label: 'Complete Dependencies'
      },
      {
        description: 'Add comprehensive documentation and comments',
        label: 'Documentation'
      },
      {
        description: 'Follow the existing code style and patterns',
        label: 'Code Style'
      },
      {
        description: 'Implement error handling and validation',
        label: 'Error Handling'
      }
    ],
    customSections: [
      {
        id: 'ed4a7j63q',
        name: 'Code Context',
        description: 'Please paste your data here..',
        isVisible: true
      }
    ],
    createdBy: 'system',
    showProgrammingLanguage: true,
    showOutputValidation: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7aadf6b8-43ea-4ee3-9bd9-7d7dae734b33',
    name: 'Language Translation',
    role: 'code-developer',
    description: 'Translate code between programming languages while preserving logic and structure.',
    content: '',
    raceRole: 'Act as a Code Developer specializing in cross-language code translation and framework design.',
    raceAction: 'Translate the provided code to the target programming language.',
    raceContext: '[Source Code]',
    raceExpectation: 'Produce equivalent code in the target language that maintains the original functionality.',
    raceExecute: 'Translate the code while ensuring:',
    bestPractices: [
      {
        description: 'Use language-specific idioms and best practices',
        label: 'Language Idioms'
      },
      {
        description: 'Maintain the original code structure and organization',
        label: 'Code Structure'
      },
      {
        description: 'Preserve all business logic and functionality',
        label: 'Logic Preservation'
      },
      {
        description: 'Implement appropriate error handling for the target language',
        label: 'Error Handling'
      },
      {
        description: 'Add language-specific documentation and comments',
        label: 'Documentation'
      }
    ],
    customSections: [],
    createdBy: 'system',
    showProgrammingLanguage: true,
    showOutputValidation: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '54271fe5-7df1-4880-874f-37b2a4081fdf',
    name: 'Generate TDD Test Cases',
    role: 'code-developer',
    description: 'Create comprehensive test cases following Test-Driven Development principles.',
    content: '',
    raceRole: 'Act as a Test-Driven Development expert with extensive experience in unit testing.',
    raceAction: 'Create a comprehensive test suite for the given functionality.',
    raceContext: '[Requirements/Code]',
    raceExpectation: 'Develop a complete set of test cases that cover all functionality and edge cases.',
    raceExecute: 'Generate test cases ensuring:',
    bestPractices: [
      {
        description: 'Follow the Red-Green-Refactor cycle',
        label: 'TDD Cycle'
      },
      {
        description: 'Test both positive and negative scenarios',
        label: 'Scenario Coverage'
      },
      {
        description: 'Include edge cases and boundary conditions',
        label: 'Edge Cases'
      },
      {
        description: 'Use descriptive test names that explain the test purpose',
        label: 'Test Names'
      },
      {
        description: 'Implement proper test isolation and setup',
        label: 'Test Isolation'
      }
    ],
    customSections: [],
    createdBy: 'system',
    showProgrammingLanguage: true,
    showOutputValidation: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'df46c394-e13c-4972-9497-805d8b476a9d',
    name: 'Generate BDD Scenarios',
    role: 'quality-analyst',
    description: 'Create Behavior-Driven Development scenarios from requirements and user stories.',
    content: '',
    raceRole: 'Act as a Quality Analyst specializing in Behavior-Driven Development.',
    raceAction: 'Create BDD scenarios based on the provided requirements or user stories.',
    raceContext: '[Requirements/User Story]',
    raceExpectation: 'Generate clear, comprehensive BDD scenarios that capture all business requirements.',
    raceExecute: 'Create scenarios following:',
    bestPractices: [
      {
        description: 'Use clear, business-focused language',
        label: 'Business Language'
      },
      {
        description: 'Follow Given-When-Then format strictly',
        label: 'GWT Format'
      },
      {
        description: 'Include all acceptance criteria',
        label: 'Acceptance Criteria'
      },
      {
        description: 'Add examples for complex scenarios',
        label: 'Examples'
      },
      {
        description: 'Consider both happy path and edge cases',
        label: 'Scenario Coverage'
      }
    ],
    customSections: [],
    createdBy: 'system',
    showProgrammingLanguage: false,
    showOutputValidation: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'e57c394-e13c-4972-9497-805d8b476f8e',
    name: 'BDD to Test Script',
    role: 'automation-expert',
    description: 'Convert BDD scenarios into automated test scripts.',
    content: '',
    raceRole: 'Act as an Automation Expert specializing in BDD implementation.',
    raceAction: 'Convert the provided BDD scenarios into automated test scripts.',
    raceContext: '[BDD Scenarios]',
    raceExpectation: 'Create maintainable, reliable automated test scripts that implement the BDD scenarios.',
    raceExecute: 'Implement the automation while ensuring:',
    bestPractices: [
      {
        description: 'Implement reusable step definitions',
        label: 'Reusability'
      },
      {
        description: 'Use page object pattern for UI elements',
        label: 'Page Objects'
      },
      {
        description: 'Include proper wait strategies',
        label: 'Wait Strategies'
      },
      {
        description: 'Implement robust element locators',
        label: 'Element Locators'
      },
      {
        description: 'Add proper logging and reporting',
        label: 'Logging'
      }
    ],
    customSections: [],
    createdBy: 'system',
    showProgrammingLanguage: true,
    showOutputValidation: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];