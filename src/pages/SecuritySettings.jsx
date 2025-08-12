import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { TwoFactorAuth } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Fingerprint, Smartphone, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [twoFactor, setTwoFactor] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        const twoFactorData = await TwoFactorAuth.filter({ user_id: currentUser.id });
        setTwoFactor(twoFactorData[0] || null);

        // Simulate checking local storage for biometric preference
        const biometricPref = localStorage.getItem('biometricEnabled');
        setBiometricEnabled(biometricPref === 'true');

      } catch (err) {
        error("Failed to load security settings.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handle2FAChange = async (enabled) => {
    try {
      if (enabled) {
        // In a real app, this would involve a setup flow (QR code, etc.)
        const new2FA = await TwoFactorAuth.create({
          user_id: user.id,
          secret_key: 'mock_secret_key', // This would be generated securely
          is_enabled: true
        });
        setTwoFactor(new2FA);
        success("Two-Factor Authentication enabled.");
      } else {
        await TwoFactorAuth.update(twoFactor.id, { is_enabled: false });
        setTwoFactor({ ...twoFactor, is_enabled: false });
        success("Two-Factor Authentication disabled.");
      }
    } catch (err) {
      error("Failed to update 2FA status.");
    }
  };

  const handleBiometricChange = (enabled) => {
    // This is a simulation. Real biometric auth is handled by the OS/browser.
    localStorage.setItem('biometricEnabled', enabled);
    setBiometricEnabled(enabled);
    success(`Biometric login ${enabled ? 'enabled' : 'disabled'}.`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Security Settings</h1>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>Add an extra layer of security to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-gray-500" />
                <Label htmlFor="2fa-switch" className="font-semibold">Enable 2FA</Label>
              </div>
              <Switch 
                id="2fa-switch" 
                checked={twoFactor?.is_enabled || false}
                onCheckedChange={handle2FAChange}
              />
            </div>
            {twoFactor?.is_enabled && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">2FA is active. You will be asked for a code from your authenticator app when you log in.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biometric Authentication</CardTitle>
            <CardDescription>Use your fingerprint or face to log in on supported devices.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-6 h-6 text-gray-500" />
                <Label htmlFor="biometric-switch" className="font-semibold">Enable Biometric Login</Label>
              </div>
              <Switch 
                id="biometric-switch"
                checked={biometricEnabled}
                onCheckedChange={handleBiometricChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Receive real-time updates about your bookings and account.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-gray-500" />
                        <Label className="font-semibold">Enable Push Notifications</Label>
                    </div>
                    {/* The actual component is in the layout to trigger browser permission */}
                    <p className="text-sm text-gray-600">Manage in your browser settings.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}