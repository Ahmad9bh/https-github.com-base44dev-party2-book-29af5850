import React, { useState, useEffect } from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { GroupBooking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Users, Mail, Trash2, DollarSign, Send, Info, CheckCircle, XCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { EnhancedNotificationService } from '@/components/notifications/EnhancedNotificationService';

export default function GroupBookingPage() {
  const [mode, setMode] = useState('organizer'); // organizer | contributor
  const [groupBooking, setGroupBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributors, setContributors] = useState([]);
  
  const location = useLocation();
  const history = useHistory();
  const { toast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('id');
  const bookingData = JSON.parse(queryParams.get('bookingData') || '{}');
  const venueId = queryParams.get('venueId');

  useEffect(() => {
    initializePage();
  }, [location.search]);

  const initializePage = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (bookingId) {
        // Contributor or returning organizer view
        setMode('contributor');
        const gb = await GroupBooking.get(bookingId);
        setGroupBooking(gb);
        setContributors(gb.contributors);
        const venueData = await Venue.get(gb.venue_id);
        setVenue(venueData);
      } else if (venueId && bookingData.event_date) {
        // Organizer's first visit
        setMode('organizer');
        const venueData = await Venue.get(venueId);
        setVenue(venueData);
        // Add organizer as the first contributor
        setContributors([{ email: currentUser.email, name: currentUser.full_name || 'Organizer', amount: 0 }]);
      } else {
        history.push(createPageUrl('Browse'));
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Could not initialize group booking.' });
      }
    } catch (err) {
      console.error("Initialization failed:", err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load page data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContributor = () => {
    if (contributorEmail && !contributors.some(c => c.email === contributorEmail)) {
      setContributors([...contributors, { email: contributorEmail, name: 'Invited Guest', amount: 0 }]);
      setContributorEmail('');
    }
  };

  const handleRemoveContributor = (email) => {
    if (email === user.email) {
      toast({ variant: 'destructive', description: "You can't remove yourself as the organizer." });
      return;
    }
    setContributors(contributors.filter(c => c.email !== email));
  };
  
  useEffect(() => {
    // Recalculate amounts whenever contributors change
    if (mode === 'organizer' && contributors.length > 0 && bookingData.total_amount) {
        const amountPerPerson = bookingData.total_amount / contributors.length;
        setContributors(contributors.map(c => ({...c, amount: amountPerPerson })));
    }
  }, [contributors.length, bookingData.total_amount]);

  const handleCreateAndInvite = async () => {
    if (contributors.length < 2) {
        toast({ variant: 'destructive', title: 'Add Contributors', description: 'You must invite at least one other person.'});
        return;
    }

    setSubmitting(true);
    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

        const groupBookingData = {
            primary_booker_id: user.id,
            primary_booker_name: user.full_name,
            venue_id: venue.id,
            ...bookingData,
            contributors: contributors,
            status: 'organizing',
            expires_at: expiresAt.toISOString()
        };

        const newGroupBooking = await GroupBooking.create(groupBookingData);
        
        // Send email invites
        for (const contributor of contributors) {
            if (contributor.email !== user.email) {
                await EnhancedNotificationService.notifyGroupBookingInvite(
                    contributor.email, 
                    user.full_name, 
                    venue.title, 
                    contributor.amount,
                    newGroupBooking.id
                );
            }
        }
        
        toast({ title: 'Success!', description: 'Group booking created and invites sent!'});
        history.push(createPageUrl(`GroupBooking?id=${newGroupBooking.id}`));

    } catch(err) {
        console.error("Failed to create group booking", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create the group booking.'});
    } finally {
        setSubmitting(false);
    }
  };

  // This function would handle contributor's payment
  const handleContributorPayment = async (contributorEmail) => {
    toast({ title: "Payment initiated...", description: "Redirecting to payment processor." });
    // In a real app, this would redirect to a Stripe Checkout session
    // For now, we simulate a successful payment
    setSubmitting(true);
    try {
        const updatedContributors = groupBooking.contributors.map(c => 
            c.email === contributorEmail ? { ...c, payment_status: 'paid' } : c
        );

        await GroupBooking.update(groupBooking.id, { contributors: updatedContributors });

        // Check if all paid
        const allPaid = updatedContributors.every(c => c.payment_status === 'paid');
        if (allPaid) {
            // All contributions are in, create the final booking
            const finalBooking = await Booking.create({
                ...bookingData,
                venue_id: groupBooking.venue_id,
                user_id: groupBooking.primary_booker_id,
                status: 'confirmed',
                booking_type: 'group'
            });
            await GroupBooking.update(groupBooking.id, { status: 'confirmed', booking_id: finalBooking.id });
            toast({ title: 'Event Confirmed!', description: 'All contributions received. The booking is confirmed!' });
        } else {
            toast({ title: 'Contribution Received!', description: 'Thank you for your payment.' });
        }
        initializePage(); // Refresh data
    } catch (err) {
        console.error("Payment simulation failed:", err);
        toast({ variant: 'destructive', title: 'Payment Error', description: 'Failed to process payment.' });
    } finally {
        setSubmitting(false);
    }
  };


  if (loading) return <LoadingSpinner />;
  if (!venue) return <div>Error loading venue data.</div>;

  if (mode === 'organizer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3"><Users /> Group Booking for {venue.title}</CardTitle>
            <CardDescription>Invite friends to split the cost of your event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <p><strong>Date:</strong> {bookingData.event_date}</p>
                <p><strong>Time:</strong> {bookingData.start_time} - {bookingData.end_time}</p>
                <p className="font-bold text-lg mt-2"><strong>Total Cost:</strong> {formatCurrency(bookingData.total_amount, bookingData.currency)}</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="contributor-email">Invite by Email</Label>
                <div className="flex gap-2">
                    <Input id="contributor-email" type="email" placeholder="friend@example.com" value={contributorEmail} onChange={(e) => setContributorEmail(e.target.value)} />
                    <Button onClick={handleAddContributor}><UserPlus className="w-4 h-4 mr-2"/> Add</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold">{contributors.length} Contributors</h3>
                {contributors.map((c, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{c.email}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-indigo-600">{formatCurrency(c.amount, bookingData.currency)}</span>
                            {c.email !== user.email && (
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveContributor(c.email)}>
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-full" size="lg" onClick={handleCreateAndInvite} disabled={submitting}>
                {submitting ? <LoadingSpinner /> : <><Send className="w-5 h-5 mr-2" /> Create Group & Send Invites</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contributor View
  if (mode === 'contributor') {
    const myContribution = groupBooking.contributors.find(c => c.email.toLowerCase() === user.email.toLowerCase());

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">You're Invited!</CardTitle>
                    <CardDescription>{groupBooking.primary_booker_name} invited you to chip in for an event at <strong>{venue.title}</strong>.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Event Details</h3>
                        <p><strong>Date:</strong> {safeFormatDate(groupBooking.event_date)}</p>
                        <p><strong>Time:</strong> {groupBooking.start_time} - {groupBooking.end_time}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2">Payment Status</h3>
                        <div className="space-y-3">
                        {groupBooking.contributors.map((c, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span>{c.name || c.email}</span>
                                {c.payment_status === 'paid' ? 
                                    <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Paid</span> : 
                                    <span className="flex items-center gap-1 text-gray-500"><Info className="w-4 h-4" /> Pending</span>
                                }
                            </div>
                        ))}
                        </div>
                    </div>

                    <Card className="bg-indigo-50 text-indigo-900 p-6 text-center">
                        <p className="text-lg">Your Share</p>
                        <p className="text-4xl font-bold">{formatCurrency(myContribution?.amount || 0, groupBooking.currency)}</p>
                    </Card>

                    {myContribution?.payment_status === 'pending' ? (
                        <Button className="w-full" size="lg" onClick={() => handleContributorPayment(myContribution.email)} disabled={submitting}>
                            {submitting ? <LoadingSpinner /> : <><DollarSign className="w-5 h-5 mr-2" /> Pay Your Share</>}
                        </Button>
                    ) : (
                         <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <p className="font-semibold">You've paid! Thank you.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
  }
  
  return null;
}

const safeFormatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch {
        return dateString;
    }
}