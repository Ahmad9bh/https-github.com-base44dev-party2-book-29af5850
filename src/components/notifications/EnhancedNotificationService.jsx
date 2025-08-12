
import { SendEmail } from '@/api/integrations';
import { Notification } from '@/api/entities';
import { RealtimeNotification } from '@/api/entities'; // Assuming this provides enum-like values for notification types
import { realtimeService } from './RealtimeNotificationManager';

// Helper function for currency formatting
function formatCurrency(amount) {
  // Ensure amount is a number and handle potential non-numeric inputs gracefully
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return '$0.00'; // Default or error value
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

// Helper function to create a page URL path.
// This assumes 'path' already includes the base route and query parameters (e.g., 'GroupBooking?id=...')
// and just needs to be concatenated with the origin.
function createPageUrl(path) {
  // Prepend a '/' if the path doesn't start with one, to ensure it's a valid relative URL path segment.
  // This handles cases like 'GroupBooking?id=123' becoming '/GroupBooking?id=123'.
  return path.startsWith('/') ? path : `/${path}`;
}

class EnhancedNotificationService {
  // Booking approved notification
  static async notifyBookingApproved(booking, venue, user) {
    const title = 'Booking Confirmed! 🎉';
    const message = `Your booking at ${venue.title} has been approved for ${booking.event_date}`;
    const link = `/my-bookings`;
    const fullUrl = `${window.location.origin}${link}`;

    await Promise.all([
      // Traditional notification
      Notification.create({
        user_id: booking.user_id,
        title,
        message,
        link,
        type: 'booking_confirmed'
      }),
      
      // Real-time notification
      realtimeService.createNotification(
        booking.user_id,
        "booking_approved",
        title,
        message,
        { booking_id: booking.id, venue_id: venue.id, link }
      ),

      // Email notification
      SendEmail({
        to: user.email,
        subject: title,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Booking Confirmed!</h2>
            <p>Great news! Your booking has been approved.</p>
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${venue.title}</h3>
              <p><strong>Date:</strong> ${booking.event_date}</p>
              <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
              <p><strong>Guests:</strong> ${booking.guest_count}</p>
              <p><strong>Total:</strong> $${booking.total_amount}</p>
            </div>
            <p>We're excited for your event! If you have any questions, feel free to contact the venue owner.</p>
            <a href="${fullUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              View Booking Details
            </a>
          </div>
        `
      })
    ]);
  }

  // Booking rejected notification
  static async notifyBookingRejected(booking, venue, user, reason = '') {
    const title = 'Booking Not Available';
    const message = `Unfortunately, your booking request at ${venue.title} for ${booking.event_date} was not approved.${reason ? ` Reason: ${reason}` : ''}`;
    const link = `/browse`;
    const fullUrl = `${window.location.origin}${link}`;

    await Promise.all([
      Notification.create({
        user_id: booking.user_id,
        title,
        message,
        link,
        type: 'booking_rejected'
      }),
      
      // Changed to string literal as per outline
      realtimeService.createNotification(
        booking.user_id,
        "booking_rejected",
        title,
        message,
        { booking_id: booking.id, venue_id: venue.id, link }
      ),

      SendEmail({
        to: user.email,
        subject: title,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">Booking Not Available</h2>
            <p>We're sorry, but your booking request could not be approved.</p>
            <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${venue.title}</h3>
              <p><strong>Requested Date:</strong> ${booking.event_date}</p>
              <p><strong>Requested Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <p>Don't worry - there are many other great venues available! Browse our selection to find the perfect alternative.</p>
            <a href="${fullUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              Find Another Venue
            </a>
          </div>
        `
      })
    ]);
  }

  // New message notification
  static async notifyNewMessage(conversationId, senderId, recipientId, senderName, venueName = '') {
    const title = `New message from ${senderName}`;
    const message = venueName ? `You have a new message about ${venueName}` : 'You have a new message';
    const link = `/messages`;

    await Promise.all([
      Notification.create({
        user_id: recipientId,
        title,
        message,
        link,
        type: 'new_message'
      }),
      
      // Changed to string literal as per outline
      realtimeService.createNotification(
        recipientId,
        "new_message",
        title,
        message,
        { conversation_id: conversationId, sender_id: senderId, link }
      )
    ]);
  }

  // Venue approved notification (for venue owners)
  static async notifyVenueApproved(venue, owner) {
    const title = 'Venue Approved! 🎉';
    const message = `Your venue "${venue.title}" has been approved and is now live on Party2Go`;
    const link = `/my-venues`;
    const fullUrl = `${window.location.origin}${link}`;

    await Promise.all([
      Notification.create({
        user_id: owner.id,
        title,
        message,
        link,
        type: 'venue_approved'
      }),
      
      // Changed to string literal as per outline
      realtimeService.createNotification(
        owner.id,
        "venue_approved",
        title,
        message,
        { venue_id: venue.id, link }
      ),

      SendEmail({
        to: owner.email,
        subject: title,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Congratulations! Your Venue is Live</h2>
            <p>Great news! Your venue has been approved and is now available for bookings.</p>
            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${venue.title}</h3>
              <p><strong>Location:</strong> ${venue.location?.city || 'Not specified'}</p>
              <p><strong>Capacity:</strong> ${venue.capacity} guests</p>
              <p><strong>Price:</strong> $${venue.price_per_hour}/hour</p>
            </div>
            <p>Your venue is now visible to thousands of potential customers. Make sure to:</p>
            <ul>
              <li>Keep your calendar updated</li>
              <li>Respond quickly to booking requests</li>
              <li>Provide excellent customer service</li>
            </ul>
            <a href="${fullUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              Manage Your Venue
            </a>
          </div>
        `
      })
    ]);
  }

  // Payment received notification (for venue owners)
  static async notifyPaymentReceived(booking, venue, owner, amount) {
    const title = 'Payment Received 💰';
    const message = `You received $${amount} for booking at ${venue.title}`;
    const link = `/owner-financials`;

    await Promise.all([
      Notification.create({
        user_id: owner.id,
        title,
        message,
        link,
        type: 'payment_received'
      }),
      
      // Changed to string literal as per outline
      realtimeService.createNotification(
        owner.id,
        "payment_received",
        title,
        message,
        { booking_id: booking.id, venue_id: venue.id, amount, link }
      )
    ]);
  }

  // Booking cancelled notification (for venue owners)
  static async notifyBookingCancelled(booking, venue, owner, user) {
    const title = 'Booking Cancelled';
    const message = `${user.full_name} cancelled their booking at ${venue.title} for ${booking.event_date}`;
    const link = `/my-venues`;

    await Promise.all([
      Notification.create({
        user_id: owner.id,
        title,
        message,
        link,
        type: 'booking_cancelled'
      }),
      
      // Changed to string literal as per outline
      realtimeService.createNotification(
        owner.id,
        "booking_cancelled",
        title,
        message,
        { booking_id: booking.id, venue_id: venue.id, user_id: user.id, link }
      )
    ]);
  }

  // Team invitation notification
  static async notifyTeamInvitation(staffEmail, ownerName) {
    const title = `You're invited to join a team!`;
    const message = `${ownerName} has invited you to help manage their venues on Party2Go. Log in to accept the invitation.`;
    const link = `/user-profile`; // User can accept from their profile
    const fullUrl = `${window.location.origin}${link}`; // Construct full URL using window.location.origin

    await SendEmail({
      to: staffEmail,
      subject: title,
      body: `
        <h2>Hi there,</h2>
        <p>${message}</p>
        <p>You can view and accept this invitation by logging into your Party2Go account and navigating to the 'Invitations' tab in your profile.</p>
        <a href="${fullUrl}" 
           style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
          Accept Invitation
        </a>
        <br><br>
        <p>Thanks,</p>
        <p>The Party2Go Team</p>
      `
    });
  }
  
  // Group Booking Invitation
  static async notifyGroupBookingInvite(recipientEmail, organizerName, venueName, amount, groupBookingId) {
    const title = `You're invited to an event at ${venueName}!`;
    const message = `${organizerName} has invited you to chip in for an event. Your share is ${formatCurrency(amount)}.`;
    const link = createPageUrl(`GroupBooking?id=${groupBookingId}`);
    const fullUrl = `${window.location.origin}${link}`;

    await SendEmail({
        to: recipientEmail,
        subject: title,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #4F46E5;">You're Invited!</h2>
            <p>Hi there,</p>
            <p><strong>${organizerName}</strong> has invited you to join an event at <strong>${venueName}</strong> and split the cost.</p>
            <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 16px; margin: 0;">Your Share:</p>
              <p style="font-size: 32px; font-weight: bold; margin: 8px 0; color: #1E293B;">${formatCurrency(amount)}</p>
            </div>
            <p>Click the button below to see the event details and pay your share. The payment link will expire in 7 days.</p>
            <a href="${fullUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; text-align: center; width: calc(100% - 48px);">
              View Details & Pay Your Share
            </a>
            <p style="font-size: 12px; color: #64748B; margin-top: 24px;">If you weren't expecting this, you can safely ignore this email.</p>
          </div>
        `
    });
  }

}

export { EnhancedNotificationService };
