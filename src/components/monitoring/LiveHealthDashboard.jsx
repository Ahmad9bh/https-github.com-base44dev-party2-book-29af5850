import React, { useState, useEffect } from 'react';
import { SystemHealth } from '@/api/entities';
import { Analytics } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, Users, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LiveHealthDashboard() {
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [liveStats, setLiveStats] = useState({
        activeUsers: 0,
        todayBookings: 0,
        systemLoad: 0,
        responseTime: 0
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        loadHealthData();
        // Set up real-time updates every 30 seconds
        const interval = setInterval(loadHealthData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadHealthData = async () => {
        try {
            // Load system health metrics
            const metrics = await SystemHealth.list('-last_checked', 20);
            setHealthMetrics(metrics || []);

            // Generate live stats (in production, these would come from real monitoring)
            const now = new Date();
            setLiveStats({
                activeUsers: Math.floor(Math.random() * 50) + 10,
                todayBookings: Math.floor(Math.random() * 20) + 5,
                systemLoad: Math.floor(Math.random() * 30) + 20,
                responseTime: Math.floor(Math.random() * 100) + 50
            });

            setLastUpdate(now);
        } catch (error) {
            console.error('Failed to load health data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Live System Health</h2>
                    <p className="text-gray-600">Real-time monitoring and performance metrics</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                    <Button variant="outline" onClick={loadHealthData} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{liveStats.activeUsers}</span>
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Currently online</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Today's Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{liveStats.todayBookings}</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">New bookings today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">System Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{liveStats.systemLoad}%</span>
                            <Activity className="w-5 h-5 text-orange-600" />
                        </div>
                        <Progress value={liveStats.systemLoad} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{liveStats.responseTime}ms</span>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Average response</p>
                    </CardContent>
                </Card>
            </div>

            {/* Health Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>System Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    {healthMetrics.length === 0 ? (
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No health metrics available yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Metrics will appear as the system generates health data.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {healthMetrics.map((metric, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(metric.status)}
                                        <div>
                                            <h4 className="font-medium">{metric.metric_name}</h4>
                                            <p className="text-sm text-gray-600">{metric.service_component}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-semibold">
                                            {metric.metric_value} {metric.metric_unit}
                                        </span>
                                        <Badge className={getStatusColor(metric.status)}>
                                            {metric.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alerts */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
                {healthMetrics.filter(m => m.status !== 'healthy').length === 0 ? (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            All systems are operating normally. No active alerts.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        {healthMetrics.filter(m => m.status !== 'healthy').map((metric, index) => (
                            <Alert key={index} variant={metric.status === 'critical' ? 'destructive' : 'default'}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>{metric.metric_name}</strong> is showing {metric.status} status with value {metric.metric_value} {metric.metric_unit}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}