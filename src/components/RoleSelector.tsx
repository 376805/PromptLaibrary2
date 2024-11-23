import React from 'react';
import { Users } from 'lucide-react';
import { useStore } from '../store/useStore';

const roles = [
  { id: 'automation-engineer', name: 'Automation Engineer' },
  { id: 'qa-engineer', name: 'QA Engineer' },
  { id: 'qa-lead', name: 'QA Lead' }
];

export const RoleSelector = () => {
  const { selectedRole, setSelectedRole } = useStore();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-700">Select Role</h2>
      </div>
      <div className="flex gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              selectedRole === role.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>
    </div>
  );
};