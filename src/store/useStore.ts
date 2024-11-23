/**
 * Main store for the ProLib application using Zustand
 * Manages global state including prompts, UI state, and modal controls
 */

import { create } from 'zustand';
import {Store, Prompt, Template, SharedPrompt, ModalMode, Tag, Role, PromptVersion, Team } from '../types';
import authService from '../services/authService';
import { useRoleStore } from './roleStore';
import { useTemplateStore } from './templateStore';
import { RATE_LIMIT } from '../constants';

/**
 * Creates and exports the main store with persistence
 * Uses localStorage for data persistence between sessions
 */
export const useStore = create<Store>((set, get) => ({
  // State
  id: '',
  email: '',
  prompts: [],
  tags: [],
  templates: [],
  roles: [],
  searchQuery: '',
  searchTerm: '',
  selectedTags: [],
  selectedRole: null,
  selectedPrompt: null,
  isCreateModalOpen: false,
  isManageModalOpen: false,
  isViewTemplateModalOpen: false,
  modalMode: 'create',
  selectedTemplate: null,
  selectedTemplateForPrompt: null,
  initialRoleId: null,
  versions: [],
  teams: [],
  sharedPrompts: [],
  requestQueue: [],
  currentUser: null,
  promptHistory: [],
  isAuthenticated: authService.isAuthenticated(),

  // Actions
  addPrompt: (prompt: Prompt) =>
    set((state) => ({
      prompts: [...state.prompts, prompt],
      //@ts-ignore
      promptHistory: [...state.promptHistory, prompt],
    })),

  updatePrompt: (prompt: Prompt) =>
    set((state) => ({
      prompts: state.prompts.map((p) => (p.id === prompt.id ? prompt : p)),
      //@ts-ignore
      promptHistory: state.promptHistory.map((p) => (p.id === prompt.id ? prompt : p)),
    })),

  deletePrompt: (id: string) =>
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
      //@ts-ignore
      promptHistory: state.promptHistory.filter((p) => p.id !== id),
    })),

  clearPrompts: () =>
    set((state) => ({
      prompts: [],
      promptHistory: [],
    })),

  addTag: (tag: Tag) =>
    set((state) => ({ tags: [...state.tags, tag] })),

  addTemplate: async (template: Template) => {
    try {
      const templateStore = useTemplateStore.getState();
      
      // Add template to templateStore
      templateStore.addTemplate(template);
      
      // Get the newly added template from userTemplates
      const userTemplates = templateStore.userTemplates;
      const newTemplate = userTemplates[userTemplates.length - 1];
      
      // Update the local templates state
      set(state => ({
        templates: [...state.templates, newTemplate]
      }));
      
      return newTemplate;
    } catch (error) {
      console.error('Error adding template:', error);
      throw error;
    }
  },

  updateTemplate: async (template: Template) => {
    try {
      const templateStore = useTemplateStore.getState();
      
      // Ensure raceExecute field is properly set
      const templateWithExecute = {
        ...template,
        raceExecute: template.raceExecute || template.raceExpectation || ''
      };
      
      // Update in templateStore
      await templateStore.updateTemplate(templateWithExecute);
      
      // Update local state
      set(state => ({
        templates: state.templates.map(t => 
          t.id === template.id ? templateWithExecute : t
        )
      }));
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      const templateStore = useTemplateStore.getState();
      const template = templateStore.templates.find(t => t.id === id) || 
                      templateStore.userTemplates.find(t => t.id === id);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Update local state first for immediate UI feedback
      set(state => ({
        templates: state.templates.filter(t => t.id !== id)
      }));

      // Then try to delete from templateStore
      await templateStore.deleteTemplate(id);
    } catch (error) {
      console.error('Error deleting template:', error);
      
      // Revert the state if the operation fails
      const templateStore = useTemplateStore.getState();
      const template = templateStore.templates.find(t => t.id === id) || 
                      templateStore.userTemplates.find(t => t.id === id);
      
      if (template) {
        set(state => ({
          templates: [...state.templates, template]
        }));
      }
      throw error;
    }
  },

  addRole: async (role: Role) => {
    try {
      const roleStore = useRoleStore.getState();
      const newRole = await roleStore.addRole(role);
      return newRole;
    } catch (error) {
      console.error('Error adding role:', error);
      throw error;
    }
  },

  updateRole: async (role: Role) => {
    try {
      if (!role?.id) {
        throw new Error('Role ID is required for update');
      }

      const roleStore = useRoleStore.getState();
      const templateStore = useTemplateStore.getState();
      
      // Ensure we have all required fields
      const roleToUpdate = {
        ...role,
        id: role.id,
        name: role.name.trim(),
        description: role.description?.trim() || '',
        updatedAt: new Date().toISOString()
      };
      
      // Update in roleStore first
      await roleStore.updateRole(roleToUpdate.id, roleToUpdate);
      
      // Get the updated roles to ensure consistency
      const allRoles = roleStore.getAllRoles();
      
      // Update the local state with the complete roles array
      set(state => ({
        roles: allRoles
      }));

      return roleToUpdate;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  deleteRole: async (id: string) => {
    try {
      const templateStore = useTemplateStore.getState();
      const roleStore = useRoleStore.getState();
      
      // Find templates with this role
      const templatesWithRole = [...templateStore.templates, ...templateStore.userTemplates]
        .filter(t => t.role === id);
      
      if (templatesWithRole.length > 0) {
        const proceed = window.confirm(
          `This role has ${templatesWithRole.length} dependent templates. Deleting it will also delete these templates. Continue?`
        );
        if (!proceed) return;
        
        // Delete dependent templates first
        for (const template of templatesWithRole) {
          await templateStore.deleteTemplate(template.id);
        }
      }
      
      // Delete the role
      await roleStore.deleteRole(id);
      
      // Update the local roles state
      set(state => ({
        roles: state.roles.filter(r => r.id !== id)
      }));

      // Clear role from any remaining templates
      templateStore.updateTemplatesForDeletedRole(id);

    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  setSearchQuery: (query: string) =>//@ts-ignore
    set({ searchQuery: query }),

  setSearchTerm: (term: string) =>
    set({ searchTerm: term }),

  toggleTag: (tagId: string) =>
    set((state) => ({
      ...state,//@ts-ignore
      selectedTags: state.selectedTags.includes(tagId) //@ts-ignore
        ? state.selectedTags.filter((id) => id !== tagId) //@ts-ignore
        : [...state.selectedTags, tagId],
    })),

  setSelectedRole: (role: string | null) =>
    set({ selectedRole: role }),

  toggleCreateModal: () => {
    set((state) => ({
      isCreateModalOpen: !state.isCreateModalOpen
    }));
  },

  toggleManageModal: () => {
    set((state) => ({
      isManageModalOpen: !state.isManageModalOpen
    }));
  },

  toggleViewTemplateModal: () =>
    set((state) => ({ isViewTemplateModalOpen: !state.isViewTemplateModalOpen })),

  setModalMode: (mode: ModalMode) => {
    set({
      modalMode: mode
    });
  },

  setSelectedTemplate: (template: Template | null) => {
    set({
      selectedTemplate: template ? {
        ...template,
        raceExecute: template.raceExecute || template.raceExpectation || ''
      } : null
    });
  },
    
  setSelectedTemplateForPrompt: (template: Template | null) => {
    set({
      selectedTemplateForPrompt: template ? {
        ...template,
        raceExecute: template.raceExecute || template.raceExpectation || ''
      } : null
    });
  },

  setInitialRoleId: (roleId: string | null) =>
    set({ initialRoleId: roleId }),
//@ts-ignore
  addVersion: (version: PromptVersion) => set((state) => ({ versions: [...state.versions, version] })),
 //@ts-ignore
  getVersionHistory: (promptId: string) => get().versions.filter((v) => v.promptId === promptId),
  revertToVersion: (promptId: string, versionId: string) => { //@ts-ignore
    const version = get().versions.find((v) => v.id === versionId && v.promptId === promptId);
    if (version) {
      set((state) => ({
        prompts: state.prompts.map((p) =>
          p.id === promptId ? { ...p, content: version.content } : p
        ),
      }));
    }
  },
  sharePrompt: (promptId: string, recipients: string[], permissions: 'view' | 'edit' | 'admin') =>
    set((state) => ({
      sharedPrompts: [
        ...state.sharedPrompts,
        { 
          promptId, 
          sharedWith: recipients, 
          permissions,
          userId: state.currentUser?.id || recipients[0] // Fallback to first recipient to maintain compatibility
        },
      ],
    })),
  getSharedPrompts: (userId: string) =>//@ts-ignore
    get().sharedPrompts.filter((sp) => sp.sharedWith.includes(userId)),
  
  checkRateLimit: (userId: string) => {
    const user = get().currentUser;
    if (!user) return false;
    //@ts-ignore
    if (user.rateLimitExpiry && user.rateLimitExpiry > new Date()) {
      return false;
    }
    //@ts-ignore
    if (user.requestCount >= RATE_LIMIT) {
      set(state => ({
        ...state,
        currentUser: {
          ...state.currentUser!,
          rateLimitExpiry: new Date(Date.now() + 60000), // 1 minute
          requestCount: 0
        }
      }));
      return false;
    }
    
    return true;
  },

  enqueueRequest: async (request: () => Promise<any>) => {
    const requestId = crypto.randomUUID();
    const userId = get().currentUser?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    set((state) => ({
      ...state,
      requestQueue: [//@ts-ignore
        ...state.requestQueue,
        {
          id: requestId,
          userId,
          request,
          timestamp: new Date()
        }
      ]
    }));

    // Return promise that resolves when request is processed
    return new Promise((resolve, reject) => {
      const checkQueue = setInterval(() => {//@ts-ignore
        const request = get().requestQueue.find(r => r.id === requestId);
        if (!request) {
          clearInterval(checkQueue);
          resolve(true);
        }
      }, 100);
    });
  },

  processQueue: () => {
    const state = get();//@ts-ignore
    const queue = state.requestQueue;
    
    if (queue.length === 0) return;
    
    // Process oldest request first
    const nextRequest = queue[0];
    //@ts-ignore
    if (state.checkRateLimit(nextRequest.userId)) {
      nextRequest.request()
        .then(() => {
          set((state) => ({
            ...state, //@ts-ignore
            requestQueue: state.requestQueue.filter(r => r.id !== nextRequest.id),
            currentUser: {
              ...state.currentUser!, //@ts-ignore
              requestCount: state.currentUser!.requestCount + 1
            }
          }));
        })
        .catch(console.error);
    }
  },

  importTemplates: (templates: Template[], roles: Role[]) => {
    const templateStore = useTemplateStore.getState();
    const roleStore = useRoleStore.getState();

    // Add new roles first
    const newRoles = roles.filter(role => 
      !roleStore.roles.find(r => r.id === role.id)
    );
    roleStore.importRoles(newRoles);

    // Add new templates with new IDs
    const newTemplates = templates.map(template => ({
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Update templateStore
    templateStore.importTemplates(newTemplates);

    // Update local state
    set(state => ({
      ...state,
      roles: [...state.roles, ...newRoles],
      templates: [...state.templates, ...newTemplates]
    }));
  },

  login: async (username: string, password: string) => {
    try {
      const success = await authService.login(username, password);
      if (success) {
        set({ isAuthenticated: true });
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ isAuthenticated: false });
  },
  setSelectedPrompt: (prompt: Prompt | null) => set({ selectedPrompt: prompt }),
  setId: (id: string) => set({ id }),
  setEmail: (email: string) => set({ email }),
}));

// Start queue processor

setInterval(() => {
  //@ts-ignore
  useStore.getState().processQueue(); 
}, 60000);