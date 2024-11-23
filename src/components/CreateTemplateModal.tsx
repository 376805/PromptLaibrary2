import React, { useState, useEffect } from 'react';
import { Template, CustomSection } from '../types';
import { useTemplateStore } from '../store/templateStore';
import { useRoleStore } from '../store/roleStore';
import { useStore } from '../store/useStore';
import authService from '../services/authService';
import { Modal } from './Modal';
import { Check } from 'lucide-react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';

interface CreateTemplateModalProps {
  initialData?: Partial<Template>;
}

interface NewBestPractice {
  label: string;
  description: string;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [newBestPractice, setNewBestPractice] = useState<NewBestPractice>({
    label: '',
    description: ''
  });
  const [newCustomSection, setNewCustomSection] = useState({
    name: '',
    description: ''
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [allRoles, setAllRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: '',
    raceRole: '',
    raceAction: '',
    raceContext: '',
    raceExecute: '',
    bestPractices: [] as NewBestPractice[],
    showProgrammingLanguage: false,
    showOutputValidation: false,
    customSections: [] as CustomSection[]
  });

  const { addTemplate, updateTemplate } = useTemplateStore();
  const { getAllRoles } = useRoleStore();
  const { 
    isCreateModalOpen, 
    toggleCreateModal, 
    modalMode,
    setModalMode,
    selectedTemplate 
  } = useStore();
  const currentUser = authService.getUser();

  // Initialize form data when modal opens or template changes
  useEffect(() => {
    if (isCreateModalOpen && modalMode === 'updateTemplate' && selectedTemplate) {
      setFormData({
        name: selectedTemplate.name || '',
        description: selectedTemplate.description || '',
        role: selectedTemplate.role || '',
        raceRole: selectedTemplate.raceRole || '',
        raceAction: selectedTemplate.raceAction || '',
        raceContext: selectedTemplate.raceContext || '',
        raceExecute: selectedTemplate.raceExecute || '',
        bestPractices: selectedTemplate.bestPractices || [],
        customSections: selectedTemplate.customSections || [],
        showProgrammingLanguage: selectedTemplate.showProgrammingLanguage || false,
        showOutputValidation: selectedTemplate.showOutputValidation || false,
        ...selectedTemplate // Keep any additional properties that might be used elsewhere
      });
      setCurrentStep(1);
    } else if (!isCreateModalOpen) {
      setFormData({
        name: '',
        description: '',
        role: '',
        raceRole: '',
        raceAction: '',
        raceContext: '',
        raceExecute: '',
        bestPractices: [],
        showProgrammingLanguage: false,
        showOutputValidation: false,
        customSections: []
      });
      setCurrentStep(1);
    }
  }, [isCreateModalOpen, modalMode, selectedTemplate]);

  useEffect(() => {
    setAllRoles(getAllRoles());
  }, [getAllRoles]);

  // Handle role selection
  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = allRoles.find(r => r.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      role: e.target.value,
      raceRole: selectedRole ? `Act as ${selectedRole.name}${selectedRole.description ? `, ${selectedRole.description}` : ''}` : ''
    }));
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const missingFields = [];
    if (!formData.name) missingFields.push('Template Name');
    if (!formData.role) missingFields.push('Role');
    if (!formData.raceRole) missingFields.push('RACE Role');
    if (!formData.raceAction) missingFields.push('RACE Action');
    if (!formData.raceContext) missingFields.push('RACE Context');
    if (!formData.raceExecute) missingFields.push('RACE Execute');

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields:\n${missingFields.join('\n')}`);
      return;
    }

    const promise = (async () => {
      const templateData: Partial<Template> = {
        id: selectedTemplate?.id,
        name: formData.name,
        description: formData.description || '',
        role: formData.role,
        raceRole: formData.raceRole,
        raceAction: formData.raceAction,
        raceContext: formData.raceContext,
        raceExecute: formData.raceExecute,
        bestPractices: formData.bestPractices || [],
        customSections: formData.customSections,
        createdBy: currentUser?.username || 'system',
        showProgrammingLanguage: formData.showProgrammingLanguage || false,
        showOutputValidation: formData.showOutputValidation || false,
        content: [
          formData.raceRole ? `Role:\n${formData.raceRole}` : '',
          formData.raceAction ? `Action:\n${formData.raceAction}` : '',
          formData.raceContext ? `Context:\n${formData.raceContext}` : '',
          formData.raceExecute ? `Execute:\n${formData.raceExecute}` : ''
        ].filter(Boolean).join('\n\n'),
        createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (modalMode === 'updateTemplate' && selectedTemplate?.id) {
        await updateTemplate({
          ...templateData,
          id: selectedTemplate.id,
          updatedAt: new Date().toISOString()
        } as Template);
      } else {
        addTemplate(templateData as Template);
      }
      
      handleClose();
    })();

    toast.promise(promise, {
      loading: 'Saving template...',
      success: modalMode === 'updateTemplate' ? 'Template updated successfully!' : 'Template created successfully!',
      error: 'Failed to save template. Please try again.'
    });
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      role: '',
      raceRole: '',
      raceAction: '',
      raceContext: '',
      raceExecute: '',
      bestPractices: [],
      showProgrammingLanguage: false,
      showOutputValidation: false,
      customSections: []
    });
    toggleCreateModal();
  };

  // Handle step navigation
  const handleNext = () => {
    console.log('Current step before next:', currentStep);
    if (currentStep === 1 && !formData.name) {
      alert('Please enter a template name');
      return;
    }
    if (currentStep === 1 && !formData.role) {
      alert('Please select a role');
      return;
    }
    const nextStep = currentStep + 1;
    console.log('Setting next step to:', nextStep);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    console.log('Setting previous step to:', prevStep);
    setCurrentStep(prevStep);
  };

  // Debug current step changes
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);

  // Handle adding a custom section
  const handleAddCustomSection = () => {
    if (!newCustomSection.name.trim()) return;

    const newSection: CustomSection = {
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID
      name: newCustomSection.name.trim(),
      description: newCustomSection.description.trim(),
      isVisible: true
    };
    
    setFormData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
    
    setNewCustomSection({ name: '', description: '' });
  };

  const handleRemoveCustomSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const handleToggleSectionVisibility = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === id ? { ...section, isVisible: !section.isVisible } : section
      )
    }));
  };

  // Add state for editing best practices
  const [editingPractice, setEditingPractice] = useState<{index: number, practice: NewBestPractice} | null>(null);

  // Add state for editing custom sections
  const [editingSection, setEditingSection] = useState<{id: string, section: CustomSection} | null>(null);

  if (!isCreateModalOpen) return null;

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      title={modalMode === 'updateTemplate' ? 'Edit Template' : 'Create Template'}
    >
      <div className="p-4">
        {/* Steps Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-3">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-300 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <div className={`h-0.5 w-8 transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-300 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <div className={`h-0.5 w-8 transition-colors duration-300 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-300 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <div className={`h-0.5 w-8 transition-colors duration-300 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-300 ${currentStep >= 4 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {currentStep > 4 ? <Check className="w-3.5 h-3.5" /> : '4'}
            </div>
          </div>
          <div className="flex justify-center mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>Basic Info</span>
            <span className="mx-2">→</span>
            <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>RACE Framework</span>
            <span className="mx-2">→</span>
            <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>Best Practices</span>
            <span className="mx-2">→</span>
            <span className={currentStep === 4 ? 'font-medium text-blue-600' : ''}>Settings</span>
          </div>
        </div>

        {/* Form Content */}
        <form id="template-form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Basic Information
                </h3>
                <div className="space-y-6">
                  {/* Template Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Template Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Code Review Template"
                      required
                    />
                  </div>

                  {/* Template Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="Describe the purpose and use case of this template"
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={handleRoleSelect}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-300"
                      required
                    >
                      <option value="">Select a role</option>
                      {allRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              {/* RACE Framework */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  RACE Framework
                </h3>
                <div className="space-y-6">
                  {/* Role */}
                  <div>
                    <label htmlFor="raceRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <textarea
                      id="raceRole"
                      value={formData.raceRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, raceRole: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder="Define the role or perspective to be taken"
                    />
                  </div>

                  {/* Action */}
                  <div>
                    <label htmlFor="raceAction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action
                    </label>
                    <textarea
                      id="raceAction"
                      value={formData.raceAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, raceAction: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder="Specify the action to be taken"
                    />
                  </div>

                  {/* Context */}
                  <div>
                    <label htmlFor="raceContext" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Context
                    </label>
                    <textarea
                      id="raceContext"
                      value={formData.raceContext}
                      onChange={(e) => setFormData(prev => ({ ...prev, raceContext: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder="Provide context or background information"
                    />
                  </div>

                  {/* Execute */}
                  <div>
                    <label htmlFor="raceExecute" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Execute
                    </label>
                    <textarea
                      id="raceExecute"
                      value={formData.raceExecute}
                      onChange={(e) => setFormData(prev => ({ ...prev, raceExecute: e.target.value }))}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder="Describe what needs to be executed or delivered"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Best Practices */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Best Practices
                </h3>
                <div className="space-y-6">
                  {formData.bestPractices && formData.bestPractices.length > 0 && (
                    <ul className="mb-3 space-y-2">
                      {formData.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                          {editingPractice?.index === index ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={editingPractice.practice.label}
                                onChange={(e) => setEditingPractice(prev => ({
                                  ...prev!,
                                  practice: { ...prev!.practice, label: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="Best practice label"
                              />
                              <textarea
                                value={editingPractice.practice.description}
                                onChange={(e) => setEditingPractice(prev => ({
                                  ...prev!,
                                  practice: { ...prev!.practice, description: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="Description"
                                rows={2}
                              />
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedPractices = [...formData.bestPractices];
                                    updatedPractices[index] = editingPractice.practice;
                                    setFormData(prev => ({ ...prev, bestPractices: updatedPractices }));
                                    setEditingPractice(null);
                                  }}
                                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPractice(null)}
                                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{practice.label}</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{practice.description}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPractice({ index, practice: { ...practice } })}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      bestPractices: prev.bestPractices?.filter((_, i) => i !== index) || []
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newBestPractice.label}
                      onChange={(e) => setNewBestPractice(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Best practice label (e.g., SOLID)"
                    />
                    <textarea
                      value={newBestPractice.description}
                      onChange={(e) => setNewBestPractice(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Description of the best practice"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBestPractice.label.trim() && newBestPractice.description.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            bestPractices: [...(prev.bestPractices || []), newBestPractice]
                          }));
                          setNewBestPractice({ label: '', description: '' });
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Best Practice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Template Settings
                </h3>
                <div className="space-y-6">
                  {/* Field Visibility */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <input
                        type="checkbox"
                        id="showProgrammingLanguage"
                        checked={formData.showProgrammingLanguage}
                        onChange={(e) => setFormData(prev => ({ ...prev, showProgrammingLanguage: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label htmlFor="showProgrammingLanguage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Programming Language Field
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Allow users to specify the programming language for their prompt
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Sections */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Custom Sections
                    </h4>
                    <div className="space-y-4">
                      {/* Add new section form */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                        <input
                          type="text"
                          value={newCustomSection.name}
                          onChange={(e) => setNewCustomSection(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Section name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={newCustomSection.description}
                          onChange={(e) => setNewCustomSection(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Section description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSection}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Add Section
                        </button>
                      </div>

                      {/* Custom sections list */}
                      {formData.customSections.map((section) => (
                        <div key={section.id} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {editingSection?.id === section.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingSection.section.name}
                                onChange={(e) => setEditingSection(prev => ({
                                  ...prev!,
                                  section: { ...prev!.section, name: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="Section name"
                              />
                              <input
                                type="text"
                                value={editingSection.section.description}
                                onChange={(e) => setEditingSection(prev => ({
                                  ...prev!,
                                  section: { ...prev!.section, description: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="Section description"
                              />
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      customSections: prev.customSections.map(s => 
                                        s.id === section.id ? editingSection.section : s
                                      )
                                    }));
                                    setEditingSection(null);
                                  }}
                                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSection(null)}
                                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-medium">{section.name}</h4>
                                  <p className="text-xs text-gray-500">{section.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingSection({ id: section.id!, section: { ...section } })}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSection(section.id!)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md"
              >
                Back
              </button>
            )}
            {currentStep === 1 && <div />}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {currentStep === 4 ? (modalMode === 'updateTemplate' ? 'Update Template' : 'Create Template') : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};