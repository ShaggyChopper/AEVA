import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Let the fade-out animation finish before calling onClose
      const closeTimer = setTimeout(onClose, 300); 
      return () => clearTimeout(closeTimer);
    }, 3800);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const styleConfig = {
    success: {
      bgColor: 'bg-green-500',
      icon: CheckCircleIcon,
    },
    error: {
      bgColor: 'bg-red-500',
      icon: XCircleIcon,
    },
    warning: {
      bgColor: 'bg-amber-500',
      icon: ExclamationTriangleIcon,
    }
  };

  const { bgColor, icon: Icon } = styleConfig[type];

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-white/50 p-1.5 inline-flex h-8 w-8 hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};