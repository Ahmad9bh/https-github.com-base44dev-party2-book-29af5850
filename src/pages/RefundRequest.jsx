import React, { useState, useEffect } from 'react';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';
import { format, isValid } from 'date-fns';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getLocalizedText, formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function RefundRequest() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    reason: '',
    additional_details: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const userData = await User.me();
      setUser(userData);

      // Get booking ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking_id');

      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      // Load booking data
      const bookingData = await Booking.get(bookingId);
      
      if (!bookingData) {
        setError('Booking not found');
        setLoading(false);
        return;
      }

      // Verify user owns this booking
      if (bookingData.user_id !== userData.id) {
        setError('You are not authorized to request a refund for this booking');
        setLoading(false);
        return;
      }

      setBooking(bookingData);

      // Load venue data if booking has venue_id
      if (bookingData.venue_id) {
        try {
          const venueData = await Venue.get(bookingData.venue_id);
          setVenue(venueData);
        } catch (venueError) {
          console.error('Failed to load venue:', venueError);
          // Continue without venue data - not critical for refund request
        }
      }

    } catch (err) {
      console.error('Failed to load refund request data:', err);
      setError('Failed to load booking information');
    } finally {
      setLoading(false);
    }
  };

  const calculateRefundAmount = () => {
    if (!booking || !booking.event_date || !booking.total_amount) {
      return 0;
    }

    try {
      const eventDate = new Date(booking.event_date);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

      let refundPercentage = 0;
      if (daysUntilEvent >= 7) {
        refundPercentage = 0.9; // 90% refund for 7+ days notice
      } else if (daysUntilEvent >= 3) {
        refundPercentage = 0.7; // 70% refund for 3-6 days notice
      } else if (daysUntilEvent >= 1) {
        refundPercentage = 0.5; // 50% refund for 1-2 days notice
      } else {
        refundPercentage = 0.25; // 25% refund for same day
      }

      return booking.total_amount * refundPercentage;
    } catch (error) {
      console.error('Error calculating refund amount:', error);
      return 0;
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the refund request');
      return;
    }

    if (!booking) {
      toast.error('Booking information not available');
      return;
    }

    setSubmitting(true);
    try {
      const refundAmount = calculateRefundAmount();
      
      await Booking.update(booking.id, {
        status: 'cancellation_requested',
        cancellation_reason: formData.reason,
        cancellation_request_status: 'pending',
        refund_amount: refundAmount,
        cancellation_requested_at: new Date().toISOString()
      });

      toast.success('Refund request submitted successfully! The venue owner will review your request.');
      window.location.href = createPageUrl('MyBookings');

    } catch (error) {
      console.error('Failed to submit refund request:', error);
      toast.error('Failed to submit refund request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = createPageUrl('MyBookings')}
        >
          Back to My Bookings
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = createPageUrl('MyBookings')}
        >
          Back to My Bookings
        </Button>
      </div>
    );
  }

  const refundAmount = calculateRefundAmount();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Refund</h1>
        <p className="text-gray-600">Submit a cancellation and refund request for your booking.</p>
      </div>

      {/* Booking Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{venue?.title || 'Venue information not available'}</p>
                <p className="text-sm text-gray-600">{venue?.location?.city || ''}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">
                  {booking.event_date && isValid(new Date(booking.event_date)) 
                    ? format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')
                    : 'Date not available'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {booking.start_time && booking.end_time 
                    ? `${booking.start_time} - ${booking.end_time}`
                    : 'Time not available'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <p>{booking.guest_count || 0} guests</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span>Original Amount:</span>
                <span className="font-medium">
                  {formatCurrency(booking.total_amount || 0, booking.currency || currentCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Estimated Refund:</span>
                <span className="font-medium">
                  {formatCurrency(refundAmount, booking.currency || currentCurrency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Policy Notice */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Refund Policy:</strong> Refund amounts depend on when you cancel:
          <ul className="mt-2 list-disc list-inside text-sm">
            <li>7+ days before event: 90% refund</li>
            <li>3-6 days before: 70% refund</li>
            <li>1-2 days before: 50% refund</li>
            <li>Same day: 25% refund</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Refund Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Cancellation *</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need to cancel this booking..."
                value={formData.reason}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="additional_details">Additional Details (Optional)</Label>
              <Textarea
                id="additional_details"
                placeholder="Any additional information you'd like to share..."
                value={formData.additional_details}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = createPageUrl('MyBookings')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Submitting...' : 'Submit Refund Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}