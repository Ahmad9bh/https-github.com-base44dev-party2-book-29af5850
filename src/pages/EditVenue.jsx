
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities'; // Booking entity import is kept as it's used in delete logic
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Added Alert components
import { Save, Trash2, X, PlusCircle, Image as ImageIcon, Video, Mountain } from 'lucide-react'; // Updated icons
import { useToast } from '@/components/ui/use-toast'; // Updated toast import path
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VenueCalendar from '@/components/venues/VenueCalendar';
import PricingManager from '@/components/venues/PricingManager';
import { getLocalizedText } from '@/components/common/FormatUtils'; // Added Localization utility
import { useLocalization } from '@/components/common/LocalizationContext'; // Added Localization context

// Transformed from simple array to objects for better handling in checkboxes
const eventCategoriesList = [
  { id: 'wedding', name: 'Wedding' },
  { id: 'birthday', name: 'Birthday' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'anniversary', name: 'Anniversary' },
  { id: 'graduation', name: 'Graduation' },
  { id: 'other', name: 'Other' }
];

const commonAmenitiesList = [
  'Parking', 'WiFi', 'Sound System', 'Projector', 'Air Conditioning',
  'Kitchen Access', 'Tables & Chairs', 'Dance Floor', 'Bar Area',
  'Outdoor Space', 'Photography Allowed', 'Decorations Allowed'
];

export default function EditVenue() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState(null); // Changed initial state to null
  const { toast } = useToast(); // Changed from { success, error }

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
    amenities: [],
    video_url: ''
  });

  useEffect(() => {
    const venueId = searchParams.get('id');
    if (venueId) {
      loadVenue(venueId);
    } else {
      setFormError("No venue ID provided.");
      setLoading(false);
    }
  }, [searchParams]);

  const loadVenue = async (id) => { // Renamed from loadVenueData
    try {
      setLoading(true);
      setFormError(null); // Clear previous errors
      const userData = await User.me();
      const venueData = await Venue.get(id);

      if (venueData.owner_id !== userData.id) {
        throw new Error("You are not authorized to edit this venue.");
      }
      
      setUser(userData);
      setVenue(venueData); // Set venue state for display
      setFormData({ // Populate formData for form inputs
        title: venueData.title || '',
        description: venueData.description || '',
        category: venueData.category || [],
        price_per_hour: venueData.price_per_hour || '',
        currency: venueData.currency || 'USD',
        capacity: venueData.capacity || '',
        location: venueData.location || { address: '', city: '', latitude: null, longitude: null },
        images: venueData.images || [],
        amenities: venueData.amenities || [],
        video_url: venueData.video_url || ''
      });

    } catch (err) {
      console.error('Failed to load venue data:', err);
      setFormError(err.message || 'Failed to load venue data.'); // Set form error for display
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load venue data.'
      });
      navigate(createPageUrl('MyVenues')); // Redirect if loading fails or unauthorized
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
  };

  const handleCategoryChange = (categoryId, checked) => { // Updated to use categoryId
    let updatedCategories;
    if (checked) {
      updatedCategories = [...formData.category, categoryId];
    } else {
      updatedCategories = formData.category.filter((c) => c !== categoryId);
    }
    setFormData((prev) => ({
      ...prev,
      category: updatedCategories
    }));
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedUrls = [];
    for (const file of files) {
      try {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (err) {
        console.error('Image upload failed:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Image upload failed.'
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null); // Clear any previous form errors
    try {
      const updatedData = {
        ...formData,
        price_per_hour: parseFloat(formData.price_per_hour),
        capacity: parseInt(formData.capacity)
      };
      await Venue.update(venue.id, updatedData); // Use venue.id, not venueId from searchParams directly
      toast({
        variant: "success",
        title: "Success",
        description: 'Venue updated successfully!'
      });
      // Optionally re-load venue data to refresh display if needed, or just update venue state directly
      setVenue(prev => ({ ...prev, ...updatedData }));

    } catch (err) {
      console.error('Failed to update venue:', err);
      const errorMessage = err.message || 'Failed to update venue. Please try again.';
      setFormError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVenue = async () => {
    if (!venue) return;
    
    setDeleting(true);
    setFormError(null); // Clear any previous form errors
    try {
      // Check for active bookings
      const activeBookings = await Booking.filter({ 
        venue_id: venue.id, 
        status: { '$in': ['confirmed', 'pending', 'awaiting_payment'] }
      });
      
      if (activeBookings.length > 0) {
        setFormError(`Cannot delete venue with ${activeBookings.length} active booking(s). Cancel all bookings first.`);
        setDeleting(false);
        return;
      }

      // Soft delete - mark as deleted instead of hard delete
      await Venue.update(venue.id, {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        title: `[DELETED] ${venue.title}`,
        description: `This venue was deleted on ${new Date().toLocaleDateString()}`
      });

      toast({
        variant: "success",
        title: "Success",
        description: 'Venue deleted successfully.'
      });
      navigate(createPageUrl('MyVenues'));
    } catch (err) {
      console.error('Failed to delete venue:', err);
      const errorMessage = err.message || 'Failed to delete venue. Please try again.';
      setFormError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setDeleting(false);
    }
  };

  const handlePricingUpdate = (newPrice) => {
    setFormData(prev => ({
      ...prev,
      price_per_hour: String(newPrice) // Ensure it's stored as a string if the input expects it
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Changed condition and content based on outline
  if (!venue || formError) { // Check if venue is not loaded or if there's a general formError (e.g. "No venue ID provided")
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{formError || "Venue not found or you do not have permission to edit it."}</h2>
        <Button onClick={() => navigate(createPageUrl('MyVenues'))}>Back to My Venues</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Venue</CardTitle>
          <CardDescription>Update details, manage availability, and set pricing for "{venue?.title}".</CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                {/* Basic Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Venue Title</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" rows={4} value={formData.description} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="price_per_hour">Price per Hour</Label>
                                <Input
                                    id="price_per_hour"
                                    name="price_per_hour"
                                    type="number"
                                    min="0"
                                    value={formData.price_per_hour}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <Select name="currency" value={formData.currency} onValueChange={(value) => setFormData(prev => ({...prev, currency: value}))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="SAR">SAR</SelectItem>
                                        <SelectItem value="AED">AED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="capacity">Maximum Capacity</Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Section */}
                <Card>
                   <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="location.address"
                                value={formData.location.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="location.city"
                                value={formData.location.city}
                                onChange={handleInputChange}
                            />
                        </div>
                   </CardContent>
                </Card>

                {/* Categories & Amenities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Event Categories</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             {eventCategoriesList.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category.id}`}
                                        checked={formData.category.includes(category.id)}
                                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                                    />
                                    <Label htmlFor={`category-${category.id}`} className="capitalize">{category.name}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                       <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             {commonAmenitiesList.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`amenity-${amenity}`}
                                        checked={formData.amenities.includes(amenity)}
                                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                                    />
                                    <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="images">Upload Images</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
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
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={() => removeImage(index)}
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

                {/* Video URL */}
                <Card>
                    <CardHeader><CardTitle>Video Tour (Optional)</CardTitle></CardHeader>
                    <CardContent>
                        <Label htmlFor="video_url">YouTube/Vimeo URL</Label>
                        <Input
                            id="video_url"
                            name="video_url"
                            type="url"
                            value={formData.video_url}
                            onChange={handleInputChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <Button type="button" variant="destructive" onClick={handleDeleteVenue} disabled={saving || deleting}>
                    {deleting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Venue
                      </>
                    )}
                  </Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MyVenues'))}>Cancel</Button>
                    <Button type="submit" disabled={saving || deleting}>
                      {saving ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Update Venue
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="calendar">
                <VenueCalendar venueId={venue.id} />
            </TabsContent>
            
            <TabsContent value="pricing">
                <PricingManager venueId={venue.id} basePrice={venue.price_per_hour} currency={venue.currency} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
