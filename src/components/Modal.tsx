import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = '7xl'
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    } else {
      const timer = setTimeout(() => setIsShowing(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isShowing) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop with increased blur */}
      <div 
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose} 
      />

      {/* Modal Container with increased padding */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header with close button */}
          <div className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 pr-12">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="text-gray-800 dark:text-gray-200">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
