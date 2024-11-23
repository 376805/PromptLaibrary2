import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { useTemplateStore } from '../store/templateStore';
import { useRoleStore } from '../store/roleStore';
import { useStore } from '../store/useStore';
import { TemplateCard } from './TemplateCard';

interface TemplateListProps {
  userId?: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({ userId }) => {
  const { templates, userTemplates, isLoading, fetchTemplates } = useTemplateStore();
  const { selectedRole } = useRoleStore();
  const { 
    searchTerm, 
    toggleCreateModal, 
    setSelectedTemplate, 
    deleteTemplate,
    setModalMode,
    setInitialRoleId,
  } = useStore();

  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  // Filter and sort templates based on search term and selected role
  useEffect(() => {
    if (!templates && !userTemplates) {
      fetchTemplates();
      return;
    }

    // Combine all templates
    const allTemplates = [...(templates || []), ...(userTemplates || [])];

    // Filter templates
    const filtered = allTemplates.filter(template => {
      const matchesSearch = searchTerm ? (
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;

      const matchesRole = !selectedRole ? true : template.role === selectedRole.id;

      return matchesSearch && matchesRole;
    });

    // Sort templates alphabetically by name
    const sortedTemplates = filtered.sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    setFilteredTemplates(sortedTemplates);
  }, [templates, userTemplates, searchTerm, selectedRole, fetchTemplates]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleEdit = (template: Template) => {
    setModalMode('updateTemplate');
    setSelectedTemplate(template);
    setInitialRoleId(template.role);
    toggleCreateModal();
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              isUserTemplate={template.createdBy === userId}
              onEdit={undefined}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
            No templates found. {userId && 'Create your first template by clicking the "Create Template" button above.'}
          </p>
        )}
      </div>
    </div>
  );
};