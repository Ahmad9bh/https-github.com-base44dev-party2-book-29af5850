import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Crown, DollarSign, Users, Building2, Zap, Shield, Star, CheckCircle, XCircle, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Subscription } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic_premium',
    name: 'Basic Premium',
    price: 29,
    interval: 'monthly',
    features: [
      'Up to 5 venues',
      'Basic analytics',
      'Email support',
      'Standard payment processing',
      'Mobile app access'
    ],
    limits: {
      venues: 5,
      bookings_per_month: 100,
      api_calls: 1000,
      storage_gb: 5
    }
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 79,
    interval: 'monthly',
    features: [
      'Up to 25 venues',
      'Advanced analytics',
      'Priority support',
      'Multiple payment gateways',
      'Custom branding',
      'API access',
      'Automated reports'
    ],
    limits: {
      venues: 25,
      bookings_per_month: 500,
      api_calls: 10000,
      storage_gb: 25
    }
  },
  {
    id: 'premium_pro',
    name: 'Premium Pro',
    price: 199,
    interval: 'monthly',
    features: [
      'Unlimited venues',
      'Full analytics suite',
      '24/7 phone support',
      'White-label solution',
      'Advanced integrations',
      'Dedicated account manager',
      'Custom development'
    ],
    limits: {
      venues: -1,
      bookings_per_month: -1,
      api_calls: 100000,
      storage_gb: 100
    }
  },
  {
    id: 'enterprise_basic',
    name: 'Enterprise Basic',
    price: 499,
    interval: 'monthly',
    features: [
      'Multi-tenant architecture',
      'Custom domain',
      'Advanced security',
      'SLA guarantee',
      'Onboarding support',
      'Data export tools'
    ],
    limits: {
      venues: -1,
      bookings_per_month: -1,
      api_calls: 500000,
      storage_gb: 500
    }
  }
];

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { success, error } = useToast();

  const [subscriptionStats, setSubscriptionStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    avgRevenuePerUser: 0
  });

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, usersData, venuesData] = await Promise.all([
        Subscription.list('-created_date', 200),
        User.filter({ user_type: 'venue_owner' }),
        Venue.list('-created_date', 500)
      ]);
      
      setSubscriptions(subscriptionsData);
      setUsers(usersData);
      setVenues(venuesData);

      // Calculate subscription stats
      const activeSubscriptions = subscriptionsData.filter(s => s.status === 'active');
      const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
      
      setSubscriptionStats({
        totalRevenue: totalRevenue,
        activeSubscriptions: activeSubscriptions.length,
        churnRate: 5.2, // Mock value - would be calculated from actual data
        avgRevenuePerUser: activeSubscriptions.length > 0 ? totalRevenue / activeSubscriptions.length : 0
      });
      
      success(`Loaded ${subscriptionsData.length} subscriptions`);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (userId, planId) => {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        error('Invalid plan selected');
        return;
      }

      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const subscriptionData = {
        user_id: userId,
        plan_type: planId,
        billing_cycle: 'monthly',
        amount: plan.price,
        currency: 'USD',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        features: plan.features,
        usage_limits: plan.limits,
        auto_renew: true
      };

      await Subscription.create(subscriptionData);
      success('Subscription created successfully!');
      setShowUpgradeDialog(false);
      loadSubscriptionData();
    } catch (err) {
      console.error('Failed to create subscription:', err);
      error('Failed to create subscription');
    }
  };

  const handleUpdateSubscriptionStatus = async (subscriptionId, newStatus) => {
    try {
      await Subscription.update(subscriptionId, { status: newStatus });
      success(`Subscription ${newStatus}`);
      loadSubscriptionData();
    } catch (err) {
      console.error('Failed to update subscription:', err);
      error('Failed to update subscription status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'past_due': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (planType) => {
    if (planType.includes('enterprise')) return <Building2 className="w-5 h-5" />;
    if (planType.includes('pro')) return <Crown className="w-5 h-5" />;
    if (planType.includes('plus')) return <Star className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name || user.email : 'Unknown User';
  };

  const getUserVenueCount = (userId) => {
    return venues.filter(v => v.owner_id === userId).length;
  };

  const calculateUsage = (subscription) => {
    const userVenues = getUserVenueCount(subscription.user_id);
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_type);
    
    if (!plan) return { venues: 0, storage: 0, api: 0 };

    return {
      venues: plan.limits.venues === -1 ? 0 : (userVenues / plan.limits.venues) * 100,
      storage: Math.floor(Math.random() * 80), // Mock data
      api: Math.floor(Math.random() * 60) // Mock data
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage user subscriptions, plans, and billing</p>
        </div>
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogTrigger asChild>
            <Button>
              <Crown className="w-4 h-4 mr-2" />
              Create Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Select User</Label>
                <Select onValueChange={(userId) => setSelectedPlan({...selectedPlan, userId})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose venue owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => !subscriptions.some(s => s.user_id === u.id && s.status === 'active')).map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email} ({getUserVenueCount(user.id)} venues)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <Card key={plan.id} className={`cursor-pointer transition-all ${selectedPlan?.planId === plan.id ? 'ring-2 ring-indigo-500' : ''}`}>
                    <CardHeader onClick={() => setSelectedPlan({...selectedPlan, planId: plan.id})}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(plan.id)}
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(plan.price, 'USD')}</div>
                          <div className="text-sm text-gray-600">/{plan.interval}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Venues: {plan.limits.venues === -1 ? 'Unlimited' : plan.limits.venues}</div>
                          <div>Storage: {plan.limits.storage_gb} GB</div>
                          <div>API Calls: {plan.limits.api_calls.toLocaleString()}/month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleCreateSubscription(selectedPlan?.userId, selectedPlan?.planId)}
                  disabled={!selectedPlan?.userId || !selectedPlan?.planId}
                >
                  Create Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(subscriptionStats.totalRevenue, 'USD')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold">{subscriptionStats.activeSubscriptions}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-3xl font-bold text-red-600">{subscriptionStats.churnRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ARPU</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(subscriptionStats.avgRevenuePerUser, 'USD')}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map(plan => {
              const activeCount = subscriptions.filter(s => s.plan_type === plan.id && s.status === 'active').length;
              const revenue = activeCount * plan.price;
              
              return (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.id)}
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(plan.price, 'USD')}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Users:</span>
                        <span className="font-medium">{activeCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Monthly Revenue:</span>
                        <span className="font-medium">{formatCurrency(revenue, 'USD')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map(subscription => {
              const usage = calculateUsage(subscription);
              const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_type);
              
              return (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPlanIcon(subscription.plan_type)}
                        <h3 className="text-lg font-semibold">{plan?.name || subscription.plan_type}</h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        User: {getUserName(subscription.user_id)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatCurrency(subscription.amount, subscription.currency || 'USD')}/{subscription.billing_cycle}</span>
                        <span>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                        <span>{getUserVenueCount(subscription.user_id)} venues</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {subscription.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSubscriptionStatus(subscription.id, 'suspended')}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSubscriptionStatus(subscription.id, 'active')}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateSubscriptionStatus(subscription.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {plan && (
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Venues Used</span>
                          <span>{getUserVenueCount(subscription.user_id)}/{plan.limits.venues === -1 ? '∞' : plan.limits.venues}</span>
                        </div>
                        <Progress value={usage.venues} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Storage Used</span>
                          <span>{usage.storage}%</span>
                        </div>
                        <Progress value={usage.storage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>API Usage</span>
                          <span>{usage.api}%</span>
                        </div>
                        <Progress value={usage.api} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {subscriptions.length === 0 && (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                <p className="text-gray-600 mb-4">Start by creating subscriptions for your venue owners</p>
                <Button onClick={() => setShowUpgradeDialog(true)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Create First Subscription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}