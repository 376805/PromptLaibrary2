/**
 * Type definitions for ProLib application
 */

import { ReactNode } from "react";

export interface Store{
  prompts: Prompt[];
  tags: Tag[];
  templates: Template[];
  sharedPrompts: SharedPrompt[];
  roles: Role[];
  searchTerm: string;
  modalMode: ModalMode;
  selectedPrompt: Prompt | null;
  selectedTemplate: Template | null;
  selectedRole: string | null;
  initialRoleId: string | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  id: string;
  email: string;
  selectedTags: string[];
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (prompt: Prompt) => void;
  deletePrompt: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setModalMode: (mode: ModalMode) => void;
  setSelectedRole: (role: string | null) => void;
  toggleManageModal: () => void;
  isManageModalOpen: boolean;
  toggleCreateModal: () => void;
  isCreateModalOpen: boolean;
  selectedTemplateForPrompt: Template | null;
  setSelectedTemplateForPrompt: (template: Template | null) => void;
  toggleViewTemplateModal: () => void;
  isViewTemplateModalOpen: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addRole: (role: Role) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  setInitialRoleId: (roleId: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleTag: (tagId: string) => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Prompt {
  priority: ReactNode;
  id: string;
  title: string;
  content: string;
  roleId: string;
  templateId?: string;
  bestPractices?: { description: string; label: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  role: string;
  raceRole?: string;
  raceAction?: string;
  raceContext?: string;
  raceExpectation?: string;
  raceExecute?: string;
  bestPractices?: { description: string; label: string }[];
  showProgrammingLanguage?: boolean;
  showOutputValidation?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  customSections?: CustomSection[];
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface SharedPrompt {
  promptId: string;
  userId: string;
  permissions: 'view' | 'edit' | 'admin';
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
  isCompiled: boolean;
}

export interface CustomSection {
  id?: string;
  name: string;
  description: string;
  isVisible?: boolean;
  content?: string;
}

export type ModalMode = 
  | 'create' 
  | 'update' 
  | 'view' 
  | 'history' 
  | 'createPromptWithTemplate' 
  | 'updatePrompt'
  | 'createPrompt'
  | 'createTemplate'
  | 'updateTemplate'
  | 'manage'
  | 'enhance';
