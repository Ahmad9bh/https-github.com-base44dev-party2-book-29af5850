import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, Users, FileText, AlertTriangle, Phone } from 'lucide-react';
import { User } from '@/api/entities';
import VerificationSystem from '@/components/safety/VerificationSystem';
import InsuranceIntegration from '@/components/safety/InsuranceIntegration';
import LegalCompliance from '@/components/safety/LegalCompliance';
import EmergencyProtocols from '@/components/safety/EmergencyProtocols';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';

export default function TrustSafety() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState({
    overall: 85,
    verification: 90,
    compliance: 95,
    safety: 80,
    insurance: 70
  });
  const { success, error } = useToast();

  useEffect(() => {
    loadTrustSafetyData();
  }, []);

  const loadTrustSafetyData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      // Calculate trust scores based on user data
      calculateTrustScores(userData);
      
      success('Trust & Safety data loaded');
    } catch (err) {
      console.error('Failed to load trust & safety data:', err);
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrustScores = (userData) => {
    let scores = {
      verification: 0,
      compliance: 95, // Platform compliance is high
      safety: 80, // Base safety score
      insurance: 0
    };

    // Calculate verification score
    let verificationChecks = 0;
    let verificationTotal = 0;

    if (userData.identity_verification_status === 'verified') {
      verificationChecks += 30;
    }
    verificationTotal += 30;

    if (userData.user_type === 'venue_owner') {
      if (userData.business_verification_status === 'verified') {
        verificationChecks += 25;
      }
      verificationTotal += 25;

      if (userData.property_verification_status === 'verified') {
        verificationChecks += 25;
      }
      verificationTotal += 25;

      if (userData.background_check_status === 'verified') {
        verificationChecks += 20;
      }
      verificationTotal += 20;
    }

    scores.verification = verificationTotal > 0 ? Math.round((verificationChecks / verificationTotal) * 100) : 0;

    // Calculate insurance score (mock - would be based on actual policies)
    scores.insurance = userData.user_type === 'venue_owner' ? 70 : 100;

    // Calculate overall score
    const weights = {
      verification: 0.3,
      compliance: 0.2,
      safety: 0.3,
      insurance: 0.2
    };

    scores.overall = Math.round(
      scores.verification * weights.verification +
      scores.compliance * weights.compliance +
      scores.safety * weights.safety +
      scores.insurance * weights.insurance
    );

    setTrustScore(scores);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trust & Safety Center</h1>
        <p className="text-gray-600">
          Comprehensive verification, compliance, and safety management for the Party2Go platform
        </p>
      </div>

      {/* Trust Score Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Trust Score Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(trustScore.overall)}`}>
                {trustScore.overall}
              </div>
              <div className="text-sm text-gray-600 mb-2">Overall Trust Score</div>
              <Progress value={trustScore.overall} className="w-full" />
              <Badge className={getScoreBadge(trustScore.overall)} variant="secondary">
                {trustScore.overall >= 90 ? 'Excellent' : 
                 trustScore.overall >= 75 ? 'Good' : 
                 trustScore.overall >= 60 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(trustScore.verification)}`}>
                {trustScore.verification}
              </div>
              <div className="text-sm text-gray-600 mb-2">Verification</div>
              <Progress value={trustScore.verification} className="w-full" />
              <CheckCircle className="w-5 h-5 mx-auto mt-2 text-gray-400" />
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(trustScore.compliance)}`}>
                {trustScore.compliance}
              </div>
              <div className="text-sm text-gray-600 mb-2">Compliance</div>
              <Progress value={trustScore.compliance} className="w-full" />
              <FileText className="w-5 h-5 mx-auto mt-2 text-gray-400" />
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(trustScore.safety)}`}>
                {trustScore.safety}
              </div>
              <div className="text-sm text-gray-600 mb-2">Safety</div>
              <Progress value={trustScore.safety} className="w-full" />
              <AlertTriangle className="w-5 h-5 mx-auto mt-2 text-gray-400" />
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(trustScore.insurance)}`}>
                {trustScore.insurance}
              </div>
              <div className="text-sm text-gray-600 mb-2">Insurance</div>
              <Progress value={trustScore.insurance} className="w-full" />
              <Shield className="w-5 h-5 mx-auto mt-2 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Safety Tabs */}
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Legal Compliance
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Protocols
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="mt-6">
          <VerificationSystem userType={user?.user_type} />
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <InsuranceIntegration />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <LegalCompliance />
        </TabsContent>

        <TabsContent value="emergency" className="mt-6">
          <EmergencyProtocols />
        </TabsContent>
      </Tabs>
    </div>
  );
}