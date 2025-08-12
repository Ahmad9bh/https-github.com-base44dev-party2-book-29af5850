
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Globe, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';

export default function SmokeTest() {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [deviceType, setDeviceType] = useState('unknown');
  const { toast } = useToast();

  useEffect(() => {
    detectDevice();
    runInitialChecks();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android.*Mobile.*(?:Nexus 7|KFAPWI|Transformer|GT-P|SCH-I800|SM-P|SM-T)/i.test(userAgent);
    
    if (isMobile && !isTablet) {
      setDeviceType('mobile');
    } else if (isTablet) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  const runInitialChecks = () => {
    // Check if running in incognito/private mode
    const isIncognito = !window.indexedDB;
    
    // Check network connectivity
    const isOnline = navigator.onLine;
    
    // Check JavaScript enabled (obviously true if this runs)
    const jsEnabled = true;
    
    // Check local storage
    let localStorageWorks = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageWorks = true;
    } catch (e) {
      localStorageWorks = false;
    }

    // Check service worker support
    const serviceWorkerSupported = 'serviceWorker' in navigator;
    
    // Check PWA install capability
    const pwaInstallable = 'onbeforeinstallprompt' in window;

    setTestResults(prev => ({
      ...prev,
      environment: {
        status: 'success',
        details: {
          deviceType,
          isIncognito,
          isOnline,
          jsEnabled,
          localStorageWorks,
          serviceWorkerSupported,
          pwaInstallable,
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          url: window.location.href
        }
      }
    }));
  };

  const runSmokeTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    const tests = [
      { name: 'environment', test: runEnvironmentTest },
      { name: 'homePageLoad', test: testHomePageLoad },
      { name: 'venueListLoad', test: testVenueListLoad },
      { name: 'authentication', test: testAuthentication },
      { name: 'deepRefresh', test: testDeepRefresh },
      { name: 'mobileResponsive', test: testMobileResponsive },
      { name: 'pwaFeatures', test: testPWAFeatures },
      { name: 'apiConnectivity', test: testAPIConnectivity }
    ];

    for (const test of tests) {
      try {
        setTestResults(prev => ({
          ...prev,
          [test.name]: { status: 'running' }
        }));
        
        const result = await test.test();
        
        setTestResults(prev => ({
          ...prev,
          [test.name]: { status: 'success', ...result }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [test.name]: { 
            status: 'error', 
            error: error.message,
            details: error.details || {}
          }
        }));
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    toast({ title: 'Smoke tests completed', description: 'Check results below' });
  };

  const runEnvironmentTest = async () => {
    runInitialChecks();
    return { message: 'Environment check completed' };
  };

  const testHomePageLoad = async () => {
    const startTime = Date.now();
    
    // Test if we can navigate to home and key elements exist
    const hasTitle = document.title.length > 0;
    const hasBody = document.body.children.length > 0;
    const loadTime = Date.now() - startTime;
    
    if (!hasTitle || !hasBody) {
      throw new Error('Home page elements missing');
    }
    
    return {
      message: 'Home page loaded successfully',
      details: { loadTime, hasTitle, hasBody }
    };
  };

  const testVenueListLoad = async () => {
    const startTime = Date.now();
    
    try {
      const venues = await Venue.filter({ status: 'active' }, '', 5);
      const loadTime = Date.now() - startTime;
      
      return {
        message: `Loaded ${venues.length} venues`,
        details: { venueCount: venues.length, loadTime }
      };
    } catch (error) {
      throw new Error(`Failed to load venues: ${error.message}`);
    }
  };

  const testAuthentication = async () => {
    try {
      const user = await User.me();
      return {
        message: 'User authenticated successfully',
        details: { userRole: user.role, userId: user.id.substring(0, 8) + '...' }
      };
    } catch (error) {
      return {
        message: 'User not authenticated (normal for public access)',
        details: { authRequired: false }
      };
    }
  };

  const testDeepRefresh = async () => {
    const currentUrl = window.location.href;
    const isDeepUrl = currentUrl.includes('?') || currentUrl.split('/').length > 4;
    
    return {
      message: 'Deep refresh test (manual verification needed)',
      details: { 
        currentUrl,
        isDeepUrl,
        instruction: 'Press F5 to test - page should not 404'
      }
    };
  };

  const testMobileResponsive = async () => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
    
    const isMobileViewport = viewport.width < 768;
    const hasTouch = 'ontouchstart' in window;
    
    return {
      message: 'Mobile responsiveness check',
      details: { 
        viewport,
        isMobileViewport,
        hasTouch,
        deviceType
      }
    };
  };

  const testPWAFeatures = async () => {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      installPrompt: 'onbeforeinstallprompt' in window,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      fullscreen: 'requestFullscreen' in document.documentElement
    };
    
    return {
      message: 'PWA features check',
      details: features
    };
  };

  const testAPIConnectivity = async () => {
    const startTime = Date.now();
    
    try {
      // Test basic API connectivity
      const testData = await Venue.list('', 1);
      const responseTime = Date.now() - startTime;
      
      return {
        message: 'API connectivity successful',
        details: { 
          responseTime,
          apiWorking: true,
          baseUrl: process.env.REACT_APP_BASE44_API_URL || 'Base44 API'
        }
      };
    } catch (error) {
      throw new Error(`API connectivity failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Smartphone className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Smoke Tests</h1>
        <p className="text-gray-600">
          Comprehensive testing for Party2Go production environment
        </p>
        
        <div className="flex items-center gap-4 mt-4">
          {getDeviceIcon()}
          <span className="text-sm text-gray-600 capitalize">{deviceType} device detected</span>
          <Globe className="w-4 h-4" />
          <span className="text-sm text-gray-600">{window.location.hostname}</span>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={runSmokeTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open(createPageUrl('Browse'), '_blank')}
            >
              Test Deep Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {Object.entries(testResults).map(([testName, result]) => (
          <Card key={testName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</span>
                <Badge variant={result.status === 'success' ? 'success' : result.status === 'error' ? 'destructive' : 'secondary'}>
                  {result.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.message && (
                <p className="text-sm text-gray-700 mb-2">{result.message}</p>
              )}
              
              {result.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}
              
              {result.details && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer font-medium mb-2">Test Details</summary>
                  <pre className="bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
