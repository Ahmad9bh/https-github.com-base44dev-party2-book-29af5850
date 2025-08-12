
import React, { useState, useRef, useEffect } from 'react';

export const Popover = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const handleOpenChange = (newOpen) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, onOpenChange: handleOpenChange });
        }
        return child;
      })}
    </div>
  );
};

export const PopoverTrigger = ({ asChild, children, isOpen, onOpenChange, ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onOpenChange?.(!isOpen);
  };

  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      'aria-expanded': isOpen
    });
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export const PopoverContent = ({ 
  children, 
  className = '', 
  align = 'center',
  side = 'bottom',
  isOpen,
  onOpenChange,
  ...props 
}) => {
  const contentRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div 
      ref={contentRef}
      className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}
      style={{
        top: side === 'bottom' ? '100%' : 'auto',
        bottom: side === 'top' ? '100%' : 'auto',
        left: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
        right: align === 'end' ? '0' : 'auto',
        transform: align === 'center' ? 'translateX(-50%)' : 'none',
        marginTop: side === 'bottom' ? '8px' : '0',
        marginBottom: side === 'top' ? '8px' : '0',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
