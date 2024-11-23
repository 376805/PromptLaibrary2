/**
 * CreatePromptModal Component
 * 
 * A modal component for creating and editing prompts with role and template selection.
 * Features a multi-step process with card-based selection interfaces.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useRoleStore } from '../store/roleStore';
import { useTemplateStore } from '../store/templateStore';
import { Template, Role } from '../types';
import { ArrowRight, Check, Upload } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PreviewPage } from './PreviewPage';
import { languages } from '../data/languages';
import { useDropzone } from 'react-dropzone';
import { enhancePrompt } from '../services/apiSelector';

interface FileData {
  id: string;
  name: string;
  content: string;
}

interface CustomTextArea {
  id: string;
  name: string;
  content: string;
}

interface CustomSectionData {
  sectionId: string;
  name: string;
  content: string;
}

/**
 * CreatePromptModal component for creating and editing prompts
 */
export const CreatePromptModal = () => {
  // Store hooks
  const { 
    isCreateModalOpen, 
    toggleCreateModal,
    selectedTemplateForPrompt,
    setSelectedTemplateForPrompt,
    modalMode,
    addPrompt,
    currentUser
  } = useStore();

  const { 
    modalSelectedRole, 
    setModalSelectedRole, 
    clearModalRole, 
    roles 
  } = useRoleStore();
  const { 
    templates, 
    userTemplates 
  } = useTemplateStore();

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    bestPractices: [] as any[],
    checkedPractices: [] as { description: string; label: string }[],
    additionalText: '',
    uploadedFiles: [] as FileData[],
    customTextAreas: [] as CustomTextArea[],
    programmingLanguage: '',
    outputValidation: '',
    customSections: [] as CustomSectionData[],
    raceRole: '',
    roleDescription: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [formExpanded, setFormExpanded] = useState(false);
  const [showAddTextArea, setShowAddTextArea] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isCustomSectionsExpanded, setIsCustomSectionsExpanded] = useState(true);

  /**
   * Combine and sort all roles
   */
  const allRoles = useMemo(() => 
    [...roles, ...useRoleStore.getState().userRoles]
      .sort((a, b) => a.name.localeCompare(b.name))
  , [roles]);

  /**
   * Combines all templates from store
   */
  const allTemplates = useMemo(() => 
    [...templates, ...userTemplates]
  , [templates, userTemplates]);

  /**
   * Filters templates based on selected role
   */
  const updateFilteredTemplates = useCallback(() => {
    if (modalSelectedRole) {
      const filtered = allTemplates
        .filter(template => template.role === modalSelectedRole.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates([]);
    }
  }, [modalSelectedRole, allTemplates]);

  /**
   * Updates filtered templates when role or templates change
   */
  useEffect(() => {
    if (modalMode === 'createPromptWithTemplate' && selectedTemplateForPrompt) {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplateForPrompt.name
      }));
    } else if (modalSelectedRole) {
      updateFilteredTemplates();
    }
  }, [modalMode, selectedTemplateForPrompt, modalSelectedRole, updateFilteredTemplates]);

  /**
   * Manages step transitions based on role and template selection
   */
  useEffect(() => {
    if (!isCreateModalOpen) return;

    if (modalMode === 'createPromptWithTemplate') {
      if (selectedTemplateForPrompt) {
        setCurrentStep(3);
        setFormExpanded(true);
      }
    } else if (modalMode === 'createPrompt') {
      if (currentStep === 1 && modalSelectedRole) {
        setCurrentStep(2);
      } else if (currentStep === 2 && !modalSelectedRole) {
        setCurrentStep(1);
      } else if (currentStep === 2 && modalSelectedRole && selectedTemplateForPrompt) {
        setCurrentStep(3);
        setFormExpanded(true);
      }
    }
  }, [modalMode, modalSelectedRole, selectedTemplateForPrompt, currentStep, isCreateModalOpen]);

  /**
   * Clears modal role and resets state when opening the modal
   */
  useEffect(() => {
    if (isCreateModalOpen) {
      clearModalRole();
      setCurrentStep(1);
      setFilteredTemplates([]);
      setFormData({
        title: '',
        content: '',
        bestPractices: [] as any[],
        checkedPractices: [] as { description: string; label: string }[],
        additionalText: '',
        uploadedFiles: [] as FileData[],
        customTextAreas: [] as CustomTextArea[],
        programmingLanguage: '',
        outputValidation: '',
        customSections: [] as CustomSectionData[],
        raceRole: '',
        roleDescription: ''
      });
    }
  }, [isCreateModalOpen, clearModalRole]);

  /**
   * Resets state when modal closes
   */
  useEffect(() => {
    if (!isCreateModalOpen) {
      clearModalRole();
      setFormData({
        title: '',
        content: '',
        bestPractices: [] as any[],
        checkedPractices: [] as { description: string; label: string }[],
        additionalText: '',
        uploadedFiles: [],
        customTextAreas: [],
        programmingLanguage: '',
        outputValidation: '',
        customSections: [] as CustomSectionData[],
        raceRole: '',
        roleDescription: ''
      });
      setCurrentStep(1);
      setFilteredTemplates([]);
      setFormExpanded(false);
      setSelectedTemplateForPrompt(null);
    }
  }, [isCreateModalOpen, clearModalRole, setSelectedTemplateForPrompt]);

  /**
   * Handles initial state for template mode
   */
  useEffect(() => {
    if (isCreateModalOpen && modalMode === 'createPromptWithTemplate' && selectedTemplateForPrompt) {
      const selectedRole = allRoles.find(r => r.id === selectedTemplateForPrompt.role);
      setModalSelectedRole(selectedRole || null);
      setFormData(prev => ({
        ...prev,
        title: selectedTemplateForPrompt.name,
        raceRole: selectedTemplateForPrompt.raceRole,
        roleDescription: selectedTemplateForPrompt.description
      }));
      setCurrentStep(3);
    }
  }, [isCreateModalOpen, modalMode, selectedTemplateForPrompt, allRoles, setModalSelectedRole]);

  // Initialize form with selected template if available
  useEffect(() => {
    if (selectedTemplateForPrompt && modalMode === 'createPromptWithTemplate') {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplateForPrompt.name,
        bestPractices: selectedTemplateForPrompt.bestPractices || [],
        checkedPractices: []
      }));
      
      setFormExpanded(true);
    }
  }, [selectedTemplateForPrompt, modalMode]);

  // Handle template selection
  const handleTemplateSelection = (template: Template) => {
    setSelectedTemplateForPrompt(template);
    
    if (modalMode === 'createPrompt') {
      setFormData(prev => ({
        ...prev,
        title: template.name || ''
      }));
    }
    
    if (modalSelectedRole && currentStep === 2) {
      setCurrentStep(3);
      setFormExpanded(true);
    }
  };

  /**
   * Gets final content for prompt
   */
  const getFinalContent = () => {
    const parts: string[] = [];

    // 1. RACE Framework
    if (selectedTemplateForPrompt) {
      // Use template's role data if available
      parts.push(`Role:\n${selectedTemplateForPrompt.raceRole}`);
      
      if (selectedTemplateForPrompt.description) {
        parts.push(`Description:\n${selectedTemplateForPrompt.description}`);
      }
      
      if (selectedTemplateForPrompt.raceAction) {
        parts.push(`Action:\n${selectedTemplateForPrompt.raceAction}`);
      }
      
      if (selectedTemplateForPrompt.raceContext) {
        parts.push(`Context:\n${selectedTemplateForPrompt.raceContext}`);
      }
      
      if (selectedTemplateForPrompt.raceExecute) {
        parts.push(`Execute:\n${selectedTemplateForPrompt.raceExecute}`);
      }
    } else if (formData.raceRole) {
      // Fallback to form data if no template
      parts.push(`Role:\n${formData.raceRole}`);
      
      if (formData.roleDescription) {
        parts.push(`Description:\n${formData.roleDescription}`);
      }
    }

    // 2. Custom Sections
    formData.customSections.forEach(section => {
      if (section.content.trim()) {
        parts.push(`${section.name}:\n${section.content}`);
      }
    });

    // 3. Programming Language (if enabled and selected)
    if (selectedTemplateForPrompt?.showProgrammingLanguage && formData.programmingLanguage) {
      parts.push(`Programming Language: ${formData.programmingLanguage}`);
    }

    // 4. Best Practices
    if (formData.checkedPractices.length > 0 && selectedTemplateForPrompt?.bestPractices) {
      const selectedPractices = selectedTemplateForPrompt.bestPractices
        .filter(practice => formData.checkedPractices.some(checked => checked.description === practice.description))
        .map(practice => `• ${practice.description}`);
      
      if (selectedPractices.length > 0) {
        parts.push('Best Practices to Follow:\n' + selectedPractices.join('\n'));
      }
    }

    // 5. Output Validation (if present)
    if (formData.outputValidation.trim()) {
      parts.push(`Output Validation:\n${formData.outputValidation}`);
    }

    // 6. File Contents (if any)
    formData.uploadedFiles.forEach(file => {
      if (file.content.trim()) {
        parts.push(`File Content of ${file.name}:\n${file.content}`);
      }
    });

    return parts.join('\n\n');
  };

  /**
   * Copies final content to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFinalContent());
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = () => {
    // Show preview first
    setShowPreview(true);
    // Auto copy content when preview is shown
    copyToClipboard();
  };

  /**
   * Handles final submission after preview
   */
  const handleFinalSubmit = async () => {
    const newPrompt = {
      id: crypto.randomUUID(),
      priority: 0,
      title: formData.title,
      content: await enhancePrompt(getFinalContent(), formData.checkedPractices.map(practice => practice.label)),
      roleId: modalSelectedRole?.id || '',
      templateId: selectedTemplateForPrompt?.id || '',
      bestPractices: formData.checkedPractices,
      createdBy: currentUser?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      programmingLanguage: formData.programmingLanguage,
      outputValidation: formData.outputValidation,
      raceRole: formData.raceRole,
      description: formData.roleDescription
    };

    addPrompt(newPrompt);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      bestPractices: [] as any[],
      checkedPractices: [] as { description: string; label: string }[],
      additionalText: '',
      uploadedFiles: [],
      customTextAreas: [],
      programmingLanguage: '',
      outputValidation: '',
      customSections: [] as CustomSectionData[],
      raceRole: '',
      roleDescription: ''
    });
    setSelectedTemplateForPrompt(null);
    clearModalRole();
    setCurrentStep(1);
    setShowPreview(false);
    toggleCreateModal();
  };

  // Handle role selection
  const handleRoleSelection = (role: Role) => {
    setModalSelectedRole(role);
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!modalSelectedRole) {
          setValidationError('Please select a role to continue');
          return false;
        }
        break;
      case 2:
        if (!selectedTemplateForPrompt) {
          setValidationError('Please select a template to continue');
          return false;
        }
        break;
      default:
        break;
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setValidationError('');
      
      // Clear states based on which step we're returning from
      if (currentStep === 3) {
        // Going back from step 3 to 2
        setSelectedTemplateForPrompt(null);
        setFormData(prev => ({
          ...prev,
          title: ''
        }));
      } else if (currentStep === 2) {
        // Going back from step 2 to 1
        setModalSelectedRole(null);
        setSelectedTemplateForPrompt(null);
        setFormData(prev => ({
          ...prev,
          title: ''
        }));
        setFilteredTemplates([]);
      }
    }
  };

  /**
   * Auto-expands form when both role and template are selected
   */
  useEffect(() => {
    if (modalMode === 'createPromptWithTemplate' && selectedTemplateForPrompt) {
      setFormExpanded(true);
      setCurrentStep(3);
    } else if (modalSelectedRole && selectedTemplateForPrompt) {
      setFormExpanded(true);
      setCurrentStep(3);
    } else {
      setFormExpanded(false);
    }
  }, [selectedTemplateForPrompt, modalSelectedRole, modalMode]);

  /**
   * Resets form when modal opens/closes or mode changes
   */
  useEffect(() => {
    if (!isCreateModalOpen) {
      // Reset form when modal is closed
      setFormData({
        title: '',
        content: '',
        bestPractices: [] as any[],
        checkedPractices: [] as { description: string; label: string }[],
        additionalText: '',
        uploadedFiles: [],
        customTextAreas: [],
        programmingLanguage: '',
        outputValidation: '',
        customSections: [] as CustomSectionData[],
        raceRole: '',
        roleDescription: ''
      });
      setCurrentStep(1);
    } else if (modalMode === 'createPromptWithTemplate' && selectedTemplateForPrompt) {
      // Set form data from template
      setFormData({
        title: selectedTemplateForPrompt.name,
        content: '',
        bestPractices: selectedTemplateForPrompt.bestPractices || [],
        checkedPractices: [] as { description: string; label: string }[],
        additionalText: '',
        uploadedFiles: [],
        customTextAreas: [],
        programmingLanguage: '',
        outputValidation: '',
        customSections: [] as CustomSectionData[],
        raceRole: selectedTemplateForPrompt.raceRole,
        roleDescription: selectedTemplateForPrompt.description
      });
      setCurrentStep(3);
    } else if (modalMode === 'createPrompt') {
      // Reset form for new prompt creation
      setFormData({
        title: '',
        content: '',
        bestPractices: [] as any[],
        checkedPractices: [] as { description: string; label: string }[],
        additionalText: '',
        uploadedFiles: [],
        customTextAreas: [],
        programmingLanguage: '',
        outputValidation: '',
        customSections: [] as CustomSectionData[],
        raceRole: '',
        roleDescription: ''
      });
      setCurrentStep(1);
    }
  }, [isCreateModalOpen, modalMode, selectedTemplateForPrompt, currentUser]);

  /**
   * Handles file upload for prompt content
   * @param e - File input change event
   */
  const handleFileUpload = (sectionId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'for section:', sectionId);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('File content loaded:', content.substring(0, 100));

      setFormData(prev => ({
        ...prev,
        customSections: prev.customSections.length > 0 
          ? prev.customSections.map(section => 
              section.sectionId === sectionId 
                ? { ...section, content: content }
                : section
            )
          : [
              {
                sectionId: sectionId,
                name: selectedTemplateForPrompt?.customSections?.find(s => s.id === sectionId)?.name || '',
                content: content
              }
            ]
      }));
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
    }));
  };

  const handleAddTextArea = () => {
    const newId = crypto.randomUUID();
    setFormData(prev => ({
      ...prev,
      customTextAreas: [
        ...prev.customTextAreas,
        {
          id: newId,
          name: '',
          content: ''
        }
      ]
    }));
  };

  const handleRemoveTextArea = (textAreaId: string) => {
    setFormData(prev => ({
      ...prev,
      customTextAreas: prev.customTextAreas.filter(area => area.id !== textAreaId)
    }));
  };

  const handleTextAreaNameChange = (textAreaId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      customTextAreas: prev.customTextAreas.map(area =>
        area.id === textAreaId ? { ...area, name } : area
      )
    }));
  };

  const handleTextAreaContentChange = (textAreaId: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      customTextAreas: prev.customTextAreas.map(area =>
        area.id === textAreaId ? { ...area, content } : area
      )
    }));
  };

  /**
   * Handles best practice check
   * @param practice - Best practice to check
   */
  const handleBestPracticeCheck = (practice: { description: string; label: string }) => {
    setFormData(prev => {
      const newCheckedPractices = prev.checkedPractices.includes(practice)
        ? prev.checkedPractices.filter(p => p.description !== practice.description)
        : [...prev.checkedPractices, practice];
      return { ...prev, checkedPractices: newCheckedPractices };
    });
  };

  const handleFileContentForSection = (sectionId: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      customSections: [
        ...prev.customSections.filter(s => s.sectionId !== sectionId),
        { 
          sectionId: sectionId, 
          name: selectedTemplateForPrompt?.customSections?.find(s => s.id === sectionId)?.name || '',
          content: content
        }
      ]
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[], sectionId: string) => {
    console.log('Files dropped:', acceptedFiles, 'for section:', sectionId);

    acceptedFiles.forEach(file => {
      console.log('Processing file:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        console.log('File content loaded, length:', content.length);
        setFormData(prev => ({
          ...prev,
          customSections: [
            ...prev.customSections.filter(s => s.sectionId !== sectionId),
            {
              sectionId: sectionId,
              name: selectedTemplateForPrompt?.customSections?.find(s => s.id === sectionId)?.name || '',
              content: content
            }
          ]
        }));
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsText(file);
    });
  }, [selectedTemplateForPrompt]);

  /**
   * Handles select all best practices
   */
  const handleSelectAllBestPractices = () => {
    setFormData(prev => {
      const allPracticesSelected = selectedTemplateForPrompt?.bestPractices?.length === prev.checkedPractices.length;
      
      // If all practices are selected, unselect all. Otherwise, select all.
      const newCheckedPractices = allPracticesSelected 
        ? []
        : selectedTemplateForPrompt?.bestPractices || [];

      return { ...prev, checkedPractices: newCheckedPractices };
    });
  };

  if (!isCreateModalOpen || (modalMode !== 'createPrompt' && modalMode !== 'createPromptWithTemplate')) return null;

  return (
    <>
      <Modal
        isOpen={isCreateModalOpen && !showPreview}
        onClose={() => {
          toggleCreateModal();
          setCurrentStep(1);
          setShowPreview(false);
          setFormData({
            title: '',
            content: '',
            bestPractices: [] as any[],
            checkedPractices: [] as { description: string; label: string }[],
            additionalText: '',
            uploadedFiles: [],
            customTextAreas: [],
            programmingLanguage: '',
            outputValidation: '',
            customSections: [] as CustomSectionData[],
            raceRole: '',
            roleDescription: ''
          });
          setSelectedTemplateForPrompt(null);
          clearModalRole();
        }}
        size="7xl"
        title={
          selectedTemplateForPrompt 
            ? selectedTemplateForPrompt.name
            : modalMode === 'createPrompt' 
              ? 'Create New Prompt'
              : 'Select Template'
        }
      >
        <div className="p-4">
          {/* Steps Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-3">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-200 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className={`h-0.5 w-8 transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-200 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <div className={`h-0.5 w-8 transition-colors duration-300 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-200 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
            </div>
            <div className="flex justify-center mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>Select Role</span>
              <span className="mx-2">→</span>
              <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>Choose Template</span>
              <span className="mx-2">→</span>
              <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>Create Prompt</span>
            </div>
          </div>

          {/* Step Content */}
          <form className="space-y-4 sm:space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Role
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allRoles.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelection(role)}
                        className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          modalSelectedRole?.id === role.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {role.name}
                        </h3>
                        {role.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Template Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Template for {modalSelectedRole?.name}
                  </label>
                  {filteredTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelection(template)}
                          className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            selectedTemplateForPrompt?.id === template.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {template.name}
                          </h3>
                          {template.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {template.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No templates available for this role.
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Prompt Structure */}
                <div className="space-y-2 pt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                  </div>

                  <div>
                     {/* Template Specific Sections */}
                     {(selectedTemplateForPrompt?.customSections || []).filter(section => section.isVisible).length > 0 && (
                      <div className="mb-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-04">
                      

                        {isCustomSectionsExpanded && (
                          <div className="mt-4 space-y-4">
                            {(selectedTemplateForPrompt?.customSections || [])
                              .filter(section => section.isVisible)
                              .map(section => {
                                return (
                                  <div key={section.id} className="space-y-2">
                                    <div className="flex flex-col">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {section.name}
                                      </label>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <textarea
                                        value={formData.customSections.find(s => s.sectionId === section.id)?.content || ''}
                                        onChange={(e) => {
                                          setFormData(prev => ({
                                            ...prev,
                                            customSections: [
                                              ...prev.customSections.filter(s => s.sectionId !== section.id),
                                              { 
                                                sectionId: section.id!, 
                                                name: section.name, 
                                                content: e.target.value 
                                              }
                                            ]
                                          }));
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-500"
                                        rows={3}
                                        placeholder={`${section.description.toLowerCase()}...`}
                                      />
                                      
                                      {/* Simple File Upload Button */}
                                      <div className="flex-shrink-0">
                                        <label className="cursor-pointer p-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors inline-flex items-center justify-center group relative">
                                          <input
                                            type="file"
                                            onChange={handleFileUpload(section.id!)}
                                            className="hidden"
                                            accept=".txt,.js,.ts,.jsx,.tsx,.json,.html,.css,.feature"
                                          />
                                          <Upload className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                          
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1.5 px-3 whitespace-normal break-words inline-block max-w-[60rem] leading-snug shadow-lg z-50 left-1/2 transform -translate-x-1/2">
                                            Upload file
                                          </div>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              
                   
                            {/* Programming Language Dropdown */}
                            {selectedTemplateForPrompt?.showProgrammingLanguage && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Programming Language
                                </label>
                                <select
                                  value={formData.programmingLanguage}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      programmingLanguage: e.target.value
                                    }));
                                  }}
                                  className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-500"
                                >
                                  <option value="">Select a language...</option>
                                  <option value="Python">Python</option>
                                  <option value="JavaScript">JavaScript</option>
                                  <option value="TypeScript">TypeScript</option>
                                  <option value="Java">Java</option>
                                  <option value="C#">C#</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <hr className="my-4 border-t border-gray-200 dark:border-gray-700" />
                    {/* Best Practices Section */}
                    <div className="mb-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-04">
                      <div className="mt-2">
                        <div className="space-y-2">
                          {selectedTemplateForPrompt?.bestPractices && selectedTemplateForPrompt.bestPractices.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  Best Practices
                                </h3>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="select-all-practices"
                                    checked={selectedTemplateForPrompt.bestPractices.length === formData.checkedPractices.length}
                                    onChange={handleSelectAllBestPractices}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                  />
                                  <label
                                    htmlFor="select-all-practices"
                                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    Select All
                                  </label>
                                </div>
                              </div>
                              {selectedTemplateForPrompt.bestPractices.map((practice, index) => (
                                <div key={index} className="flex items-start">
                                  <input
                                    type="checkbox"
                                    id={`practice-${index}`}
                                    checked={formData.checkedPractices.some(checked => checked.description === practice.description)}
                                    onChange={() => handleBestPracticeCheck(practice)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                  />
                                  <div className="relative group">
                                    <label
                                      htmlFor={`practice-${index}`}
                                      className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-help"
                                    >
                                      {practice.label}
                                    </label>
                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50">
                                      <div 
                                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs rounded-lg py-2 px-3 whitespace-normal break-words shadow-lg border border-gray-200 dark:border-gray-700"
                                        style={{ 
                                          maxWidth: '300px',
                                          minWidth: '200px',
                                          width: 'max-content'
                                        }}
                                      >
                                        {practice.description}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={currentStep === 3 ? handleSubmit : handleNextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {currentStep === 3 ? 'Create' : 'Next'}
              </button>
            </div>
          </form>

        </div>
      </Modal>

      <PreviewPage
        isOpen={isCreateModalOpen && showPreview}
        onClose={() => {
          setShowPreview(false);
          toggleCreateModal();
          setCurrentStep(1);
          setFormData({
            title: '',
            content: '',
            bestPractices: [] as any[],
            checkedPractices: [] as { description: string; label: string }[],
            additionalText: '',
            uploadedFiles: [],
            customTextAreas: [],
            programmingLanguage: '',
            outputValidation: '',
            customSections: [] as CustomSectionData[],
            raceRole: '',
            roleDescription: ''
          });
          setSelectedTemplateForPrompt(null);
          clearModalRole();
        }}
        content={getFinalContent()}
        onBack={() => setShowPreview(false)}
        onCopy={copyToClipboard}
        showCopySuccess={showCopySuccess}
      />
    </>
  );
};