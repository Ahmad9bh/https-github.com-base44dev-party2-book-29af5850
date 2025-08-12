import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Shield, Globe, Scale, CheckCircle, AlertTriangle, Download, Eye, Calendar, Users } from 'lucide-react';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/toast';

const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    region: 'European Union',
    status: 'compliant',
    lastAudit: '2024-01-15',
    nextAudit: '2024-07-15',
    requirements: [
      'Data consent management',
      'Right to be forgotten',
      'Data portability',
      'Privacy by design',
      'Data breach notification'
    ]
  },
  {
    id: 'ccpa',
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    region: 'California, USA',
    status: 'compliant',
    lastAudit: '2024-02-01',
    nextAudit: '2024-08-01',
    requirements: [
      'Consumer rights disclosure',
      'Opt-out mechanisms',
      'Data sale transparency',
      'Non-discrimination policies'
    ]
  },
  {
    id: 'pdpl',
    name: 'PDPL',
    fullName: 'Personal Data Protection Law',
    region: 'Saudi Arabia',
    status: 'in_progress',
    lastAudit: null,
    nextAudit: '2024-06-01',
    requirements: [
      'Data localization',
      'Consent requirements',
      'Cross-border transfers',
      'Data retention policies'
    ]
  },
  {
    id: 'uae_dp',
    name: 'UAE DPL',
    fullName: 'UAE Data Protection Law',
    region: 'United Arab Emirates',
    status: 'compliant',
    lastAudit: '2024-01-20',
    nextAudit: '2024-07-20',
    requirements: [
      'Data controller registration',
      'Subject access rights',
      'Data transfer agreements',
      'Incident reporting'
    ]
  }
];

const LEGAL_DOCUMENTS = [
  {
    id: 'terms_of_service',
    title: 'Terms of Service',
    lastUpdated: '2024-01-15',
    version: '3.2',
    status: 'active',
    applies_to: ['all_users'],
    languages: ['en', 'ar']
  },
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    lastUpdated: '2024-01-15',
    version: '2.8',
    status: 'active',
    applies_to: ['all_users'],
    languages: ['en', 'ar']
  },
  {
    id: 'cookie_policy',
    title: 'Cookie Policy',
    lastUpdated: '2024-01-10',
    version: '1.5',
    status: 'active',
    applies_to: ['all_users'],
    languages: ['en', 'ar']
  },
  {
    id: 'vendor_agreement',
    title: 'Venue Owner Agreement',
    lastUpdated: '2024-02-01',
    version: '4.1',
    status: 'active',
    applies_to: ['venue_owners'],
    languages: ['en', 'ar']
  },
  {
    id: 'booking_terms',
    title: 'Booking Terms & Conditions',
    lastUpdated: '2024-01-20',
    version: '2.3',
    status: 'active',
    applies_to: ['customers'],
    languages: ['en', 'ar']
  }
];

const AUDIT_LOGS = [
  {
    id: 'audit_001',
    date: '2024-01-15',
    type: 'gdpr_compliance',
    auditor: 'DataGuard Legal',
    result: 'passed',
    findings: 0,
    recommendations: 2
  },
  {
    id: 'audit_002',
    date: '2024-02-01',
    type: 'security_assessment',
    auditor: 'CyberSec Pro',
    result: 'passed',
    findings: 1,
    recommendations: 3
  },
  {
    id: 'audit_003',
    date: '2024-01-20',
    type: 'uae_compliance',
    auditor: 'Emirates Legal',
    result: 'passed',
    findings: 0,
    recommendations: 1
  }
];

export default function LegalCompliance() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState('gdpr');
  const [complianceStats, setComplianceStats] = useState({
    overallScore: 92,
    compliantFrameworks: 3,
    totalFrameworks: 4,
    pendingActions: 2,
    lastAuditDate: '2024-02-01'
  });
  const { success, error } = useToast();

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      // In a real application, this would load actual compliance data
      success('Compliance data loaded successfully');
    } catch (err) {
      console.error('Failed to load compliance data:', err);
      error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditResultColor = (result) => {
    switch (result) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const downloadDocument = (documentId, language = 'en') => {
    // In a real application, this would download the actual document
    success(`Downloading ${documentId} in ${language}`);
  };

  const viewDocument = (documentId, language = 'en') => {
    // In a real application, this would open the document in a new tab
    window.open(`/legal/${documentId}?lang=${language}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Legal Compliance Dashboard
          </CardTitle>
          <p className="text-gray-600">
            Monitor and maintain compliance with global data protection and legal requirements
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {complianceStats.overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Compliance</div>
              <Progress value={complianceStats.overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {complianceStats.compliantFrameworks}/{complianceStats.totalFrameworks}
              </div>
              <div className="text-sm text-gray-600">Frameworks Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {complianceStats.pendingActions}
              </div>
              <div className="text-sm text-gray-600">Pending Actions</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Last Audit</div>
              <div className="font-medium">
                {new Date(complianceStats.lastAuditDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="frameworks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="documents">Legal Documents</TabsTrigger>
              <TabsTrigger value="audits">Audit History</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="frameworks" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compliance Frameworks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMPLIANCE_FRAMEWORKS.map(framework => (
                    <Card key={framework.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{framework.name}</h4>
                            <p className="text-sm text-gray-600">{framework.fullName}</p>
                            <p className="text-xs text-gray-500">{framework.region}</p>
                          </div>
                          <Badge className={getStatusColor(framework.status)}>
                            {framework.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h5 className="text-sm font-medium">Key Requirements:</h5>
                          <ul className="text-xs space-y-1">
                            {framework.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          {framework.lastAudit && (
                            <p>Last Audit: {new Date(framework.lastAudit).toLocaleDateString()}</p>
                          )}
                          <p>Next Audit: {new Date(framework.nextAudit).toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Legal Documents</h3>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {LEGAL_DOCUMENTS.map(doc => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{doc.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>Version {doc.version}</span>
                              <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                              <Badge variant="outline">
                                {doc.applies_to.join(', ').replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Available in:</span>
                          {doc.languages.map(lang => (
                            <div key={lang} className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDocument(doc.id, lang)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View ({lang.toUpperCase()})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDocument(doc.id, lang)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audits" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compliance Audit History</h3>
                
                <div className="space-y-4">
                  {AUDIT_LOGS.map(audit => (
                    <Card key={audit.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{audit.type.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-600">Conducted by: {audit.auditor}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(audit.date).toLocaleDateString()}</p>
                          </div>
                          <Badge className={`${getAuditResultColor(audit.result)} bg-transparent border`}>
                            {audit.result.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Findings</p>
                            <p className="font-medium text-red-600">{audit.findings}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Recommendations</p>
                            <p className="font-medium text-yellow-600">{audit.recommendations}</p>
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">
                              <FileText className="w-3 h-3 mr-1" />
                              View Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Privacy Controls & Data Management</h3>
                
                {/* Data Retention Policies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data Retention Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">User Data</h4>
                        <p className="text-sm text-gray-600 mb-2">Personal information and account data</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Retention: 7 years after account closure</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Transaction Data</h4>
                        <p className="text-sm text-gray-600 mb-2">Booking and payment records</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Retention: 10 years for tax compliance</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Marketing Data</h4>
                        <p className="text-sm text-gray-600 mb-2">Analytics and communication preferences</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Retention: Until consent withdrawn</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Log Data</h4>
                        <p className="text-sm text-gray-600 mb-2">System logs and security records</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Retention: 2 years</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Rights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Privacy Rights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium">Data Access</h4>
                        <p className="text-sm text-gray-600">Users can request copies of their data</p>
                        <Badge className="mt-2" variant="outline">Automated</Badge>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium">Data Correction</h4>
                        <p className="text-sm text-gray-600">Users can update incorrect information</p>
                        <Badge className="mt-2" variant="outline">Self-Service</Badge>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <h4 className="font-medium">Data Deletion</h4>
                        <p className="text-sm text-gray-600">Right to be forgotten implementation</p>
                        <Badge className="mt-2" variant="outline">Manual Review</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consent Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Consent Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        Consent management system is active and compliant with GDPR, CCPA, and regional privacy laws.
                        Users can modify their consent preferences at any time through their account settings.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Cookie Consent Rate</p>
                        <p className="text-2xl font-bold text-green-600">94.2%</p>
                      </div>
                      <div>
                        <p className="font-medium">Marketing Opt-in Rate</p>
                        <p className="text-2xl font-bold text-blue-600">67.8%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}