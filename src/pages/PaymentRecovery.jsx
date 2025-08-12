import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaymentRecovery } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/components/common/FormatUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PaymentRecovery() {
  const [searchParams] = useSearchParams();
  const recoveryId = searchParams.get('recovery_id');
  
  const [recovery, setRecovery] = useState(null);
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecoveryData();
  }, [recoveryId]);

  const loadRecoveryData = async () => {
    if (!recoveryId) {
      setError('No recovery ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await User.me();
      const recoveryData = await PaymentRecovery.get(recoveryId);
      
      if (recoveryData.user_id !== currentUser.id) {
        throw new Error('This recovery link is not for your account');
      }

      // Check if recovery has expired
      if (new Date() > new Date(recoveryData.expires_at)) {
        throw new Error('This payment recovery link has expired');
      }

      // Check if already recovered
      if (recoveryData.recovery_status === 'recovered') {
        throw new Error('This payment has already been completed');
      }

      setUser(currentUser);
      setRecovery(recoveryData);

      const bookingData = await Booking.get(recoveryData.booking_id);
      const venueData = await Venue.get(bookingData.venue_id);
      
      setBooking(bookingData);
      setVenue(venueData);

    } catch (err) {
      console.error('Failed to load recovery data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonRecovery = async () => {
    if (confirm('Are you sure you want to abandon this payment? Your booking will be cancelled.')) {
      try {
        await PaymentRecovery.update(recovery.id, {
          recovery_status: 'abandoned'
        });
        
        await Booking.update(booking.id, {
          status: 'cancelled',
          payment_status: 'abandoned'
        });

        alert('Payment recovery abandoned. Your booking has been cancelled.');
        window.location.href = createPageUrl('MyBookings');
      } catch (err) {
        console.error('Failed to abandon recovery:', err);
        alert('Failed to abandon recovery. Please try again.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Recovery Link Invalid</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to={createPageUrl('MyBookings')}>
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  if (!recovery || !booking || !venue) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Recovery Data Not Found</h1>
        <Link to={createPageUrl('MyBookings')}>
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  const isExpiringSoon = (new Date(recovery.expires_at) - new Date()) < (24 * 60 * 60 * 1000); // Less than 24 hours
  const timeUntilExpiry = formatDistanceToNow(new Date(recovery.expires_at), { addSuffix: true });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-lg text-gray-600">Your booking is waiting for payment completion</p>
      </div>

      {/* Urgency Alert */}
      <Alert className={`mb-6 ${isExpiringSoon ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <Clock className={`h-4 w-4 ${isExpiringSoon ? 'text-red-600' : 'text-yellow-600'}`} />
        <AlertDescription className={isExpiringSoon ? 'text-red-800' : 'text-yellow-800'}>
          <strong>Payment Required:</strong> This payment opportunity expires {timeUntilExpiry}. 
          Complete your payment now to confirm your booking.
        </AlertDescription>
      </Alert>

      {/* Recovery Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Payment Recovery</CardTitle>
            <Badge variant="outline" className="bg-yellow-50">
              Attempt #{recovery.retry_count + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-semibold">{formatCurrency(recovery.amount, recovery.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Failure:</span>
              <span className="text-red-600">{recovery.failure_reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className={isExpiringSoon ? 'text-red-600 font-medium' : ''}>
                {format(new Date(recovery.expires_at), 'MMMM d, yyyy HH:mm')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
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
                <p className="font-medium">Contact</p>
                <p>{booking.contact_name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Attempts */}
      {recovery.retry_count > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Previous Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>We've attempted to process your payment {recovery.retry_count} time{recovery.retry_count > 1 ? 's' : ''} before.</p>
              <p className="mt-2">
                Last attempt: {format(new Date(recovery.last_retry_at), 'MMMM d, yyyy HH:mm')}
              </p>
              <p className="mt-1 text-red-600">Reason: {recovery.failure_reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl(`Payment?recovery_id=${recovery.id}`)}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Complete Payment Now
            </Button>
          </Link>
          <Link to={createPageUrl('MyBookings')}>
            <Button variant="outline" size="lg">
              View All Bookings
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-red-600 hover:text-red-700"
            onClick={handleAbandonRecovery}
          >
            Cancel This Booking
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>If you're still experiencing payment issues:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Verify your card details are correct</li>
              <li>Check that you have sufficient funds</li>
              <li>Contact your bank to ensure the transaction isn't being blocked</li>
              <li>Try using a different payment method</li>
              <li>Use a different browser or device</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded-lg mt-4">
              <p className="text-blue-800">
                <strong>Still need help?</strong> Contact support at support@party2book.com 
                with recovery ID: {recovery.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}