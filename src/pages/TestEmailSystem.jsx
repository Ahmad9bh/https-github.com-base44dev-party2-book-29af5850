import React, { useState, useEffect } from 'react';
import { EnhancedNotificationService } from '@/components/notifications/EnhancedNotificationService';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TestEmailSystem() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('booking_confirmed');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to get current user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!currentUser) {
      setResult({ success: false, message: 'No user logged in to send test email to.' });
      return;
    }

    setSending(true);
    setResult(null);
    
    // Create realistic mock data using the current user's information
    const mockUser = { 
      id: currentUser.id, 
      full_name: currentUser.full_name || 'Test User', 
      email: currentUser.email 
    };
    
    const mockVenue = { 
      id: 'test_venue_id', 
      title: 'The Grand Hall', 
      owner_id: 'owner_id', 
      owner_name: "Venue Owner" 
    };
    
    const mockOwner = { 
      id: 'owner_id', 
      full_name: 'Venue Owner', 
      email: currentUser.email // Send to current user for testing
    };
    
    const mockBooking = { 
        id: 'test_booking_id',
        user_id: currentUser.id,
        venue_id: 'test_venue_id',
        event_date: '2024-12-25',
        start_time: '18:00',
        end_time: '23:00',
        guest_count: 100,
        total_amount: 2500,
        contact_name: mockUser.full_name
    };

    try {
      let response = `Test email sent successfully to ${currentUser.email}!`;

      switch (selectedTemplate) {
        case 'booking_confirmed':
          await EnhancedNotificationService.notifyBookingApproved(mockBooking, mockVenue, mockUser);
          break;
        case 'booking_rejected':
          await EnhancedNotificationService.notifyBookingRejected(mockBooking, mockVenue, mockUser, 'Venue not available for the requested dates.');
          break;
        case 'venue_approved':
            await EnhancedNotificationService.notifyVenueApproved(mockVenue, mockOwner);
            break;
        case 'payment_received':
            await EnhancedNotificationService.notifyPaymentReceived(mockBooking, mockVenue, mockOwner, 2125);
            break;
        case 'team_invitation':
            await EnhancedNotificationService.notifyTeamInvitation(currentUser.email, "John Doe (Test Owner)");
            break;
        default:
          throw new Error('Selected template not configured for testing.');
      }
      
      setResult({ success: true, message: response });
    } catch (err) {
      console.error('Test email failed:', err);
      setResult({ success: false, message: `Test email failed: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Email System</CardTitle>
        <CardDescription>
          Send test versions of automated emails to verify they are working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Test emails will be sent to your account ({currentUser?.email || 'unknown'}). This is required for security - emails can only be sent to registered users.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="template">Email Template to Test</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking_confirmed">Booking Confirmed (to Guest)</SelectItem>
              <SelectItem value="booking_rejected">Booking Rejected (to Guest)</SelectItem>
              <SelectItem value="venue_approved">Venue Approved (to Owner)</SelectItem>
              <SelectItem value="payment_received">Payment Received (to Owner)</SelectItem>
              <SelectItem value="team_invitation">Team Invitation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSendTest} disabled={sending || !currentUser}>
          {sending ? (
            <>
              <LoadingSpinner size="h-4 w-4" />
              <span className="ml-2">Sending...</span>
            </>
          ) : (
            'Send Test Email'
          )}
        </Button>

        {result && (
          <div className={`mt-4 p-4 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p><strong>{result.success ? 'Success' : 'Error'}:</strong> {result.message}</p>
            {result.success && (
              <p className="mt-2 text-xs text-green-600">Check your email inbox for the test message.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}