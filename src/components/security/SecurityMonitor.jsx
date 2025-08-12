import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';
import { format } from 'date-fns';

const SecurityMonitor = ({ isAdmin = false }) => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [stats, setStats] = useState({
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedIPs: 0,
    activeThreats: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadSecurityData();
      const interval = setInterval(loadSecurityData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadSecurityData = async () => {
    try {
      // Mock security data - in real implementation, this would come from security service
      const mockEvents = [
        {
          id: 1,
          type: 'failed_login',
          severity: 'medium',
          description: 'Multiple failed login attempts from IP 192.168.1.100',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          ip: '192.168.1.100',
          user: 'john.doe@example.com'
        },
        {
          id: 2,
          type: 'suspicious_api_usage',
          severity: 'high',
          description: 'Unusual API rate limiting exceeded',
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          ip: '10.0.0.15',
          apiKey: 'pk_test_...'
        },
        {
          id: 3,
          type: 'payment_fraud_attempt',
          severity: 'critical',
          description: 'Potential payment fraud detected',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          ip: '203.0.113.1',
          amount: 5000
        }
      ];

      setSecurityEvents(mockEvents);
      setStats({
        failedLogins: 15,
        suspiciousActivity: 3,
        blockedIPs: 8,
        activeThreats: 2
      });
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'failed_login': return <Lock className="w-4 h-4" />;
      case 'suspicious_api_usage': return <Activity className="w-4 h-4" />;
      case 'payment_fraud_attempt': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedLogins}</p>
              </div>
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                <p className="text-2xl font-bold text-orange-600">{stats.suspiciousActivity}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.blockedIPs}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent security events</p>
          ) : (
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <Alert key={event.id} className="border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(event.timestamp, 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <AlertDescription className="mb-2">
                          {event.description}
                        </AlertDescription>
                        <div className="text-sm text-gray-600 space-y-1">
                          {event.ip && <div>IP: {event.ip}</div>}
                          {event.user && <div>User: {event.user}</div>}
                          {event.apiKey && <div>API Key: {event.apiKey}</div>}
                          {event.amount && <div>Amount: ${event.amount}</div>}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              View Security Logs
            </Button>
            <Button variant="outline" className="justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Manage IP Blocks
            </Button>
            <Button variant="outline" className="justify-start">
              <Activity className="w-4 h-4 mr-2" />
              API Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;