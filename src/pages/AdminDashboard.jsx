import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { Payout } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { Dispute } from '@/api/entities';
import { VenueReport } from '@/api/entities';
import { RefundRequest } from '@/api/entities';
import { PaymentRecovery } from '@/api/entities';
import { Analytics } from '@/api/entities';
import { SystemHealth } from '@/api/entities';
import { SupportTicket } from '@/api/entities';
import { UserActivity } from '@/api/entities';
import { ApiKey } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { Review } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Clock,
  Database,
  Activity,
  Settings,
  LayoutGrid,
  Briefcase,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Layers,
  TrendingUp,
  TrendingDown,
  Eye,
  UserCheck,
  AlertCircle,
  Rocket,
  Crown,
  Key,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLocalization } from '@/components/common/LocalizationContext';
import AdminAnalyticsDashboard from '@/components/analytics/AdminAnalyticsDashboard';
import UserManagement from '@/components/admin/UserManagement';
import VenueManagement from '@/components/admin/VenueManagement';
import VendorManagement from '@/components/admin/VendorManagement';
import ContentManager from './ContentManager';
import PlatformSettingsManager from '@/components/admin/PlatformSettingsManager';
import DisputeResolution from '@/components/admin/DisputeResolution';
import FinancialOperations from '@/components/admin/FinancialOperations';

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, onClick, href, variant = "default" }) => (
  <Card className={`cursor-pointer transition-all hover:shadow-md ${
    variant === "danger" ? "border-red-200 hover:border-red-300" :
    variant === "warning" ? "border-yellow-200 hover:border-yellow-300" :
    "border-blue-200 hover:border-blue-300"
  }`} onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          variant === "danger" ? "bg-red-100" :
          variant === "warning" ? "bg-yellow-100" :
          "bg-blue-100"
        }`}>
          <Icon className={`w-4 h-4 ${
            variant === "danger" ? "text-red-600" :
            variant === "warning" ? "text-yellow-600" :
            "text-blue-600"
          }`} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// System Health Component
const SystemSettings = ({ stats, setActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database Connection</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Processing</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Service</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>File Storage</span>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <QuickActionCard
                title="Launch Readiness"
                description="Validate all systems before go-live"
                icon={Rocket}
                variant="warning"
                onClick={() => window.open(createPageUrl('LaunchReadinessCheck'), '_blank')}
              />
              <QuickActionCard
                title="Cleanup Test Venues"
                description="Remove test and invalid venue data"
                icon={Building}
                onClick={() => window.open(createPageUrl('CleanupVenues'), '_blank')}
              />
              <QuickActionCard
                title="Database Maintenance"
                description="Run database optimization and cleanup"
                icon={Database}
                onClick={() => window.open(createPageUrl('CleanupDatabase'), '_blank')}
              />
              <QuickActionCard
                title="System Monitoring"
                description="View real-time system health metrics"
                icon={Activity}
                onClick={() => window.open(createPageUrl('SystemMonitoring'), '_blank')}
              />
              <QuickActionCard
                title="Payment Configuration"
                description="Configure Stripe and payment settings"
                icon={Settings}
                onClick={() => window.open(createPageUrl('ConfigureStripe'), '_blank')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {(stats.pendingVenues > 0 || stats.openDisputes > 0 || stats.reportedVenues > 0 || stats.openSupportTickets > 0 || stats.systemIssues > 0) ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Priority Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.pendingVenues > 0 && (
                <QuickActionCard
                  title={`${stats.pendingVenues} Pending Venues`}
                  description="Venues awaiting approval"
                  icon={Building}
                  variant="warning"
                  onClick={() => setActiveTab('venues')}
                />
              )}
              {stats.pendingVendors > 0 && (
                <QuickActionCard
                  title={`${stats.pendingVendors} Pending Vendors`}
                  description="Vendors awaiting approval"
                  icon={Briefcase}
                  variant="warning"
                  onClick={() => setActiveTab('vendors')}
                />
              )}
              {stats.openDisputes > 0 && (
                <QuickActionCard
                  title={`${stats.openDisputes} Open Disputes`}
                  description="Active dispute cases"
                  icon={AlertCircle}
                  variant="danger"
                  onClick={() => setActiveTab('disputes')}
                />
              )}
              {stats.openSupportTickets > 0 && (
                <QuickActionCard
                  title={`${stats.openSupportTickets} Open Support Tickets`}
                  description="Customer support issues"
                  icon={Mail}
                  variant="warning"
                  onClick={() => console.log('Navigate to Support Tickets')}
                />
              )}
              {stats.systemIssues > 0 && (
                <QuickActionCard
                  title={`${stats.systemIssues} System Issues`}
                  description="Critical system alerts"
                  icon={AlertTriangle}
                  variant="danger"
                  onClick={() => console.log('Navigate to System Logs')}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">All Systems Operational</h3>
            <p className="text-green-700">No critical issues requiring immediate attention.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { currentLanguage } = useLocalization();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [allData, setAllData] = useState({
    venues: [],
    bookings: [],
    users: [],
    vendors: [],
    disputes: [],
    reports: [],
    refundRequests: [],
    payouts: [],
    paymentRecoveries: [],
    supportTickets: [],
    userActivity: [],
    apiKeys: [],
    subscriptions: [],
    systemHealth: [],
    reviews: []
  });
  const [stats, setStats] = useState({
    totalVenues: 0,
    pendingVenues: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    openDisputes: 0,
    reportedVenues: 0,
    openSupportTickets: 0,
    failedPayments: 0,
    systemIssues: 0,
    monthlyActiveUsers: 0,
    conversionRate: 0,
    activeSubscriptions: 0,
    totalApiKeys: 0
  });

  useEffect(() => {
    checkAdminAccess();
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);
      await loadDashboardData();
    } catch (error) {
      console.error('Admin access check failed:', error);
      window.location.href = createPageUrl('Home');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      // Batch 1: Load primary entities for core stats and initial render
      const [venues, bookings, users, vendors] = await Promise.all([
        Venue.list('-created_date', 200).catch(() => []),
        Booking.list('-created_date', 500).catch(() => []),
        User.list('-created_date', 200).catch(() => []),
        Vendor.list('-created_date', 200).catch(() => [])
      ]);

      // Immediately set some data to begin rendering the page
      const partialData = {
        venues: venues || [],
        bookings: bookings || [],
        users: users || [],
        vendors: vendors || [],
      };
      setAllData(prev => ({ ...prev, ...partialData }));

      // Batch 2: Load secondary entities for disputes, support, and financials
      const [disputes, reports, refundRequests, payouts] = await Promise.all([
        Dispute.list('-created_date', 50).catch(() => []),
        VenueReport.list('-created_date', 50).catch(() => []),
        RefundRequest.list('-created_date', 50).catch(() => []),
        Payout.list('-created_date', 50).catch(() => [])
      ]);

      const financialData = {
        disputes: disputes || [],
        reports: reports || [],
        refundRequests: refundRequests || [],
        payouts: payouts || [],
      };
      setAllData(prev => ({ ...prev, ...financialData }));

      // Batch 3: Load tertiary data for analytics and system health
      const [paymentRecoveries, supportTickets, userActivity, apiKeys, subscriptions, systemHealth, reviews] = await Promise.all([
        PaymentRecovery.list('-created_date', 100).catch(() => []),
        SupportTicket.list('-created_date', 100).catch(() => []),
        UserActivity.list('-created_date', 500).catch(() => []),
        ApiKey.list('-created_date', 100).catch(() => []),
        Subscription.list('-created_date', 200).catch(() => []),
        SystemHealth.list('-created_date', 50).catch(() => []),
        Review.list('-created_date', 200).catch(() => [])
      ]);

      const analyticsAndSystemData = {
        paymentRecoveries: paymentRecoveries || [],
        supportTickets: supportTickets || [],
        userActivity: userActivity || [],
        apiKeys: apiKeys || [],
        subscriptions: subscriptions || [],
        systemHealth: systemHealth || [],
        reviews: reviews || []
      };

      // Construct the final data object from all collected results for comprehensive stats calculation
      const data = {
        ...partialData,
        ...financialData,
        ...analyticsAndSystemData
      };

      setAllData(data);

      // Enhanced stats calculation using the final, complete dataset
      const pendingVenuesCount = data.venues.filter(v => v.status === 'pending_approval').length;
      const pendingVendorsCount = data.vendors.filter(v => v.status === 'pending_approval').length;
      const openDisputesCount = data.disputes.filter(d => ['open', 'investigating', 'awaiting_response'].includes(d.status)).length;
      const reportedVenuesCount = data.reports.filter(r => r.status === 'pending').length;
      const openSupportTicketsCount = data.supportTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;
      const failedPaymentsCount = data.paymentRecoveries.filter(p => p.recovery_status === 'pending').length;
      const systemIssuesCount = data.systemHealth.filter(s => s.status === 'critical').length;

      const totalPlatformRevenue = data.bookings
        .filter(b => ['confirmed', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (b.platform_fee || (b.total_amount * 0.15) || 0), 0);

      // Calculate monthly active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyActiveUsers = data.userActivity
        .filter(a => new Date(a.created_date) >= thirtyDaysAgo)
        .map(a => a.user_id)
        .filter((id, index, arr) => arr.indexOf(id) === index).length;

      // Calculate conversion rate
      const totalSearches = data.userActivity.filter(a => a.activity_type === 'search').length;
      const totalBookings = data.bookings.length;
      const conversionRate = totalSearches > 0 ? (totalBookings / totalSearches) * 100 : 0;

      setStats({
        totalVenues: data.venues.length,
        pendingVenues: pendingVenuesCount,
        pendingVendors: pendingVendorsCount,
        totalBookings: data.bookings.length,
        totalUsers: data.users.length,
        totalRevenue: totalPlatformRevenue,
        openDisputes: openDisputesCount,
        reportedVenues: reportedVenuesCount,
        openSupportTickets: openSupportTicketsCount,
        failedPayments: failedPaymentsCount,
        systemIssues: systemIssuesCount,
        monthlyActiveUsers,
        conversionRate,
        activeSubscriptions: data.subscriptions.filter(s => s.status === 'active').length,
        totalApiKeys: data.apiKeys.filter(k => k.is_active).length
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleVenueFeatureToggle = async (venueId, currentFeatured) => {
    try {
      await Venue.update(venueId, {
        is_featured: !currentFeatured,
        featured_at: !currentFeatured ? new Date().toISOString() : null,
        featured_by: !currentFeatured ? user.id : null
      });
      loadDashboardData(true);
    } catch (error) {
      console.error('Failed to toggle venue feature status:', error);
    }
  };

  const handleVenueStatusChange = async (venueId, newStatus) => {
    try {
      await Venue.update(venueId, { status: newStatus });
      loadDashboardData(true);
    } catch (error) {
      console.error('Failed to update venue status:', error);
    }
  };

  const handleDataUpdate = () => {
    loadDashboardData(true);
  };

  // Enhanced stat cards with trends
  const StatCard = ({ title, value, change, icon: Icon, color = "text-blue-600", trend, onClick, urgent = false }) => (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${urgent ? 'border-red-200 bg-red-50' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${urgent ? 'text-red-700' : 'text-gray-600'}`}>{title}</p>
            <p className={`text-2xl font-bold ${urgent ? 'text-red-800' : 'text-gray-900'}`}>{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and analytics</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <Activity className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="overview" className="text-xs">
            <div className="flex items-center gap-1">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="venues" className="text-xs">
            <div className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Venues</span>
              {stats.pendingVenues > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center">
                  {stats.pendingVenues}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="financials" className="text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financials</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="disputes" className="text-xs">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Disputes</span>
              {stats.openDisputes > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center">
                  {stats.openDisputes}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs">
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Vendors</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs">
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs">
            <div className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* New Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Critical KPIs */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Venues Pending Approval"
                  value={stats.pendingVenues}
                  icon={Clock}
                  color="text-orange-600"
                  urgent={stats.pendingVenues > 0}
                  onClick={() => setActiveTab('venues')}
                />
                <StatCard
                  title="Open Disputes"
                  value={stats.openDisputes}
                  icon={AlertTriangle}
                  color="text-red-600"
                  urgent={stats.openDisputes > 0}
                  onClick={() => setActiveTab('disputes')}
                />
                <StatCard
                  title="Support Tickets"
                  value={stats.openSupportTickets}
                  icon={MessageSquare}
                  color="text-blue-600"
                  urgent={stats.openSupportTickets > 5}
                  onClick={() => console.log('Navigate to Support Tickets')}
                />
                <StatCard
                  title="Platform Revenue"
                  value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
                  icon={DollarSign}
                  color="text-green-600"
                />
              </div>
            </div>

            {/* Platform Overview */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Venues"
                  value={stats.totalVenues}
                  icon={Building}
                  color="text-blue-600"
                />
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="text-purple-600"
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.totalBookings}
                  icon={Calendar}
                  color="text-indigo-600"
                />
                <StatCard
                  title="Monthly Active Users"
                  value={stats.monthlyActiveUsers}
                  icon={TrendingUp}
                  color="text-green-600"
                />
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Venue Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allData.venues
                      .filter(v => v.status === 'pending_approval')
                      .slice(0, 5)
                      .map(venue => (
                        <div key={venue.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{venue.title}</h4>
                            <p className="text-sm text-gray-600">{venue.location?.city}</p>
                          </div>
                          <Button size="sm" onClick={() => setActiveTab('venues')}>
                            Review
                          </Button>
                        </div>
                      ))}
                    {allData.venues.filter(v => v.status === 'pending_approval').length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending venue approvals</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allData.disputes
                      .filter(d => d.status === 'open')
                      .slice(0, 5)
                      .map(dispute => (
                        <div key={dispute.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{dispute.reason.replace('_', ' ')}</h4>
                            <p className="text-sm text-gray-600">Reporter: {dispute.reporter_name}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => setActiveTab('disputes')}>
                            Review
                          </Button>
                        </div>
                      ))}
                    {allData.disputes.filter(d => d.status === 'open').length === 0 && (
                      <p className="text-gray-500 text-center py-4">No open disputes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Keep existing TabsContent for other tabs */}
        <TabsContent value="analytics" className="mt-6">
          <AdminAnalyticsDashboard data={allData} />
        </TabsContent>

        <TabsContent value="venues" className="mt-6">
          <VenueManagement
            venues={allData.venues}
            onUpdate={handleDataUpdate}
            onFeatureToggle={handleVenueFeatureToggle}
            onStatusChange={handleVenueStatusChange}
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <VendorManagement
            vendors={allData.vendors}
            onUpdate={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement
            users={allData.users}
            bookings={allData.bookings}
            venues={allData.venues}
            onUpdate={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <FinancialOperations
            refundRequests={allData.refundRequests}
            payouts={allData.payouts}
            bookings={allData.bookings}
            venues={allData.venues}
            users={allData.users}
            onUpdate={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettings stats={stats} setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentManager />
        </TabsContent>

        <TabsContent value="disputes" className="mt-6">
          <DisputeResolution
            disputes={allData.disputes}
            reports={allData.reports}
            onUpdate={handleDataUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}