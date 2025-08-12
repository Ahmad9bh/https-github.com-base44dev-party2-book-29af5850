import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, Camera, FileText, Phone, MapPin, Building, User, Clock, Star } from 'lucide-react';
import { User as UserEntity } from '@/api/entities';
import { Venue } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const VERIFICATION_TYPES = [
  {
    type: 'identity',
    title: 'Identity Verification',
    description: 'Verify your identity with government-issued ID',
    required: true,
    fields: ['full_name', 'date_of_birth', 'id_document', 'selfie_photo'],
    icon: User
  },
  {
    type: 'business',
    title: 'Business Verification',
    description: 'Verify your business registration and permits',
    required: true,
    fields: ['business_name', 'registration_number', 'business_license', 'tax_id'],
    icon: Building
  },
  {
    type: 'property',
    title: 'Property Verification',
    description: 'Verify ownership or authorization to list property',
    required: true,
    fields: ['property_deed', 'rental_agreement', 'authorization_letter'],
    icon: MapPin
  },
  {
    type: 'background',
    title: 'Background Check',
    description: 'Optional background verification for enhanced trust',
    required: false,
    fields: ['criminal_background', 'references'],
    icon: Shield
  }
];

export default function VerificationSystem({ userType = 'venue_owner' }) {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [verificationData, setVerificationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [selectedVerificationType, setSelectedVerificationType] = useState('identity');
  const { success, error } = useToast();

  const [verificationStats, setVerificationStats] = useState({
    identityVerified: 0,
    businessVerified: 0,
    propertyVerified: 0,
    overallScore: 0
  });

  useEffect(() => {
    loadVerificationData();
  }, []);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      const userData = await UserEntity.me();
      setUser(userData);

      if (userData.user_type === 'venue_owner') {
        const userVenues = await Venue.filter({ owner_id: userData.id });
        setVenues(userVenues);
      }

      // Initialize verification data from user profile
      const existingData = {
        identity: {
          full_name: userData.full_name || '',
          date_of_birth: userData.date_of_birth || '',
          id_document: userData.id_document_url || '',
          selfie_photo: userData.selfie_photo_url || '',
          status: userData.identity_verification_status || 'pending'
        },
        business: {
          business_name: userData.company_name || '',
          registration_number: userData.business_registration || '',
          business_license: userData.business_license_url || '',
          tax_id: userData.tax_id || '',
          status: userData.business_verification_status || 'pending'
        },
        property: {
          property_deed: userData.property_deed_url || '',
          rental_agreement: userData.rental_agreement_url || '',
          authorization_letter: userData.authorization_letter_url || '',
          status: userData.property_verification_status || 'pending'
        },
        background: {
          criminal_background: userData.background_check_url || '',
          references: userData.references || '',
          status: userData.background_check_status || 'not_requested'
        }
      };

      setVerificationData(existingData);
      calculateVerificationStats(existingData);
    } catch (err) {
      console.error('Failed to load verification data:', err);
      error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const calculateVerificationStats = (data) => {
    const stats = {
      identityVerified: data.identity?.status === 'verified' ? 100 : 0,
      businessVerified: data.business?.status === 'verified' ? 100 : 0,
      propertyVerified: data.property?.status === 'verified' ? 100 : 0,
      overallScore: 0
    };

    const totalPossible = userType === 'venue_owner' ? 300 : 100;
    const currentScore = stats.identityVerified + stats.businessVerified + stats.propertyVerified;
    stats.overallScore = Math.round((currentScore / totalPossible) * 100);

    setVerificationStats(stats);
  };

  const handleFileUpload = async (verificationType, fieldName, file) => {
    try {
      setUploading({ ...uploading, [`${verificationType}_${fieldName}`]: true });
      
      // Validate file type and size
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        error('Please upload an image or PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        error('File size must be less than 10MB');
        return;
      }

      const { file_url } = await UploadFile({ file });
      
      setVerificationData(prev => ({
        ...prev,
        [verificationType]: {
          ...prev[verificationType],
          [fieldName]: file_url
        }
      }));

      success('File uploaded successfully');
    } catch (err) {
      console.error('Failed to upload file:', err);
      error('Failed to upload file');
    } finally {
      setUploading({ ...uploading, [`${verificationType}_${fieldName}`]: false });
    }
  };

  const handleInputChange = (verificationType, fieldName, value) => {
    setVerificationData(prev => ({
      ...prev,
      [verificationType]: {
        ...prev[verificationType],
        [fieldName]: value
      }
    }));
  };

  const submitVerificationRequest = async (verificationType) => {
    try {
      const typeData = verificationData[verificationType];
      const verificationTypeConfig = VERIFICATION_TYPES.find(t => t.type === verificationType);
      
      // Validate required fields
      const missingFields = verificationTypeConfig.fields.filter(field => !typeData[field]);
      if (missingFields.length > 0) {
        error(`Please complete all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Update user with verification data
      const updateData = {
        ...typeData,
        [`${verificationType}_verification_status`]: 'under_review',
        [`${verificationType}_submitted_at`]: new Date().toISOString()
      };

      await UserEntity.updateMyUserData(updateData);
      
      // Update local state
      setVerificationData(prev => ({
        ...prev,
        [verificationType]: {
          ...prev[verificationType],
          status: 'under_review'
        }
      }));

      success(`${verificationTypeConfig.title} submitted for review`);
    } catch (err) {
      console.error('Failed to submit verification:', err);
      error('Failed to submit verification request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'not_requested': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'under_review': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderFileUpload = (verificationType, fieldName, label, accept = "image/*,application/pdf") => {
    const uploadKey = `${verificationType}_${fieldName}`;
    const isUploading = uploading[uploadKey];
    const fileUrl = verificationData[verificationType]?.[fieldName];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {fileUrl ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">File uploaded</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                View
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <input
                type="file"
                id={uploadKey}
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileUpload(verificationType, fieldName, file);
                }}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor={uploadKey}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : 'Click to upload file'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Verification Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Verification Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Complete your verification to build trust with customers
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {verificationStats.overallScore}%
              </div>
              <div className="text-sm text-gray-600">Trust Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VERIFICATION_TYPES.slice(0, 3).map(type => {
              const status = verificationData[type.type]?.status || 'pending';
              const Icon = type.icon;
              
              return (
                <div key={type.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    {getStatusIcon(status)}
                  </div>
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <Badge className={getStatusColor(status)} variant="secondary">
                    {status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>

          {verificationStats.overallScore < 100 && (
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Complete your verification to unlock full platform features and increase customer trust.
                {userType === 'venue_owner' && ' Verified venues get 3x more bookings on average.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verification Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedVerificationType} onValueChange={setSelectedVerificationType}>
            <TabsList className="grid w-full grid-cols-4">
              {VERIFICATION_TYPES.map(type => {
                const status = verificationData[type.type]?.status || 'pending';
                return (
                  <TabsTrigger key={type.type} value={type.type} className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.title.split(' ')[0]}
                    {status === 'verified' && <CheckCircle className="w-3 h-3 text-green-600" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {VERIFICATION_TYPES.map(type => (
              <TabsContent key={type.type} value={type.type} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{type.title}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                  <Badge className={getStatusColor(verificationData[type.type]?.status || 'pending')}>
                    {(verificationData[type.type]?.status || 'pending').replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Identity Verification Fields */}
                  {type.type === 'identity' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Full Legal Name</Label>
                          <Input
                            value={verificationData.identity?.full_name || ''}
                            onChange={(e) => handleInputChange('identity', 'full_name', e.target.value)}
                            placeholder="Enter your full legal name"
                          />
                        </div>
                        <div>
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={verificationData.identity?.date_of_birth || ''}
                            onChange={(e) => handleInputChange('identity', 'date_of_birth', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {renderFileUpload('identity', 'id_document', 'Government ID (Passport, Driver\'s License, etc.)')}
                        {renderFileUpload('identity', 'selfie_photo', 'Selfie Photo with ID', 'image/*')}
                      </div>
                    </>
                  )}

                  {/* Business Verification Fields */}
                  {type.type === 'business' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Business/Company Name</Label>
                          <Input
                            value={verificationData.business?.business_name || ''}
                            onChange={(e) => handleInputChange('business', 'business_name', e.target.value)}
                            placeholder="Enter business name"
                          />
                        </div>
                        <div>
                          <Label>Registration Number</Label>
                          <Input
                            value={verificationData.business?.registration_number || ''}
                            onChange={(e) => handleInputChange('business', 'registration_number', e.target.value)}
                            placeholder="Business registration number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Tax ID/VAT Number</Label>
                        <Input
                          value={verificationData.business?.tax_id || ''}
                          onChange={(e) => handleInputChange('business', 'tax_id', e.target.value)}
                          placeholder="Tax identification number"
                        />
                      </div>

                      {renderFileUpload('business', 'business_license', 'Business License/Registration Certificate')}
                    </>
                  )}

                  {/* Property Verification Fields */}
                  {type.type === 'property' && (
                    <div className="space-y-4">
                      <Alert>
                        <MapPin className="w-4 h-4" />
                        <AlertDescription>
                          You must provide proof of ownership or authorization for each property you list.
                          Choose the document that best applies to your situation.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 gap-4">
                        {renderFileUpload('property', 'property_deed', 'Property Deed/Title (If you own the property)')}
                        {renderFileUpload('property', 'rental_agreement', 'Rental/Lease Agreement (If you rent the property)')}
                        {renderFileUpload('property', 'authorization_letter', 'Authorization Letter (If representing property owner)')}
                      </div>
                    </div>
                  )}

                  {/* Background Check Fields */}
                  {type.type === 'background' && (
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="w-4 h-4" />
                        <AlertDescription>
                          Background verification is optional but recommended for enhanced trust.
                          This helps customers feel more confident booking with you.
                        </AlertDescription>
                      </Alert>

                      {renderFileUpload('background', 'criminal_background', 'Criminal Background Check (Optional)')}
                      
                      <div>
                        <Label>Professional References (Optional)</Label>
                        <Textarea
                          value={verificationData.background?.references || ''}
                          onChange={(e) => handleInputChange('background', 'references', e.target.value)}
                          placeholder="Provide contact information for 2-3 professional references..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  {verificationData[type.type]?.status === 'verified' ? (
                    <Badge className="bg-green-100 text-green-800 px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verified
                    </Badge>
                  ) : verificationData[type.type]?.status === 'under_review' ? (
                    <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Under Review
                    </Badge>
                  ) : (
                    <Button onClick={() => submitVerificationRequest(type.type)}>
                      Submit for Verification
                    </Button>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">For Verified Users:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Higher booking conversion rates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Priority in search results
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Trust badge on listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Access to premium features
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">Platform Security:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Fraud prevention
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Identity confirmation
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Legal compliance
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Safe transactions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}