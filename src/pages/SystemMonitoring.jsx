import React from 'react';
import SystemHealthMonitor from '@/components/monitoring/SystemHealthMonitor';

export default function SystemMonitoringPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health & Monitoring</h1>
        <p className="text-gray-600">
          Real-time insights into platform performance, reliability, and database health.
        </p>
      </div>
      <SystemHealthMonitor />
    </div>
  );
}