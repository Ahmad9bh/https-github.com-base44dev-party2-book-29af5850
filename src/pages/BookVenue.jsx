
import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { DiscountCode } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';
import { formatCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { Label } from '@/components/ui/label';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import NotificationService from '@/components/notifications/NotificationService';
import { format, differenceInMinutes, parseISO, addDays } from 'date-fns';
import { isSlotAvailableForBooking } from '@/components/venues/BookingWidget'; 
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  CheckCircle,
  Tag,
  AlertCircle,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function BookVenue() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Robust parameter check
  const venueIdParam = searchParams.get('venue_id');
  const dateParam = searchParams.get('date');
  const startTimeParam = searchParams.get('startTime');
  const endTimeParam = searchParams.get('endTime');

  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const { toast } = useToast();

  const [bookingDetails, setBookingDetails] = useState(() => {
    const guests = parseInt(searchParams.get('guests'), 10);
    return {
      venue_id: venueIdParam,
      event_date: dateParam,
      event_end_date: searchParams.get('endDate') || dateParam, // Ensure end date defaults to start date
      start_time: startTimeParam,
      end_time: endTimeParam,
      guest_count: isNaN(guests) ? 1 : guests,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      event_type: 'private_party',
      special_requests: '',
      total_amount: 0,
      currency: 'USD',
      discount_amount: 0,
      platform_fee: 0 // Initialize platform fee
    };
  });

  useEffect(() => {
    if (venueIdParam) { // Only load if venueId exists
        loadData();
    }
  }, [venueIdParam]);

  useEffect(() => {
    calculateTotalPrice();
  }, [discountApplied, venue, bookingDetails.event_date, bookingDetails.event_end_date, bookingDetails.start_time, bookingDetails.end_time]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    // This check is now redundant due to the guard below, but good for safety.
    if (!bookingDetails.venue_id) {
      toast({
        title: "Error",
        description: "No venue ID provided in the URL. Please navigate from a venue page.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const userData = await User.me().catch(() => null);
      setUser(userData);
      if (userData) {
        setBookingDetails(prev => ({
          ...prev,
          user_id: userData.id,
          contact_name: userData.full_name || '',
          contact_email: userData.email || '',
          contact_phone: userData.phone || '',
        }));
      }

      const venueData = await Venue.get(bookingDetails.venue_id);
      if (!venueData) {
        throw new Error('Venue not found or may have been removed.');
      }
      setVenue(venueData);
      setBookingDetails(prev => ({ 
        ...prev, 
        currency: venueData.currency || 'USD' 
      }));

    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError(err.message || 'Could not load booking information.');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Could not load booking information.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (venueData = venue) => {
    if (!venueData?.price_per_hour || !bookingDetails.event_date || !bookingDetails.start_time || !bookingDetails.end_time) {
      return;
    }

    try {
      const startDate = parseISO(bookingDetails.event_date);
      const endDate = parseISO(bookingDetails.event_end_date || bookingDetails.event_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("Invalid start or end date format.");
        return;
      }

      const startDateTime = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${bookingDetails.start_time}`);
      let endDateTime = parseISO(`${format(endDate, 'yyyy-MM-dd')}T${bookingDetails.end_time}`);

      // Handle overnight calculation: if end time is on the same day but earlier than start time,
      // it implies the booking spans into the next day.
      if (endDateTime <= startDateTime) {
          endDateTime = addDays(endDateTime, 1);
      }

      const totalMinutes = differenceInMinutes(endDateTime, startDateTime);
      const totalHours = totalMinutes > 0 ? totalMinutes / 60 : 0; // Calculate hours from minutes
      const basePrice = totalHours * venueData.price_per_hour;
      
      const discountAmount = discountApplied ? 
        (discountApplied.discount_type === 'percentage' ? 
          basePrice * (discountApplied.value / 100) : 
          discountApplied.value) : 0;
      
      const subtotal = Math.max(0, basePrice - discountAmount);
      const platformFeePercentage = 2.5;
      const platformFee = subtotal * (platformFeePercentage / 100);
      const finalPrice = subtotal + platformFee;
      
      setBookingDetails(prev => ({ 
        ...prev, 
        total_amount: finalPrice,
        discount_amount: discountAmount,
        base_amount: basePrice,
        platform_fee: platformFee 
      }));
    } catch (error) { 
      console.error('Error calculating total price:', error);
    }
  };

  // Guard clause to prevent rendering with incomplete data
  if (!venueIdParam || !dateParam || !startTimeParam || !endTimeParam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Incomplete Booking Information</h1>
        <p className="text-gray-600 mb-6">
          Some booking details are missing from the URL. Please start the booking process again from the venue's page to ensure all information is correct.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Please enter a discount code",
        variant: "destructive"
      });
      return;
    }

    setDiscountLoading(true);
    try {
      const codes = await DiscountCode.filter({
        code: discountCode.toUpperCase(),
        venue_id: bookingDetails.venue_id,
        is_active: true
      });
      
      const validCode = codes[0];
      if (!validCode) {
        toast({
          title: "Invalid discount code",
          description: "The discount code you entered is not valid for this venue.",
          variant: "destructive"
        });
        setDiscountLoading(false);
        return;
      }

      if (validCode.expires_at && new Date(validCode.expires_at) < new Date()) {
        toast({
          title: "Expired discount code",
          description: "This discount code has expired.",
          variant: "destructive"
        });
        setDiscountLoading(false);
        return;
      }

      setDiscountApplied(validCode);
      toast({
        title: "Discount applied!",
        description: `You saved ${formatCurrency(
          validCode.discount_type === 'percentage' ? 
            (bookingDetails.base_amount || 0) * (validCode.value / 100) : validCode.value,
          bookingDetails.currency,
          currentCurrency
        )}`,
        variant: "success"
      });
    } catch (err) {
      console.error("Failed to apply discount:", err);
      toast({
        title: "Error applying discount",
        description: "Could not validate the discount code.",
        variant: "destructive"
      });
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setDiscountApplied(null);
    setDiscountCode('');
    toast({
      title: "Discount removed",
      variant: "success"
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!venue || !user) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you are logged in.",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    // Final conflict check
    const { isAvailable } = await isSlotAvailableForBooking(
      venue.id,
      parseISO(bookingDetails.event_date),
      parseISO(bookingDetails.event_end_date || bookingDetails.event_date),
      bookingDetails.start_time,
      bookingDetails.end_time
    );

    if (!isAvailable) {
      setError("This time slot is no longer available. Please go back and select a different time.");
      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: "The selected time slot was booked while you were completing the form.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const bookingData = {
        venue_id: venue.id,
        user_id: user.id,
        event_date: bookingDetails.event_date,
        event_end_date: bookingDetails.event_end_date || bookingDetails.event_date,
        start_time: bookingDetails.start_time,
        end_time: bookingDetails.end_time,
        guest_count: parseInt(bookingDetails.guest_count),
        event_type: bookingDetails.event_type,
        special_requests: bookingDetails.special_requests,
        contact_name: bookingDetails.contact_name,
        contact_email: bookingDetails.contact_email,
        contact_phone: bookingDetails.contact_phone,
        total_amount: bookingDetails.total_amount,
        currency: bookingDetails.currency,
        discount_code: discountApplied?.code || null,
        discount_amount: bookingDetails.discount_amount || 0,
        platform_fee: bookingDetails.platform_fee || 0, 
        status: venue.instant_book_enabled ? 'confirmed' : 'pending',
      };

      const newBooking = await Booking.create(bookingData);
      await NotificationService.notifyBookingRequest(newBooking, venue);

      toast({
        title: "Booking Request Submitted!",
        description: "Your request has been sent to the venue owner.",
      });

      navigate(createPageUrl(`Payment?booking_id=${newBooking.id}`));
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "There was an error submitting your booking.");
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupBooking = () => {
    if (!bookingDetails.event_date || !bookingDetails.start_time || !bookingDetails.end_time || !bookingDetails.guest_count) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all event details before proceeding.",
        });
        return;
    }
    const bookingData = {
        ...bookingDetails,
        event_date: bookingDetails.event_date, // bookingDetails.event_date is already in 'yyyy-MM-dd' string format
    };
    const encodedBookingData = encodeURIComponent(JSON.stringify(bookingData));
    navigate(createPageUrl(`GroupBooking?venueId=${venue.id}&bookingData=${encodedBookingData}`));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue Not Found</h1>
        <p className="text-gray-600 mb-6">
          The venue you're looking for could not be found.
        </p>
        <Link to={createPageUrl('Browse')}>
          <Button>Browse Other Venues</Button>
        </Link>
      </div>
    );
  }

  const startDateTime = bookingDetails.event_date && bookingDetails.start_time ? parseISO(`${bookingDetails.event_date}T${bookingDetails.start_time}`) : null;
  let endDateTime = bookingDetails.event_end_date && bookingDetails.end_time ? parseISO(`${bookingDetails.event_end_date}T${bookingDetails.end_time}`) : null;
  
  if (startDateTime && endDateTime && endDateTime <= startDateTime) {
      endDateTime = addDays(endDateTime, 1);
  }

  const totalMinutesDisplay = startDateTime && endDateTime ? differenceInMinutes(endDateTime, startDateTime) : 0;
  const totalHoursDisplay = totalMinutesDisplay > 0 ? totalMinutesDisplay / 60 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm your Booking</h1>
        <p className="text-gray-600">Review your details and complete your reservation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Venue Info and Booking Details */}
        <div className="space-y-6">
          {/* Venue Card */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
              {venue.images && venue.images[0] ? (
                <img
                  src={venue.images[0]}
                  alt={venue.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'block'; 
                    }
                  }}
                />
              ) : null}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ display: venue.images && venue.images[0] ? 'none' : 'block' }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">{venue.title}</h2>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.location?.address}, {venue.location?.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                  <p className="font-semibold">{format(parseISO(bookingDetails.event_date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Date</Label>
                  <p className="font-semibold">
                    {format(parseISO(bookingDetails.event_end_date || bookingDetails.event_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Time</Label>
                  <p className="font-semibold">{bookingDetails.start_time} - {bookingDetails.end_time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Duration</Label>
                  <p className="font-semibold">{totalHoursDisplay} hours</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Guests</Label>
                  <p className="font-semibold">{bookingDetails.guest_count} guests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Discount Code
              </CardTitle>
              <CardDescription>
                Have a promo code? Enter it below to save on your booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!discountApplied ? (
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    onClick={applyDiscountCode}
                    disabled={discountLoading || !discountCode.trim()}
                    variant="outline"
                  >
                    {discountLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">
                        Discount Applied: {discountApplied.code}
                      </p>
                      <p className="text-sm text-green-700">
                        You saved {formatCurrency(bookingDetails.discount_amount, bookingDetails.currency, currentCurrency)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={removeDiscount}
                    variant="ghost"
                    size="sm"
                    className="text-green-700 hover:text-green-900"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Changed to space-y-6 as per outline implied */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base price ({bookingDetails?.base_amount > 0 && venue?.price_per_hour ? (bookingDetails.base_amount / venue.price_per_hour).toFixed(1) : 0} hours)</span>
                  <span>{formatCurrency(bookingDetails.base_amount || 0, bookingDetails.currency, currentCurrency)}</span>
                </div>
                
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountApplied.code})</span>
                    <span>-{formatCurrency(bookingDetails.discount_amount, bookingDetails.currency, currentCurrency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee (2.5%)</span>
                    <span>{formatCurrency(bookingDetails.platform_fee || 0, bookingDetails.currency, currentCurrency)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    {formatCurrency(bookingDetails.total_amount, bookingDetails.currency, currentCurrency)}
                  </span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleBooking} 
                  className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700" 
                  disabled={submitting} 
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Reserve and Proceed to Payment
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleGroupBooking} 
                  disabled={loading} 
                  variant="outline" 
                  size="lg" 
                  className="w-full flex items-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    Book with a Group & Split Payment
                </Button>
              </div>


              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-2">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Instant Confirmation</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                You won't be charged until your booking is confirmed by the venue owner.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
