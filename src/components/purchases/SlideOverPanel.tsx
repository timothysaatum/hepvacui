import React, { useEffect, type ReactNode } from 'react';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  gradientColor?: 'purple' | 'green' | 'blue';
}

export const SlideOverPanel: React.FC<SlideOverPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  gradientColor = 'purple',
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const gradientClasses = {
    purple: 'from-purple-50 to-white',
    green: 'from-green-50 to-white',
    blue: 'from-blue-50 to-white',
  };

  return (
    <>
      {/* Transparent backdrop - no darkening, just centering and click-to-close */}
      <div
        className="fixed inset-0 bg-transparent z-40 transition-opacity flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Centered Panel */}
        <div
          className={`${widthClasses[width]} w-full bg-white shadow-2xl rounded-xl z-50 transform transition-all duration-300 ease-out scale-100 max-h-[90vh] flex flex-col border border-gray-200`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r ${gradientClasses[gradientColor]} flex-shrink-0 rounded-t-xl`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                aria-label="Close panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto rounded-b-xl">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};