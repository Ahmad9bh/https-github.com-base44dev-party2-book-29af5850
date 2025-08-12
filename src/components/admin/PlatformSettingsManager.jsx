
import React, { useState, useEffect } from 'react';
import { EnvironmentConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, DollarSign, Shield, Globe, Mail, Zap, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const SettingsSection = ({ title, description, children }) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Separator />
        <div className="space-y-6">{children}</div>
    </div>
);

export default function PlatformSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Commission & Fees
    platform_commission_rate: 15,
    payment_processing_fee: 2.9,
    vendor_subscription_fee: 10,
    
    // Feature Flags
    enable_instant_booking: true,
    enable_group_booking: true,
    enable_vendor_marketplace: true,
    enable_ai_recommendations: true,
    enable_multi_language: true,
    
    // Booking Settings
    max_advance_booking_days: 365,
    min_advance_booking_hours: 24,
    auto_confirm_threshold: 1000,
    booking_modification_window: 48,
    
    // Payment Settings
    default_currency: 'USD',
    supported_currencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR'],
    refund_processing_days: 5,
    payout_schedule: 'weekly',
    
    // Content Moderation
    auto_approve_venues: false,
    auto_approve_reviews: true,
    review_moderation_threshold: 2,
    content_filter_enabled: true,
    
    // Communication
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    push_notifications_enabled: true,
    marketing_emails_enabled: true,
    
    // Security
    require_phone_verification: true,
    require_id_verification: false,
    session_timeout_minutes: 120,
    max_login_attempts: 5,
    
    // Platform Branding
    platform_name: 'Party2Go',
    support_email: 'support@party2go.com',
    company_address: '123 Business St, City, Country',
    privacy_policy_url: '/privacy',
    terms_of_service_url: '/terms'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadPlatformSettings();
  }, []);

  const loadPlatformSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd load these from EnvironmentConfig
      // For now, we'll use default values
      const configs = await EnvironmentConfig.list();
      
      // Map configurations to settings object and parse types
      const loadedSettings = { ...settings }; // Start with default types
      configs.forEach(config => {
        if (loadedSettings.hasOwnProperty(config.key)) {
          const defaultValue = settings[config.key]; // Get the type from initial settings
          let parsedValue = config.value;

          if (typeof defaultValue === 'number') {
            parsedValue = Number(config.value);
            if (isNaN(parsedValue)) {
                console.warn(`Failed to parse number for key: ${config.key}, value: ${config.value}. Using default.`);
                parsedValue = defaultValue; // Fallback to default if parsing fails
            }
          } else if (typeof defaultValue === 'boolean') {
            parsedValue = config.value === 'true';
          } else if (Array.isArray(defaultValue)) {
            parsedValue = config.value.split(',').map(s => s.trim());
          }
          loadedSettings[config.key] = parsedValue;
        }
      });
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load platform settings:', error);
      toast({
        title: "Error",
        description: "Failed to load platform settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to EnvironmentConfig
      for (const [key, value] of Object.entries(settings)) {
        try {
          const existing = await EnvironmentConfig.filter({ key });
          if (existing && existing.length > 0) {
            await EnvironmentConfig.update(existing[0].id, { value: String(value) });
          } else {
            await EnvironmentConfig.create({
              key,
              value: String(value),
              environment: 'production',
              description: `Platform setting: ${key}`
            });
          }
        } catch (error) {
          console.error(`Failed to save setting ${key}:`, error);
        }
      }
      
      toast({
        title: "Success",
        description: "Platform settings saved successfully."
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save platform settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleArrayChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value.split(',').map(s => s.trim()) }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Manage core platform configurations and feature flags.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={loadPlatformSettings} disabled={loading || saving}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Reload
                </Button>
                <Button onClick={saveSettings} disabled={saving || loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fees" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="fees"><DollarSign className="w-4 h-4 mr-2" />Fees</TabsTrigger>
                <TabsTrigger value="features"><Zap className="w-4 h-4 mr-2" />Features</TabsTrigger>
                <TabsTrigger value="booking"><Globe className="w-4 h-4 mr-2" />Booking</TabsTrigger>
                <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
                <TabsTrigger value="comms"><Mail className="w-4 h-4 mr-2" />Comms</TabsTrigger>
                <TabsTrigger value="branding"><Settings className="w-4 h-4 mr-2" />Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="fees">
                <SettingsSection title="Commissions & Fees" description="Set transaction fees for the platform.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="platform_commission_rate">Platform Commission Rate (%)</Label>
                        <Input
                          id="platform_commission_rate"
                          type="number"
                          value={settings.platform_commission_rate}
                          onChange={e => handleSettingChange('platform_commission_rate', Number(e.target.value))}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="payment_processing_fee">Payment Processing Fee (%)</Label>
                        <Input
                          id="payment_processing_fee"
                          type="number"
                          value={settings.payment_processing_fee}
                          onChange={e => handleSettingChange('payment_processing_fee', Number(e.target.value))}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="vendor_subscription_fee">Vendor Subscription Fee ($)</Label>
                        <Input
                          id="vendor_subscription_fee"
                          type="number"
                          value={settings.vendor_subscription_fee}
                          onChange={e => handleSettingChange('vendor_subscription_fee', Number(e.target.value))}
                        />
                    </div>
                </SettingsSection>
            </TabsContent>

             <TabsContent value="features">
                <SettingsSection title="Feature Flags" description="Enable or disable major platform features globally.">
                    <div className="flex items-center justify-between p-2 border rounded-md">
                        <Label>Enable Instant Booking</Label>
                        <Switch checked={settings.enable_instant_booking} onCheckedChange={v => handleSettingChange('enable_instant_booking', v)} />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded-md">
                        <Label>Enable Vendor Marketplace</Label>
                        <Switch checked={settings.enable_vendor_marketplace} onCheckedChange={v => handleSettingChange('enable_vendor_marketplace', v)} />
                    </div>
                     <div className="flex items-center justify-between p-2 border rounded-md">
                        <Label>Enable AI Recommendations</Label>
                        <Switch checked={settings.enable_ai_recommendations} onCheckedChange={v => handleSettingChange('enable_ai_recommendations', v)} />
                    </div>
                </SettingsSection>
            </TabsContent>
            
            <TabsContent value="booking">
                <SettingsSection title="Booking Rules" description="Define rules for how bookings are made and managed.">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="max_advance_booking_days">Max Advance Booking (days)</Label>
                        <Input
                          id="max_advance_booking_days"
                          type="number"
                          value={settings.max_advance_booking_days}
                          onChange={e => handleSettingChange('max_advance_booking_days', Number(e.target.value))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="min_advance_booking_hours">Min Advance Booking (hours)</Label>
                        <Input
                          id="min_advance_booking_hours"
                          type="number"
                          value={settings.min_advance_booking_hours}
                          onChange={e => handleSettingChange('min_advance_booking_hours', Number(e.target.value))}
                        />
                    </div>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="security">
                <SettingsSection title="Security Settings" description="Manage platform security configurations.">
                     <div className="flex items-center justify-between p-2 border rounded-md">
                        <Label>Require Phone Verification for Owners</Label>
                        <Switch checked={settings.require_phone_verification} onCheckedChange={v => handleSettingChange('require_phone_verification', v)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
                        <Input
                          id="session_timeout_minutes"
                          type="number"
                          value={settings.session_timeout_minutes}
                          onChange={e => handleSettingChange('session_timeout_minutes', Number(e.target.value))}
                        />
                    </div>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="comms">
                <SettingsSection title="Communications" description="Manage email, SMS, and push notification settings.">
                     <div className="flex items-center justify-between p-2 border rounded-md">
                        <Label>Enable Email Notifications</Label>
                        <Switch checked={settings.email_notifications_enabled} onCheckedChange={v => handleSettingChange('email_notifications_enabled', v)} />
                    </div>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="branding">
                <SettingsSection title="Branding & Legal" description="Set platform name and legal information.">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="platform_name">Platform Name</Label>
                        <Input
                          id="platform_name"
                          value={settings.platform_name}
                          onChange={e => handleSettingChange('platform_name', e.target.value)}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label htmlFor="support_email">Support Email</Label>
                        <Input
                          id="support_email"
                          value={settings.support_email}
                          onChange={e => handleSettingChange('support_email', e.target.value)}
                        />
                    </div>
                </SettingsSection>
            </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
