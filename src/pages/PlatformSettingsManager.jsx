import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function PlatformSettingsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>Manage core platform configurations and feature flags.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Under Construction</AlertTitle>
          <AlertDescription>
            This section is currently being developed. Soon, you'll be able to manage commission rates, feature flags, and other system-wide settings from this dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}