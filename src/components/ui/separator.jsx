import React from 'react';

export const Separator = ({ className = '', orientation = 'horizontal', ...props }) => {
  const baseClasses = 'bg-gray-200';
  const orientationClasses = orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full';
  
  return (
    <div 
      className={`${baseClasses} ${orientationClasses} ${className}`} 
      {...props} 
    />
  );
};