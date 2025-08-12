import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Building2, Globe, Settings, Users, DollarSign, Shield, Database, Palette, Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { Tenant } from '@/api/entities';
import { Enterprise } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MultiTenantManager() {
  const [tenants, setTenants] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { success, error } = useToast();

  const [newTenant, setNewTenant] = useState({
    tenant_name: '',
    subdomain: '',
    custom_domain: '',
    enterprise_id: '',
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      features_enabled: [],
      booking_approval_required: true,
      payment_processing: 'stripe',
      commission_rate: 15
    },
    branding: {
      logo_url: '',
      favicon_url: '',
      primary_color: '#4F46E5',
      secondary_color: '#06B6D4',
      font_family: 'Inter'
    },
    status: 'setup',
    storage_quota: 10,
    bandwidth_quota: 100
  });

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const [tenantsData, enterprisesData] = await Promise.all([
        Tenant.list('-created_date', 100),
        Enterprise.list('-created_date', 50)
      ]);
      
      setTenants(tenantsData);
      setEnterprises(enterprisesData);
      success(`Loaded ${tenantsData.length} tenants and ${enterprisesData.length} enterprises`);
    } catch (err) {
      console.error('Failed to load tenant data:', err);
      error('Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      // Validate subdomain uniqueness
      const existingSubdomain = tenants.find(t => t.subdomain === newTenant.subdomain);
      if (existingSubdomain) {
        error('Subdomain already exists');
        return;
      }

      // Generate database configuration
      const databaseConfig = {
        host: `${newTenant.subdomain}-db.party2go.com`,
        database: `tenant_${newTenant.subdomain}`,
        isolation_level: 'schema',
        backup_schedule: 'daily'
      };

      const tenantData = {
        ...newTenant,
        database_config: databaseConfig,
        features_enabled: [
          'venue_booking',
          'payment_processing',
          'user_management',
          'basic_analytics',
          ...newTenant.settings.features_enabled
        ]
      };

      await Tenant.create(tenantData);
      success('Tenant created successfully!');
      setShowCreateDialog(false);
      setNewTenant({
        tenant_name: '',
        subdomain: '',
        custom_domain: '',
        enterprise_id: '',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          features_enabled: [],
          booking_approval_required: true,
          payment_processing: 'stripe',
          commission_rate: 15
        },
        branding: {
          logo_url: '',
          favicon_url: '',
          primary_color: '#4F46E5',
          secondary_color: '#06B6D4',
          font_family: 'Inter'
        },
        status: 'setup',
        storage_quota: 10,
        bandwidth_quota: 100
      });
      loadTenantData();
    } catch (err) {
      console.error('Failed to create tenant:', err);
      error('Failed to create tenant');
    }
  };

  const handleUpdateTenantStatus = async (tenantId, newStatus) => {
    try {
      await Tenant.update(tenantId, { status: newStatus });
      success(`Tenant status updated to ${newStatus}`);
      loadTenantData();
    } catch (err) {
      console.error('Failed to update tenant status:', err);
      error('Failed to update tenant status');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await Tenant.delete(tenantId);
      success('Tenant deleted successfully');
      loadTenantData();
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      error('Failed to delete tenant');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'setup': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateUsage = (tenant) => {
    // Mock usage calculation - in real app, this would come from analytics
    return {
      storage: Math.floor(Math.random() * tenant.storage_quota),
      bandwidth: Math.floor(Math.random() * tenant.bandwidth_quota),
      users: Math.floor(Math.random() * 100),
      venues: Math.floor(Math.random() * 50)
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Tenant Management</h1>
          <p className="text-gray-600">Manage tenants, enterprises, and platform scaling</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tenant_name">Tenant Name</Label>
                      <Input
                        id="tenant_name"
                        value={newTenant.tenant_name}
                        onChange={(e) => setNewTenant({...newTenant, tenant_name: e.target.value})}
                        placeholder="Acme Events Ltd"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subdomain">Subdomain</Label>
                      <div className="flex">
                        <Input
                          id="subdomain"
                          value={newTenant.subdomain}
                          onChange={(e) => setNewTenant({...newTenant, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                          placeholder="acme"
                          className="rounded-r-none"
                        />
                        <div className="px-3 py-2 bg-gray-50 border border-l-0 rounded-r-md text-sm text-gray-600">
                          .party2go.com
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom_domain">Custom Domain (Optional)</Label>
                    <Input
                      id="custom_domain"
                      value={newTenant.custom_domain}
                      onChange={(e) => setNewTenant({...newTenant, custom_domain: e.target.value})}
                      placeholder="events.acme.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="enterprise_id">Enterprise Account</Label>
                    <Select
                      value={newTenant.enterprise_id}
                      onValueChange={(value) => setNewTenant({...newTenant, enterprise_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enterprise account (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {enterprises.map(enterprise => (
                          <SelectItem key={enterprise.id} value={enterprise.id}>
                            {enterprise.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storage_quota">Storage Quota (GB)</Label>
                      <Input
                        id="storage_quota"
                        type="number"
                        value={newTenant.storage_quota}
                        onChange={(e) => setNewTenant({...newTenant, storage_quota: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bandwidth_quota">Bandwidth Quota (GB/month)</Label>
                      <Input
                        id="bandwidth_quota"
                        type="number"
                        value={newTenant.bandwidth_quota}
                        onChange={(e) => setNewTenant({...newTenant, bandwidth_quota: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Timezone</Label>
                      <Select
                        value={newTenant.settings.timezone}
                        onValueChange={(value) => setNewTenant({
                          ...newTenant,
                          settings: {...newTenant.settings, timezone: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Currency</Label>
                      <Select
                        value={newTenant.settings.currency}
                        onValueChange={(value) => setNewTenant({
                          ...newTenant,
                          settings: {...newTenant.settings, currency: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                          <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Language</Label>
                      <Select
                        value={newTenant.settings.language}
                        onValueChange={(value) => setNewTenant({
                          ...newTenant,
                          settings: {...newTenant.settings, language: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Booking Approval Required</Label>
                        <p className="text-sm text-gray-600">Require manual approval for all bookings</p>
                      </div>
                      <Switch
                        checked={newTenant.settings.booking_approval_required}
                        onCheckedChange={(checked) => setNewTenant({
                          ...newTenant,
                          settings: {...newTenant.settings, booking_approval_required: checked}
                        })}
                      />
                    </div>

                    <div>
                      <Label>Commission Rate (%)</Label>
                      <Input
                        type="number"
                        value={newTenant.settings.commission_rate}
                        onChange={(e) => setNewTenant({
                          ...newTenant,
                          settings: {...newTenant.settings, commission_rate: parseFloat(e.target.value)}
                        })}
                        min="0"
                        max="50"
                        step="0.5"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        value={newTenant.branding.logo_url}
                        onChange={(e) => setNewTenant({
                          ...newTenant,
                          branding: {...newTenant.branding, logo_url: e.target.value}
                        })}
                        placeholder="https://cdn.example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="favicon_url">Favicon URL</Label>
                      <Input
                        id="favicon_url"
                        value={newTenant.branding.favicon_url}
                        onChange={(e) => setNewTenant({
                          ...newTenant,
                          branding: {...newTenant.branding, favicon_url: e.target.value}
                        })}
                        placeholder="https://cdn.example.com/favicon.ico"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={newTenant.branding.primary_color}
                          onChange={(e) => setNewTenant({
                            ...newTenant,
                            branding: {...newTenant.branding, primary_color: e.target.value}
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={newTenant.branding.primary_color}
                          onChange={(e) => setNewTenant({
                            ...newTenant,
                            branding: {...newTenant.branding, primary_color: e.target.value}
                          })}
                          placeholder="#4F46E5"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={newTenant.branding.secondary_color}
                          onChange={(e) => setNewTenant({
                            ...newTenant,
                            branding: {...newTenant.branding, secondary_color: e.target.value}
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={newTenant.branding.secondary_color}
                          onChange={(e) => setNewTenant({
                            ...newTenant,
                            branding: {...newTenant.branding, secondary_color: e.target.value}
                          })}
                          placeholder="#06B6D4"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Font Family</Label>
                    <Select
                      value={newTenant.branding.font_family}
                      onValueChange={(value) => setNewTenant({
                        ...newTenant,
                        branding: {...newTenant.branding, font_family: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'advanced_analytics', label: 'Advanced Analytics', desc: 'Detailed reporting and insights' },
                      { key: 'white_label', label: 'White Label Branding', desc: 'Remove Party2Go branding' },
                      { key: 'api_access', label: 'API Access', desc: 'Full REST API access' },
                      { key: 'custom_integrations', label: 'Custom Integrations', desc: 'Third-party integrations' },
                      { key: 'priority_support', label: 'Priority Support', desc: '24/7 priority customer support' },
                      { key: 'advanced_payments', label: 'Advanced Payments', desc: 'Multiple payment gateways' },
                      { key: 'multi_currency', label: 'Multi-Currency', desc: 'Support for multiple currencies' },
                      { key: 'bulk_operations', label: 'Bulk Operations', desc: 'Batch import/export capabilities' }
                    ].map(feature => (
                      <div key={feature.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={feature.key}
                          checked={newTenant.settings.features_enabled.includes(feature.key)}
                          onChange={(e) => {
                            const features = e.target.checked
                              ? [...newTenant.settings.features_enabled, feature.key]
                              : newTenant.settings.features_enabled.filter(f => f !== feature.key);
                            setNewTenant({
                              ...newTenant,
                              settings: {...newTenant.settings, features_enabled: features}
                            });
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <label htmlFor={feature.key} className="font-medium cursor-pointer">
                            {feature.label}
                          </label>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTenant}>
                  Create Tenant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenants Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-3xl font-bold">{tenants.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-3xl font-bold text-green-600">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enterprise Accounts</p>
                <p className="text-3xl font-bold text-purple-600">{enterprises.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Storage</p>
                <p className="text-3xl font-bold text-orange-600">
                  {tenants.reduce((sum, t) => sum + (t.storage_quota || 0), 0)} GB
                </p>
              </div>
              <Database className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.map(tenant => {
              const usage = calculateUsage(tenant);
              return (
                <div key={tenant.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{tenant.tenant_name}</h3>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                        <Badge variant="outline">
                          {tenant.subdomain}.party2go.com
                        </Badge>
                      </div>
                      
                      {tenant.custom_domain && (
                        <p className="text-sm text-blue-600 mb-2">
                          <Globe className="w-4 h-4 inline mr-1" />
                          {tenant.custom_domain}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Storage Usage</p>
                          <div className="flex items-center gap-2">
                            <Progress value={(usage.storage / tenant.storage_quota) * 100} className="flex-1" />
                            <span className="text-xs">{usage.storage}/{tenant.storage_quota} GB</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bandwidth</p>
                          <div className="flex items-center gap-2">
                            <Progress value={(usage.bandwidth / tenant.bandwidth_quota) * 100} className="flex-1" />
                            <span className="text-xs">{usage.bandwidth}/{tenant.bandwidth_quota} GB</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Users</p>
                          <p className="text-sm font-medium">{usage.users}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Venues</p>
                          <p className="text-sm font-medium">{usage.venues}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`https://${tenant.subdomain}.party2go.com`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTenant(tenant)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`https://${tenant.subdomain}.party2go.com`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      {tenant.status === 'active' ? (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateTenantStatus(tenant.id, 'suspended')}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateTenantStatus(tenant.id, 'active')}>
                          Activate
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTenant(tenant.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {tenant.features_enabled && tenant.features_enabled.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">Enabled Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {tenant.features_enabled.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}