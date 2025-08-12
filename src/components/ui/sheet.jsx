
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sheet = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        
        if (child.type?.displayName === 'SheetTrigger') {
          return React.cloneElement(child, {
            onClick: () => handleOpenChange(true)
          });
        }
        if (child.type?.displayName === 'SheetContent') {
          return React.cloneElement(child, {
            isOpen,
            onClose: () => handleOpenChange(false)
          });
        }
        return child;
      })}
    </>
  );
};

const SheetTrigger = ({ children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
};
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = ({ 
  children, 
  side = 'right', 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;

  const sideStyles = {
    right: 'right-0 top-0 h-screen w-80 transform translate-x-0',
    left: 'left-0 top-0 h-screen w-80 transform translate-x-0', 
    top: 'top-0 left-0 w-full h-80 transform translate-y-0',
    bottom: 'bottom-0 left-0 w-full max-h-[80vh] transform translate-y-0'
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet - Full height */}
      <div 
        className={`fixed bg-white shadow-xl transition-transform duration-300 ease-in-out ${sideStyles[side]} ${className}`}
        {...props}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        {children}
      </div>
    </div>
  );
};
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`flex flex-col space-y-2 text-center sm:text-left p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const SheetTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

const SheetDescription = ({ children, className = '', ...props }) => {
  return (
    <p 
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
};
