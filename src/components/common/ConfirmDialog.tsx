import React, { createContext, useContext, useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  const getTypeStyles = () => {
    const type = options?.type || 'info';
    const styles = {
      danger: {
        icon: '⚠️',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      },
      warning: {
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      },
      info: {
        icon: 'ℹ️',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      }
    };
    return styles[type];
  };

  const typeStyles = isOpen && options ? getTypeStyles() : null;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Modal Overlay */}
      {isOpen && options && typeStyles && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
              onClick={handleCancel}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 ${typeStyles.iconBg} rounded-full p-3`}>
                  <span className="text-2xl">{typeStyles.icon}</span>
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {options.title || 'Confirm Action'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {options.message}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {options.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${typeStyles.confirmBtn}`}
                >
                  {options.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};