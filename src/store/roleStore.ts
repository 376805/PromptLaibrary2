/**
 * Role management store for the ProLib application
 * Handles role CRUD operations and role-related state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Role } from '../types';
import { defaultRoles } from '../data/defaultRoles';

/** Role store interface defining all state and actions */
interface RoleState {
  roles: Role[];
  userRoles: Role[];
  selectedRole: Role | null;
  modalSelectedRole: Role | null;
  addRole: (role: Role) => Role;
  updateRole: (id: string, updatedRole: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  setSelectedRole: (role: Role | null) => void;
  setModalSelectedRole: (role: Role | null) => void;
  clearModalRole: () => void;
  exportRoles: () => Role[];
  importRoles: (roles: Role[]) => void;
  getAllRoles: () => Role[];
  resetDefaultRoles: () => void;
}

const initializeDefaultRoles = () => {
  try {
    // Try to load stored default roles
    const storedRoles = localStorage.getItem('prolib-default-roles');
    if (storedRoles) {
      const parsedRoles = JSON.parse(storedRoles);
      return parsedRoles.map(role => ({
        ...role,
        isDefault: true,
        createdAt: role.createdAt || new Date().toISOString(),
        updatedAt: role.updatedAt || new Date().toISOString()
      }));
    }
  } catch (error) {
    console.error('Error loading stored default roles:', error);
  }
  
  // Fall back to default roles from the file if loading fails
  return defaultRoles.map(role => ({
    ...role,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

/**
 * Creates and exports the role store with persistence
 * Uses localStorage for data persistence between sessions
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      // Initial state
      roles: initializeDefaultRoles(),
      userRoles: [],
      selectedRole: null,
      modalSelectedRole: null,

      // Getters
      getAllRoles: () => {
        const state = get();
        return [...state.roles, ...state.userRoles].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      },

      // Setters
      setSelectedRole: (role) => set({ selectedRole: role }),
      setModalSelectedRole: (role) => set({ modalSelectedRole: role }),
      clearModalRole: () => set({ modalSelectedRole: null }),

      // Actions
      resetDefaultRoles: () => {
        set(state => ({
          roles: initializeDefaultRoles(),
          selectedRole: state.selectedRole?.isDefault ? null : state.selectedRole,
          modalSelectedRole: state.modalSelectedRole?.isDefault ? null : state.modalSelectedRole
        }));
      },

      addRole: (role) => {
        // Check for duplicate role name
        const state = get();
        const allRoles = [...state.roles, ...state.userRoles];
        const isDuplicate = allRoles.some(
          existingRole => existingRole.name.toLowerCase() === role.name.trim().toLowerCase()
        );

        if (isDuplicate) {
          throw new Error(`Role with name "${role.name}" already exists`);
        }

        const newRole = {
          ...role,
          id: role.id || crypto.randomUUID(),
          name: role.name.trim(),
          description: role.description?.trim() || '',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          userRoles: [...state.userRoles, newRole]
        }));

        return newRole;
      },

      updateRole: (id, updatedRole) => {
        const state = get();
        const allRoles = [...state.roles, ...state.userRoles];
        const roleToUpdate = allRoles.find(role => role.id === id);

        if (!roleToUpdate) {
          throw new Error(`Role with id "${id}" not found`);
        }

        // Check for duplicate name
        const isDuplicate = allRoles.some(
          role => role.id !== id && 
          role.name.toLowerCase() === updatedRole.name?.trim().toLowerCase()
        );

        if (isDuplicate) {
          throw new Error(`Role with name "${updatedRole.name}" already exists`);
        }

        const updatedRoleData = {
          ...roleToUpdate,
          ...updatedRole,
          id: id, // Ensure ID is preserved
          updatedAt: new Date().toISOString()
        };

        if (roleToUpdate.isDefault) {
          // Update default role in state and localStorage
          const defaultRoleIndex = state.roles.findIndex(r => r.id === id);
          if (defaultRoleIndex !== -1) {
            const updatedDefaultRoles = [...state.roles];
            updatedDefaultRoles[defaultRoleIndex] = updatedRoleData;
            
            // Update the roles in state
            set({ roles: updatedDefaultRoles });

            // Store updated default roles in localStorage
            try {
              localStorage.setItem('prolib-default-roles', JSON.stringify(updatedDefaultRoles));
            } catch (error) {
              console.error('Error storing default roles:', error);
              throw new Error('Failed to store default roles');
            }
          }
        } else {
          // Update user role
          set(state => ({
            userRoles: state.userRoles.map(role =>
              role.id === id ? updatedRoleData : role
            )
          }));
        }

        // Update selected roles if they match the updated role
        set(state => ({
          selectedRole: state.selectedRole?.id === id ? updatedRoleData : state.selectedRole,
          modalSelectedRole: state.modalSelectedRole?.id === id ? updatedRoleData : state.modalSelectedRole
        }));
      },

      deleteRole: (id) => {
        set((state) => ({
          userRoles: state.userRoles.filter((role) => role.id !== id),
          selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
          modalSelectedRole: state.modalSelectedRole?.id === id ? null : state.modalSelectedRole
        }));
      },

      importRoles: (roles) => {
        try {
          set((state) => {
            // Create a Set of existing role IDs for quick lookup
            const existingIds = new Set([
              ...state.roles.map(r => r.id),
              ...state.userRoles.map(r => r.id)
            ]);

            // Filter out duplicates and process new roles
            const newRoles = roles
              .filter(role => !existingIds.has(role.id))
              .map(role => ({
                ...role,
                id: role.id || crypto.randomUUID(),
                name: role.name.trim(),
                description: role.description?.trim() || '',
                isDefault: false,
                createdAt: role.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }));

            return {
              userRoles: [...state.userRoles, ...newRoles]
            };
          });
        } catch (error) {
          console.error('Error importing roles:', error);
          throw error;
        }
      },

      exportRoles: () => {
        const state = get();
        return [...state.roles, ...state.userRoles];
      },
    }),
    {
      name: 'prompt-library-roles',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        roles: state.roles,
        userRoles: state.userRoles,
        selectedRole: state.selectedRole,
        modalSelectedRole: state.modalSelectedRole
      })
    }
  )
);