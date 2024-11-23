import React, { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useStore } from './store/useStore';
import { useTemplateStore } from './store/templateStore';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { TemplateList } from './components/TemplateList';
import { CreateTemplateModal } from './components/CreateTemplateModal';
import { CreatePromptModal } from './components/CreatePromptModal';
import { ManageModal } from './components/ManageModal';
import { EnhancePromptModal } from './components/EnhancePromptModal';
import { RoleFilter } from './components/RoleFilter';
import authService from './services/authService';
import { Toaster } from 'react-hot-toast';

function App() {
  const { 
    isAuthenticated, 
    modalMode, 
    isCreateModalOpen, 
    isManageModalOpen,
    toggleCreateModal,
    setSelectedRole 
  } = useStore();
  const { fetchTemplates, isLoading } = useTemplateStore();

  // Get current user
  const currentUser = authService.getUser();

  // Fetch templates when app loads
  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated, fetchTemplates]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Show loading state while loading templates
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-dark-bg transition-colors duration-300 relative">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            success: {
              style: {
                background: '#2563eb',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            },
            loading: {
              style: {
                background: '#363636',
                color: '#fff',
              },
            },
          }}
        />
        <div className="fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </div>
        <div className="flex-1 transition-all duration-300 ml-16">
          <div className="p-8">
            <div className="max-w-7xl mx-auto animate-fade-in">
              <div className="mb-8 animate-slide-up">
                <SearchBar />
              </div>
              <RoleFilter />
              <TemplateList userId={currentUser?.username} />
            </div>
          </div>
        </div>
        {/* Modals */}
        {isCreateModalOpen && modalMode === 'createPrompt' && <CreatePromptModal />}
        {isCreateModalOpen && modalMode === 'createPromptWithTemplate' && <CreatePromptModal />}
        {isCreateModalOpen && modalMode === 'updatePrompt' && <CreatePromptModal />}
        {isCreateModalOpen && modalMode === 'createTemplate' && <CreateTemplateModal />}
        {isCreateModalOpen && modalMode === 'updateTemplate' && <CreateTemplateModal />}
        {isManageModalOpen && modalMode === 'manage' && <ManageModal />}
        {isManageModalOpen && modalMode === 'enhance' && <EnhancePromptModal />}
      </div>
    </ThemeProvider>
  );
}

export default App;