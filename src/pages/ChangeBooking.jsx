
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CreditCard, Info } from 'lucide-react';
import { format, set, parseISO, differenceInMinutes, addDays } from 'date-fns';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';
import VenueCalendar from '@/components/venues/VenueCalendar';
import { formatCurrency } from '@/components/common/FormatUtils';

export default function ChangeBooking() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const [requestedDate, setRequestedDate] = useState(null);
  const [requestedStartTime, setRequestedStartTime] = useState('');
  const [requestedEndTime, setRequestedEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  // Pricing calculation states
  const [originalHours, setOriginalHours] = useState(0);
  const [newHours, setNewHours] = useState(0);
  const [additionalHours, setAdditionalHours] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);

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
          throw new Error("You can only change your own bookings.");
        }
        if (bookingData.status !== 'confirmed') {
          throw new Error("Only confirmed bookings can be changed.");
        }
        if (bookingData.change_request_status === 'pending') {
            throw new Error("A change request for this booking is already pending.");
        }
        // If there's a pending payment for a change request, redirect to payment
        if (bookingData.change_request_status === 'payment_pending' && bookingData.change_request_payment_status === 'pending' && bookingData.additional_cost > 0) {
          window.location.href = createPageUrl(`Payment?booking_id=${booking.id}&change=true&amount=${Math.round(bookingData.additional_cost * 100)}`);
          return; // Stop loading the form if redirecting to payment
        }

        setUser(currentUser);
        setBooking(bookingData);
        setRequestedDate(parseISO(bookingData.event_date));
        setRequestedStartTime(bookingData.start_time || '');
        setRequestedEndTime(bookingData.end_time || '');

        const venueData = await Venue.get(bookingData.venue_id);
        setVenue(venueData);

        // Calculate original hours
        const originalStartDateTime = parseISO(`${bookingData.event_date}T${bookingData.start_time}`);
        let originalEndDateTime = parseISO(`${bookingData.event_date}T${bookingData.end_time}`);
        if (originalEndDateTime <= originalStartDateTime) {
          originalEndDateTime = addDays(originalEndDateTime, 1);
        }
        const originalTotalMinutes = differenceInMinutes(originalEndDateTime, originalStartDateTime);
        const originalTotalHours = originalTotalMinutes > 0 ? originalTotalMinutes / 60 : 0;
        setOriginalHours(originalTotalHours);

      } catch (err) {
        console.error("Failed to load booking data:", err);
        error(err.message || "Failed to load booking data.");
        window.location.href = createPageUrl('MyBookings');
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [bookingId, error, success]); // Added dependencies for useEffect

  useEffect(() => {
    if (requestedDate) {
      generateTimeSlots();
    }
  }, [requestedDate]);

  // Calculate pricing when times change
  useEffect(() => {
    if (requestedDate && requestedStartTime && requestedEndTime && venue?.price_per_hour) {
      calculatePricingChanges();
    }
  }, [requestedDate, requestedStartTime, requestedEndTime, venue, originalHours]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    setTimeSlots(slots);
  };

  const calculatePricingChanges = () => {
    try {
      const newStartDateTime = parseISO(`${format(requestedDate, 'yyyy-MM-dd')}T${requestedStartTime}`);
      let newEndDateTime = parseISO(`${format(requestedDate, 'yyyy-MM-dd')}T${requestedEndTime}`);
      
      if (newEndDateTime <= newStartDateTime) {
        newEndDateTime = addDays(newEndDateTime, 1);
      }
      
      const newTotalMinutes = differenceInMinutes(newEndDateTime, newStartDateTime);
      const newTotalHours = newTotalMinutes > 0 ? newTotalMinutes / 60 : 0;
      
      setNewHours(newTotalHours);
      
      const hoursDifference = newTotalHours - originalHours;
      setAdditionalHours(hoursDifference);
      
      if (hoursDifference > 0) {
        const additionalPrice = hoursDifference * venue.price_per_hour;
        const platformFee = additionalPrice * 0.025; // 2.5% platform fee
        const totalAdditionalCost = additionalPrice + platformFee;
        
        setAdditionalCost(totalAdditionalCost);
      } else {
        setAdditionalCost(0);
      }
    } catch (error) {
      console.error('Error calculating pricing changes:', error);
      setAdditionalCost(0);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!requestedDate) {
      errors.date = 'Please select a new date';
    }
    if (!requestedStartTime) {
      errors.startTime = 'Please select a start time';
    }
    if (!requestedEndTime) {
      errors.endTime = 'Please select an end time';
    }
    // Basic check for valid time range (start before end)
    if (requestedStartTime && requestedEndTime) {
      const startMinutes = parseInt(requestedStartTime.split(':')[0]) * 60 + parseInt(requestedStartTime.split(':')[1]);
      const endMinutes = parseInt(requestedEndTime.split(':')[0]) * 60 + parseInt(requestedEndTime.split(':')[1]);
      if (endMinutes < startMinutes && additionalHours <= 0) { // Allow overnight bookings
        errors.timeRange = 'End time must be after start time for same-day bookings. If extending overnight, ensure selected times reflect this.';
      }
    }
    if (!reason.trim()) {
      errors.reason = 'Please provide a reason for the change';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const updatePayload = {
        change_request_status: additionalCost > 0 ? 'payment_pending' : 'pending',
        requested_event_date: format(requestedDate, 'yyyy-MM-dd'),
        requested_start_time: requestedStartTime,
        requested_end_time: requestedEndTime,
        change_request_reason: reason,
        additional_cost: additionalCost,
        change_request_payment_status: additionalCost > 0 ? 'pending' : 'not_required'
      };

      await Booking.update(booking.id, updatePayload);

      if (additionalCost > 0) {
        // Redirect to payment page for the additional cost
        window.location.href = createPageUrl(`Payment?booking_id=${booking.id}&change=true&amount=${Math.round(additionalCost * 100)}`);
      } else {
        // No additional cost, just submit directly
        success("Change request submitted successfully. The venue owner will review your request.");
        window.location.href = createPageUrl('MyBookings');
      }
      
    } catch (err) {
      console.error("Failed to submit change request:", err);
      error(err.message || "Failed to submit change request. Please try again.");
      setSubmitting(false); // Only set back to false if there was an error before redirection
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking || !venue) return <div>Booking or Venue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Request Booking Change for {venue.title}</CardTitle>
          <CardDescription>
            Current booking: {format(parseISO(booking.event_date), 'MMMM d, yyyy')} from {booking.start_time} to {booking.end_time} ({originalHours.toFixed(1)} hours).<br />
            Please select your new desired date and time. The venue owner will need to approve this change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show form errors */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {Object.values(formErrors).map((err, index) => (
                    <div key={index}>{err}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Required Alert */}
          {additionalCost > 0 && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">Additional Payment Required</p>
                  <div className="text-sm text-blue-800">
                    <p>You're extending your booking by <strong>{additionalHours.toFixed(1)} hours</strong></p>
                    <p>Additional cost: <strong>{formatCurrency(additionalCost, booking.currency || 'USD')}</strong></p>
                    <p className="text-xs text-blue-600 mt-1">*Includes 2.5% platform fee</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Pricing Summary */}
          {newHours > 0 && (
            <Card className="mb-6 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Original booking ({originalHours.toFixed(1)} hours)</span>
                  <span>{formatCurrency(originalHours * venue.price_per_hour, booking.currency || 'USD')}</span>
                </div>
                
                {additionalHours > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Additional hours (+{additionalHours.toFixed(1)} hours)</span>
                      <span>+{formatCurrency(additionalHours * venue.price_per_hour, booking.currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Platform fee (2.5%)</span>
                      <span>+{formatCurrency(additionalHours * venue.price_per_hour * 0.025, booking.currency || 'USD')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Additional Payment Required</span>
                      <span>{formatCurrency(additionalCost, booking.currency || 'USD')}</span>
                    </div>
                  </>
                )}
                
                {additionalHours < 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Reduction in hours ({Math.abs(additionalHours).toFixed(1)} hours less)</span>
                    <span>No additional payment required</span>
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>New Total ({newHours.toFixed(1)} hours)</span>
                  <span>{formatCurrency(newHours * venue.price_per_hour * (additionalHours > 0 ? 1.025 : 1), booking.currency || 'USD')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <VenueCalendar 
                venue={venue}
                selected={requestedDate}
                onSelect={setRequestedDate}
                currentLanguage="en"
              />
            </div>
            <div className="space-y-6">
              <div>
                <Label>New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {requestedDate ? format(requestedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={requestedDate}
                      onSelect={setRequestedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">New Start Time</Label>
                  <Select onValueChange={setRequestedStartTime} value={requestedStartTime}>
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="end-time">New End Time</Label>
                  <Select onValueChange={setRequestedEndTime} value={requestedEndTime}>
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Change *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a brief reason for this change request."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link to={createPageUrl('MyBookings')}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : (additionalCost > 0 ? 'Proceed to Payment' : 'Submit Request')}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
