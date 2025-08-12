import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { SupportTicket } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Analytics } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, Users, Calendar, MessageSquare, TrendingUp, 
    AlertTriangle, CheckCircle, Clock, DollarSign 
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LiveHealthDashboard from '@/components/monitoring/LiveHealthDashboard';
import ReferralManager from '@/components/growth/ReferralManager';
import FeedbackCollector from '@/components/feedback/FeedbackCollector';
import { createPageUrl } from '@/utils';

export default function OperationalDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        supportTickets: [],
        recentBookings: [],
        keyMetrics: {
            totalUsers: 0,
            todayBookings: 0,
            pendingTickets: 0,
            revenue: 0
        }
    });

    useEffect(() => {
        const initialize = async () => {
            try {
                const currentUser = await User.me();
                if (currentUser.role !== 'admin') {
                    window.location.href = createPageUrl('Home');
                    return;
                }
                setUser(currentUser);
                await loadDashboardData();
            } catch (e) {
                window.location.href = createPageUrl('Home');
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [tickets, bookings, users] = await Promise.all([
                SupportTicket.filter({ status: 'open' }, '-created_date', 10),
                Booking.list('-created_date', 20),
                User.list('-created_date', 100)
            ]);

            // Calculate today's bookings
            const today = new Date().toISOString().split('T')[0];
            const todayBookings = bookings.filter(b => 
                b.created_date && b.created_date.startsWith(today)
            ).length;

            // Calculate revenue (simplified)
            const revenue = bookings
                .filter(b => b.status === 'confirmed' || b.status === 'completed')
                .reduce((sum, b) => sum + (b.total_amount || 0), 0);

            setDashboardData({
                supportTickets: tickets || [],
                recentBookings: bookings || [],
                keyMetrics: {
                    totalUsers: users.length,
                    todayBookings,
                    pendingTickets: tickets?.length || 0,
                    revenue: Math.round(revenue)
                }
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const { keyMetrics, supportTickets, recentBookings } = dashboardData;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations Dashboard</h1>
                <p className="text-gray-600">Monitor platform performance, support, and growth metrics</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{keyMetrics.totalUsers}</span>
                        <p className="text-xs text-gray-500 mt-1">Registered users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Today's Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{keyMetrics.todayBookings}</span>
                        <p className="text-xs text-gray-500 mt-1">New bookings today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Open Tickets
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{keyMetrics.pendingTickets}</span>
                        <p className="text-xs text-gray-500 mt-1">Require attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">${keyMetrics.revenue.toLocaleString()}</span>
                        <p className="text-xs text-gray-500 mt-1">Total confirmed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="health">System Health</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                    <TabsTrigger value="growth">Growth</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Support Tickets */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Recent Support Tickets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {supportTickets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No open support tickets</p>
                                        <p className="text-sm text-gray-400">Great job on customer support!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {supportTickets.slice(0, 5).map((ticket) => (
                                            <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{ticket.subject}</h4>
                                                    <p className="text-sm text-gray-600">{ticket.user_name}</p>
                                                </div>
                                                <Badge className={
                                                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }>
                                                    {ticket.priority}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Bookings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Recent Bookings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentBookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No recent bookings</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentBookings.slice(0, 5).map((booking) => (
                                            <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">${booking.total_amount}</h4>
                                                    <p className="text-sm text-gray-600">{booking.contact_name}</p>
                                                </div>
                                                <Badge className={
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }>
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="health">
                    <LiveHealthDashboard />
                </TabsContent>

                <TabsContent value="support">
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Management</CardTitle>
                            <p className="text-gray-600">Manage and respond to customer support requests</p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Support Center Integration</h3>
                                <p className="text-gray-600 mb-6">
                                    This would integrate with your support ticket system to manage customer inquiries.
                                </p>
                                <Button onClick={() => window.location.href = createPageUrl('SupportCenter')}>
                                    Visit Support Center
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="growth">
                    <ReferralManager />
                </TabsContent>

                <TabsContent value="feedback">
                    <FeedbackCollector />
                </TabsContent>
            </Tabs>
        </div>
    );
}