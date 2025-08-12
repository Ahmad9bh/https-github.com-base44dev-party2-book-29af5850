import React from 'react';
import EndToEndTestSuite from '@/components/testing/EndToEndTestSuite';

export default function EndToEndTestsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">End-to-End Test Suite</h1>
        <p className="text-gray-600">
          Automated testing of critical user journeys and platform functionality.
        </p>
      </div>
      <EndToEndTestSuite />
    </div>
  );
}