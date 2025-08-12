import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { EnvironmentConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, DollarSign, Mail, Shield, Globe, Zap, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';

const PLATFORM_SETTINGS = [
  {
    key: 'PLATFORM_COMMISSION_RATE',
    category: 'financial',
    label: 'Platform Commission Rate',
    description: 'Percentage commission taken from each booking (0-100)',
    type: 'number',
    min: 0,
    max: 100,
    step: 0.1,
    default: '15'
  },
  {
    key: 'MIN_BOOKING_AMOUNT',
    category: 'financial',
    label: 'Minimum Booking Amount',
    description: 'Minimum amount required for a booking (in USD)',
    type: 'number',
    min: 0,
    default: '50'
  },
  {
    key: 'AUTO_APPROVAL_THRESHOLD',
    category: 'moderation',
    label: 'Auto Approval Threshold',
    description: 'Bookings under this amount are auto-approved',
    type: 'number',
    min: 0,
    default: '500'
  },
  {
    key: 'REQUIRE_ID_VERIFICATION',
    category: 'verification',
    label: 'Require ID Verification',
    description: 'Require users to verify their identity before booking',
    type: 'boolean',
    default: 'false'
  },
  {
    key: 'VENUE_APPROVAL_REQUIRED',
    category: 'moderation',
    label: 'Venue Approval Required',
    description: 'All new venues must be approved by admins',
    type: 'boolean',
    default: 'true'
  },
  {
    key: 'EMAIL_NOTIFICATIONS_ENABLED',
    category: 'notifications',
    label: 'Email Notifications',
    description: 'Enable email notifications platform-wide',
    type: 'boolean',
    default: 'true'
  },
  {
    key: 'CANCELLATION_WINDOW_HOURS',
    category: 'policies',
    label: 'Cancellation Window (Hours)',
    description: 'Hours before event when free cancellation ends',
    type: 'number',
    min: 0,
    default: '24'
  },
  {
    key: 'REFUND_PROCESSING_DAYS',
    category: 'financial',
    label: 'Refund Processing Days',
    description: 'Business days to process refunds',
    type: 'number',
    min: 1,
    max: 30,
    default: '5'
  },
  {
    key: 'FEATURE_FLAG_INSTANT_BOOKING',
    category: 'features',
    label: 'Instant Booking Feature',
    description: 'Enable instant booking without owner approval',
    type: 'boolean',
    default: 'false'
  },
  {
    key: 'FEATURE_FLAG_GROUP_BOOKINGS',
    category: 'features',
    label: 'Group Bookings Feature',
    description: 'Enable split payment group bookings',
    type: 'boolean',
    default: 'true'
  }
];

export default function AdminSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [emailTemplate, setEmailTemplate] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(currentUser);
        await loadSettings();
      } catch (err) {
        console.error('Failed to initialize:', err);
        window.location.href = createPageUrl('Home');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const loadSettings = async () => {
    try {
      const configs = await EnvironmentConfig.list();
      const settingsMap = {};
      
      configs.forEach(config => {
        settingsMap[config.key] = config.value;
      });

      // Set defaults for missing settings
      PLATFORM_SETTINGS.forEach(setting => {
        if (!(setting.key in settingsMap)) {
          settingsMap[setting.key] = setting.default;
        }
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Failed to load settings:', err);
      error('Failed to load platform settings');
    }
  };

  const updateSetting = async (key, value) => {
    try {
      // Find existing config or create new one
      const configs = await EnvironmentConfig.filter({ key });
      
      if (configs && configs.length > 0) {
        await EnvironmentConfig.update(configs[0].id, { value: String(value) });
      } else {
        await EnvironmentConfig.create({
          key,
          value: String(value),
          environment: 'production',
          is_secret: false,
          description: `Platform setting: ${key}`
        });
      }

      setSettings({ ...settings, [key]: String(value) });
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      throw err;
    }
  };

  const handleSaveCategory = async (category) => {
    setSaving(true);
    try {
      const categorySettings = PLATFORM_SETTINGS.filter(s => s.category === category);
      
      for (const setting of categorySettings) {
        await updateSetting(setting.key, settings[setting.key]);
      }

      success(`${category} settings saved successfully`);
    } catch (err) {
      error(`Failed to save ${category} settings`);
    } finally {
      setSaving(false);
    }
  };

  const sendPlatformAnnouncement = async () => {
    if (!emailTemplate.trim()) {
      error('Please enter an announcement message');
      return;
    }

    setSaving(true);
    try {
      // In a real implementation, this would send emails to all users
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Platform announcement sent to all users');
      setEmailTemplate('');
    } catch (err) {
      error('Failed to send platform announcement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const renderSetting = (setting) => {
    const value = settings[setting.key] || setting.default;

    if (setting.type === 'boolean') {
      return (
        <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="font-medium">{setting.label}</Label>
            <p className="text-sm text-gray-600">{setting.description}</p>
          </div>
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => setSettings({
              ...settings,
              [setting.key]: String(checked)
            })}
          />
        </div>
      );
    }

    if (setting.type === 'number') {
      return (
        <div key={setting.key} className="space-y-2">
          <Label className="font-medium">{setting.label}</Label>
          <p className="text-sm text-gray-600">{setting.description}</p>
          <Input
            type="number"
            min={setting.min}
            max={setting.max}
            step={setting.step || 1}
            value={value}
            onChange={(e) => setSettings({
              ...settings,
              [setting.key]: e.target.value
            })}
          />
        </div>
      );
    }

    return (
      <div key={setting.key} className="space-y-2">
        <Label className="font-medium">{setting.label}</Label>
        <p className="text-sm text-gray-600">{setting.description}</p>
        <Input
          value={value}
          onChange={(e) => setSettings({
            ...settings,
            [setting.key]: e.target.value
          })}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            Platform Settings
          </h1>
          <p className="text-gray-600">Configure platform-wide settings and policies</p>
        </div>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Settings
                </CardTitle>
                <CardDescription>Configure commission rates, fees, and payment policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLATFORM_SETTINGS.filter(s => s.category === 'financial').map(renderSetting)}
                <Button onClick={() => handleSaveCategory('financial')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Financial Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Moderation & Approval Settings
                </CardTitle>
                <CardDescription>Configure content moderation and approval workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLATFORM_SETTINGS.filter(s => s.category === 'moderation' || s.category === 'verification').map(renderSetting)}
                <Button onClick={() => handleSaveCategory('moderation')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Moderation Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure email and push notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLATFORM_SETTINGS.filter(s => s.category === 'notifications').map(renderSetting)}
                <Button onClick={() => handleSaveCategory('notifications')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Feature Flags
                </CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLATFORM_SETTINGS.filter(s => s.category === 'features').map(renderSetting)}
                <Button onClick={() => handleSaveCategory('features')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Feature Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Policy Settings
                </CardTitle>
                <CardDescription>Configure cancellation, refund, and booking policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLATFORM_SETTINGS.filter(s => s.category === 'policies').map(renderSetting)}
                <Button onClick={() => handleSaveCategory('policies')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Policy Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Platform Communication
                </CardTitle>
                <CardDescription>Send announcements and updates to all users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Platform announcements will be sent to all registered users. Use this feature responsibly.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>Announcement Message</Label>
                  <Textarea
                    placeholder="Enter your platform-wide announcement..."
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={sendPlatformAnnouncement} 
                  disabled={saving || !emailTemplate.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {saving ? 'Sending...' : 'Send Platform Announcement'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}