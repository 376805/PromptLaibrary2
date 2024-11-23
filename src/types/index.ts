export type ModalMode = 'view' | 'create' | 'update' | 'history' | 'createPromptWithTemplate' | 'updatePrompt' | 'createPrompt' | 'createTemplate' | 'updateTemplate' | 'manage' | 'enhance';

export interface Tag {
  id: string;
  name: string;
  parentId?: string;
  color: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  role: string;
  raceRole: string;
  raceAction: string;
  raceContext: string;
  raceExecute: string;
  bestPractices: string[];
  showProgrammingLanguage: boolean;
  showOutputValidation: boolean;
  customSections: CustomSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomSection {
  id: string;
  name: string;
  description: string;
  isVisible?: boolean;
  content?: string;
  required?: boolean;
}

export interface CustomSectionData {
  id: string;
  title: string;
  content: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  template?: Template;
  bestPractices: string[];
  checkedPractices: string[];
  additionalText: string;
  uploadedFiles: FileData[];
  customTextAreas: CustomTextArea[];
  programmingLanguage: string;
  outputValidation: string;
  customSections: CustomSectionData[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

export interface FileData {
  name: string;
  content: string;
}

export interface CustomTextArea {
  id: string;
  title: string;
  content: string;
}

export interface SharedPrompt {
  id: string;
  promptId: string;
  userId: string;
  sharedWith: string[];
  permissions: 'admin' | 'view' | 'edit';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  timestamp: Date;
  author: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface RequestQueueItem {
  id: string;
  userId: string;
  request: () => Promise<any>;
  timestamp: Date;
}

export interface Store {
  id: string;
  email: string;
  prompts: Prompt[];
  promptHistory: Prompt[];
  tags: Tag[];
  templates: Template[];
  roles: Role[];
  searchQuery: string;
  searchTerm: string;
  selectedTags: string[];
  selectedRole: Role | null;
  selectedPrompt: Prompt | null;
  selectedTemplate: Template | null;
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    email: string;
    requestCount?: number;
    rateLimitExpiry?: Date;
  } | null;
  requestQueue: RequestQueueItem[];
  isCreateModalOpen: boolean;
  isManageModalOpen: boolean;
  isViewTemplateModalOpen: boolean;
  modalMode: ModalMode;
  selectedTemplateForPrompt: Template | null;
  initialRoleId: string | null;
  versions: PromptVersion[];
  teams: Team[];
  sharedPrompts: SharedPrompt[];

  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (prompt: Prompt) => void;
  deletePrompt: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setModalMode: (mode: ModalMode) => void;
  setSharedPrompts: (sharedPrompts: SharedPrompt[]) => void;
  sharePrompt: (promptId: string, userId: string, permissions: 'admin' | 'view' | 'edit') => void;
  unsharePrompt: (promptId: string, userId: string) => void;
  setCurrentUser: (user: { id: string; email: string } | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setInitialRoleId: (roleId: string | null) => void;
  processQueue: () => void;
  enqueueRequest: (request: () => Promise<any>) => void;
}