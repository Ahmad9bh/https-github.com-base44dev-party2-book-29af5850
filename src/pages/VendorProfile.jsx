
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Vendor } from '@/api/entities';
import { VendorReview } from '@/api/entities';
import { VendorBooking } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Award, 
  Phone, 
  Mail, 
  Globe, 
  Shield,
  Calendar,
  DollarSign,
  MessageSquare,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const vendorId = queryParams.get('id');

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);

      // Load user
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }

      // Load vendor
      const vendorData = await Vendor.get(vendorId);
      if (!vendorData || vendorData.status !== 'active') {
        throw new Error('Vendor not found or inactive');
      }
      setVendor(vendorData);

      // Load reviews
      const vendorReviews = await VendorReview.filter({ vendor_id: vendorId }, '-created_date', 20);
      setReviews(vendorReviews);

    } catch (error) {
      console.error('Failed to load vendor:', error);
      toast({
        title: "Error loading vendor",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = async () => {
    if (!user) {
      await User.login();
      return;
    }

    // For demo purposes, we'll create a mock booking record to enable reviews
    try {
      const mockBooking = await VendorBooking.create({
        vendor_id: vendor.id,
        user_id: user.id,
        service_type: vendor.service_type,
        event_date: new Date().toISOString().split('T')[0],
        guest_count: 50,
        status: 'completed', // Mark as completed so user can review
        customer_name: user.full_name,
        customer_email: user.email
      });

      // Redirect to review page
      window.location.href = createPageUrl(`WriteVendorReview?bookingId=${mockBooking.id}`);

    } catch (error) {
      console.error('Failed to create booking for review:', error);
      // If booking creation fails, go directly to review page without booking ID
      window.location.href = createPageUrl(`WriteVendorReview?vendorId=${vendor.id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-4">This vendor may no longer be available.</p>
          <Link to={createPageUrl('BrowseVendors')}>
            <Button>Browse Vendors</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 mx-auto md:mx-0">
              <AvatarImage src={vendor.profile_image_url} alt={vendor.company_name} />
              <AvatarFallback className="text-2xl">
                {vendor.company_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vendor.company_name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {vendor.service_type.charAt(0).toUpperCase() + vendor.service_type.slice(1)}
                    </Badge>
                    {vendor.is_verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {vendor.insurance_coverage && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Insured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    {averageRating > 0 ? (
                      <>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-xl font-bold">
                            {averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          ({reviews.length} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600">No reviews yet</span>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleWriteReview}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.city}, {vendor.country}</span>
                </div>
                {vendor.years_in_business && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{vendor.years_in_business}+ years experience</span>
                  </div>
                )}
                {vendor.team_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{vendor.team_size} team members</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Responds within {vendor.response_time_hours || 24} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {vendor.company_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {vendor.description}
                </p>

                {vendor.specialties && vendor.specialties.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {vendor.equipment_provided && vendor.equipment_provided.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Equipment Provided</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {vendor.equipment_provided.map((equipment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{equipment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {vendor.certifications && vendor.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.certifications.map((cert, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {vendor.price_range_min && vendor.price_range_max ? (
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(vendor.price_range_min, vendor.currency)} - {formatCurrency(vendor.price_range_max, vendor.currency)}
                      </div>
                    ) : vendor.base_price ? (
                      <div className="text-2xl font-bold text-indigo-600">
                        From {formatCurrency(vendor.base_price, vendor.currency)}
                      </div>
                    ) : (
                      <div className="text-lg text-gray-600">
                        Contact for pricing
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {vendor.pricing_model === 'per_hour' ? 'Per hour' : 
                       vendor.pricing_model === 'per_person' ? 'Per person' : 
                       vendor.pricing_model === 'per_event' ? 'Per event' : 'Custom pricing'}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {vendor.minimum_booking && (
                      <div>Minimum: {formatCurrency(vendor.minimum_booking, vendor.currency)}</div>
                    )}
                    <div>Book {vendor.advance_booking_days || 7} days in advance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio & Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.gallery_image_urls && vendor.gallery_image_urls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendor.gallery_image_urls.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`${vendor.company_name} work ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No gallery images available yet</p>
                  </div>
                )}

                {vendor.portfolio_urls && vendor.portfolio_urls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">External Portfolio Links</h3>
                    <div className="space-y-2">
                      {vendor.portfolio_urls.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline block"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.user_avatar} />
                              <AvatarFallback>
                                {review.user_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.user_name}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1">{review.rating}</span>
                                </div>
                                <span>•</span>
                                <span>{format(new Date(review.created_date), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{review.review_text}</p>
                        
                        {review.service_quality && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Quality:</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1">{review.service_quality}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Communication:</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1">{review.communication}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Punctuality:</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1">{review.punctuality}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Value:</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1">{review.value_for_money}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {review.vendor_response && (
                          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                            <div className="font-medium text-sm mb-1">Response from {vendor.company_name}</div>
                            <p className="text-sm text-gray-700">{review.vendor_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet</p>
                    <p className="text-sm">Be the first to leave a review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {vendor.contact_email && (
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <a 
                          href={`mailto:${vendor.contact_email}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {vendor.contact_email}
                        </a>
                      </div>
                    )}
                    
                    {vendor.contact_phone && (
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <a 
                          href={`tel:${vendor.contact_phone}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {vendor.contact_phone}
                        </a>
                      </div>
                    )}

                    {vendor.website_url && (
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <a 
                          href={vendor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Service Areas</h3>
                      {vendor.service_areas && vendor.service_areas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {vendor.service_areas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{vendor.city} area</p>
                      )}
                    </div>

                    {vendor.cancellation_policy && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                        <p className="text-sm text-gray-600">{vendor.cancellation_policy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
