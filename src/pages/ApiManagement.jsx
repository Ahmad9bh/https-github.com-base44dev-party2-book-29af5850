import React from 'react';
import APIManagement from '@/components/enterprise/APIManagement';

export default function ApiManagementPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer API Platform</h1>
        <p className="text-gray-600">
          Create and manage API keys to integrate your applications with the Party2Go platform.
        </p>
      </div>
      <APIManagement />
    </div>
  );
}