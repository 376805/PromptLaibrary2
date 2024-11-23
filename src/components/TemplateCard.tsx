import React from 'react';
import { Template } from '../types';
import { useStore } from '../store/useStore';
import { Edit2 } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  isUserTemplate: boolean;
  onEdit?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isUserTemplate,
  onEdit,
}) => {
  const { 
    setSelectedTemplate,
    toggleViewTemplateModal,
    setSelectedTemplateForPrompt,
    setSelectedRole,
    setModalMode,
    toggleCreateModal
  } = useStore();

  const handleClick = () => {
    setSelectedTemplateForPrompt(template);
    if (template) {
      setSelectedRole(template.role);
    }
    setModalMode('createPromptWithTemplate');
    toggleCreateModal();
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
          {template.name}
        </h3>
        <div className="flex gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              title="Edit template"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {template.description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {template.description}
        </p>
      )}
    </div>
  );
};
