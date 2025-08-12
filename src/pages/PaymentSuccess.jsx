
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities'; // New import
import { UserActivity } from '@/api/entities'; // New import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Users, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/common/FormatUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const { info } = useToast();

  useEffect(() => {
    if (bookingId) {
      const processBookingConfirmation = async () => {
        try {
          // Fetch booking to get details
          const bookingData = await Booking.get(bookingId);

          // Update booking status if it's still in a pre-payment state
          if (bookingData.status === 'awaiting_payment' || bookingData.status === 'slot_reserved') {
             await Booking.update(bookingId, { status: 'pending' }); // Set to 'pending' for owner approval
             // After update, refetch or adjust bookingData if needed, 
             // but for now, we'll use the initial fetched bookingData for display
          }
          
          setBooking(bookingData);
          
          // Fetch venue data
          const venueData = await Venue.get(bookingData.venue_id);
          setVenue(venueData);

          // Log booking activity for personalization
          // Ensure user is logged in before trying to log activity
          try {
            const user = await User.me();
            if (user && user.id) {
              await UserActivity.create({
                  user_id: user.id,
                  venue_id: bookingData.venue_id,
                  activity_type: 'book',
              });
            }
          } catch (activityErr) {
            console.warn('Failed to log user activity (user might not be logged in or other issue):', activityErr);
            // Non-critical error, continue without logging activity
          }

        } catch (err) {
          console.error('Failed to process booking or load data:', err);
          // Set booking/venue to null to trigger "Booking Not Found" display
          setBooking(null); 
          setVenue(null);
        } finally {
          setLoading(false);
        }
      };
      processBookingConfirmation();
    } else {
      setLoading(false);
      setBooking(null); // Ensure no booking is displayed if ID is missing
      setVenue(null);
    }
  }, [bookingId]);


  const handleDownloadConfirmation = () => {
    // In a real app, this would generate and download a PDF
    info({ title: "Coming Soon!", description: "PDF download feature is under development." });
  };

  const handleShareBooking = async () => {
    const shareData = {
      title: `Booking Confirmed - ${venue?.title}`,
      text: `My booking at ${venue?.title} is confirmed for ${booking ? format(new Date(booking.event_date), 'MMMM d, yyyy') : ''}`,
      url: window.location.href,
    };

    const fallbackToClipboard = (message) => {
        navigator.clipboard.writeText(window.location.href);
        info({ title: 'Link Copied', description: message });
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Don't log expected errors like user cancellation or permission denial.
        // AbortError: User cancelled the share dialog.
        // NotAllowedError: Browser blocked the share due to permissions (e.g., in iframe).
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error('An unexpected share error occurred:', err);
        }
        
        // Fallback to clipboard for any error except user cancellation.
        if (err.name !== 'AbortError') {
          fallbackToClipboard('Sharing isn\'t available, so we copied the booking link to your clipboard.');
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      fallbackToClipboard('Your browser doesn\'t support sharing, so we copied the booking link instead.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking || !venue) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for, or there was an error processing it.</p>
        <Link to={createPageUrl('MyBookings')}>
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-lg text-gray-600">Your booking has been confirmed</p>
      </div>

      {/* Booking Confirmation Card */}
      <Card className="mb-6">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Booking Confirmation</CardTitle>
          <p className="text-green-600">Booking ID: {booking.id}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Venue Info */}
            <div>
              <h2 className="text-xl font-semibold mb-2">{venue.title}</h2>
              {venue.images && venue.images[0] && (
                <img 
                  src={venue.images[0]} 
                  alt={venue.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{venue.location?.address}, {venue.location?.city}</span>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-500">🕐</span>
                    <span>{booking.start_time} - {booking.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{booking.guest_count} guests</span>
                  </div>
                  {booking.event_type && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center text-gray-500">🎉</span>
                      <span>{booking.event_type}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm">
                  <p>{booking.contact_name}</p>
                  <p>{booking.contact_email}</p>
                  {booking.contact_phone && <p>{booking.contact_phone}</p>}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div>
                <h3 className="font-semibold mb-2">Special Requests</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {booking.special_requests}
                </p>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Venue Rental</span>
                  <span>{formatCurrency(booking.total_amount - (booking.platform_fee || 0), booking.currency)}</span>
                </div>
                {booking.platform_fee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span>{formatCurrency(booking.platform_fee, booking.currency)}</span>
                  </div>
                )}
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Applied</span>
                    <span>-{formatCurrency(booking.discount_amount, booking.currency)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span>{formatCurrency(booking.total_amount, booking.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownloadConfirmation} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Confirmation
        </Button>
        <Button onClick={handleShareBooking} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Booking
        </Button>
        <Link to={createPageUrl('MyBookings')}>
          <Button>View All Bookings</Button>
        </Link>
      </div>

      {/* Next Steps */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
              <p>You'll receive a confirmation email with all the details shortly.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
              <p>The venue owner may contact you to coordinate final details.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
              <p>You can message the venue owner directly through our platform if needed.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">4</span>
              <p>After your event, you can leave a review to help other users.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
