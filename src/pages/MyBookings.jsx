import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, MapPin, Users, Clock, Star, MessageSquare,
  CreditCard, AlertTriangle, CheckCircle, XCircle, Edit3,
  FileText, Download, RefreshCw, Phone, Mail, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function MyBookings() {
  const { currentCurrency, getLocalizedText } = useLocalization();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadBookingsData();
  }, []);

  const loadBookingsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load user's bookings
      const userBookings = await Booking.filter({ user_id: currentUser.id }, '-event_date');
      setBookings(userBookings);

      // Load venue details for bookings
      const venueIds = [...new Set(userBookings.map(b => b.venue_id))];
      const venueData = {};
      
      for (const venueId of venueIds) {
        try {
          const venue = await Venue.filter({ id: venueId });
          if (venue.length > 0) {
            venueData[venueId] = venue[0];
          }
        } catch (error) {
          console.warn(`Failed to load venue ${venueId}:`, error);
        }
      }
      
      setVenues(venueData);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your bookings."
      });
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'payment_pending': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'rejected': return XCircle;
      case 'payment_pending': return CreditCard;
      default: return AlertTriangle;
    }
  };

  const categorizeBookings = () => {
    const now = new Date();
    
    return {
      upcoming: bookings.filter(booking => {
        const eventDate = new Date(booking.event_date);
        return isFuture(eventDate) && ['confirmed', 'pending'].includes(booking.status);
      }),
      past: bookings.filter(booking => {
        const eventDate = new Date(booking.event_date);
        return isPast(eventDate) || booking.status === 'completed';
      }),
      pending: bookings.filter(booking => 
        ['pending', 'payment_pending'].includes(booking.status)
      ),
      cancelled: bookings.filter(booking => 
        ['cancelled', 'rejected'].includes(booking.status)
      )
    };
  };

  const handlePayNow = (booking) => {
    window.location.href = createPageUrl(`Payment?booking_id=${booking.id}`);
  };

  const canModifyBooking = (booking) => {
    const eventDate = new Date(booking.event_date);
    const hoursUntilEvent = (eventDate - new Date()) / (1000 * 60 * 60);
    return hoursUntilEvent > 48 && ['confirmed', 'pending'].includes(booking.status);
  };

  const canCancelBooking = (booking) => {
    const eventDate = new Date(booking.event_date);
    const hoursUntilEvent = (eventDate - new Date()) / (1000 * 60 * 60);
    return hoursUntilEvent > 24 && ['confirmed', 'pending'].includes(booking.status);
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-gray-600">Please log in to view your bookings.</p>
      </div>
    );
  }

  const categorizedBookings = categorizeBookings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your venue reservations and bookings</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadBookingsData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{categorizedBookings.upcoming.length}</div>
            <div className="text-blue-700">Upcoming Events</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{categorizedBookings.pending.length}</div>
            <div className="text-yellow-700">Pending Approval</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{categorizedBookings.past.filter(b => b.status === 'completed').length}</div>
            <div className="text-green-700">Completed Events</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{bookings.length}</div>
            <div className="text-purple-700">Total Bookings</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {categorizedBookings.upcoming.length > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">
                {categorizedBookings.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {categorizedBookings.pending.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                {categorizedBookings.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming">
          <BookingList 
            bookings={categorizedBookings.upcoming}
            venues={venues}
            currentCurrency={currentCurrency}
            type="upcoming"
            canModifyBooking={canModifyBooking}
            canCancelBooking={canCancelBooking}
          />
        </TabsContent>

        {/* Pending Bookings */}
        <TabsContent value="pending">
          <BookingList 
            bookings={categorizedBookings.pending}
            venues={venues}
            currentCurrency={currentCurrency}
            type="pending"
            onPayNow={handlePayNow}
          />
        </TabsContent>

        {/* Past Bookings */}
        <TabsContent value="past">
          <BookingList 
            bookings={categorizedBookings.past}
            venues={venues}
            currentCurrency={currentCurrency}
            type="past"
          />
        </TabsContent>

        {/* Cancelled Bookings */}
        <TabsContent value="cancelled">
          <BookingList 
            bookings={categorizedBookings.cancelled}
            venues={venues}
            currentCurrency={currentCurrency}
            type="cancelled"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Booking List Component
const BookingList = ({ bookings, venues, currentCurrency, type, canModifyBooking, canCancelBooking, onPayNow }) => {
  if (bookings.length === 0) {
    const emptyMessages = {
      upcoming: "No upcoming bookings",
      pending: "No pending bookings",
      past: "No past bookings",
      cancelled: "No cancelled bookings"
    };

    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {emptyMessages[type]}
        </h3>
        <p className="text-gray-600 mb-6">
          {type === 'upcoming' && "Your upcoming events will appear here"}
          {type === 'pending' && "Bookings awaiting confirmation will appear here"}
          {type === 'past' && "Your completed events will appear here"}
          {type === 'cancelled' && "Cancelled bookings will appear here"}
        </p>
        <Button asChild>
          <Link to={createPageUrl('Browse')}>Browse Venues</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {bookings.map((booking, index) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            venue={venues[booking.venue_id]}
            currentCurrency={currentCurrency}
            type={type}
            canModify={canModifyBooking?.(booking)}
            canCancel={canCancelBooking?.(booking)}
            onPayNow={onPayNow}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Booking Card Component
const BookingCard = ({ booking, venue, currentCurrency, type, canModify, canCancel, onPayNow, index }) => {
  const StatusIcon = getStatusIcon(booking.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Venue Image */}
            <div className="w-full lg:w-48 h-32 flex-shrink-0">
              <img
                src={venue?.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
                alt={venue?.title || 'Venue'}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Booking Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {venue?.title || 'Venue Name'}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{venue?.location?.city || 'Location'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(booking.status)} border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Event Date</div>
                    <div className="font-medium">
                      {format(parseISO(booking.event_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Guests</div>
                    <div className="font-medium">{booking.guest_count}</div>
                  </div>
                </div>
              </div>

              {/* Contact & Event Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Event Type</div>
                  <div className="font-medium">{booking.event_type || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="font-bold text-lg text-indigo-600">
                    {formatCurrency(booking.total_amount, booking.currency, currentCurrency)}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.special_requests && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Special Requests</div>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    {booking.special_requests}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link to={createPageUrl(`VenueDetails?id=${booking.venue_id}`)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Venue
                  </Link>
                </Button>

                {booking.status === 'payment_pending' && onPayNow && (
                  <Button 
                    size="sm" 
                    onClick={() => onPayNow(booking)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                )}

                {canModify && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={createPageUrl(`ChangeBooking?id=${booking.id}`)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modify
                    </Link>
                  </Button>
                )}

                {canCancel && (
                  <Button variant="outline" size="sm" asChild className="text-red-600 hover:text-red-700">
                    <Link to={createPageUrl(`CancelBooking?id=${booking.id}`)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Link>
                  </Button>
                )}

                {booking.status === 'completed' && !booking.review_id && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={createPageUrl(`WriteReview?booking_id=${booking.id}`)}>
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </Link>
                  </Button>
                )}

                <Button variant="outline" size="sm" asChild>
                  <Link to={createPageUrl(`Messages?venue_id=${booking.venue_id}`)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Owner
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper function to get status color (moved outside component for reuse)
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
    case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'payment_pending': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'confirmed': return CheckCircle;
    case 'pending': return Clock;
    case 'completed': return CheckCircle;
    case 'cancelled': return XCircle;
    case 'rejected': return XCircle;
    case 'payment_pending': return CreditCard;
    default: return AlertTriangle;
  }
};