import React, { useState, useEffect } from 'react';

// The main container
export const Avatar = ({ children, className = '', size = 'default', ...props }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} bg-gray-100 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// The image component
export const AvatarImage = ({ src, alt, className = '', onError, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [src]);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  if (!src || imageError) {
    return null;
  }

  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
      )}
      <img 
        src={src} 
        alt={alt || 'Profile'}
        className={`absolute inset-0 w-full h-full rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
};

// The fallback component
export const AvatarFallback = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`flex items-center justify-center w-full h-full text-sm font-medium text-gray-600 bg-gray-200 rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};