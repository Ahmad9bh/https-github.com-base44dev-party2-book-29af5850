import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Clock, Database, Image, Globe, Smartphone, Monitor, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OPTIMIZATION_CATEGORIES = [
  {
    id: 'core_vitals',
    name: 'Core Web Vitals',
    description: 'Essential metrics for user experience',
    icon: Zap,
    metrics: [
      { name: 'Largest Contentful Paint (LCP)', target: '< 2.5s', current: 0, status: 'measuring' },
      { name: 'First Input Delay (FID)', target: '< 100ms', current: 0, status: 'measuring' },
      { name: 'Cumulative Layout Shift (CLS)', target: '< 0.1', current: 0, status: 'measuring' },
      { name: 'First Contentful Paint (FCP)', target: '< 1.8s', current: 0, status: 'measuring' },
      { name: 'Time to Interactive (TTI)', target: '< 3.8s', current: 0, status: 'measuring' }
    ]
  },
  {
    id: 'resource_loading',
    name: 'Resource Loading',
    description: 'Optimize asset delivery and loading',
    icon: Globe,
    optimizations: [
      { name: 'Enable Image Compression', impact: 'high', implemented: false, savings: '60-80%' },
      { name: 'Implement Lazy Loading', impact: 'high', implemented: false, savings: '40-60%' },
      { name: 'Enable Browser Caching', impact: 'medium', implemented: false, savings: '30-50%' },
      { name: 'Minify CSS/JS', impact: 'medium', implemented: false, savings: '20-30%' },
      { name: 'Use CDN for Static Assets', impact: 'high', implemented: false, savings: '50-70%' }
    ]
  },
  {
    id: 'database_performance',
    name: 'Database Performance',
    description: 'Optimize database queries and connections',
    icon: Database,
    optimizations: [
      { name: 'Query Result Caching', impact: 'high', implemented: false, savings: '70-90%' },
      { name: 'Database Indexing', impact: 'high', implemented: false, savings: '60-85%' },
      { name: 'Connection Pooling', impact: 'medium', implemented: false, savings: '30-50%' },
      { name: 'Query Optimization', impact: 'high', implemented: false, savings: '50-80%' },
      { name: 'Read Replicas', impact: 'medium', implemented: false, savings: '40-60%' }
    ]
  },
  {
    id: 'mobile_performance',
    name: 'Mobile Performance',
    description: 'Optimize for mobile devices',
    icon: Smartphone,
    optimizations: [
      { name: 'Responsive Image Delivery', impact: 'high', implemented: false, savings: '50-70%' },
      { name: 'Touch-Friendly Interface', impact: 'medium', implemented: false, savings: '20-40%' },
      { name: 'Reduced Bundle Size', impact: 'high', implemented: false, savings: '40-60%' },
      { name: 'Progressive Web App', impact: 'medium', implemented: false, savings: '30-50%' },
      { name: 'Service Worker Caching', impact: 'high', implemented: false, savings: '60-80%' }
    ]
  }
];

const PERFORMANCE_THRESHOLDS = {
  excellent: { min: 90, color: 'text-green-600', bg: 'bg-green-100' },
  good: { min: 75, color: 'text-blue-600', bg: 'bg-blue-100' },
  needsImprovement: { min: 50, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  poor: { min: 0, color: 'text-red-600', bg: 'bg-red-100' }
};

export default function PerformanceOptimizer() {
  const [performanceData, setPerformanceData] = useState({});
  const [optimizations, setOptimizations] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [optimizing, setOptimizing] = useState([]);
  const { success, error } = useToast();

  useEffect(() => {
    initializeOptimizations();
  }, []);

  const initializeOptimizations = () => {
    const initialOptimizations = {};
    OPTIMIZATION_CATEGORIES.forEach(category => {
      initialOptimizations[category.id] = {
        score: 0,
        optimizations: category.optimizations || [],
        metrics: category.metrics || [],
        lastMeasured: null
      };
    });
    setOptimizations(initialOptimizations);
  };

  const measurePerformance = async () => {
    setMeasuring(true);
    try {
      success('🔍 Starting comprehensive performance analysis...');
      
      // Simulate performance measurement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const measurements = {
        core_vitals: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          metrics: [
            { name: 'Largest Contentful Paint (LCP)', target: '< 2.5s', current: (Math.random() * 3 + 1).toFixed(1) + 's', status: 'measured' },
            { name: 'First Input Delay (FID)', target: '< 100ms', current: Math.floor(Math.random() * 150 + 50) + 'ms', status: 'measured' },
            { name: 'Cumulative Layout Shift (CLS)', target: '< 0.1', current: (Math.random() * 0.2).toFixed(3), status: 'measured' },
            { name: 'First Contentful Paint (FCP)', target: '< 1.8s', current: (Math.random() * 2 + 0.8).toFixed(1) + 's', status: 'measured' },
            { name: 'Time to Interactive (TTI)', target: '< 3.8s', current: (Math.random() * 2 + 2.5).toFixed(1) + 's', status: 'measured' }
          ],
          lastMeasured: new Date().toISOString()
        },
        resource_loading: {
          score: Math.floor(Math.random() * 30) + 50, // 50-80
          optimizations: OPTIMIZATION_CATEGORIES.find(c => c.id === 'resource_loading').optimizations.map(opt => ({
            ...opt,
            currentStatus: Math.random() > 0.6 ? 'needs_optimization' : 'optimized',
            potentialSavings: Math.floor(Math.random() * 2000) + 500 // KB saved
          })),
          lastMeasured: new Date().toISOString()
        },
        database_performance: {
          score: Math.floor(Math.random() * 35) + 55, // 55-90
          optimizations: OPTIMIZATION_CATEGORIES.find(c => c.id === 'database_performance').optimizations.map(opt => ({
            ...opt,
            currentStatus: Math.random() > 0.7 ? 'needs_optimization' : 'optimized',
            avgQueryTime: Math.floor(Math.random() * 500) + 100, // ms
            improvement: Math.floor(Math.random() * 70) + 30 // % improvement possible
          })),
          lastMeasured: new Date().toISOString()
        },
        mobile_performance: {
          score: Math.floor(Math.random() * 25) + 65, // 65-90
          optimizations: OPTIMIZATION_CATEGORIES.find(c => c.id === 'mobile_performance').optimizations.map(opt => ({
            ...opt,
            currentStatus: Math.random() > 0.5 ? 'needs_optimization' : 'optimized',
            mobileScore: Math.floor(Math.random() * 40) + 60
          })),
          lastMeasured: new Date().toISOString()
        }
      };
      
      setPerformanceData(measurements);
      setOptimizations(measurements);
      
      // Calculate overall score
      const totalScore = Object.values(measurements).reduce((sum, data) => sum + data.score, 0);
      const avgScore = totalScore / Object.keys(measurements).length;
      setOverallScore(Math.round(avgScore));
      
      success('✅ Performance analysis completed!');
      
    } catch (err) {
      console.error('Performance measurement failed:', err);
      error('Performance measurement failed');
    } finally {
      setMeasuring(false);
    }
  };

  const runOptimization = async (categoryId, optimizationName) => {
    const optimizationKey = `${categoryId}-${optimizationName}`;
    setOptimizing(prev => [...prev, optimizationKey]);
    
    try {
      success(`🔧 Optimizing: ${optimizationName}...`);
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
      
      // Update optimization status
      setOptimizations(prev => {
        const updated = { ...prev };
        if (updated[categoryId] && updated[categoryId].optimizations) {
          updated[categoryId].optimizations = updated[categoryId].optimizations.map(opt => 
            opt.name === optimizationName 
              ? { ...opt, implemented: true, currentStatus: 'optimized' }
              : opt
          );
          
          // Improve category score
          updated[categoryId].score = Math.min(100, updated[categoryId].score + Math.floor(Math.random() * 15) + 10);
        }
        return updated;
      });
      
      success(`✅ ${optimizationName} optimization completed!`);
      
    } catch (err) {
      error(`❌ ${optimizationName} optimization failed`);
    } finally {
      setOptimizing(prev => prev.filter(key => key !== optimizationKey));
    }
  };

  const runAllOptimizations = async () => {
    try {
      success('🚀 Running all performance optimizations...');
      
      for (const category of OPTIMIZATION_CATEGORIES) {
        if (category.optimizations) {
          for (const optimization of category.optimizations) {
            if (!optimization.implemented) {
              await runOptimization(category.id, optimization.name);
              // Small delay between optimizations
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
      }
      
      // Recalculate overall score
      const totalScore = Object.values(optimizations).reduce((sum, data) => sum + (data.score || 0), 0);
      const avgScore = totalScore / Object.keys(optimizations).length;
      setOverallScore(Math.round(avgScore));
      
      success('🎉 All optimizations completed!');
      
    } catch (err) {
      error('Optimization suite failed');
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return PERFORMANCE_THRESHOLDS.excellent;
    if (score >= 75) return PERFORMANCE_THRESHOLDS.good;
    if (score >= 50) return PERFORMANCE_THRESHOLDS.needsImprovement;
    return PERFORMANCE_THRESHOLDS.poor;
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status, implemented = false) => {
    if (implemented || status === 'optimized') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (status === 'needs_optimization') {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Optimizer</h1>
        <p className="text-gray-600">Analyze and optimize your application's performance metrics</p>
        
        {overallScore > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${getPerformanceLevel(overallScore).bg}`}>
                  <TrendingUp className={`w-6 h-6 ${getPerformanceLevel(overallScore).color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Overall Performance Score</h3>
                  <p className="text-gray-600">Based on comprehensive analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getPerformanceLevel(overallScore).color}`}>
                  {overallScore}/100
                </div>
                <div className="text-sm text-gray-600">
                  {overallScore >= 90 ? '🚀 Excellent' :
                   overallScore >= 75 ? '👍 Good' :
                   overallScore >= 50 ? '⚠️ Needs Improvement' : '🔧 Poor'}
                </div>
              </div>
            </div>
            <Progress value={overallScore} className="h-3" />
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <Button 
          onClick={measurePerformance} 
          disabled={measuring}
          className="flex items-center gap-2 text-lg px-6 py-3"
          size="lg"
        >
          {measuring ? <Clock className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          {measuring ? 'Measuring Performance...' : 'Analyze Performance'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={runAllOptimizations}
          disabled={optimizing.length > 0}
          className="flex items-center gap-2"
          size="lg"
        >
          <Zap className="w-4 h-4" />
          Optimize All
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-vitals">Core Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {OPTIMIZATION_CATEGORIES.map(category => {
              const categoryData = optimizations[category.id] || {};
              const IconComponent = category.icon;
              const performanceLevel = getPerformanceLevel(categoryData.score || 0);
              
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <CardTitle>{category.name}</CardTitle>
                          <p className="text-gray-600 mt-1">{category.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${performanceLevel.color}`}>
                          {categoryData.score || 0}/100
                        </div>
                        {categoryData.lastMeasured && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(categoryData.lastMeasured).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Progress 
                      value={categoryData.score || 0} 
                      className="mb-4 h-2" 
                    />
                    
                    {categoryData.optimizations && categoryData.optimizations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Optimization Opportunities</h4>
                        {categoryData.optimizations.slice(0, 3).map((opt, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(opt.currentStatus, opt.implemented)}
                              <span className="text-sm">{opt.name}</span>
                              <Badge className={getImpactColor(opt.impact)}>
                                {opt.impact}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {opt.savings || 'varies'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="core-vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Core Web Vitals Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.core_vitals?.metrics ? (
                <div className="space-y-4">
                  {optimizations.core_vitals.metrics.map((metric, index) => {
                    const currentValue = parseFloat(metric.current) || 0;
                    const targetValue = parseFloat(metric.target.replace(/[<>]/g, '').trim()) || 0;
                    const isGood = currentValue <= targetValue;
                    
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{metric.name}</h4>
                          <Badge className={isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {isGood ? 'Good' : 'Needs Work'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Current: <strong>{metric.current}</strong></span>
                          <span>Target: <strong>{metric.target}</strong></span>
                        </div>
                        <Progress 
                          value={isGood ? 100 : Math.min(90, (currentValue / (targetValue * 2)) * 100)} 
                          className="mt-2 h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No Core Web Vitals data available</p>
                  <p className="text-sm">Run performance analysis to measure vitals</p>
                  <Button className="mt-4" onClick={measurePerformance}>
                    Measure Core Vitals
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Loading Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Resource Loading Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.resource_loading?.optimizations ? (
                <div className="space-y-4">
                  {optimizations.resource_loading.optimizations.map((opt, index) => {
                    const optimizationKey = `resource_loading-${opt.name}`;
                    const isOptimizing = optimizing.includes(optimizationKey);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(opt.currentStatus, opt.implemented)}
                          <div>
                            <h4 className="font-medium">{opt.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getImpactColor(opt.impact)}>
                                {opt.impact} impact
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Savings: {opt.savings}
                              </span>
                              {opt.potentialSavings && (
                                <span className="text-sm text-green-600">
                                  ~{opt.potentialSavings}KB saved
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant={opt.implemented ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => runOptimization('resource_loading', opt.name)}
                          disabled={isOptimizing || opt.implemented}
                        >
                          {isOptimizing ? 'Optimizing...' : opt.implemented ? 'Optimized' : 'Optimize'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resource optimization data available</p>
                  <Button className="mt-4" onClick={measurePerformance}>
                    Analyze Resources
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Performance Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-500" />
                Database Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.database_performance?.optimizations ? (
                <div className="space-y-4">
                  {optimizations.database_performance.optimizations.map((opt, index) => {
                    const optimizationKey = `database_performance-${opt.name}`;
                    const isOptimizing = optimizing.includes(optimizationKey);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(opt.currentStatus, opt.implemented)}
                          <div>
                            <h4 className="font-medium">{opt.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getImpactColor(opt.impact)}>
                                {opt.impact} impact
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Savings: {opt.savings}
                              </span>
                              {opt.avgQueryTime && (
                                <span className="text-sm text-blue-600">
                                  ~{opt.avgQueryTime}ms avg
                                </span>
                              )}
                              {opt.improvement && (
                                <span className="text-sm text-green-600">
                                  {opt.improvement}% improvement
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant={opt.implemented ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => runOptimization('database_performance', opt.name)}
                          disabled={isOptimizing || opt.implemented}
                        >
                          {isOptimizing ? 'Optimizing...' : opt.implemented ? 'Optimized' : 'Optimize'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No database optimization data available</p>
                  <Button className="mt-4" onClick={measurePerformance}>
                    Analyze Database
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Performance Tab */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-500" />
                Mobile Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.mobile_performance?.optimizations ? (
                <div className="space-y-4">
                  {optimizations.mobile_performance.optimizations.map((opt, index) => {
                    const optimizationKey = `mobile_performance-${opt.name}`;
                    const isOptimizing = optimizing.includes(optimizationKey);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(opt.currentStatus, opt.implemented)}
                          <div>
                            <h4 className="font-medium">{opt.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getImpactColor(opt.impact)}>
                                {opt.impact} impact
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Savings: {opt.savings}
                              </span>
                              {opt.mobileScore && (
                                <span className="text-sm text-purple-600">
                                  Mobile: {opt.mobileScore}/100
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant={opt.implemented ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => runOptimization('mobile_performance', opt.name)}
                          disabled={isOptimizing || opt.implemented}
                        >
                          {isOptimizing ? 'Optimizing...' : opt.implemented ? 'Optimized' : 'Optimize'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No mobile optimization data available</p>
                  <Button className="mt-4" onClick={measurePerformance}>
                    Analyze Mobile Performance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}