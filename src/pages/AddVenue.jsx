
import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { useNavigate } from 'react-router-dom'; // New import for navigation

const initialEventCategories = [
  'wedding', 'birthday', 'corporate', 'anniversary', 'graduation', 'other'
];

const commonAmenities = [
  'Parking', 'WiFi', 'Sound System', 'Projector', 'Air Conditioning',
  'Kitchen Access', 'Tables & Chairs', 'Dance Floor', 'Bar Area',
  'Outdoor Space', 'Photography Allowed', 'Decorations Allowed'
];

export default function AddVenue() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [eventCategories, setEventCategories] = useState(initialEventCategories);
  const [customCategory, setCustomCategory] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const toast = useToast();
  const [formError, setFormError] = useState(null); // New state for general form errors
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: [],
    price_per_hour: '',
    currency: 'USD',
    capacity: '',
    location: {
      address: '',
      city: '',
      latitude: null,
      longitude: null
    },
    images: [],
    video_url: '',
    amenities: [] // FIX: Initialize amenities as an empty array
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      // Redirect to Home page if user is not logged in or session expired
      navigate('/Home');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validates a single form field and updates the `fieldErrors` state.
   * Preserves errors for other fields.
   * @param {string} name - The name of the field to validate (e.g., 'title', 'location.address').
   * @param {*} value - The current value of the field.
   */
  const validateField = (name, value) => {
    setFieldErrors(prevErrors => {
      const currentErrors = { ...prevErrors };

      switch (name) {
        case 'title':
          if (!value.trim()) {
            currentErrors.title = getLocalizedText('title_required', currentLanguage);
          } else if (value.trim().length < 3) {
            currentErrors.title = getLocalizedText('title_min_chars', currentLanguage);
          } else {
            delete currentErrors.title;
          }
          break;
        case 'description':
          if (!value.trim()) {
            currentErrors.description = getLocalizedText('description_required', currentLanguage);
          } else if (value.trim().length < 10) {
            currentErrors.description = getLocalizedText('description_min_chars', currentLanguage);
          } else {
            delete currentErrors.description;
          }
          break;
        case 'price_per_hour':
          const price = parseFloat(value);
          if (!value) {
            currentErrors.price_per_hour = getLocalizedText('price_required', currentLanguage);
          } else if (isNaN(price) || price <= 0) {
            currentErrors.price_per_hour = getLocalizedText('price_positive_number', currentLanguage);
          } else {
            delete currentErrors.price_per_hour;
          }
          break;
        case 'capacity':
          const capacity = parseInt(value);
          if (!value) {
            currentErrors.capacity = getLocalizedText('capacity_required', currentLanguage);
          } else if (isNaN(capacity) || capacity <= 0) {
            currentErrors.capacity = getLocalizedText('capacity_positive_number', currentLanguage);
          } else {
            delete currentErrors.capacity;
          }
          break;
        case 'location.address':
          if (!value.trim()) {
            currentErrors['location.address'] = getLocalizedText('address_required', currentLanguage);
          } else if (value.trim().length < 5) {
            currentErrors['location.address'] = getLocalizedText('address_complete', currentLanguage);
          } else {
            delete currentErrors['location.address'];
          }
          break;
        case 'location.city':
          if (!value.trim()) {
            currentErrors['location.city'] = getLocalizedText('city_required', currentLanguage);
          } else {
            delete currentErrors['location.city'];
          }
          break;
        case 'category': // Handle category validation
          if (value.length === 0) {
            currentErrors.category = getLocalizedText('category_required', currentLanguage);
          } else {
            delete currentErrors.category;
          }
          break;
        default:
          break;
      }
      return currentErrors;
    });
  };

  /**
   * Generic handler for input field changes. Updates formData, marks field as touched,
   * and triggers real-time validation if conditions met.
   * @param {string} name - The name of the form field (e.g., 'title', 'location.address').
   * @param {*} value - The new value of the field.
   */
  const handleFieldChange = (name, value) => {
    // Update form data, handling nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Mark field as touched for display purposes
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Validate field in real-time if it has been touched (from previous render) OR if it now has a value.
    // This allows immediate feedback once user starts typing or after first interaction.
    if (touchedFields[name] || value) {
      validateField(name, value);
    }
  };

  const handleCategoryChange = (category, checked) => {
    let updatedCategories;
    if (checked) {
      updatedCategories = [...formData.category, category];
    } else {
      updatedCategories = formData.category.filter((c) => c !== category);
    }
    setFormData((prev) => ({
      ...prev,
      category: updatedCategories
    }));
    validateField('category', updatedCategories); // Validate category immediately after change
  };

  const addCustomCategory = () => {
    const trimmedCategory = customCategory.trim();
    if (trimmedCategory) {
      if (!eventCategories.includes(trimmedCategory)) {
        setEventCategories(prev => [...prev, trimmedCategory]);
        // Also add it to the selected categories
        handleCategoryChange(trimmedCategory, true);
        setCustomCategory('');
        toast.success(getLocalizedText('category_added_successfully', currentLanguage, { category: trimmedCategory }));
      } else {
        toast.error(getLocalizedText('category_already_exists', currentLanguage));
      }
    } else {
      toast.error(getLocalizedText('category_cannot_be_empty', currentLanguage));
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((a) => a !== amenity)
      }));
    }
  };

  const addCustomAmenity = () => {
    const trimmedAmenity = customAmenity.trim();
    if (trimmedAmenity) {
      if (!formData.amenities.includes(trimmedAmenity)) {
        setFormData((prev) => ({
          ...prev,
          amenities: [...prev.amenities, trimmedAmenity]
        }));
        setCustomAmenity('');
        toast.success(getLocalizedText('amenity_added_successfully', currentLanguage));
      } else {
        toast.error(getLocalizedText('amenity_already_exists', currentLanguage));
      }
    } else {
      toast.error(getLocalizedText('amenity_cannot_be_empty', currentLanguage));
    }
  };

  const removeCustomAmenity = (amenityToRemove) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenityToRemove)
    }));
    toast.success(getLocalizedText('amenity_removed_successfully', currentLanguage));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedUrls = [];
    for (const file of files) {
      try {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error(getLocalizedText('image_upload_failed', currentLanguage));
      }
    }

    setFormData((prev) => {
      const updatedImages = [...prev.images, ...uploadedUrls];
      // After images are added, re-validate the 'images' field if it was previously errored
      if (fieldErrors.images) {
        setFieldErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          if (updatedImages.length > 0) {
            delete newErrors.images;
          }
          return newErrors;
        });
      }
      return { ...prev, images: updatedImages };
    });
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
      // If removing the last image, set the image error
      if (updatedImages.length === 0 && touchedFields.images) {
        setFieldErrors(prevErrors => ({
          ...prevErrors,
          images: getLocalizedText('at_least_one_image_required', currentLanguage)
        }));
      }
      return { ...prev, images: updatedImages };
    });
  };

  /**
   * Performs full form validation for submission. Updates `fieldErrors` with all errors found
   * and marks all relevant fields as `touched`.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newFieldErrors = {}; // Accumulate all errors here

    // Mark all relevant fields as touched for submission to ensure all errors are displayed
    const newTouchedFieldsOnSubmit = { ...touchedFields }; // Start with existing touched fields
    newTouchedFieldsOnSubmit.title = true;
    newTouchedFieldsOnSubmit.description = true;
    newTouchedFieldsOnSubmit.price_per_hour = true;
    newTouchedFieldsOnSubmit.capacity = true;
    newTouchedFieldsOnSubmit['location.address'] = true; // For location.address
    newTouchedFieldsOnSubmit['location.city'] = true;   // For location.city
    newTouchedFieldsOnSubmit.category = true; // For category checkbox group
    newTouchedFieldsOnSubmit.images = true; // Mark images as touched for validation
    setTouchedFields(newTouchedFieldsOnSubmit);

    // Perform all validations and populate `newFieldErrors`
    if (!formData.title.trim()) {
      newFieldErrors.title = getLocalizedText('title_required', currentLanguage);
    } else if (formData.title.trim().length < 3) {
      newFieldErrors.title = getLocalizedText('title_min_chars', currentLanguage);
    }

    if (!formData.description.trim()) {
      newFieldErrors.description = getLocalizedText('description_required', currentLanguage);
    } else if (formData.description.trim().length < 10) {
      newFieldErrors.description = getLocalizedText('description_min_chars', currentLanguage);
    }

    const price = parseFloat(formData.price_per_hour);
    if (!formData.price_per_hour) {
      newFieldErrors.price_per_hour = getLocalizedText('price_required', currentLanguage);
    } else if (isNaN(price) || price <= 0) {
      newFieldErrors.price_per_hour = getLocalizedText('price_positive_number', currentLanguage);
    } else if (price > 10000) {
      newFieldErrors.price_per_hour = getLocalizedText('price_unusually_high', currentLanguage);
    }

    const capacity = parseInt(formData.capacity);
    if (!formData.capacity) {
      newFieldErrors.capacity = getLocalizedText('capacity_required', currentLanguage);
    } else if (isNaN(capacity) || capacity <= 0) {
      newFieldErrors.capacity = getLocalizedText('capacity_positive_number', currentLanguage);
    } else if (capacity > 10000) {
      newFieldErrors.capacity = getLocalizedText('capacity_unusually_high', currentLanguage);
    }

    if (!formData.location.address.trim()) {
      newFieldErrors['location.address'] = getLocalizedText('address_required', currentLanguage);
    } else if (formData.location.address.trim().length < 5) {
      newFieldErrors['location.address'] = getLocalizedText('address_complete', currentLanguage);
    }

    if (!formData.location.city.trim()) {
      newFieldErrors['location.city'] = getLocalizedText('city_required', currentLanguage);
    }

    if (formData.category.length === 0) {
      newFieldErrors.category = getLocalizedText('category_required', currentLanguage);
    }

    if (formData.images.length === 0) {
      newFieldErrors.images = getLocalizedText('at_least_one_image_required', currentLanguage);
    }

    setFieldErrors(newFieldErrors); // Update the state with all detected errors

    return Object.keys(newFieldErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true); // Set submitting true early to disable button
    setFormError(null); // Clear previous general form errors

    if (!validateForm()) {
      setFormError(getLocalizedText('fix_errors', currentLanguage)); // Set general form error
      setSubmitting(false); // Re-enable submit button if validation fails
      return;
    }

    let geocodedLocation = { ...formData.location };

    setIsGeocoding(true);
    try {
      const geocodingResult = await InvokeLLM({
        prompt: `Provide the approximate latitude and longitude for the following location: ${formData.location.address}, ${formData.location.city}. Respond only with a JSON object.`,
        response_json_schema: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
          required: ['latitude', 'longitude'],
        },
      });

      if (geocodingResult.latitude !== undefined && geocodingResult.longitude !== undefined) {
        geocodedLocation.latitude = geocodingResult.latitude;
        geocodedLocation.longitude = geocodingResult.longitude;
      } else {
        throw new Error('Geocoding failed to return valid coordinates.');
      }
    } catch (geoError) {
      console.error('Geocoding failed:', geoError);
      toast.error('Could not find coordinates for the address. Please try a more specific address.');
      setIsGeocoding(false);
      setSubmitting(false);
      return;
    }
    setIsGeocoding(false);

    try {
      const venueData = {
        ...formData,
        location: geocodedLocation,
        price_per_hour: parseFloat(formData.price_per_hour),
        capacity: parseInt(formData.capacity),
        category: Array.isArray(formData.category) ? formData.category : [],
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        owner_id: user.id,
        owner_name: user.full_name,
        owner_email: user.email, // Added owner_email
        status: 'pending_approval'
      };

      await Venue.create(venueData);
      toast.success(getLocalizedText('venue_submitted_approval', currentLanguage));
      navigate('/MyVenues'); // Use navigate to go to MyVenues page
    } catch (error) {
      console.error('Failed to create venue:', error);
      toast.error(getLocalizedText('failed_submit_venue', currentLanguage));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getLocalizedText('list_your_venue', currentLanguage)}</h1>
        <p className="text-gray-600">{getLocalizedText('share_amazing_space', currentLanguage)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('basic_information', currentLanguage)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">{getLocalizedText('venue_title', currentLanguage)} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={() => setTouchedFields(prev => ({ ...prev, title: true }))}
                className={fieldErrors.title && touchedFields.title ? 'border-red-500' : ''}
                placeholder={getLocalizedText('enter_venue_name_placeholder', currentLanguage)}
              />
              {fieldErrors.title && touchedFields.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">{getLocalizedText('description', currentLanguage)} *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => setTouchedFields(prev => ({ ...prev, description: true }))}
                className={fieldErrors.description && touchedFields.description ? 'border-red-500' : ''}
                placeholder={getLocalizedText('describe_venue_placeholder', currentLanguage)}
              />
              {fieldErrors.description && touchedFields.description && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price_per_hour">{getLocalizedText('price_per_hour_label', currentLanguage)} *</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_hour}
                  onChange={(e) => handleFieldChange('price_per_hour', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, price_per_hour: true }))}
                  className={fieldErrors.price_per_hour && touchedFields.price_per_hour ? 'border-red-500' : ''}
                  placeholder="e.g. 150"
                />
                {fieldErrors.price_per_hour && touchedFields.price_per_hour && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {fieldErrors.price_per_hour}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">{getLocalizedText('currency', currentLanguage)}</Label>
                <Select value={formData.currency} onValueChange={(value) => handleFieldChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - {getLocalizedText('usd_currency', currentLanguage)}</SelectItem>
                    <SelectItem value="EUR">EUR - {getLocalizedText('eur_currency', currentLanguage)}</SelectItem>
                    <SelectItem value="GBP">GBP - {getLocalizedText('gbp_currency', currentLanguage)}</SelectItem>
                    <SelectItem value="SAR">SAR - {getLocalizedText('sar_currency', currentLanguage)}</SelectItem>
                    <SelectItem value="AED">AED - {getLocalizedText('aed_currency', currentLanguage)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">{getLocalizedText('maximum_capacity', currentLanguage)} *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleFieldChange('capacity', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, capacity: true }))}
                  className={fieldErrors.capacity && touchedFields.capacity ? 'border-red-500' : ''}
                  placeholder="e.g. 100"
                />
                {fieldErrors.capacity && touchedFields.capacity && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {fieldErrors.capacity}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('location', currentLanguage)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">{getLocalizedText('address', currentLanguage)} *</Label>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => handleFieldChange('location.address', e.target.value)}
                onBlur={() => setTouchedFields(prev => ({ ...prev, 'location.address': true }))}
                className={fieldErrors['location.address'] && touchedFields['location.address'] ? 'border-red-500' : ''}
                placeholder={getLocalizedText('enter_full_street_address', currentLanguage)}
              />
              {fieldErrors['location.address'] && touchedFields['location.address'] && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors['location.address']}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">{getLocalizedText('city', currentLanguage)} *</Label>
              <Input
                id="city"
                value={formData.location.city}
                onChange={(e) => handleFieldChange('location.city', e.target.value)}
                onBlur={() => setTouchedFields(prev => ({ ...prev, 'location.city': true }))}
                className={fieldErrors['location.city'] && touchedFields['location.city'] ? 'border-red-500' : ''}
                placeholder={getLocalizedText('enter_city_name', currentLanguage)}
              />
              {fieldErrors['location.city'] && touchedFields['location.city'] && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {fieldErrors['location.city']}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('event_categories', currentLanguage)} *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Predefined and custom categories */}
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eventCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.category.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {getLocalizedText(category, currentLanguage)}
                      </Label>
                    </div>
                  ))}
                </div>
                {fieldErrors.category && touchedFields.category && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* Add Custom Category */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{getLocalizedText('add_custom_category', currentLanguage)}</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder={getLocalizedText('enter_category_name', currentLanguage)}
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomCategory();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomCategory} variant="outline" className="bg-slate-900 text-slate-50 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
                    <Plus className="w-4 h-4 mr-2" />
                    {getLocalizedText('add', currentLanguage)}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('amenities', currentLanguage)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Common Amenities */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{getLocalizedText('common_amenities', currentLanguage)}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <Label htmlFor={amenity}>
                        {getLocalizedText(amenity.toLowerCase().replace(/\s+/g, '_'), currentLanguage)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Amenity */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{getLocalizedText('add_custom_amenity', currentLanguage)}</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder={getLocalizedText('enter_amenity_name', currentLanguage)}
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomAmenity} variant="outline" className="bg-slate-900 text-slate-50 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
                    <Plus className="w-4 h-4 mr-2" />
                    {getLocalizedText('add', currentLanguage)}
                  </Button>
                </div>
              </div>

              {/* Selected Custom Amenities */}
              {formData.amenities.filter((amenity) => !commonAmenities.includes(amenity)).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{getLocalizedText('custom_amenities', currentLanguage)}</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.filter((amenity) => !commonAmenities.includes(amenity)).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-2">
                        {amenity}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => removeCustomAmenity(amenity)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('photos', currentLanguage)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="images">{getLocalizedText('upload_images', currentLanguage)}</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {getLocalizedText('upload_images_description', currentLanguage)}
                </p>
                {fieldErrors.images && touchedFields.images && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {fieldErrors.images}
                  </p>
                )}
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2">{getLocalizedText('main_photo', currentLanguage)}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video URL */}
        <Card>
          <CardHeader>
            <CardTitle>{getLocalizedText('video_tour_optional', currentLanguage)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="video_url">{getLocalizedText('youtube_vimeo_url', currentLanguage)}</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => handleFieldChange('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {getLocalizedText('video_description', currentLanguage)}
              </p>
            </div>
          </CardContent>
        </Card>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {getLocalizedText('cancel', currentLanguage)}
          </Button>
          <Button type="submit" disabled={submitting || isGeocoding}>
            {isGeocoding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Geocoding Address...
              </>
            ) : submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getLocalizedText('submitting_approval', currentLanguage)}
              </>
            ) : (
              getLocalizedText('submit_for_approval', currentLanguage)
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
