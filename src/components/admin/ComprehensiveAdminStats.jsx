import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, Users, DollarSign, Activity, Shield, Database,
  Zap, Globe, Mail, Phone, CreditCard
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function ComprehensiveAdminStats({ 
  bookings, users, venues, paymentRecoveries, supportTickets, 
  userActivity, subscriptions, systemHealth 
}) {
  // Calculate key business metrics
  const calculateMetrics = () => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Revenue metrics
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const platformRevenue = confirmedBookings.reduce((sum, b) => sum + (b.platform_fee || (b.total_amount * 0.15)), 0);

    // User engagement
    const recentActivity = userActivity.filter(a => new Date(a.created_date) >= last7Days);
    const activeUsers = [...new Set(recentActivity.map(a => a.user_id))].length;
    
    // Payment health
    const failedPayments = paymentRecoveries.filter(p => p.recovery_status === 'pending').length;
    const recoveredPayments = paymentRecoveries.filter(p => p.recovery_status === 'recovered').length;
    const recoveryRate = paymentRecoveries.length > 0 ? (recoveredPayments / paymentRecoveries.length) * 100 : 0;

    // Support metrics
    const openTickets = supportTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;
    const avgResponseTime = calculateAvgResponseTime(supportTickets);

    // System health
    const criticalIssues = systemHealth.filter(s => s.status === 'critical').length;
    const warningIssues = systemHealth.filter(s => s.status === 'warning').length;

    // Growth metrics
    const newUsersLast7Days = users.filter(u => new Date(u.created_date) >= last7Days).length;
    const newVenuesLast7Days = venues.filter(v => new Date(v.created_date) >= last7Days).length;

    return {
      totalRevenue,
      platformRevenue,
      activeUsers,
      failedPayments,
      recoveryRate,
      openTickets,
      avgResponseTime,
      criticalIssues,
      warningIssues,
      newUsersLast7Days,
      newVenuesLast7Days
    };
  };

  const calculateAvgResponseTime = (tickets) => {
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    if (resolvedTickets.length === 0) return 0;
    
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.created_date);
      const resolved = new Date(ticket.updated_date);
      return sum + (resolved - created);
    }, 0);
    
    return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // Convert to hours
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      {/* Business Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Health */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Revenue Health
              </h4>
              <div className="text-2xl font-bold text-green-600">
                ${metrics.platformRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Platform fees collected</p>
            </div>

            {/* User Engagement */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                User Engagement
              </h4>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.activeUsers}
              </div>
              <p className="text-sm text-gray-600">Active users (7 days)</p>
            </div>

            {/* System Reliability */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                System Health
              </h4>
              <div className="flex items-center gap-2">
                {metrics.criticalIssues === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <span className="text-lg font-semibold">
                  {metrics.criticalIssues === 0 ? 'Healthy' : `${metrics.criticalIssues} Issues`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Recovery */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Recovery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Failed Payments</span>
              <Badge variant={metrics.failedPayments > 10 ? "destructive" : "outline"}>
                {metrics.failedPayments}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Recovery Rate</span>
                <span className="text-sm font-medium">{metrics.recoveryRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.recoveryRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Support Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Support Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Open Tickets</span>
              <Badge variant={metrics.openTickets > 20 ? "destructive" : "outline"}>
                {metrics.openTickets}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Avg Response Time</span>
              <span className="font-medium">{metrics.avgResponseTime}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Indicators (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.newUsersLast7Days}</div>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.newVenuesLast7Days}</div>
              <p className="text-sm text-gray-600">New Venues</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((metrics.activeUsers / users.length) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">User Engagement Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}