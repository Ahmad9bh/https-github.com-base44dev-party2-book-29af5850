import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import StripePaymentForm from '@/components/payments/StripePaymentForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const isChangePayment = searchParams.get('change') === 'true';
  const status = searchParams.get('status');

  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const { success, error } = useToast();

  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    description: '',
    type: 'booking'
  });

  useEffect(() => {
    const processPostPayment = async () => {
      if (status && bookingId) {
        setLoading(true);
        try {
          const currentBooking = await Booking.get(bookingId);
          if (status === 'success') {
            if (isChangePayment) {
              await Booking.update(bookingId, { change_request_payment_status: 'completed' });
              success('Payment successful! Your change request has been sent to the venue owner.');
            } else {
              await Booking.update(bookingId, { status: 'confirmed', payment_status: 'succeeded' });
              success('Payment successful! Your booking is confirmed.');
            }
            window.location.href = createPageUrl('MyBookings');
          } else if (status === 'cancelled') {
            error('Payment was cancelled. Please try again.');
            if (isChangePayment) {
              await Booking.update(bookingId, { change_request_status: 'pending' });
            }
            window.location.href = createPageUrl(`Payment?booking_id=${bookingId}${isChangePayment ? '&change=true' : ''}`);
          }
        } catch (err) {
          console.error("Error processing payment status:", err);
          error("There was an issue processing your payment status.");
        } finally {
          setLoading(false);
        }
      }
    };

    processPostPayment();
  }, [status, bookingId, isChangePayment]);

  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingId || status) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const bookingData = await Booking.get(bookingId);
        setBooking(bookingData);

        const venueData = await Venue.get(bookingData.venue_id);
        setVenue(venueData);
        
        const userData = await User.me();
        setUser(userData);

        if (isChangePayment) {
          setPaymentDetails({
            amount: bookingData.additional_cost,
            description: `Additional charges for changing your booking at ${venueData.title}.`,
            type: 'change'
          });
        } else {
          setPaymentDetails({
            amount: bookingData.total_amount,
            description: `Payment for booking at ${venueData.title}.`,
            type: 'booking'
          });
        }

      } catch (err) {
        console.error("Failed to load payment data:", err);
        error("Failed to load payment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [bookingId, isChangePayment, status]);

  const handlePaymentSubmit = async (cardDetails) => {
    setProcessing(true);
    setPaymentError(null);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful payment
      // In a real app, this would integrate with Stripe
      const isSuccessful = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccessful) {
        if (isChangePayment) {
          await Booking.update(booking.id, {
            change_request_payment_status: 'completed',
            change_request_status: 'payment_completed'
          });
          success('Payment successful! Your change request has been submitted to the venue owner.');
        } else {
          await Booking.update(booking.id, {
            status: 'confirmed',
            payment_status: 'succeeded'
          });
          success('Payment successful! Your booking is confirmed.');
        }
        
        // Redirect to My Bookings after successful payment
        setTimeout(() => {
          window.location.href = createPageUrl('MyBookings');
        }, 1500);
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking || !venue || !user) return <div className="text-center p-8">Could not load payment details.</div>;

  const bookingDetails = {
    venueTotal: paymentDetails.amount,
    platformFee: 0,
    discount: 0
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Secure Payment</CardTitle>
          <CardDescription>{paymentDetails.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-indigo-600">
                {formatCurrency(paymentDetails.amount, booking.currency || 'USD')}
              </span>
            </div>
          </div>
          
          {isChangePayment && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                After payment, your booking change will be submitted to the venue owner for final approval.
              </AlertDescription>
            </Alert>
          )}

          <StripePaymentForm 
            amount={paymentDetails.amount}
            currency={booking.currency || 'USD'}
            bookingDetails={bookingDetails}
            onPaymentSubmit={handlePaymentSubmit}
            processing={processing}
            error={paymentError}
          />
        </CardContent>
      </Card>
    </div>
  );
}