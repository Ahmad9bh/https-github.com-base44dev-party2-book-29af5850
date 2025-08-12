
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { Label } from '@/components/ui/label';
import { Users, Calendar as CalendarIcon, Clock, Shield, Star, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format, differenceInMinutes, parseISO, eachDayOfInterval, addDays } from 'date-fns';
import { formatCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useToast } from '@/components/ui/use-toast';
import { Booking } from '@/api/entities';
import { VenueAvailability } from '@/api/entities';
import { VenuePricing } from '@/api/entities'; // Added VenuePricing import

function generateTimeSlots() {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
}

// Helper function to check if a date is booked (full day)
const isDateBooked = (date, bookedDatesArray) => {
  return bookedDatesArray.some(bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
};

export default function BookingWidget({ venue, onBook, currentLanguage, currentCurrency }) {
  const [startDate, setStartDate] = useState(null); // Changed from dateRange to startDate for single day selection
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [guestCount, setGuestCount] = useState(venue?.capacity ? Math.min(50, venue.capacity) : 50);
  const [totalPrice, setTotalPrice] = useState(null); // Changed initial state to null
  const [totalHours, setTotalHours] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);
  const [availability, setAvailability] = useState([]); // New state for raw VenueAvailability objects
  const [pricingRules, setPricingRules] = useState([]); // New state for pricing rules
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const timeSlots = generateTimeSlots();
  const { toast } = useToast();

  useEffect(() => {
    if (venue?.id) {
      loadVenueData(); // Renamed and consolidated
    }
  }, [venue?.id]); // Depend on venue.id

  const loadVenueData = async () => {
    if (!venue?.id) return;
    try {
      const [bookingsData, availabilityData, pricingData] = await Promise.all([
        Booking.filter({ venue_id: venue.id, status: { $in: ['confirmed', 'completed', 'pending'] } }),
        VenueAvailability.filter({ venue_id: venue.id }),
        VenuePricing.filter({ venue_id: venue.id, is_active: true })
      ]);

      setBookedDates(bookingsData.flatMap(b => {
        const start = parseISO(b.event_date);
        const end = b.event_end_date ? parseISO(b.event_end_date) : start;
        return eachDayOfInterval({ start: start, end: end });
      }));
      setAvailability(availabilityData); // Store raw availability objects
      setPricingRules(pricingData);
    } catch (err) {
      console.error("Failed to load venue data:", err);
      toast({ title: "Could not load venue data", description: "There was an error fetching venue availability and pricing data.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (startDate && startTime && endTime && venue.price_per_hour) {
      calculatePrice();
      checkAvailability();
    } else {
      setTotalPrice(null); // Set to null if conditions not met
      setTotalHours(0);
      setIsSlotAvailable(true); // Reset availability status
      setIsChecking(false);
    }
  }, [startDate, startTime, endTime, guestCount, venue.price_per_hour, pricingRules, venue?.id]); // Add pricingRules as dependency

  const calculatePrice = () => {
    if (!startDate || !startTime || !endTime || !venue.price_per_hour) {
      setTotalPrice(null);
      setTotalHours(0);
      return;
    }

    const startDateTime = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${startTime}`);
    let endDateTime = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${endTime}`);

    // Handle overnight booking: if end time is on the same day or earlier, it wraps to the next day.
    if (endDateTime <= startDateTime) {
      endDateTime = addDays(endDateTime, 1);
    }

    const totalMinutes = differenceInMinutes(endDateTime, startDateTime);
    const calculatedTotalHours = totalMinutes > 0 ? totalMinutes / 60 : 0;

    let adjustedPricePerHour = venue.price_per_hour;

    // Apply dynamic pricing
    const applicableRule = pricingRules.find(rule => {
      const eventDate = new Date(startDate);
      const dayOfWeek = eventDate.getDay(); // 0 = Sunday

      const ruleAppliesToDay = !rule.days_of_week || rule.days_of_week.includes(dayOfWeek);
      // Ensure rule dates are parsed correctly for comparison
      const ruleAppliesToDate = (!rule.start_date || eventDate >= parseISO(rule.start_date)) && (!rule.end_date || eventDate <= parseISO(rule.end_date));
      return ruleAppliesToDay && ruleAppliesToDate;
    });

    if (applicableRule) {
      if (applicableRule.price_modifier_type === 'percentage') {
        adjustedPricePerHour *= (1 + applicableRule.price_modifier_value / 100);
      } else { // fixed
        adjustedPricePerHour += applicableRule.price_modifier_value;
      }
    }

    const newTotalPrice = calculatedTotalHours * adjustedPricePerHour;
    setTotalPrice(newTotalPrice);
    setTotalHours(calculatedTotalHours);
  };

  const checkAvailability = async () => {
    setIsChecking(true);
    // Determine the effective end date for overnight bookings for the check.
    const effectiveEndDate = (endTime <= startTime) ? addDays(startDate, 1) : startDate;

    const { isAvailable } = await isSlotAvailableForBooking(venue.id, startDate, effectiveEndDate, startTime, endTime);
    setIsSlotAvailable(isAvailable);
    setIsChecking(false);
  };

  const handleReserve = () => {
    if (!startDate) {
      toast({ title: "Please select your event date", variant: 'destructive' }); // Changed to singular "date"
      return;
    }

    // Determine the effective end date based on time for overnight bookings
    let effectiveEndDateForBooking = startDate;
    const startDateTimeForCheck = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${startTime}`);
    let endDateTimeForCheck = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${endTime}`);
    if (endDateTimeForCheck <= startDateTimeForCheck) {
      effectiveEndDateForBooking = addDays(effectiveEndDateForBooking, 1);
    }

    if (guestCount > venue.capacity) {
      toast({ title: `Number of guests cannot exceed capacity of ${venue.capacity}`, variant: 'destructive' });
      return;
    }
    if (!isSlotAvailable) {
      toast({ title: "The selected slot is not available.", description: "Please choose a different date or time.", variant: 'destructive' });
      return;
    }
    if (totalHours <= 0) {
      toast({ title: "Booking duration must be at least 1 hour.", description: "Please adjust your start and end times.", variant: 'destructive' });
      return;
    }
    onBook(startDate, effectiveEndDateForBooking, startTime, endTime, guestCount);
  };

  return (
    <Card className="shadow-lg rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-2xl">
          {formatCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency)}
          <span className="text-base font-normal text-gray-500">/{getLocalizedText('hour', currentLanguage)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-2">
            {/* Price display is now in CardTitle, so this part can be adjusted or removed if redundant */}
            {/* This div might be for additional details, so keeping it but commenting out price part if CardTitle is primary */}
            {/* <span className="text-3xl font-bold">{formatCurrency(venue.price_per_hour, venue.currency, currentCurrency)}</span>
            <span className="text-gray-500">/ hour</span> */}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{venue.rating?.toFixed(1)}</span>
            <span className="text-gray-500">({venue.total_reviews} reviews)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="event-date" className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
              {getLocalizedText('event_date', currentLanguage)}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="event-date" variant="outline" className="w-full justify-start font-normal text-left h-11 text-base">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>{getLocalizedText('pick_a_date', currentLanguage)}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="single" // Changed to single mode
                  selected={startDate}
                  onSelect={setStartDate}
                  numberOfMonths={1}
                  disabled={(date) => {
                    const isPast = date < new Date();
                    const isBooked = isDateBooked(date, bookedDates); // Use the helper
                    const isBlocked = availability.some(a => format(parseISO(a.blocked_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                    return isPast || isBooked || isBlocked;
                  }}
                  // Modifiers and modifiersStyles removed as per outline's implied JSX
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time" className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="start-time" className="h-11 text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => <SelectItem key={`start-${time}`} value={time}>{format(new Date(`1970-01-01T${time}`), 'p')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="end-time" className="text-xs font-semibold text-gray-500 tracking-wider uppercase">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="end-time" className="h-11 text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => <SelectItem key={`end-${time}`} value={time}>{format(new Date(`1970-01-01T${time}`), 'p')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="guests" className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Number of Guests</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="guests"
                type="number"
                placeholder="Number of guests"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                className="pl-10 h-11 text-base"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum capacity: {venue.capacity} guests</p>
          </div>
        </div>

        <div className="mt-4 h-6 text-sm flex items-center">
          {startDate && ( // Check for startDate instead of dateRange.from
            isChecking ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Checking availability...</span>
              </div>
            ) : isSlotAvailable ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>This time slot is available!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <XCircle className="w-5 h-5" />
                <span>Sorry, this slot is unavailable.</span>
              </div>
            )
          )}
        </div>

        <div className="mt-2">
          <Button
            onClick={handleReserve}
            className="w-full h-12 text-base font-semibold"
            disabled={!isSlotAvailable || isChecking || !startDate || totalHours <= 0} // Check for startDate
            size="lg"
          >
            Reserve Now
          </Button>
        </div>

        {totalPrice !== null && totalPrice > 0 && ( // Check for null before > 0
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{formatCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency)} x {totalHours} hours</span>
              <span>{formatCurrency(totalPrice, venue.currency || 'USD', currentCurrency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total Price</span>
              <span>{formatCurrency(totalPrice, venue.currency || 'USD', currentCurrency)}</span>
            </div>
            {/* Removed multi-day specific price breakdown as per single day mode */}
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          You won't be charged until your booking is confirmed by the venue owner.
        </div>

        <div className="flex justify-around items-center mt-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-600" /> Secure Payment</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" /> Instant Confirmation</span>
        </div>
      </CardContent>
    </Card>
  );
}

export async function isSlotAvailableForBooking(venueId, startDate, endDate, startTime, endTime) {
  try {
    const startDateTime = parseISO(`${format(startDate, 'yyyy-MM-dd')}T${startTime}`);
    let finalEndDate = endDate; // This `endDate` is already adjusted for overnight from BookingWidget
    let endDateTime = parseISO(`${format(endDate, 'yyyy-MM-dd')}T${endTime}`); // Use the passed endDate

    // This handles the overnight part for the endDateTime itself
    if (endDateTime <= startDateTime) {
      endDateTime = addDays(endDateTime, 1);
    }

    // Check for overlaps with existing confirmed/pending bookings
    const bookings = await Booking.filter({
      venue_id: venueId,
      status: { $in: ['confirmed', 'pending'] },
      // Check for bookings whose period overlaps with the requested slot
      event_date: { $lte: format(finalEndDate, 'yyyy-MM-dd') },
      event_end_date: { $gte: format(startDate, 'yyyy-MM-dd') }
    });

    for (const booking of bookings) {
      const existingStart = parseISO(`${booking.event_date}T${booking.start_time}`);
      // Ensure existingEnd accounts for overnight bookings in the database
      const existingEnd = booking.event_end_date
        ? parseISO(`${booking.event_end_date}T${booking.end_time}`)
        : parseISO(`${booking.event_date}T${booking.end_time}`);

      if (existingEnd <= existingStart) { // If the stored booking itself is overnight
        existingEnd = addDays(existingEnd, 1);
      }

      if (startDateTime < existingEnd && endDateTime > existingStart) {
        return { isAvailable: false, conflictingBooking: booking };
      }
    }

    // Check for overlaps with blocked availability slots
    const venueAvailabilityRecords = await VenueAvailability.filter({
      venue_id: venueId,
      blocked_date: { $gte: format(startDate, 'yyyy-MM-dd'), $lte: format(finalEndDate, 'yyyy-MM-dd') }
    });

    for (const blocked of venueAvailabilityRecords) {
      const existingBlockedStart = parseISO(`${blocked.blocked_date}T${blocked.start_time}`);
      let existingBlockedEnd = parseISO(`${blocked.blocked_date}T${blocked.end_time}`);

      // Handle overnight blocking, if applicable (e.g., 23:00-02:00)
      if (existingBlockedEnd <= existingBlockedStart) {
        existingBlockedEnd = addDays(existingBlockedEnd, 1);
      }

      if (startDateTime < existingBlockedEnd && endDateTime > existingBlockedStart) {
        return { isAvailable: false, conflictingAvailability: blocked };
      }
    }

    return { isAvailable: true };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { isAvailable: false };
  }
}
