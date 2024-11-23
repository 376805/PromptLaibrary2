import React, { useState } from 'react';
import { PlusCircle, FilePlus, Settings, ChevronLeft, ChevronRight, Wand2, LogOut, Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';
import authService from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

export const Sidebar = () => {
  const { toggleCreateModal, toggleManageModal, setModalMode, logout } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isAdmin = authService.isAdmin();
  const { theme, toggleTheme } = useTheme();

  const handleCreatePrompt = () => {
    toggleCreateModal();
    setModalMode('createPrompt');
  };

  const handleCreateTemplate = () => {
    setModalMode('createTemplate');
    toggleCreateModal();
  };

  const handleManage = () => {
    toggleManageModal();
    setModalMode('manage');
  };

  const handleEnhancePrompt = () => {
    toggleManageModal();
    setModalMode('enhance');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white dark:bg-dark-card shadow-lg transition-all duration-300 flex flex-col z-[50] ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-dark-card rounded-full p-1 border border-gray-300 dark:border-dark-border shadow-sm hover:shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <div className={`p-5 ${isCollapsed ? 'px-3' : 'px-5'} flex flex-col h-full`}>
        <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
          <img 
            src="/Logo.svg" 
            alt="Prompt LAIbrary Logo" 
            className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} shrink-0`}
          />
          {!isCollapsed && <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Prompt L<span className="text-purple-600">AI</span>brary
          </h1>}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleEnhancePrompt}
            className={`w-full flex items-center gap-3 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Wand2 className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span>Enhance Prompt</span>}
          </button>

          <button
            onClick={handleCreatePrompt}
            className={`w-full flex items-center gap-3 bg-indigo-700 text-white px-5 py-3 rounded-lg hover:bg-indigo-800 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <PlusCircle className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span>Create Prompt</span>}
          </button>

          <button
            onClick={handleCreateTemplate}
            className={`w-full flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <FilePlus className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span>Create Template</span>}
          </button>

          {isAdmin && (
            <button
              onClick={handleManage}
              className={`w-full flex items-center gap-3 bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Settings className="w-6 h-6 shrink-0" />
              {!isCollapsed && <span>Manage Roles and Templates</span>}
            </button>
          )}
        </div>
      </div>

      {/* Theme Toggle and User Info */}
      <div className={`mt-auto p-5 ${isCollapsed ? 'px-3' : 'px-5'} space-y-4`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-5 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 shrink-0" />
          ) : (
            <Moon className="w-6 h-6 shrink-0" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!isCollapsed && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Logged in as: {authService.getUser()?.username}
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 text-red-600 hover:text-red-700 px-5 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};