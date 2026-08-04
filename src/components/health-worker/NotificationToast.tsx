import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationToastProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const NotificationToast = ({ type, message, isVisible, onClose }: NotificationToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border ${
        type === 'success' 
          ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' 
          : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3" />
        ) : (
          <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400 mr-3" />
        )}
        <span className={`text-sm font-medium ${
          type === 'success' 
            ? 'text-success-800 dark:text-success-300' 
            : 'text-error-800 dark:text-error-300'
        }`}>
          {message}
        </span>
        <button
          onClick={onClose}
          className={`ml-4 ${
            type === 'success' 
              ? 'text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-300' 
              : 'text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;