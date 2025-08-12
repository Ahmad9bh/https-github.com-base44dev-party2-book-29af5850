import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Database, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { CacheUtils } from '../utils/CacheManager';

const PerformanceMonitor = ({ isAdmin = false }) => {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    uptime: 0,
    errorRate: 0,
    throughput: 0
  });
  const [cacheStats, setCacheStats] = useState({});
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      loadPerformanceData();
      const interval = setInterval(loadPerformanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadPerformanceData = async () => {
    try {
      // Load cache statistics
      const cacheData = await CacheUtils.getStats();
      setCacheStats(cacheData);

      // Mock performance metrics - in real implementation, this would come from monitoring service
      const mockMetrics = {
        responseTime: Math.random() * 200 + 100, // 100-300ms
        uptime: 99.8,
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.random() * 1000 + 500 // 500-1500 req/min
      };
      setMetrics(mockMetrics);

      // Generate performance timeline data
      const now = new Date();
      const timelineData = Array.from({ length: 24 }, (_, i) => ({
        time: format(new Date(now - (23 - i) * 60 * 60 * 1000), 'HH:mm'),
        responseTime: Math.random() * 100 + 100,
        throughput: Math.random() * 500 + 300,
        errorRate: Math.random() * 3
      }));
      setPerformanceData(timelineData);

    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const getHealthStatus = (value, thresholds) => {
    if (value <= thresholds.good) return { status: 'good', color: 'bg-green-100 text-green-800' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'critical', color: 'bg-red-100 text-red-800' };
  };

  if (!isAdmin) {
    return null;
  }

  const responseTimeHealth = getHealthStatus(metrics.responseTime, { good: 200, warning: 500 });
  const errorRateHealth = getHealthStatus(metrics.errorRate, { good: 1, warning: 5 });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{Math.round(metrics.responseTime)}ms</p>
                <Badge className={responseTimeHealth.color}>
                  {responseTimeHealth.status}
                </Badge>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{metrics.uptime}%</p>
                <Progress value={metrics.uptime} className="w-16 h-2 mt-1" />
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</p>
                <Badge className={errorRateHealth.color}>
                  {errorRateHealth.status}
                </Badge>
              </div>
              <Globe className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Throughput</p>
                <p className="text-2xl font-bold">{Math.round(metrics.throughput)}</p>
                <p className="text-xs text-gray-500">req/min</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Math.round(value)}ms`, 'Response Time']} />
                <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Throughput (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Math.round(value)} req/min`, 'Throughput']} />
                <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{cacheStats.totalEntries || 0}</p>
              <p className="text-sm text-gray-600">Cache Entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{cacheStats.totalHits || 0}</p>
              <p className="text-sm text-gray-600">Cache Hits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {cacheStats.totalSize ? `${(cacheStats.totalSize / 1024 / 1024).toFixed(2)}MB` : '0MB'}
              </p>
              <p className="text-sm text-gray-600">Cache Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{cacheStats.memoryEntries || 0}</p>
              <p className="text-sm text-gray-600">Memory Cache</p>
            </div>
          </div>

          {cacheStats.byType && Object.keys(cacheStats.byType).length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Cache by Type</h4>
              <div className="space-y-2">
                {Object.entries(cacheStats.byType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <div className="flex gap-4 text-sm">
                      <span>{data.count} entries</span>
                      <span>{data.hits} hits</span>
                      <span>{(data.size / 1024).toFixed(1)}KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;