
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Dispute } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Gavel } from 'lucide-react';

export default function OpenDispute() {
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    desired_outcome: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = new URLSearchParams(location.search).get('bookingId');

  useEffect(() => {
    if (!bookingId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No booking ID provided.' });
      navigate('/my-bookings');
      return;
    }
    loadDisputeData();
  }, [bookingId]);

  const loadDisputeData = async () => {
    setLoading(true);
    try {
      const [currentUser, bookingData] = await Promise.all([
        User.me(),
        Booking.get(bookingId)
      ]);
      setUser(currentUser);
      setBooking(bookingData);

      if (bookingData.user_id !== currentUser.id && bookingData.owner_id !== currentUser.id) {
          toast({ variant: 'destructive', title: 'Access Denied', description: 'You cannot open a dispute for this booking.' });
          navigate('/my-bookings');
          return;
      }
      
      const venueData = await Venue.get(bookingData.venue_id);
      setVenue(venueData);

    } catch (error) {
      console.error('Failed to load dispute data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, reason: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.description || !formData.desired_outcome) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
      return;
    }
    setSubmitting(true);
    try {
        const defendant = user.id === booking.user_id ? 
            { id: venue.owner_id, name: venue.owner_name } :
            { id: booking.user_id, name: booking.contact_name };

      await Dispute.create({
        booking_id: booking.id,
        venue_id: venue.id,
        reporter_id: user.id,
        reporter_name: user.full_name,
        defendant_id: defendant.id,
        defendant_name: defendant.name,
        reason: formData.reason,
        description: formData.description,
        desired_outcome: formData.desired_outcome,
      });

      toast({ title: 'Dispute Submitted', description: 'Your case has been sent to our resolution team. We will review it shortly.' });
      navigate('/my-bookings');
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your dispute. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking || !venue) return <div className="text-center p-8">Could not load booking details.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gavel className="w-6 h-6" /> Open a Dispute
          </CardTitle>
          <CardDescription>
            Report an issue with your booking for "{venue.title}". Our team will mediate to find a fair resolution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold">Booking Details</h4>
            <p><strong>Venue:</strong> {venue.title}</p>
            <p><strong>Date:</strong> {booking.event_date}</p>
            <p><strong>Total Paid:</strong> ${booking.total_amount}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="reason">Reason for Dispute</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue_not_as_described">Venue not as described</SelectItem>
                  <SelectItem value="cancellation_issue">Cancellation issue</SelectItem>
                  <SelectItem value="payment_issue">Payment / Refund issue</SelectItem>
                  <SelectItem value="damages">Damages or property issue</SelectItem>
                  <SelectItem value="communication_issue">Communication issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="description">Detailed Explanation</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please describe the issue in detail. What happened? When did it happen? Who was involved?"
                rows={6}
                required
              />
            </div>
             <div>
              <Label htmlFor="desired_outcome">Desired Outcome</Label>
              <Input
                id="desired_outcome"
                value={formData.desired_outcome}
                onChange={handleInputChange}
                placeholder="e.g., Full refund, Partial refund of $500, Apology..."
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              By submitting this dispute, you agree to allow Party2Go's resolution team to review your booking details and message history with the other party.
            </p>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <LoadingSpinner size="h-4 w-4" /> : 'Submit Dispute'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
