import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/common/FormatUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      const bookingData = await Booking.get(bookingId);
      const venueData = await Venue.get(bookingData.venue_id);
      
      setBooking(bookingData);
      setVenue(venueData);

      // Update booking status to reflect cancelled payment
      await Booking.update(bookingId, {
        payment_status: 'cancelled'
      });

    } catch (err) {
      console.error('Failed to load booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking || !venue) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
        <Link to={createPageUrl('MyBookings')}>
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-lg text-gray-600">Your payment was not completed</p>
      </div>

      {/* Warning Alert */}
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Your booking is not confirmed yet.</strong> You cancelled the payment process. 
          Your reservation will be held for a limited time while you complete payment.
        </AlertDescription>
      </Alert>

      {/* Booking Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Incomplete Booking</CardTitle>
          <p className="text-gray-600">Booking ID: {booking.id}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{venue.title}</h2>
              <p className="text-gray-600">{venue.location?.city}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Event Date</p>
                <p>{format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="font-medium">Time</p>
                <p>{booking.start_time} - {booking.end_time}</p>
              </div>
              <div>
                <p className="font-medium">Guests</p>
                <p>{booking.guest_count} people</p>
              </div>
              <div>
                <p className="font-medium">Total Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(booking.total_amount, booking.currency)}
                </p>
              </div>
            </div>

            {booking.special_requests && (
              <div>
                <p className="font-medium">Special Requests</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {booking.special_requests}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl(`Payment?booking_id=${booking.id}`)}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Payment Again
            </Button>
          </Link>
          <Link to={createPageUrl('MyBookings')}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Bookings
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
            <Button variant="ghost">
              View Venue Details Again
            </Button>
          </Link>
        </div>
      </div>

      {/* Help Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>If you're having trouble with payment, here are some things you can try:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Check that your card details are correct</li>
              <li>Ensure you have sufficient funds available</li>
              <li>Try a different payment method</li>
              <li>Check with your bank if the transaction was blocked</li>
              <li>Clear your browser cache and try again</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded-lg mt-4">
              <p className="text-blue-800 font-medium">Still having issues?</p>
              <p className="text-blue-700 text-sm">
                Contact our support team at support@party2book.com and include your booking ID: {booking.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}