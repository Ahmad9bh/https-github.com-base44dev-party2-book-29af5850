
import { SendEmail } from '@/api/integrations';

export class EmailNotificationService {
  static async sendBookingConfirmation(booking, venue, user) {
    try {
      const subject = `Booking Confirmation - ${venue.title}`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Confirmed!</h2>
          <p>Dear ${booking.contact_name},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Venue:</strong> ${venue.title}</p>
            <p><strong>Date:</strong> ${new Date(booking.event_date).toLocaleDateString()}</p>
            ${booking.event_end_date && booking.event_end_date !== booking.event_date ? 
              `<p><strong>End Date:</strong> ${new Date(booking.event_end_date).toLocaleDateString()}</p>` : 
              ''
            }
            <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
            <p><strong>Guests:</strong> ${booking.guest_count}</p>
            <p><strong>Event Type:</strong> ${booking.event_type}</p>
            <p><strong>Total Amount:</strong> $${booking.total_amount.toFixed(2)}</p>
          </div>
          
          <p>If you have any questions, please contact the venue owner or our support team.</p>
          <p>Thank you for choosing Party2Book!</p>
        </div>
      `;

      await SendEmail({
        to: booking.contact_email,
        subject,
        body,
        from_name: 'Party2Book'
      });
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  static async sendBookingRequest(booking, venue, venueOwner) {
    try {
      const subject = `New Booking Request - ${venue.title}`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Booking Request</h2>
          <p>Dear ${venueOwner.full_name},</p>
          <p>You have received a new booking request for your venue:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Venue:</strong> ${venue.title}</p>
            <p><strong>Customer:</strong> ${booking.contact_name}</p>
            <p><strong>Email:</strong> ${booking.contact_email}</p>
            <p><strong>Phone:</strong> ${booking.contact_phone || 'Not provided'}</p>
            <p><strong>Date:</strong> ${new Date(booking.event_date).toLocaleDateString()}</p>
            ${booking.event_end_date && booking.event_end_date !== booking.event_date ? 
              `<p><strong>End Date:</strong> ${new Date(booking.event_end_date).toLocaleDateString()}</p>` : 
              ''
            }
            <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
            <p><strong>Guests:</strong> ${booking.guest_count}</p>
            <p><strong>Event Type:</strong> ${booking.event_type}</p>
            <p><strong>Total Amount:</strong> $${booking.total_amount.toFixed(2)}</p>
            ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
          </div>
          
          <p>Please log in to your dashboard to approve or decline this booking request.</p>
          <p><a href="${window.location.origin}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a></p>
        </div>
      `;

      await SendEmail({
        to: venueOwner.email,
        subject,
        body,
        from_name: 'Party2Book'
      });
    } catch (error) {
      console.error('Failed to send booking request email:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  static async sendVenueApproval(venue, venueOwner, status) {
    try {
      const subject = `Venue ${status === 'active' ? 'Approved' : 'Rejected'} - ${venue.title}`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'active' ? '#28a745' : '#dc3545'};">
            Venue ${status === 'active' ? 'Approved' : 'Rejected'}
          </h2>
          <p>Dear ${venueOwner.full_name},</p>
          <p>Your venue "${venue.title}" has been ${status === 'active' ? 'approved and is now live' : 'rejected'}.</p>
          
          ${status === 'active' ? `
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p><strong>Congratulations!</strong> Your venue is now visible to customers and can receive bookings.</p>
              <p>You can manage your venue and view booking requests in your dashboard.</p>
            </div>
          ` : `
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p>Unfortunately, your venue did not meet our current listing requirements.</p>
              <p>You can make improvements and resubmit for approval.</p>
            </div>
          `}
          
          <p><a href="${window.location.origin}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a></p>
        </div>
      `;

      await SendEmail({
        to: venueOwner.email,
        subject,
        body,
        from_name: 'Party2Book'
      });
    } catch (error) {
      console.error('Failed to send venue approval email:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }
}
