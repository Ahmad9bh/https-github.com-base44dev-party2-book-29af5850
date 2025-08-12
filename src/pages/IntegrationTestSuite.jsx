import React from 'react';
import EndToEndTestSuite from '@/components/testing/EndToEndTestSuite';

export default function IntegrationTestSuite() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Test Suite</h1>
        <p className="text-gray-600">
          Run automated tests for core user journeys and API integrations.
        </p>
      </div>
      <EndToEndTestSuite />
    </div>
  );
}