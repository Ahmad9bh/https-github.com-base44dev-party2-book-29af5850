import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Shield, Globe, DollarSign, CheckCircle, AlertTriangle, Settings, Activity, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PAYMENT_PROVIDERS = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    features: ['Global Coverage', 'Advanced Fraud Protection', 'Instant Payouts', 'Subscription Management'],
    fees: '2.9% + 30¢',
    countries: 40,
    currencies: 135,
    status: 'connected'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    features: ['Buyer Protection', 'Express Checkout', 'Mobile Payments', 'Global Reach'],
    fees: '2.9% + fixed fee',
    countries: 200,
    currencies: 100,
    status: 'available'
  },
  {
    id: 'square',
    name: 'Square',
    icon: '⬜',
    features: ['In-Person Payments', 'Online Payments', 'Invoicing', 'Analytics'],
    fees: '2.6% + 10¢',
    countries: 7,
    currencies: 4,
    status: 'available'
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: '🇮🇳',
    features: ['UPI Payments', 'BNPL Options', 'Smart Routing', 'Local Methods'],
    fees: '2% + GST',
    countries: 1,
    currencies: 3,
    status: 'available'
  }
];

const REGIONAL_METHODS = [
  { region: 'Middle East', methods: ['Mada', 'Apple Pay', 'STC Pay', 'Fawry'], adoption: '78%' },
  { region: 'Southeast Asia', methods: ['GrabPay', 'GoPay', 'TrueMoney', 'TouchNGo'], adoption: '65%' },
  { region: 'Europe', methods: ['SEPA', 'Sofort', 'iDEAL', 'Bancontact'], adoption: '82%' },
  { region: 'Latin America', methods: ['PIX', 'OXXO', 'Boleto', 'Mercado Pago'], adoption: '71%' }
];

export default function PaymentIntegrationManager() {
  const [paymentConfig, setPaymentConfig] = useState({
    primaryProvider: 'stripe',
    backupProvider: 'paypal',
    autoRetry: true,
    fraudProtection: true,
    multiCurrency: true,
    subscriptions: true,
    webhooks: true,
    testMode: true
  });

  const [integrationStatus, setIntegrationStatus] = useState({});
  const [paymentStats, setPaymentStats] = useState({
    totalTransactions: 0,
    successRate: 0,
    averageAmount: 0,
    monthlyVolume: 0,
    failureReasons: {},
    topCountries: []
  });

  const [webhookStatus, setWebhookStatus] = useState({});
  const [fraudMetrics, setFraudMetrics] = useState({});
  const { success, error } = useToast();

  useEffect(() => {
    loadPaymentData();
    checkIntegrationStatus();
    loadPaymentStats();
  }, []);

  const loadPaymentData = async () => {
    // Load existing payment configuration
    try {
      // In real implementation, load from backend
      const config = {
        stripe: {
          publicKey: 'pk_test_...',
          webhookSecret: 'whsec_...',
          connected: true,
          lastSync: new Date().toISOString()
        },
        paypal: {
          clientId: 'AY...',
          webhookId: 'WH...',
          connected: false,
          lastSync: null
        }
      };
      
      setIntegrationStatus(config);
    } catch (err) {
      console.error('Failed to load payment data:', err);
      error('Failed to load payment configuration');
    }
  };

  const checkIntegrationStatus = async () => {
    // Check connection status with payment providers
    const status = {};
    
    for (const provider of PAYMENT_PROVIDERS) {
      try {
        // Simulate API health check
        await new Promise(resolve => setTimeout(resolve, 500));
        
        status[provider.id] = {
          connected: provider.status === 'connected',
          healthy: Math.random() > 0.1, // 90% uptime
          lastCheck: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 500) + 100
        };
      } catch (err) {
        status[provider.id] = {
          connected: false,
          healthy: false,
          lastCheck: new Date().toISOString(),
          error: err.message
        };
      }
    }
    
    setIntegrationStatus(status);
  };

  const loadPaymentStats = async () => {
    // Load payment analytics
    const stats = {
      totalTransactions: 15847,
      successRate: 97.3,
      averageAmount: 245.67,
      monthlyVolume: 3894567.89,
      failureReasons: {
        'insufficient_funds': 35,
        'card_declined': 28,
        'network_error': 15,
        'fraud_prevention': 12,
        'other': 10
      },
      topCountries: [
        { country: 'UAE', transactions: 4521, volume: 1234567 },
        { country: 'Saudi Arabia', transactions: 3876, volume: 987654 },
        { country: 'Qatar', transactions: 2134, volume: 543210 },
        { country: 'Kuwait', transactions: 1876, volume: 432109 }
      ]
    };
    
    setPaymentStats(stats);
  };

  const connectProvider = async (providerId) => {
    try {
      success(`Connecting to ${providerId}...`);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationStatus(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          connected: true,
          lastSync: new Date().toISOString()
        }
      }));
      
      success(`Successfully connected to ${providerId}`);
    } catch (err) {
      error(`Failed to connect to ${providerId}: ${err.message}`);
    }
  };

  const testWebhooks = async () => {
    try {
      success('Testing webhook endpoints...');
      
      const webhookTests = [
        { event: 'payment.succeeded', status: 'success', responseTime: 234 },
        { event: 'payment.failed', status: 'success', responseTime: 189 },
        { event: 'refund.created', status: 'success', responseTime: 312 },
        { event: 'dispute.created', status: 'success', responseTime: 445 }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setWebhookStatus({
        lastTested: new Date().toISOString(),
        results: webhookTests,
        overallStatus: 'healthy'
      });
      
      success('All webhook tests passed');
    } catch (err) {
      error('Webhook testing failed');
    }
  };

  const runFraudAnalysis = async () => {
    try {
      success('Running fraud analysis...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fraudData = {
        riskScore: 8.7,
        blockedTransactions: 34,
        falsePositives: 2,
        savedAmount: 15670.45,
        topRiskFactors: [
          { factor: 'Unusual location', count: 12 },
          { factor: 'High velocity', count: 8 },
          { factor: 'Card testing', count: 6 },
          { factor: 'Suspicious email', count: 4 }
        ]
      };
      
      setFraudMetrics(fraudData);
      success('Fraud analysis completed');
    } catch (err) {
      error('Fraud analysis failed');
    }
  };

  const simulatePayment = async () => {
    try {
      success('Simulating test payment...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Random success/failure for testing
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        success('✅ Test payment successful - $25.00 processed');
      } else {
        error('❌ Test payment failed - Card declined');
      }
    } catch (err) {
      error('Payment simulation failed');
    }
  };

  const getProviderStatus = (providerId) => {
    const status = integrationStatus[providerId];
    if (!status) return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    if (status.connected && status.healthy) {
      return { color: 'bg-green-100 text-green-800', text: 'Connected' };
    } else if (status.connected && !status.healthy) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Issues' };
    } else {
      return { color: 'bg-red-100 text-red-800', text: 'Disconnected' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Integration Manager</h1>
        <p className="text-gray-600">Configure and monitor payment processing integrations</p>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{paymentStats.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${paymentStats.monthlyVolume.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${paymentStats.averageAmount.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentStats.totalTransactions.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-6">
            {PAYMENT_PROVIDERS.map(provider => {
              const status = getProviderStatus(provider.id);
              const isPrimary = paymentConfig.primaryProvider === provider.id;
              
              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {provider.name}
                            {isPrimary && (
                              <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {provider.fees} • {provider.countries} countries • {provider.currencies} currencies
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          {status.text}
                        </Badge>
                        <Button
                          variant={provider.status === 'connected' ? 'outline' : 'default'}
                          onClick={() => connectProvider(provider.id)}
                        >
                          {provider.status === 'connected' ? 'Reconnect' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {provider.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      {integrationStatus[provider.id] && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Response Time:</span>
                            <span>{integrationStatus[provider.id].responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Check:</span>
                            <span>{new Date(integrationStatus[provider.id].lastCheck).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Regional Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {REGIONAL_METHODS.map(region => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {region.methods.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{region.adoption}</div>
                      <div className="text-sm text-gray-600">Adoption Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primary-provider">Primary Provider</Label>
                  <Select 
                    value={paymentConfig.primaryProvider} 
                    onValueChange={(value) => 
                      setPaymentConfig(prev => ({ ...prev, primaryProvider: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.icon} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="backup-provider">Backup Provider</Label>
                  <Select 
                    value={paymentConfig.backupProvider} 
                    onValueChange={(value) => 
                      setPaymentConfig(prev => ({ ...prev, backupProvider: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_PROVIDERS.filter(p => p.id !== paymentConfig.primaryProvider).map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.icon} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Retry Failed Payments</Label>
                    <p className="text-sm text-gray-600">Automatically retry failed payments with backup provider</p>
                  </div>
                  <Switch
                    checked={paymentConfig.autoRetry}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, autoRetry: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fraud Protection</Label>
                    <p className="text-sm text-gray-600">Enable advanced fraud detection and prevention</p>
                  </div>
                  <Switch
                    checked={paymentConfig.fraudProtection}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, fraudProtection: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-Currency Support</Label>
                    <p className="text-sm text-gray-600">Accept payments in multiple currencies</p>
                  </div>
                  <Switch
                    checked={paymentConfig.multiCurrency}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, multiCurrency: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Subscription Payments</Label>
                    <p className="text-sm text-gray-600">Enable recurring subscription billing</p>
                  </div>
                  <Switch
                    checked={paymentConfig.subscriptions}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, subscriptions: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Webhook Notifications</Label>
                    <p className="text-sm text-gray-600">Receive real-time payment status updates</p>
                  </div>
                  <Switch
                    checked={paymentConfig.webhooks}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, webhooks: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-600">Use test API keys for development</p>
                  </div>
                  <Switch
                    checked={paymentConfig.testMode}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, testMode: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <Button onClick={simulatePayment} className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Test Payment
                  </Button>
                  <Button variant="outline" onClick={testWebhooks} className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Test Webhooks
                  </Button>
                  <Button variant="outline" onClick={checkIntegrationStatus} className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Check Status
                  </Button>
                </div>

                {paymentConfig.testMode && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Test mode is enabled. Use test card numbers: 4242424242424242 (success), 4000000000000002 (declined)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {webhookStatus.results && (
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {webhookStatus.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {result.status}
                          </Badge>
                          <span className="text-sm text-gray-600">{result.responseTime}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Failure Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(paymentStats.failureReasons).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="capitalize">{reason.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(paymentStats.failureReasons))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentStats.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">#{index + 1}</span>
                        <div>
                          <div className="font-medium">{country.country}</div>
                          <div className="text-sm text-gray-600">{country.transactions} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${country.volume.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fraud Protection</CardTitle>
                  <Button variant="outline" onClick={runFraudAnalysis}>
                    <Shield className="w-4 h-4 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(fraudMetrics).length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">{fraudMetrics.riskScore}/10</div>
                        <div className="text-sm text-gray-600">Security Score</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-red-600">{fraudMetrics.blockedTransactions}</div>
                        <div className="text-sm text-gray-600">Blocked Attempts</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">${fraudMetrics.savedAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Amount Saved</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Top Risk Factors</h4>
                      <div className="space-y-2">
                        {fraudMetrics.topRiskFactors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{factor.factor}</span>
                            <Badge variant="outline">{factor.count} incidents</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No fraud analysis data available</p>
                    <p className="text-sm">Run analysis to view security metrics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">PCI DSS Compliance</div>
                        <div className="text-sm text-gray-600">Level 1 Service Provider</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Certified</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">SSL/TLS Encryption</div>
                        <div className="text-sm text-gray-600">256-bit encryption for all transactions</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">3D Secure Authentication</div>
                        <div className="text-sm text-gray-600">Enhanced cardholder verification</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">GDPR Compliance</div>
                        <div className="text-sm text-gray-600">Data protection and privacy</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
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