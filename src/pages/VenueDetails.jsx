
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Review } from '@/api/entities';
import { UserActivity } from '@/api/entities';
import { UserFavorite } from '@/api/entities'; // IMPORT UserFavorite entity
import { Button } from '@/components/ui/button';
import { Star, MapPin, Heart, Flag, Users, Wifi, Car, Camera, Music, Shield, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getLocalizedText, formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import ReviewSystem from '@/components/venues/ReviewSystem';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import SocialShare from '@/components/venues/SocialShare';

import ImageGallery from '@/components/venues/ImageGallery';
import BookingWidget, { isSlotAvailableForBooking } from '@/components/venues/BookingWidget';
import VenueLocationMap from '@/components/venues/VenueLocationMap';
import ARViewer from '@/components/ai/ARViewer';
import VRVenueTour from '@/components/venues/VRVenueTour';
import { MessageSquare } from 'lucide-react';
import { Conversation } from '@/api/entities';
import { Message } from '@/api/entities';
import { useAuth } from '@/components/hooks/useAuth';

export default function VenueDetails() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('id');
  const { currentLanguage, currentCurrency } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, login } = useAuth(); // Destructure user and login from useAuth

  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [activeTab, setActiveTab] = useState('photos');
  const [pricingRules, setPricingRules] = useState([]);

  const overviewRef = useRef(null);
  const amenitiesRef = useRef(null);
  const reviewsRef = useRef(null);
  const locationRef = useRef(null);

  const amenityIcons = {
    'Parking': Car,
    'WiFi': Wifi,
    'Photography Allowed': Camera,
    'Sound System': Music,
    'Security': Shield,
    'Premium': Crown,
    'Tables & Chairs': Users,
    'Air Conditioning': Users,
    'Bar Area': Users,
    'Outdoor Space': Users,
    'Dance Floor': Users,
    'Kitchen Access': Users,
    'Decorations Allowed': Users
  };

  useEffect(() => {
    if (venueId) {
      loadVenueData();
    } else {
      setError('Venue ID is missing');
      setLoading(false);
    }
  }, [venueId, currentLanguage, user]); // Added user to dependencies to react to login/logout state changes

  useEffect(() => {
    const logViewActivity = async () => {
      if (venue && user) {
        const sessionKey = `viewed_${venue.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          try {
            await UserActivity.create({
              user_id: user.id,
              venue_id: venue.id,
              activity_type: 'view',
            });
            sessionStorage.setItem(sessionKey, 'true');
          } catch (err) {
            console.warn("Failed to log view activity", err);
          }
        }
      }
    };

    logViewActivity();
  }, [venue, user]);

  const loadVenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // No longer fetching currentUser here, as it's provided by useAuth
      // The `user` variable from `useAuth` will be reactive.

      const venueData = await Venue.get(venueId);
      if (!venueData || venueData.status !== 'active') {
        setError('This venue is not available');
        setLoading(false);
        return;
      }
      setVenue(venueData);

      // FIX: Correctly check if venue is a favorite using the UserFavorite entity
      if (user) {
        const userFavorites = await UserFavorite.filter({ user_id: user.id, venue_id: venueId });
        setIsFavorite(userFavorites.length > 0);
      } else {
        setIsFavorite(false);
      }

      const venueReviews = await Review.filter({ venue_id: venueId }, '-created_date', 50);
      setReviews(venueReviews || []);

    } catch (err) {
      console.error('Failed to load venue:', err);
      setError('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      toast({ title: 'Please log in to contact the owner.', variant: 'destructive' });
      return;
    }
    if (user.id === venue.owner_id) {
       toast({ title: "You cannot contact yourself.", variant: "destructive" });
       return;
    }

    try {
      // Check if a conversation already exists
      let existingConversation = await Conversation.filter({
        participant_ids: { '$all': [user.id, venue.owner_id] },
        venue_id: venue.id
      }, '', 1);
      
      if (existingConversation.length > 0) {
        // Conversation exists, redirect to messages page
        navigate('/Messages');
      } else {
        // Create a new conversation
        const newConversation = await Conversation.create({
          participant_ids: [user.id, venue.owner_id],
          participant_names: [user.full_name, venue.owner_name],
          participant_avatars: [user.profile_image || '', ''], // Assuming owner avatar is not available
          venue_id: venue.id,
          venue_name: venue.title,
          last_message_content: `Inquiry about ${venue.title}`,
          last_message_timestamp: new Date().toISOString(),
        });
        
        // Optionally create an initial message
        await Message.create({
            conversation_id: newConversation.id,
            sender_id: user.id,
            sender_name: user.full_name,
            content: `Hi, I'm interested in learning more about ${venue.title}.`
        });

        // Redirect to messages page
        navigate('/Messages');
      }
    } catch (error) {
      console.error('Failed to initiate conversation:', error);
      toast({ title: 'Error starting conversation', variant: 'destructive' });
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      // Instead of using User.loginWithRedirect, use our safe navigation
      const currentPageUrl = `${window.location.pathname}${window.location.search}`;
      await login(currentPageUrl);
      return;
    }

    // FIX: Correctly toggle favorite status using the UserFavorite entity
    try {
      let activityType;
      if (isFavorite) {
        const favoritesToDelete = await UserFavorite.filter({ user_id: user.id, venue_id: venue.id });
        if (favoritesToDelete.length > 0) {
            await UserFavorite.delete(favoritesToDelete[0].id);
        }
        activityType = 'unfavorite';
        toast({
          title: "Removed from favorites",
          description: `${venue.title} has been removed from your saved venues.`,
        });
      } else {
        await UserFavorite.create({ user_id: user.id, venue_id: venue.id });
        activityType = 'favorite';
        toast({
          title: "Added to favorites",
          description: `${venue.title} has been added to your saved venues.`,
        });
      }
      setIsFavorite(!isFavorite);

      await UserActivity.create({
        user_id: user.id,
        venue_id: venue.id,
        activity_type: activityType,
      });

    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast({
        variant: "destructive",
        title: "Failed to update favorites",
        description: "Please try again later.",
      });
    }
  };

  const isMobile = window.innerWidth < 768;

  const handleBooking = async (startDate, endDate, startTime, endTime, guestCount) => {
    if (!user) {
      // Safe navigation instead of User.loginWithRedirect
      const currentPageUrl = `${window.location.pathname}${window.location.search}`;
      await login(currentPageUrl);
      return;
    }

    try {
      // Create URL parameters for the booking page
      const bookingParams = new URLSearchParams({
        venue_id: venue.id,
        date: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        startTime: startTime,
        endTime: endTime,
        guests: guestCount.toString(),
      });

      // Navigate to booking page with the parameters
      navigate(`/BookVenue?${bookingParams.toString()}`);
    } catch (error) {
      console.error('Failed to initiate booking:', error);
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: "Failed to start booking process. Please try again.",
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : error || !venue ? (
          <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'This venue may have been removed or is no longer available.'}</p>
              <Button asChild>
                <Link to={createPageUrl('Browse')}>Browse Other Venues</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{venue.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    <span className="font-medium">{venue.rating?.toFixed(1) || 'New'}</span>
                    <span className="text-gray-500">({venue.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.location?.city}, {venue.location?.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="outline" className="flex items-center gap-2" onClick={handleContactOwner}>
                   <MessageSquare className="w-5 h-5" />
                   <span>{getLocalizedText('contact_owner', currentLanguage)}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2" onClick={toggleFavorite}>
                   <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                   <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </Button>
                <SocialShare venue={venue} />
              </div>
            </div>

            <ImageGallery images={venue.images} title={venue.title} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
              <div className="lg:col-span-2 space-y-12">
                <section ref={overviewRef} id="overview">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">About this venue</h2>
                      <p className="text-gray-600">Hosted by {venue.owner_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency)}
                      </div>
                      <div className="text-gray-500">per hour</div>
                    </div>
                  </div>
                  
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p>{venue.description}</p>
                  </div>

                  {(venue.model_url || venue.images?.length > 0) && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Experience This Venue</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {venue.model_url && (
                          <ARViewer modelUrl={venue.model_url} venueName={venue.title} />
                        )}
                        {venue.images && venue.images.length > 0 && (
                          <VRVenueTour venueName={venue.title} imageUrl={venue.images[0]} />
                        )}
                      </div>
                    </div>
                  )}
                </section>

                <Separator />

                <section ref={amenitiesRef} id="amenities">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What this place offers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {venue.amenities?.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Users;
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-gray-900 font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <Separator />

                <section ref={reviewsRef} id="reviews">
                  <ReviewSystem 
                    venueId={venue.id} 
                    reviews={reviews} 
                    averageRating={venue.rating} 
                    totalReviews={venue.total_reviews} 
                    currentLanguage={currentLanguage} 
                  />
                </section>

                <Separator />

                <section ref={locationRef} id="location">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Where you'll be</h2>
                  <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
                    <VenueLocationMap
                      latitude={venue.location?.latitude}
                      longitude={venue.location?.longitude}
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{venue.location?.city}</h3>
                    <p className="text-gray-600">{venue.location?.address}</p>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <BookingWidget
                    venue={venue}
                    availability={availability}
                    pricingRules={pricingRules}
                    currentLanguage={currentLanguage}
                    currentCurrency={currentCurrency}
                    onBook={handleBooking}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
