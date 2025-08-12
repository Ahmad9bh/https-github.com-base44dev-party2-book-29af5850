import React, { useState, useEffect } from 'react';
import { Vendor } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EditVendor() {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Get vendor ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const vendorId = urlParams.get('id');

  const [formData, setFormData] = useState({
    company_name: '',
    service_type: '',
    description: '',
    city: '',
    country: 'AE',
    profile_image_url: '',
    gallery_image_urls: [],
    base_price: '',
    currency: 'USD'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const serviceTypes = [
    'catering',
    'photography', 
    'decorations',
    'dj',
    'entertainment',
    'other'
  ];

  const countries = [
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' }
  ];

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (vendorId) {
        const vendorData = await Vendor.get(vendorId);
        
        // Check if user owns this vendor profile
        if (vendorData.user_id !== userData.id) {
          toast.error('You can only edit your own vendor profile.');
          window.location.href = createPageUrl('MyVendorProfile');
          return;
        }

        setVendor(vendorData);
        setFormData({
          company_name: vendorData.company_name || '',
          service_type: vendorData.service_type || '',
          description: vendorData.description || '',
          city: vendorData.city || '',
          country: vendorData.country || 'AE',
          profile_image_url: vendorData.profile_image_url || '',
          gallery_image_urls: vendorData.gallery_image_urls || [],
          base_price: vendorData.base_price?.toString() || '',
          currency: vendorData.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Failed to load vendor data:', error);
      toast.error('Failed to load vendor profile.');
      window.location.href = createPageUrl('MyVendorProfile');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    setFieldErrors(prevErrors => {
      const currentErrors = { ...prevErrors };

      switch (name) {
        case 'company_name':
          if (!value.trim()) {
            currentErrors.company_name = 'Company name is required';
          } else if (value.trim().length < 2) {
            currentErrors.company_name = 'Company name must be at least 2 characters';
          } else {
            delete currentErrors.company_name;
          }
          break;
        case 'description':
          if (!value.trim()) {
            currentErrors.description = 'Description is required';
          } else if (value.trim().length < 20) {
            currentErrors.description = 'Description must be at least 20 characters';
          } else {
            delete currentErrors.description;
          }
          break;
        case 'base_price':
          const price = parseFloat(value);
          if (!value) {
            currentErrors.base_price = 'Base price is required';
          } else if (isNaN(price) || price <= 0) {
            currentErrors.base_price = 'Base price must be a positive number';
          } else {
            delete currentErrors.base_price;
          }
          break;
        default:
          break;
      }
      return currentErrors;
    });
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (touchedFields[name] || value) {
      validateField(name, value);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profile_image_url: file_url }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          gallery_image_urls: [...prev.gallery_image_urls, file_url] 
        }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Image upload failed. Please try again.');
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      gallery_image_urls: prev.gallery_image_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const updateData = {
        ...formData,
        base_price: parseFloat(formData.base_price)
      };

      await Vendor.update(vendorId, updateData);
      toast.success('Vendor profile updated successfully!');
      window.location.href = createPageUrl('MyVendorProfile');
    } catch (error) {
      console.error('Failed to update vendor profile:', error);
      toast.error('Failed to update vendor profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your vendor profile? This action cannot be undone.')) {
      return;
    }

    try {
      await Vendor.update(vendorId, { status: 'inactive' });
      toast.success('Vendor profile deactivated successfully.');
      window.location.href = createPageUrl('MyVendorProfile');
    } catch (error) {
      console.error('Failed to delete vendor profile:', error);
      toast.error('Failed to delete vendor profile.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Profile Not Found</h3>
          <p className="text-gray-600 mb-6">The vendor profile you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Vendor Profile</h1>
        <p className="text-gray-600">Update your marketplace profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleFieldChange('company_name', e.target.value)}
                className={fieldErrors.company_name && touchedFields.company_name ? 'border-red-500' : ''}
                placeholder="Your company or business name"
              />
              {fieldErrors.company_name && touchedFields.company_name && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors.company_name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleFieldChange('service_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className={fieldErrors.description && touchedFields.description ? 'border-red-500' : ''}
                placeholder="Describe your services and what makes you unique..."
              />
              {fieldErrors.description && touchedFields.description && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="Your city"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price *</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => handleFieldChange('base_price', e.target.value)}
                  className={fieldErrors.base_price && touchedFields.base_price ? 'border-red-500' : ''}
                  placeholder="Starting price"
                />
                {fieldErrors.base_price && touchedFields.base_price && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {fieldErrors.base_price}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleFieldChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile_image">Profile Image</Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profile')}
              />
              {formData.profile_image_url && (
                <div className="mt-3">
                  <img
                    src={formData.profile_image_url}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="gallery_images">Gallery Images</Label>
              <Input
                id="gallery_images"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'gallery')}
              />
              {formData.gallery_image_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.gallery_image_urls.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Profile
          </Button>
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}