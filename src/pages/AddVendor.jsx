
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  X, 
  Plus, 
  Building2, 
  MapPin, 
  DollarSign,
  Users,
  Award,
  FileText,
  Camera
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const SERVICE_TYPES = [
  { value: 'catering', label: 'Catering & Food Service' },
  { value: 'photography', label: 'Photography & Videography' },
  { value: 'dj', label: 'DJ & Music' },
  { value: 'decorations', label: 'Decorations & Flowers' },
  { value: 'entertainment', label: 'Entertainment & Performers' },
  { value: 'planning', label: 'Event Planning & Coordination' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'security', label: 'Security Services' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'other', label: 'Other Services' }
];

const PRICING_MODELS = [
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_event', label: 'Per Event' },
  { value: 'per_person', label: 'Per Person' },
  { value: 'custom', label: 'Custom Pricing' }
];

const COMMON_EQUIPMENT = {
  catering: ['Commercial Kitchen', 'Serving Equipment', 'Tables & Linens', 'Warming Equipment'],
  photography: ['Professional Cameras', 'Lighting Equipment', 'Tripods', 'Editing Software'],
  dj: ['Sound System', 'Microphones', 'Lighting', 'Music Library'],
  decorations: ['Flower Arrangements', 'Centerpieces', 'Backdrops', 'Linens'],
  entertainment: ['Costumes', 'Props', 'Sound Equipment', 'Staging'],
  planning: ['Planning Software', 'Vendor Network', 'Timeline Management', 'Budget Tracking'],
  transportation: ['Vehicles', 'Insurance', 'GPS Systems', 'Communication Equipment'],
  security: ['Uniforms', 'Communication Equipment', 'Surveillance', 'Access Control'],
  cleaning: ['Professional Equipment', 'Eco-friendly Supplies', 'Waste Management', 'Sanitization']
};

export default function AddVendor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [vendorData, setVendorData] = useState({
    company_name: '',
    service_type: '',
    description: '',
    specialties: [],
    city: '',
    country: '',
    service_areas: [],
    contact_email: '',
    contact_phone: '',
    website_url: '',
    base_price: '',
    price_range_min: '',
    price_range_max: '',
    currency: 'USD',
    pricing_model: 'per_event',
    minimum_booking: '',
    advance_booking_days: 7,
    years_in_business: '',
    team_size: '',
    equipment_provided: [],
    certifications: [],
    insurance_coverage: false,
    profile_image_url: '',
    gallery_image_urls: [],
    portfolio_urls: [],
    cancellation_policy: '',
    terms_conditions: ''
  });

  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');
  const [customCertification, setCustomCertification] = useState('');
  const [customServiceArea, setCustomServiceArea] = useState('');
  const [customPortfolioUrl, setCustomPortfolioUrl] = useState('');

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Pre-fill some fields from user data
      setVendorData(prev => ({
        ...prev,
        contact_email: userData.email || '',
        country: userData.country || '',
      }));
    } catch (error) {
      // Redirect to login
      await User.loginWithRedirect(window.location.href);
      return;
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, value, customField, setCustomField) => {
    if (!value.trim()) return;
    
    setVendorData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setCustomField('');
  };

  const handleArrayRemove = (field, index) => {
    setVendorData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file, isGallery = false) => {
    try {
      setUploadingImage(true);
      const { file_url } = await UploadFile({ file });
      
      if (isGallery) {
        setVendorData(prev => ({
          ...prev,
          gallery_image_urls: [...prev.gallery_image_urls, file_url]
        }));
      } else {
        setVendorData(prev => ({ ...prev, profile_image_url: file_url }));
      }
      
      toast({
        title: "Image uploaded successfully",
        description: isGallery ? "Added to gallery" : "Profile image updated"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!vendorData.company_name.trim()) {
        throw new Error('Company name is required');
      }
      if (!vendorData.service_type) {
        throw new Error('Service type is required');
      }
      if (!vendorData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!vendorData.city.trim()) {
        throw new Error('City is required');
      }

      const vendor = await Vendor.create({
        ...vendorData,
        user_id: user.id,
        status: 'pending_approval'
      });

      toast({
        title: "Vendor profile submitted!",
        description: "Your profile is under review and will be published soon.",
      });

      // Redirect to vendor profile or dashboard
      setTimeout(() => {
        navigate('/MyVendorProfile');
      }, 2000);

    } catch (error) {
      console.error('Failed to create vendor profile:', error);
      toast({
        title: "Failed to submit profile",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Vendor Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Connect with thousands of event organizers and grow your business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={vendorData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Your company or business name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select 
                    value={vendorData.service_type} 
                    onValueChange={(value) => handleInputChange('service_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={vendorData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your services, experience, and what makes you unique..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {vendorData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleArrayRemove('specialties', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    placeholder="Add a specialty..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayAdd('specialties', customSpecialty, customSpecialty, setCustomSpecialty);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleArrayAdd('specialties', customSpecialty, customSpecialty, setCustomSpecialty)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={vendorData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Primary city where you're based"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={vendorData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Service Areas</Label>
                <p className="text-sm text-gray-600 mb-3">
                  List all cities/areas where you provide services
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {vendorData.service_areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleArrayRemove('service_areas', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customServiceArea}
                    onChange={(e) => setCustomServiceArea(e.target.value)}
                    placeholder="Add a service area..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayAdd('service_areas', customServiceArea, customServiceArea, setCustomServiceArea);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleArrayAdd('service_areas', customServiceArea, customServiceArea, setCustomServiceArea)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pricing_model">Pricing Model</Label>
                  <Select 
                    value={vendorData.pricing_model} 
                    onValueChange={(value) => handleInputChange('pricing_model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How do you charge?" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_MODELS.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={vendorData.currency} 
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="base_price">Starting Price</Label>
                  <Input
                    id="base_price"
                    type="number"
                    value={vendorData.base_price}
                    onChange={(e) => handleInputChange('base_price', e.target.value)}
                    placeholder="Starting from..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="price_range_min">Price Range Min</Label>
                  <Input
                    id="price_range_min"
                    type="number"
                    value={vendorData.price_range_min}
                    onChange={(e) => handleInputChange('price_range_min', e.target.value)}
                    placeholder="Minimum price"
                  />
                </div>

                <div>
                  <Label htmlFor="price_range_max">Price Range Max</Label>
                  <Input
                    id="price_range_max"
                    type="number"
                    value={vendorData.price_range_max}
                    onChange={(e) => handleInputChange('price_range_max', e.target.value)}
                    placeholder="Maximum price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minimum_booking">Minimum Booking</Label>
                  <Input
                    id="minimum_booking"
                    type="number"
                    value={vendorData.minimum_booking}
                    onChange={(e) => handleInputChange('minimum_booking', e.target.value)}
                    placeholder="Minimum booking amount"
                  />
                </div>

                <div>
                  <Label htmlFor="advance_booking_days">Advance Booking (Days)</Label>
                  <Input
                    id="advance_booking_days"
                    type="number"
                    value={vendorData.advance_booking_days}
                    onChange={(e) => handleInputChange('advance_booking_days', e.target.value)}
                    placeholder="Days in advance required"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience & Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Experience & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="years_in_business">Years in Business</Label>
                  <Input
                    id="years_in_business"
                    type="number"
                    value={vendorData.years_in_business}
                    onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                    placeholder="How long have you been in business?"
                  />
                </div>

                <div>
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    value={vendorData.team_size}
                    onChange={(e) => handleInputChange('team_size', e.target.value)}
                    placeholder="Number of team members"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance_coverage"
                  checked={vendorData.insurance_coverage}
                  onCheckedChange={(checked) => handleInputChange('insurance_coverage', checked)}
                />
                <Label htmlFor="insurance_coverage">
                  I have professional insurance coverage
                </Label>
              </div>

              {/* Equipment */}
              <div>
                <Label>Equipment & Resources</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {vendorData.equipment_provided.map((equipment, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {equipment}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleArrayRemove('equipment_provided', index)}
                      />
                    </Badge>
                  ))}
                </div>
                
                {/* Suggested equipment based on service type */}
                {COMMON_EQUIPMENT[vendorData.service_type] && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Common equipment for {vendorData.service_type}:</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_EQUIPMENT[vendorData.service_type].map((equipment) => (
                        <Button
                          key={equipment}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!vendorData.equipment_provided.includes(equipment)) {
                              handleArrayAdd('equipment_provided', equipment, '', () => {});
                            }
                          }}
                          disabled={vendorData.equipment_provided.includes(equipment)}
                        >
                          {equipment}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    placeholder="Add equipment/resource..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayAdd('equipment_provided', customEquipment, customEquipment, setCustomEquipment);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleArrayAdd('equipment_provided', customEquipment, customEquipment, setCustomEquipment)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {vendorData.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleArrayRemove('certifications', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customCertification}
                    onChange={(e) => setCustomCertification(e.target.value)}
                    placeholder="Add certification..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayAdd('certifications', customCertification, customCertification, setCustomCertification);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleArrayAdd('certifications', customCertification, customCertification, setCustomCertification)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images & Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Images & Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div>
                <Label>Profile Image</Label>
                <div className="mt-2">
                  {vendorData.profile_image_url ? (
                    <div className="relative w-32 h-32">
                      <img 
                        src={vendorData.profile_image_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('profile_image_url', '')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(e.target.files[0], false);
                          }
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <Label>Gallery Images</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Showcase your work with high-quality images
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vendorData.gallery_image_urls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVendorData(prev => ({
                            ...prev,
                            gallery_image_urls: prev.gallery_image_urls.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0], true);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Portfolio URLs */}
              <div>
                <Label>Portfolio Links</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Links to your external portfolio, social media, or website
                </p>
                <div className="space-y-2 mb-3">
                  {vendorData.portfolio_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={url} disabled />
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleArrayRemove('portfolio_urls', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customPortfolioUrl}
                    onChange={(e) => setCustomPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayAdd('portfolio_urls', customPortfolioUrl, customPortfolioUrl, setCustomPortfolioUrl);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleArrayAdd('portfolio_urls', customPortfolioUrl, customPortfolioUrl, setCustomPortfolioUrl)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contact & Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={vendorData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="business@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={vendorData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={vendorData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  value={vendorData.cancellation_policy}
                  onChange={(e) => handleInputChange('cancellation_policy', e.target.value)}
                  placeholder="Describe your cancellation and refund policy..."
                />
              </div>

              <div>
                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_conditions"
                  value={vendorData.terms_conditions}
                  onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                  placeholder="Any specific terms and conditions for your services..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={submitting}
              className="px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
