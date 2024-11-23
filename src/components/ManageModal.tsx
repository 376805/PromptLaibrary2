import React, { useState, useEffect, useMemo } from 'react';
import { X, Edit2, Trash2, Plus, ArrowRight, Download, Upload, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTemplateStore } from '../store/templateStore';
import { useRoleStore } from '../store/roleStore';
import { Role, Template } from '../types';
import authService from '../services/authService';
import { Modal } from './Modal';

interface ImportData {
  roles: Role[];
  templates: Template[];
  version: string;
  exportDate: string;
}

export const ManageModal = () => {
  const {
    isManageModalOpen,
    toggleManageModal,
    addRole,
    updateRole,
    deleteRole,
    setModalMode,
    toggleCreateModal,
    setSelectedTemplate,
    setInitialRoleId,
    modalMode,
    prompts,
    setSelectedPrompt
  } = useStore();

  const {
    userRoles,
    roles: defaultRoles,
    getAllRoles,
    resetDefaultRoles,
    modalSelectedRole,
    setModalSelectedRole,
  } = useRoleStore();

  const {
    templates,
    userTemplates,
    updateTemplate,
    deleteTemplate,
    addTemplate
  } = useTemplateStore();

  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role === 'admin';

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: ''
  });
  const [editingRoleData, setEditingRoleData] = useState<Partial<Role>>({
    name: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'templates'>('roles');
  const [isLoading, setIsLoading] = useState(false);

  // Combine all roles with real-time updates
  const allRoles = useMemo(() => getAllRoles(), [getAllRoles, userRoles, defaultRoles]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isManageModalOpen) {
      setEditingRole(null);
      setEditingRoleData({ name: '', description: '' });
      setNewRole({ name: '', description: '' });
      setSearchQuery('');
    }
  }, [isManageModalOpen]);

  // Set active tab based on modal mode
  useEffect(() => {
    if (modalMode === 'manage') {
      setActiveTab('roles');
    } else if ((modalMode as string) === 'templates') {
      setActiveTab('templates');
    }
  }, [modalMode]);

  // Force update when role changes
  useEffect(() => {
    if (isManageModalOpen) {
      getAllRoles();
    }
  }, [isManageModalOpen, getAllRoles]);

  // Reset default roles when modal opens to ensure they're in sync
  useEffect(() => {
    if (isManageModalOpen) {
      resetDefaultRoles();
    }
  }, [isManageModalOpen, resetDefaultRoles]);

  // Load data when modal opens
  useEffect(() => {
    if (isManageModalOpen) {
      setIsLoading(true);
      // Remove the template fetching since it's causing the loop
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [isManageModalOpen]);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditingRoleData({
      name: role.name || '',
      description: role.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditingRoleData({ name: '', description: '' });
  };

  const handleAddRole = () => {
    if (!newRole.name?.trim()) {
      alert('Role name is required');
      return;
    }

    const role: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRole.name.trim(),
      description: newRole.description?.trim() || ''
    };

    addRole(role);
    setNewRole({ name: '', description: '' });
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRoleData.name?.trim()) {
      alert('Role name is required');
      return;
    }

    // Check for duplicate role name
    const isDuplicate = allRoles.some(
      role => role.id !== editingRole.id && 
      role.name.toLowerCase() === editingRoleData.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert(`Role with name "${editingRoleData.name}" already exists`);
      return;
    }

    try {
      // Ensure we have a valid role ID and data
      if (!editingRole.id) {
        throw new Error('Invalid role ID');
      }

      // Create complete role object for update
      const roleToUpdate = {
        ...editingRole,
        id: editingRole.id,
        name: editingRoleData.name.trim(),
        description: editingRoleData.description?.trim() || '',
        isDefault: editingRole.isDefault || false,
        updatedAt: new Date().toISOString()
      };

      // Update the role
      await updateRole(roleToUpdate);
      
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure? This will also delete all templates associated with this role.')) {
      setIsLoading(true);
      try {
        await deleteRole(roleId);
        const templateStore = useTemplateStore.getState();
        await templateStore.fetchTemplates();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setInitialRoleId(template.role);
    setModalMode('updateTemplate');
    toggleManageModal();
    toggleCreateModal();
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (isAdmin) {
      const confirmDelete = window.confirm('Are you sure you want to delete this template?');
      if (!confirmDelete) return;

      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };

  const handleMoveTemplate = (templateId: string, newRoleId: string) => {
    const template = [...templates, ...userTemplates].find(t => t.id === templateId);
    if (template) {
      updateTemplate({
        ...template,
        role: newRoleId,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleExportTemplates = () => {
    const exportData = {
      templates: [...templates, ...userTemplates],
      roles: allRoles,
      version: '1.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptlib-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text) as ImportData;

      if (!importData.templates || !Array.isArray(importData.templates)) {
        throw new Error('Invalid template data format');
      }

      // Import roles first if they exist
      if (importData.roles && Array.isArray(importData.roles)) {
        const roleStore = useRoleStore.getState();
        roleStore.importRoles(importData.roles);
      }

      // Get current templates to check for duplicates
      const templateStore = useTemplateStore.getState();
      const existingIds = new Set(templateStore.userTemplates.map(t => t.id));
      const duplicateCount = importData.templates.filter(t => existingIds.has(t.id)).length;
      const newCount = importData.templates.length - duplicateCount;

      // Process templates to ensure RACE components are present
      const processedTemplates = importData.templates.map(template => {
        // Ensure all RACE fields exist
        return {
          ...template,
          raceRole: template.raceRole || '',
          raceAction: template.raceAction || '',
          raceContext: template.raceContext || '',
          raceExpectation: template.raceExpectation || '',
          bestPractices: template.bestPractices || []
        };
      });

      // Then import templates
      templateStore.importTemplates(processedTemplates);

      // Force a refresh of the UI
      setTimeout(() => {
        window.location.reload();
      }, 100);

      // Show detailed import results
      alert(`Import completed:\n${newCount} new templates added\n${duplicateCount} duplicates skipped`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please check the file format.');
    }

    event.target.value = '';
  };

  // Filter roles with real-time updates
  const filteredRoles = useMemo(() => 
    allRoles.filter(role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allRoles, searchQuery]);

  const filteredTemplates = useMemo(() => 
    [...templates, ...userTemplates].filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [templates, userTemplates, searchQuery]);

  if (!isManageModalOpen) return null;

  if (isLoading) {
    return (
      <Modal
        isOpen={isManageModalOpen}
        onClose={toggleManageModal}
        title="Manage Library"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isManageModalOpen}
      onClose={toggleManageModal}
      title={modalMode === 'manage' ? 'Manage Roles and Templates' : 'Manage Templates'}
    >
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Templates
            </button>
          </nav>
        </div>

        {activeTab === 'roles' && (
          <div className="space-y-6">
            {/* Add Role Form */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-base font-medium mb-6">Add New Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="roleName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Role Name
                  </label>
                  <input
                    id="roleName"
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Enter role name"
                    className="w-full px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="roleDescription" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <input
                    id="roleDescription"
                    type="text"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Enter role description"
                    className="w-full px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddRole}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  Add Role
                </button>
              </div>
            </div>

            {/* Role List */}
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  {editingRole?.id === role.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="editRoleName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Role Name
                        </label>
                        <input
                          id="editRoleName"
                          type="text"
                          value={editingRoleData.name}
                          onChange={(e) => setEditingRoleData({ ...editingRoleData, name: e.target.value })}
                          placeholder="Enter role name"
                          className="w-full px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="editRoleDescription" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <input
                          id="editRoleDescription"
                          type="text"
                          value={editingRoleData.description}
                          onChange={(e) => setEditingRoleData({ ...editingRoleData, description: e.target.value })}
                          placeholder="Enter role description"
                          className="w-full px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-4">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateRole}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{role.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          title="Edit role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Template Search and Actions */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportTemplates}
                  className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImportTemplates}
                />
                <label
                  htmlFor="import-file"
                  className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </label>
              </div>
            </div>

            {/* Template List */}
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Role:</span>
                        <select
                          value={template.role}
                          onChange={(e) => handleMoveTemplate(template.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {allRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        title="Edit template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};