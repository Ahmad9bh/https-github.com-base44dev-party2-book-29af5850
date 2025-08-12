
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { createPageUrl } from '@/utils';

class NotificationService {
  // Create a booking request notification for venue owner
  static async notifyBookingRequest(booking, venue) {
    try {
      await Notification.create({
        user_id: venue.owner_id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${booking.contact_name} wants to book ${venue.title} for ${booking.guest_count} guests on ${booking.event_date}`,
        link: createPageUrl('MyVenues?tab=bookings'),
      });
    } catch (error) {
      console.error('Failed to send booking request notification:', error);
    }
  }

  // Notify guest when booking is confirmed
  static async notifyBookingConfirmed(booking, venue) {
    try {
      // Use the user_id directly from the booking object.
      // Filtering the User table is an admin-only action.
      if (booking.user_id) {
        await Notification.create({
          user_id: booking.user_id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed!',
          message: `Your booking at ${venue.title} has been confirmed for ${booking.event_date}`,
          link: createPageUrl('MyBookings'),
        });
      }
    } catch (error) {
      console.error('Failed to send booking confirmation notification:', error);
    }
  }

  // Notify guest when booking is rejected
  static async notifyBookingRejected(booking, venue, reason = '') {
    try {
       // Use the user_id directly from the booking object.
      if (booking.user_id) {
        await Notification.create({
          user_id: booking.user_id,
          type: 'booking_rejected',
          title: 'Booking Not Available',
          message: `Unfortunately, your booking request for ${venue.title} was not approved. ${reason}`,
          link: createPageUrl('Browse'),
        });
      }
    } catch (error) {
      console.error('Failed to send booking rejection notification:', error);
    }
  }

  // Notify venue owner when they have a new message
  static async notifyNewMessage(conversationId, senderId, receiverId, senderName, venueTitle) {
    try {
      await Notification.create({
        user_id: receiverId,
        type: 'new_message',
        title: 'New Message',
        message: `${senderName} sent you a message${venueTitle ? ` about ${venueTitle}` : ''}`,
        link: createPageUrl('Messages'),
      });
    } catch (error) {
      console.error('Failed to send new message notification:', error);
    }
  }

  // Notify venue owner when their venue is approved
  static async notifyVenueApproved(venue) {
    try {
      await Notification.create({
        user_id: venue.owner_id,
        type: 'venue_approved',
        title: 'Venue Approved!',
        message: `Your venue "${venue.title}" has been approved and is now live on the platform`,
        link: createPageUrl(`VenueDetails?id=${venue.id}`),
      });
    } catch (error) {
      console.error('Failed to send venue approval notification:', error);
    }
  }

  // Notify guest to write a review after their event
  static async notifyReviewRequest(booking, venue) {
    try {
       // Use the user_id directly from the booking object.
      if (booking.user_id) {
        await Notification.create({
          user_id: booking.user_id,
          type: 'review_request',
          title: 'How was your event?',
          message: `Please share your experience at ${venue.title} to help other guests`,
          link: createPageUrl(`WriteReview?booking_id=${booking.id}`),
        });
      }
    } catch (error) {
      console.error('Failed to send review request notification:', error);
    }
  }

  // Bulk notification for announcements
  static async sendAnnouncementToAllUsers(title, message, link = null) {
    try {
      const allUsers = await User.list();
      const notifications = allUsers.map(user => ({
        user_id: user.id,
        type: 'announcement',
        title,
        message,
        link: link || createPageUrl('Home'),
      }));

      // Create notifications in batches to avoid overwhelming the system
      for (let i = 0; i < notifications.length; i += 50) {
        const batch = notifications.slice(i, i + 50);
        await Promise.all(batch.map(n => Notification.create(n)));
      }
    } catch (error) {
      console.error('Failed to send announcement notifications:', error);
    }
  }

  // Clean up old read notifications (call this periodically)
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldNotifications = await Notification.filter({
        is_read: true,
        created_date: { '$lt': cutoffDate.toISOString() }
      });

      // Delete old notifications in batches
      for (const notification of oldNotifications) {
        await Notification.delete(notification.id);
      }

      console.log(`Cleaned up ${oldNotifications.length} old notifications`);
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
    }
  }
}

export default NotificationService;
