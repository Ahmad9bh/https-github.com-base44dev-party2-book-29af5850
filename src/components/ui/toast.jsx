import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, description, variant };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const toast = useCallback((options) => {
    if (typeof options === 'string') {
      showToast({ title: options, description: '' });
    } else {
      showToast(options);
    }
  }, [showToast]);

  // This function makes the toast handlers more robust.
  const createToastHandler = (defaultTitle, variant) => (message) => {
    let description = message;
    // If an object is passed by mistake, extract a readable message from it.
    if (typeof message === 'object' && message !== null) {
      description = message.description || message.message || JSON.stringify(message);
    }
    showToast({ title: defaultTitle, description: String(description), variant });
  };

  const contextValue = {
    toast,
    success: createToastHandler('Success', 'success'),
    error: createToastHandler('Error', 'destructive'),
    info: createToastHandler('Info', 'default'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(({ id, title, description, variant }) => (
          <div 
            key={id} 
            className={`px-4 py-3 rounded-md shadow-lg text-white transition-opacity duration-300 max-w-sm ${
              variant === 'success' ? 'bg-green-500' : 
              variant === 'destructive' ? 'bg-red-500' : 
              'bg-blue-500'
            }`}
          >
            {title && <div className="font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('useToast must be used within a ToastProvider');
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
};