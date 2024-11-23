import React from 'react';
import { useRoleStore } from '../store/roleStore';
import { Users } from 'lucide-react';

export const RoleFilter: React.FC = () => {
  const { selectedRole, setSelectedRole, getAllRoles } = useRoleStore();
  const allRoles = useRoleStore(state => state.getAllRoles());

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const role = roleId ? allRoles.find(r => r.id === roleId) : null;
    setSelectedRole(role);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Role</h3>
      </div>
      <select
        value={selectedRole?.id || ''}
        onChange={handleRoleChange}
        className="block w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Roles</option>
        {allRoles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
};