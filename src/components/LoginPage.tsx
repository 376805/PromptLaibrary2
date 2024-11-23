import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg transition-colors duration-300">
      <div className="relative bg-white dark:bg-dark-card p-8 rounded-lg shadow-xl w-full max-w-md animate-bounce-in">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="flex justify-center mb-8">
          <img src="Logo.svg" alt="Prompt LAIbrary Logo" className="w-16 h-16" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          Login to Prompt L<span className="text-purple-600">AI</span>brary
        </h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4 flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-shadow"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-shadow"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors relative overflow-hidden group"
          >
            <span className={`inline-block transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              Login
            </span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>
      </div>
    </div>
  );
}; 