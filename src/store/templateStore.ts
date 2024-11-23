/**
 * Template management store for the ProLib application
 * Handles template CRUD operations and template-related state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Template } from '../types';
import { defaultTemplates } from '../data/defaultTemplates';
import { generateId } from '../utils/generateId';

/** Template store interface defining all state and actions */
interface TemplateStore {
  // State
  templates: Template[];
  userTemplates: Template[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  fetchTemplates: () => Promise<void>;
  updateTemplatesForRole: (roleId: string, newRoleName: string) => void;
  updateTemplatesForDeletedRole: (roleId: string) => void;
  importTemplates: (templates: Template[]) => void;
  parseRaceComponents: (content: string) => {
    raceRole: string;
    raceAction: string;
    raceContext: string;
    raceExecute: string;
  };
}

/**
 * Creates and exports the template store with persistence
 * Uses localStorage for data persistence between sessions
 */
export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: defaultTemplates.map(template => ({
        ...template,
        raceExecute: template.raceExecute || template.raceExpectation || ''
      })),
      userTemplates: [],
      isLoading: false,
      error: null,

      /**
       * Adds a new template to the store
       * @param template - New template to add
       */
      addTemplate: (template) =>
        set((state) => ({
          userTemplates: [...state.userTemplates, { 
            ...template, 
            id: generateId(),
            createdBy: template.createdBy || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        })),

      /**
       * Updates an existing template
       * @param template - Template object with updated fields
       */
      updateTemplate: (template) =>
        set((state) => {
          // Check if the template exists in userTemplates or templates
          const isUserTemplate = state.userTemplates.some(t => t.id === template.id);
          const isDefaultTemplate = state.templates.some(t => t.id === template.id);

          if (isUserTemplate) {
            // Update in userTemplates
            return {
              ...state,
              userTemplates: state.userTemplates.map((t) =>
                t.id === template.id ? { 
                  ...t,
                  ...template,
                  raceExecute: template.raceExecute || template.raceExpectation || t.raceExecute || t.raceExpectation || '',
                  createdBy: t.createdBy,
                  createdAt: t.createdAt,
                  updatedAt: new Date().toISOString()
                } : t
              )
            };
          } else if (isDefaultTemplate) {
            // Move the modified default template to userTemplates
            const originalTemplate = state.templates.find(t => t.id === template.id);
            return {
              ...state,
              userTemplates: [
                ...state.userTemplates,
                { 
                  ...originalTemplate,
                  ...template,
                  id: generateId(), // Generate new ID for the user copy
                  raceExecute: template.raceExecute || template.raceExpectation || originalTemplate?.raceExecute || originalTemplate?.raceExpectation || '',
                  createdBy: 'user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isDefault: false
                }
              ],
              // Keep the original template in templates array
              templates: state.templates
            };
          }
          return state;
        }),

      /**
       * Deletes a template from the store
       * @param templateId - ID of the template to delete
       * @returns Promise resolving to true if deletion was successful
       */
      deleteTemplate: async (templateId) => {
        try {
          // Get current state
          const state = get();
          const templateToDelete = state.templates.find(t => t.id === templateId) || 
                                 state.userTemplates.find(t => t.id === templateId);
          
          if (!templateToDelete) {
            throw new Error('Template not found');
          }

          // Update the local state first for immediate UI feedback
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== templateId),
            userTemplates: state.userTemplates.filter((t) => t.id !== templateId)
          }));

          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 100));

          return true;
        } catch (error) {
          console.error('Error deleting template:', error);
          
          // If error occurs, revert the state
          const state = get();
          const templateToDelete = state.templates.find(t => t.id === templateId) || 
                                 state.userTemplates.find(t => t.id === templateId);
          
          if (templateToDelete) {
            const isDefaultTemplate = (templateToDelete as Template & { isDefault?: boolean }).isDefault ?? false;
            
            set((state) => ({
              templates: isDefaultTemplate 
                ? [...state.templates, templateToDelete]
                : state.templates,
              userTemplates: !isDefaultTemplate 
                ? [...state.userTemplates, templateToDelete]
                : state.userTemplates
            }));
          }
          
          throw error;
        }
      },

      /**
       * Fetches templates from the server
       * Currently simulated with a timeout
       */
      fetchTemplates: async () => {
        const state = get();
        if (state.isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
          // Simulating API call with shorter timeout
          await new Promise(resolve => setTimeout(resolve, 100));
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching templates:', error);
          set({ isLoading: false });
        }
      },

      /**
       * Updates templates associated with a role when role name changes
       * @param roleId - ID of the role
       * @param newRoleName - New name for the role
       */
      updateTemplatesForRole: (roleId, newRoleName) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.role === roleId ? { ...t, roleName: newRoleName } : t
          ),
          userTemplates: state.userTemplates.map((t) =>
            t.role === roleId ? { ...t, roleName: newRoleName } : t
          )
        })),

      /**
       * Updates templates when a role is deleted
       * @param roleId - ID of the deleted role
       */
      updateTemplatesForDeletedRole: (roleId) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.role === roleId ? { ...t, role: '' } : t
          ),
          userTemplates: state.userTemplates.map((t) =>
            t.role === roleId ? { ...t, role: '' } : t
          )
        })),

      /**
       * Parses RACE components from content string
       * @param content - Template content string
       */
      parseRaceComponents: (content: string) => {
        const components = {
          raceRole: '',
          raceAction: '',
          raceContext: '',
          raceExecute: ''
        };

        if (!content) return components;

        // Split content by newlines and process each section
        const lines = content.split('\n');
        let currentComponent = '';
        
        for (const line of lines) {
          if (line.startsWith('Role:')) {
            currentComponent = 'raceRole';
            components.raceRole = line.replace('Role:', '').trim();
          } else if (line.startsWith('Action:')) {
            currentComponent = 'raceAction';
            components.raceAction = line.replace('Action:', '').trim();
          } else if (line.startsWith('Context:')) {
            currentComponent = 'raceContext';
            components.raceContext = line.replace('Context:', '').trim();
          } else if (line.startsWith('Execute:') || line.startsWith('Expectation:')) {
            currentComponent = 'raceExecute';
            components.raceExecute = line.replace(/^(Execute:|Expectation:)/, '').trim();
          } else if (currentComponent && line.trim()) {
            // Append content to current component
            components[currentComponent] += '\n' + line.trim();
          }
        }

        // Clean up the components
        Object.keys(components).forEach(key => {
          components[key] = components[key].trim();
        });

        return components;
      },

      /**
       * Imports templates into the store, skipping duplicates
       * @param templates - Array of templates to import
       */
      importTemplates: (templates) => {
        set((state) => {
          // Create a Set of existing template IDs for quick lookup
          const existingIds = new Set(state.userTemplates.map(t => t.id));
          
          // Process and filter templates
          const newTemplates = templates.map(template => {
            // Parse RACE components from content if they don't exist
            const raceComponents = !template.raceRole && template.content 
              ? get().parseRaceComponents(template.content)
              : {
                  raceRole: template.raceRole || '',
                  raceAction: template.raceAction || '',
                  raceContext: template.raceContext || '',
                  raceExecute: template.raceExecute || ''
                };

            // Combine RACE components for content if it doesn't exist
            const content = template.content || [
              raceComponents.raceRole ? `Role:\n${raceComponents.raceRole}` : '',
              raceComponents.raceAction ? `Action:\n${raceComponents.raceAction}` : '',
              raceComponents.raceContext ? `Context:\n${raceComponents.raceContext}` : '',
              raceComponents.raceExecute ? `Execute:\n${raceComponents.raceExecute}` : ''
            ].filter(Boolean).join('\n\n');

            return {
              ...template,
              id: template.id || generateId(),
              createdAt: template.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: template.createdBy || 'unknown',
              // Set RACE components
              ...raceComponents,
              // Set content
              content,
              // Ensure other fields
              description: template.description || '',
              bestPractices: template.bestPractices || []
            };
          }).filter(template => !existingIds.has(template.id));

          return {
            userTemplates: [...state.userTemplates, ...newTemplates]
          };
        });
      },
    }),
    {
      name: 'prompt-library-templates',
      storage: createJSONStorage(() => localStorage),
    }
  )
);