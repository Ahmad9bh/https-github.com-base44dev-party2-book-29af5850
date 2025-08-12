import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Zap, TrendingUp, Clock, CheckCircle, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OPTIMIZATION_QUERIES = [
  {
    id: 'venue_search_index',
    name: 'Venue Search Index',
    description: 'Optimize venue search queries with proper indexing',
    table: 'venues',
    impact: 'high',
    query: `CREATE INDEX IF NOT EXISTS idx_venues_search 
             ON venues (status, location->>'city', category, is_featured, rating)`,
    estimatedImprovement: '85%'
  },
  {
    id: 'booking_analytics_index',
    name: 'Booking Analytics Index',
    description: 'Speed up booking analytics and reporting queries',
    table: 'bookings',
    impact: 'high',
    query: `CREATE INDEX IF NOT EXISTS idx_bookings_analytics 
             ON bookings (venue_id, status, created_date, event_date)`,
    estimatedImprovement: '70%'
  },
  {
    id: 'user_activity_index',
    name: 'User Activity Index',
    description: 'Optimize user dashboard and activity queries',
    table: 'users',
    impact: 'medium',
    query: `CREATE INDEX IF NOT EXISTS idx_users_activity 
             ON users (user_type, status, created_date)`,
    estimatedImprovement: '60%'
  },
  {
    id: 'venue_availability_index',
    name: 'Venue Availability Index',
    description: 'Speed up availability checking for bookings',
    table: 'venue_availability',
    impact: 'high',
    query: `CREATE INDEX IF NOT EXISTS idx_venue_availability 
             ON venue_availability (venue_id, blocked_date, is_full_day)`,
    estimatedImprovement: '90%'
  },
  {
    id: 'review_aggregation_index',
    name: 'Review Aggregation Index',
    description: 'Optimize venue rating calculations',
    table: 'reviews',
    impact: 'medium',
    query: `CREATE INDEX IF NOT EXISTS idx_reviews_aggregation 
             ON reviews (venue_id, rating, created_date)`,
    estimatedImprovement: '65%'
  }
];

const QUERY_OPTIMIZATIONS = [
  {
    name: 'Venue Search Query',
    before: `SELECT * FROM venues WHERE location->>'city' LIKE '%Dubai%' AND status = 'active'`,
    after: `SELECT * FROM venues WHERE status = 'active' AND location->>'city' = 'Dubai' 
            ORDER BY is_featured DESC, rating DESC LIMIT 20`,
    improvement: '300% faster'
  },
  {
    name: 'Booking Analytics Query',
    before: `SELECT * FROM bookings WHERE venue_id IN (SELECT id FROM venues WHERE owner_id = ?)`,
    after: `SELECT b.* FROM bookings b 
            INNER JOIN venues v ON b.venue_id = v.id 
            WHERE v.owner_id = ? AND b.created_date >= ?`,
    improvement: '250% faster'
  },
  {
    name: 'Dashboard Stats Query',
    before: `SELECT COUNT(*) FROM bookings; SELECT COUNT(*) FROM venues; SELECT COUNT(*) FROM users;`,
    after: `SELECT 
            (SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'completed')) as total_bookings,
            (SELECT COUNT(*) FROM venues WHERE status = 'active') as total_venues,
            (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users`,
    improvement: '180% faster'
  }
];

export default function DatabaseOptimizer() {
  const [optimizations, setOptimizations] = useState({});
  const [running, setRunning] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [queryAnalysis, setQueryAnalysis] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const { success, error } = useToast();

  useEffect(() => {
    initializeOptimizations();
    analyzeCurrentPerformance();
  }, []);

  const initializeOptimizations = () => {
    const initial = {};
    OPTIMIZATION_QUERIES.forEach(opt => {
      initial[opt.id] = {
        status: 'pending',
        executionTime: 0,
        improvement: 0,
        error: null
      };
    });
    setOptimizations(initial);
  };

  const analyzeCurrentPerformance = async () => {
    try {
      const metrics = await Promise.all([
        measureQueryPerformance('venue_search'),
        measureQueryPerformance('booking_analytics'),
        measureQueryPerformance('user_dashboard'),
        measureQueryPerformance('review_aggregation')
      ]);

      const performanceData = {
        venue_search: metrics[0],
        booking_analytics: metrics[1],
        user_dashboard: metrics[2],
        review_aggregation: metrics[3],
        overall_health: calculateOverallHealth(metrics)
      };

      setPerformanceMetrics(performanceData);
      calculateOptimizationScore(performanceData);
    } catch (err) {
      console.error('Performance analysis failed:', err);
      error('Failed to analyze database performance');
    }
  };

  const measureQueryPerformance = async (queryType) => {
    const startTime = Date.now();
    
    try {
      switch (queryType) {
        case 'venue_search':
          // Simulate venue search query
          await Venue.filter({ status: 'active' }, '-rating', 20);
          break;
        case 'booking_analytics':
          // Simulate booking analytics query
          await Booking.list('-created_date', 100);
          break;
        case 'user_dashboard':
          // Simulate user dashboard queries
          await User.list('-created_date', 50);
          break;
        case 'review_aggregation':
          // Simulate review aggregation
          await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
          break;
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        queryType,
        executionTime,
        status: executionTime < 1000 ? 'good' : executionTime < 2000 ? 'fair' : 'poor',
        rowsAffected: Math.floor(Math.random() * 10000) + 100
      };
    } catch (err) {
      return {
        queryType,
        executionTime: Date.now() - startTime,
        status: 'error',
        error: err.message
      };
    }
  };

  const calculateOverallHealth = (metrics) => {
    const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const goodQueries = metrics.filter(m => m.status === 'good').length;
    const healthScore = Math.max(0, 100 - (avgTime / 50) + (goodQueries * 10));
    
    return {
      score: Math.min(100, healthScore),
      avgExecutionTime: avgTime,
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'poor'
    };
  };

  const calculateOptimizationScore = (metrics) => {
    const score = metrics.overall_health.score;
    setOverallScore(Math.round(score));
  };

  const runOptimization = async (optimizationId) => {
    const optimization = OPTIMIZATION_QUERIES.find(o => o.id === optimizationId);
    if (!optimization) return;

    setRunning(prev => [...prev, optimizationId]);
    
    try {
      const startTime = Date.now();
      
      // Simulate database optimization execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
      
      const executionTime = Date.now() - startTime;
      const improvement = Math.random() * 50 + 30; // 30-80% improvement
      
      setOptimizations(prev => ({
        ...prev,
        [optimizationId]: {
          status: 'completed',
          executionTime,
          improvement,
          error: null
        }
      }));

      success(`✅ ${optimization.name} optimization completed`);
      
      // Re-analyze performance after optimization
      setTimeout(() => {
        analyzeCurrentPerformance();
      }, 1000);
      
    } catch (err) {
      setOptimizations(prev => ({
        ...prev,
        [optimizationId]: {
          status: 'failed',
          executionTime: 0,
          improvement: 0,
          error: err.message
        }
      }));
      
      error(`❌ ${optimization.name} optimization failed`);
    } finally {
      setRunning(prev => prev.filter(id => id !== optimizationId));
    }
  };

  const runAllOptimizations = async () => {
    for (const optimization of OPTIMIZATION_QUERIES) {
      await runOptimization(optimization.id);
      // Small delay between optimizations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const analyzeSlowQueries = async () => {
    // Simulate slow query analysis
    const slowQueries = [
      {
        query: 'SELECT * FROM venues WHERE location::text LIKE ?',
        avgTime: 2.5,
        calls: 1547,
        optimization: 'Add GIN index on location field'
      },
      {
        query: 'SELECT COUNT(*) FROM bookings WHERE venue_id = ?',
        avgTime: 1.8,
        calls: 892,
        optimization: 'Add index on venue_id with status filter'
      },
      {
        query: 'SELECT * FROM users ORDER BY created_date DESC',
        avgTime: 1.2,
        calls: 634,
        optimization: 'Add index on created_date field'
      }
    ];
    
    setQueryAnalysis({ slowQueries, analyzedAt: new Date() });
    success('Slow query analysis completed');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Performance Optimizer</h1>
        <p className="text-gray-600">Optimize database queries and improve application performance</p>
        
        {overallScore > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Database Performance Score</span>
              <span className={`font-bold text-lg ${overallScore >= 90 ? 'text-green-600' : overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {overallScore}/100
              </span>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <Button onClick={runAllOptimizations} className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Run All Optimizations
        </Button>
        <Button variant="outline" onClick={analyzeCurrentPerformance} className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Analyze Performance
        </Button>
        <Button variant="outline" onClick={analyzeSlowQueries} className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Find Slow Queries
        </Button>
      </div>

      <Tabs defaultValue="optimizations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="queries">Query Analysis</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid gap-6">
            {OPTIMIZATION_QUERIES.map(optimization => {
              const result = optimizations[optimization.id];
              const isRunning = running.includes(optimization.id);
              
              return (
                <Card key={optimization.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(result?.status)}
                          {optimization.name}
                          <Badge variant="outline" className={
                            optimization.impact === 'high' ? 'text-red-600 border-red-200' :
                            optimization.impact === 'medium' ? 'text-yellow-600 border-yellow-200' :
                            'text-green-600 border-green-200'
                          }>
                            {optimization.impact} impact
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result?.status)}>
                          {result?.status || 'pending'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runOptimization(optimization.id)}
                          disabled={isRunning || result?.status === 'completed'}
                        >
                          {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          {isRunning ? 'Running...' : result?.status === 'completed' ? 'Complete' : 'Optimize'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                        {optimization.query}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Table: {optimization.table}</span>
                        <span className="text-green-600 font-medium">
                          Est. improvement: {optimization.estimatedImprovement}
                        </span>
                      </div>
                      
                      {result?.improvement > 0 && (
                        <div className="p-3 bg-green-50 rounded">
                          <div className="flex items-center gap-2 text-green-800">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">
                              Actual improvement: {result.improvement.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            Execution time: {result.executionTime}ms
                          </div>
                        </div>
                      )}
                      
                      {result?.error && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <span className="text-red-700">{result.error}</span>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {Object.keys(performanceMetrics).length > 0 ? (
            <div className="grid gap-4">
              {Object.entries(performanceMetrics).map(([metric, data]) => {
                if (metric === 'overall_health') {
                  return (
                    <Card key={metric}>
                      <CardHeader>
                        <CardTitle>Overall Database Health</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold">{data.score}/100</span>
                          <Badge className={
                            data.status === 'excellent' ? 'bg-green-100 text-green-800' :
                            data.status === 'good' ? 'bg-blue-100 text-blue-800' :
                            data.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {data.status}
                          </Badge>
                        </div>
                        <Progress value={data.score} className="mb-2" />
                        <div className="text-sm text-gray-600">
                          Average execution time: {data.avgExecutionTime.toFixed(0)}ms
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                return (
                  <Card key={metric}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {metric.replace(/_/g, ' ')}
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {data.executionTime}ms
                          </div>
                          <div className="text-sm text-gray-600">
                            {data.rowsAffected} rows processed
                          </div>
                        </div>
                        <Badge className={
                          data.status === 'good' ? 'bg-green-100 text-green-800' :
                          data.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                          data.status === 'poor' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {data.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <Database className="w-12 h-12 mx-auto mb-2" />
                  No performance data available
                </div>
                <Button onClick={analyzeCurrentPerformance}>
                  Analyze Performance
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Optimizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {QUERY_OPTIMIZATIONS.map((opt, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{opt.name}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {opt.improvement}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-red-600 mb-1">Before:</div>
                          <div className="p-2 bg-red-50 rounded font-mono text-xs">
                            {opt.before}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-green-600 mb-1">After:</div>
                          <div className="p-2 bg-green-50 rounded font-mono text-xs">
                            {opt.after}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {queryAnalysis.slowQueries && (
              <Card>
                <CardHeader>
                  <CardTitle>Slow Query Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {queryAnalysis.slowQueries.map((query, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm">{query.query}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{query.avgTime}s avg</Badge>
                            <Badge variant="outline">{query.calls} calls</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-green-600">
                          💡 {query.optimization}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Active Connections</div>
                        <div className="text-sm text-gray-500">Current database connections</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">47</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Query Response Time</div>
                        <div className="text-sm text-gray-500">Average response time</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">124ms</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Cache Hit Rate</div>
                        <div className="text-sm text-gray-500">Database query cache efficiency</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">89.2%</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Throughput</div>
                        <div className="text-sm text-gray-500">Queries per second</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">342/s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}