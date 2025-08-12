import React from 'react';
import ProductionReadinessChecker from '@/components/testing/ProductionReadinessChecker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DeploymentDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Dashboard</h1>
        <p className="text-gray-600">
          Mission control for platform launch and maintenance.
        </p>
      </div>
      
      <ProductionReadinessChecker />
    </div>
  );
}