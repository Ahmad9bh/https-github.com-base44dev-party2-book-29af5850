import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { EnvironmentConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Rocket, Wrench, ShieldCheck, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const CheckItem = ({ text, isChecked, description }) => (
  <div className="flex items-start justify-between p-4 border rounded-lg">
    <div className="flex items-start gap-3">
      {isChecked ? (
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 mt-1" />
      )}
      <div>
        <p className="font-medium">{text}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

export default function ProductionReadinessChecker() {
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState('LIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runReadinessChecks();
  }, []);

  const runReadinessChecks = async () => {
    setLoading(true);
    const results = {};
    
    // Check 1: Admin user exists
    try {
      const admins = await User.filter({ role: 'admin' });
      results.adminExists = admins && admins.length > 0;
    } catch {
      results.adminExists = false;
    }

    // Check 2: At least one active venue
    try {
      const activeVenues = await Venue.filter({ status: 'active' });
      results.activeVenueExists = activeVenues && activeVenues.length > 0;
    } catch {
      results.activeVenueExists = false;
    }

    // Check 3: Environment Config for Stripe exists (simulated)
    try {
        const stripeKey = await EnvironmentConfig.filter({ key: 'STRIPE_SECRET_KEY' });
        results.stripeConfigured = stripeKey && stripeKey.length > 0 && stripeKey[0].value.startsWith('sk_');
    } catch {
        results.stripeConfigured = false;
    }

    // Check 4: Get current app status
    try {
        const statusConfig = await EnvironmentConfig.filter({ key: 'APP_STATUS' });
        if (statusConfig && statusConfig.length > 0) {
            setAppStatus(statusConfig[0].value);
        } else {
            // If not set, create it
            await EnvironmentConfig.create({ key: 'APP_STATUS', value: 'LIVE', environment: 'production' });
            setAppStatus('LIVE');
        }
    } catch {
        setAppStatus('UNKNOWN');
        results.appStatusConfigured = false;
    }

    results.appStatusConfigured = appStatus !== 'UNKNOWN';

    setChecks(results);
    setLoading(false);
  };

  const allChecksPassed = () => {
    return Object.values(checks).every(check => check === true);
  };

  const handleAppStatusChange = async (newStatus) => {
    setIsSubmitting(true);
    try {
      let config = await EnvironmentConfig.filter({ key: 'APP_STATUS' });
      if (config && config.length > 0) {
        await EnvironmentConfig.update(config[0].id, { value: newStatus });
      } else {
        await EnvironmentConfig.create({ key: 'APP_STATUS', value: newStatus, environment: 'production' });
      }
      setAppStatus(newStatus);
      toast({
        title: "Success",
        description: `App status changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update app status.",
        variant: "destructive",
      });
      console.error("Failed to update app status:", error);
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
      setConfirmText('');
    }
  };

  if (loading) {
    return <div>Loading readiness checks...</div>;
  }

  const newStatus = appStatus === 'LIVE' ? 'MAINTENANCE' : 'LIVE';
  const confirmationPhrase = newStatus === 'LIVE' ? 'GO LIVE' : 'MAINTENANCE';

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Production Readiness Checklist</CardTitle>
          <CardDescription>
            Ensure all checks pass before deploying the platform to live users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckItem
            text="Admin User Exists"
            isChecked={checks.adminExists}
            description="At least one user with 'admin' role is required for platform management."
          />
          <CheckItem
            text="Stripe Integration Configured"
            isChecked={checks.stripeConfigured}
            description="A valid Stripe Secret Key must be set in environment variables for payments."
          />
          <CheckItem
            text="Content Seeded"
            isChecked={checks.activeVenueExists}
            description="At least one active venue exists to ensure the marketplace is not empty on launch."
          />
          <CheckItem
            text="App Status Configured"
            isChecked={checks.appStatusConfigured}
            description="The system's application status (LIVE/MAINTENANCE) is correctly configured."
          />
        </CardContent>
      </Card>

      <Card className={`border-2 ${allChecksPassed() ? 'border-green-500' : 'border-red-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className={`w-6 h-6 ${allChecksPassed() ? 'text-green-600' : 'text-red-600'}`} />
            Platform Go-Live Control
          </CardTitle>
          <CardDescription>
            Manage the public status of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Current Status:</p>
              <div className="flex items-center gap-2">
                {appStatus === 'LIVE' ? (
                  <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    <Power className="w-6 h-6" /> LIVE
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                    <Wrench className="w-6 h-6" /> MAINTENANCE
                  </span>
                )}
              </div>
               <p className="text-sm text-gray-500 mt-1">
                {appStatus === 'LIVE' ? 'The platform is publicly accessible.' : 'Only admins can access the platform.'}
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className={`mt-4 md:mt-0 ${appStatus === 'LIVE' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                  disabled={!allChecksPassed()}
                >
                  {appStatus === 'LIVE' ? (
                    <>
                      <Wrench className="w-5 h-5 mr-2" />
                      Enter Maintenance Mode
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Go Live!
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Status Change</DialogTitle>
                  <DialogDescription>
                    You are about to change the platform status to <strong>{newStatus}</strong>.
                    Type "{confirmationPhrase}" to confirm.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={`Type "${confirmationPhrase}"`}
                    />
                    <Button
                        className="w-full"
                        variant={newStatus === 'LIVE' ? 'default' : 'destructive'}
                        disabled={confirmText !== confirmationPhrase || isSubmitting}
                        onClick={() => handleAppStatusChange(newStatus)}
                    >
                      {isSubmitting ? 'Updating...' : `Confirm and switch to ${newStatus}`}
                    </Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
          {!allChecksPassed() && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <p>
                All readiness checks must pass before you can change the platform status.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}