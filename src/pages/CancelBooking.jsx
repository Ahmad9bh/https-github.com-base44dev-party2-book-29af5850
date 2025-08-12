import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/common/FormatUtils';
import NotificationService from '@/components/notifications/NotificationService';

export default function CancelBooking() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const { success, error } = useToast();

  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingId) {
        error("No booking ID provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const currentUser = await User.me();
        const bookingData = await Booking.get(bookingId);
        
        if (bookingData.user_id !== currentUser.id) {
          throw new Error("You can only cancel your own bookings.");
        }
        if (bookingData.status !== 'confirmed') {
          throw new Error("Only confirmed bookings can be cancelled.");
        }
        if (bookingData.status === 'cancellation_requested') {
            throw new Error("A cancellation request for this booking is already pending.");
        }

        setUser(currentUser);
        setBooking(bookingData);
        
        // Calculate refund amount (e.g., 90% refund if cancelled > 7 days in advance)
        const eventDate = new Date(bookingData.event_date);
        const daysUntilEvent = (eventDate - new Date()) / (1000 * 60 * 60 * 24);
        const calculatedRefund = daysUntilEvent > 7 ? bookingData.total_amount * 0.9 : bookingData.total_amount * 0.5;
        setRefundAmount(calculatedRefund);
        
        const venueData = await Venue.get(bookingData.venue_id);
        setVenue(venueData);

      } catch (err) {
        console.error("Failed to load booking data:", err);
        error(err.message || "Failed to load booking data.");
        window.location.href = createPageUrl('MyBookings');
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      error("Please provide a reason for cancellation.");
      return;
    }
    setSubmitting(true);
    try {
      // Update the booking with cancellation request
      await Booking.update(booking.id, {
        status: 'cancellation_requested',
        cancellation_reason: reason,
        cancellation_request_status: 'pending',
        cancellation_requested_at: new Date().toISOString(),
        refund_amount: refundAmount
      });

      // Send in-app notification to venue owner instead of email
      try {
        await NotificationService.notifyNewMessage(
          null, // no conversation needed for this type
          user.id,
          venue.owner_id,
          user.full_name || 'Customer',
          venue.title
        );
      } catch (notificationError) {
        console.warn("Could not send notification:", notificationError);
        // Don't fail the whole operation if notification fails
      }

      success("Cancellation request submitted. The venue owner will review your request.");
      window.location.href = createPageUrl('MyBookings');
    } catch (err) {
      console.error("Failed to submit cancellation request:", err);
      error("Failed to submit cancellation request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking || !venue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
        <p className="text-gray-600 mb-6">The booking could not be loaded or you don't have permission to cancel it.</p>
        <Link to={createPageUrl('MyBookings')}>
          <Button>Back to My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancel Booking</h1>
        <p className="text-gray-600">Request to cancel your venue booking</p>
      </div>

      <div className="space-y-6">
        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Review your booking information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Venue</Label>
                <p className="font-medium">{venue.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Date</Label>
                <p className="font-medium">{format(new Date(booking.event_date), 'PPP')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Time</Label>
                <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Guests</Label>
                <p className="font-medium">{booking.guest_count}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Paid</Label>
                <p className="font-medium">{formatCurrency(booking.total_amount, booking.currency)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Estimated Refund</Label>
                <p className="font-medium text-green-600">{formatCurrency(refundAmount, booking.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Policy */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Cancellation Policy:</strong> Cancellations made more than 7 days before the event receive a 90% refund. 
            Cancellations made within 7 days receive a 50% refund. The final refund amount may be adjusted by the venue owner.
          </AlertDescription>
        </Alert>

        {/* Cancellation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Request</CardTitle>
            <CardDescription>Please provide a reason for your cancellation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Cancellation *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you need to cancel this booking..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link to={createPageUrl('MyBookings')}>
                    Keep Booking
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={submitting || !reason.trim()}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Cancellation Request'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}