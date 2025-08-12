import { Booking } from '@/api/entities';
import { VenueAvailability } from '@/api/entities';
import { format, parseISO, isWithinInterval, isSameDay } from 'date-fns';

export class BookingConflictManager {
  // Check if a venue is available for booking at a specific date and time
  static async checkAvailability(venueId, eventDate, startTime, endTime, excludeBookingId = null) {
    try {
      const dateStr = typeof eventDate === 'string' ? eventDate : format(eventDate, 'yyyy-MM-dd');

      // Check for venue availability blocks
      const availabilityBlocks = await VenueAvailability.filter({
        venue_id: venueId,
        blocked_date: dateStr
      });

      // Check if the date is completely blocked
      const fullDayBlock = availabilityBlocks.find(block => block.is_full_day);
      if (fullDayBlock) {
        return {
          available: false,
          reason: 'Date is blocked by venue owner',
          details: fullDayBlock
        };
      }

      // Check for partial day blocks that conflict
      const partialBlocks = availabilityBlocks.filter(block => !block.is_full_day);
      for (const block of partialBlocks) {
        if (this.timeRangesOverlap(startTime, endTime, block.start_time, block.end_time)) {
          return {
            available: false,
            reason: 'Time slot is blocked by venue owner',
            details: block
          };
        }
      }

      // Check for existing bookings that conflict
      const existingBookings = await Booking.filter({
        venue_id: venueId,
        event_date: dateStr,
        status: { '$in': ['confirmed', 'pending', 'payment_pending', 'slot_reserved', 'payment_processing'] }
      });

      // Exclude current booking if editing
      const relevantBookings = excludeBookingId 
        ? existingBookings.filter(b => b.id !== excludeBookingId)
        : existingBookings;

      for (const booking of relevantBookings) {
        if (this.timeRangesOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
          return {
            available: false,
            reason: 'Time slot conflicts with existing booking',
            details: booking
          };
        }
      }

      return {
        available: true,
        reason: 'Time slot is available'
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  // Reserve a time slot temporarily during the booking process
  static async reserveSlot(venueId, eventDate, startTime, endTime, userId, reservationMinutes = 15) {
    try {
      // First check availability
      const availability = await this.checkAvailability(venueId, eventDate, startTime, endTime);
      if (!availability.available) {
        throw new Error(availability.reason);
      }

      const dateStr = typeof eventDate === 'string' ? eventDate : format(eventDate, 'yyyy-MM-dd');
      const reservationExpiry = new Date(Date.now() + reservationMinutes * 60 * 1000);

      // Create a temporary booking with slot_reserved status
      const reservation = await Booking.create({
        venue_id: venueId,
        user_id: userId,
        event_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        guest_count: 1, // Temporary value
        total_amount: 0, // Temporary value
        status: 'slot_reserved',
        slot_reserved_at: new Date().toISOString(),
        slot_reservation_expires: reservationExpiry.toISOString(),
        conflict_checked_at: new Date().toISOString()
      });

      return {
        success: true,
        reservationId: reservation.id,
        expiresAt: reservationExpiry
      };
    } catch (error) {
      console.error('Error reserving slot:', error);
      throw error;
    }
  }

  // Convert a slot reservation to a confirmed booking
  static async confirmReservation(reservationId, bookingData) {
    try {
      const reservation = await Booking.get(reservationId);
      
      if (!reservation || reservation.status !== 'slot_reserved') {
        throw new Error('Invalid or expired reservation');
      }

      // Check if reservation has expired
      if (new Date() > new Date(reservation.slot_reservation_expires)) {
        await Booking.delete(reservationId);
        throw new Error('Reservation has expired');
      }

      // Double-check availability before confirming
      const availability = await this.checkAvailability(
        reservation.venue_id,
        reservation.event_date,
        reservation.start_time,
        reservation.end_time,
        reservationId
      );

      if (!availability.available) {
        await Booking.delete(reservationId);
        throw new Error('Time slot is no longer available');
      }

      // Update the reservation with full booking data
      const confirmedBooking = await Booking.update(reservationId, {
        ...bookingData,
        status: bookingData.is_instant_booking ? 'confirmed' : 'pending',
        conflict_checked_at: new Date().toISOString(),
        slot_reserved_at: null,
        slot_reservation_expires: null
      });

      return confirmedBooking;
    } catch (error) {
      console.error('Error confirming reservation:', error);
      throw error;
    }
  }

  // Clean up expired reservations
  static async cleanupExpiredReservations() {
    try {
      const expiredReservations = await Booking.filter({
        status: 'slot_reserved',
        slot_reservation_expires: { '$lt': new Date().toISOString() }
      });

      for (const reservation of expiredReservations) {
        await Booking.delete(reservation.id);
      }

      console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
      return expiredReservations.length;
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
      throw error;
    }
  }

  // Check if two time ranges overlap
  static timeRangesOverlap(start1, end1, start2, end2) {
    // Convert time strings to minutes for comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);

    // Check for overlap: ranges overlap if start1 < end2 AND start2 < end1
    return start1Min < end2Min && start2Min < end1Min;
  }

  // Get venue's availability for a date range
  static async getVenueAvailability(venueId, startDate, endDate) {
    try {
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Get blocked dates
      const blockedDates = await VenueAvailability.filter({
        venue_id: venueId,
        blocked_date: {
          '$gte': startDateStr,
          '$lte': endDateStr
        }
      });

      // Get existing bookings
      const bookings = await Booking.filter({
        venue_id: venueId,
        event_date: {
          '$gte': startDateStr,
          '$lte': endDateStr
        },
        status: { '$in': ['confirmed', 'pending', 'payment_pending', 'slot_reserved'] }
      });

      return {
        blockedDates,
        bookings
      };
    } catch (error) {
      console.error('Error getting venue availability:', error);
      throw error;
    }
  }

  // Check if venue is eligible for instant booking
  static async checkInstantBookEligibility(venueId) {
    try {
      const { Venue } = await import('@/api/entities');
      const venue = await Venue.get(venueId);

      if (!venue) {
        return { eligible: false, reason: 'Venue not found' };
      }

      // Criteria for instant book eligibility
      const criteria = {
        hasMinimumRating: venue.rating >= 4.5,
        hasMinimumReviews: venue.total_reviews >= 10,
        hasMinimumBookings: venue.total_bookings >= 20,
        ownerVerified: venue.owner_verification_status === 'verified',
        venueActive: venue.status === 'active',
        instantBookEnabled: venue.instant_book_enabled
      };

      const eligible = Object.values(criteria).every(Boolean);

      return {
        eligible,
        criteria,
        reason: eligible ? 'Venue meets all criteria' : 'Venue does not meet all criteria'
      };
    } catch (error) {
      console.error('Error checking instant book eligibility:', error);
      throw error;
    }
  }
}