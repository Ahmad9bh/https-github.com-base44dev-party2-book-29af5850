import React from 'react';

export default function LoadingSpinner({ size = 'h-8 w-8', color = 'border-blue-600' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
    </div>
  );
}