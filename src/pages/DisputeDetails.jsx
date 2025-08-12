import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dispute } from '@/api/entities';
import { DisputeMessage } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Gavel, Send, UserCircle, FileUp, ClipboardList, Banknote } from 'lucide-react';
import { format } from 'date-fns';

export default function DisputeDetails() {
  const [dispute, setDispute] = useState(null);
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const location = useLocation();
  const { toast } = useToast();
  const disputeId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!disputeId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No dispute ID provided.' });
      return;
    }
    loadCaseDetails();
  }, [disputeId]);

  const loadCaseDetails = async () => {
    setLoading(true);
    try {
      const [adminData, disputeData] = await Promise.all([User.me(), Dispute.get(disputeId)]);
      setAdmin(adminData);
      setDispute(disputeData);
      
      const [bookingData, messagesData] = await Promise.all([
          Booking.get(disputeData.booking_id),
          DisputeMessage.filter({ dispute_id: disputeData.id }, 'created_date', 100)
      ]);
      setBooking(bookingData);
      setMessages(messagesData || []);
      
    } catch (error) {
      console.error("Failed to load case details:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load case details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await DisputeMessage.create({
        dispute_id: dispute.id,
        sender_id: admin.id,
        sender_name: admin.full_name || 'Admin',
        message: newMessage,
      });
      setNewMessage('');
      loadCaseDetails(); // Refresh messages
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
        await Dispute.update(dispute.id, { status: newStatus });
        toast({ title: 'Status Updated', description: `Case status changed to ${newStatus}.` });
        loadCaseDetails();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update status.' });
    }
  };

    const handleResolve = async (e) => {
        e.preventDefault();
        const resolution = e.target.resolution.value;
        const refundAmount = parseFloat(e.target.refund.value) || 0;
        if (!resolution) {
            toast({ variant: 'destructive', title: 'Resolution Required', description: 'Please provide resolution details.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await Dispute.update(dispute.id, {
                status: 'resolved',
                resolution: resolution,
                amount_refunded: refundAmount,
                resolved_by: admin.id,
                resolved_at: new Date().toISOString(),
            });

            // Here you would trigger the actual refund via a payment integration
            // For now, we just update the booking status if a full refund is given.
            if(refundAmount >= booking.total_amount) {
                await Booking.update(booking.id, { status: 'cancelled', cancellation_reason: `Dispute resolution (Case ID: ${dispute.id})`});
            }

            toast({ title: 'Case Resolved!', description: 'The dispute has been successfully resolved.' });
            loadCaseDetails();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to resolve case.' });
        } finally {
            setIsSubmitting(false);
        }
    };

  if (loading) return <LoadingSpinner />;
  if (!dispute) return <div className="text-center p-8">Could not load dispute details.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Case Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Details (ID: {dispute.id})</CardTitle>
            <CardDescription>
              Dispute reported on {format(new Date(dispute.created_date), 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Status:</strong> <Badge>{dispute.status}</Badge></p>
                  <p><strong>Reason:</strong> {dispute.reason.replace(/_/g, ' ')}</p>
                  <p><strong>Reporter:</strong> {dispute.reporter_name}</p>
                  <p><strong>Defendant:</strong> {dispute.defendant_name}</p>
              </div>
              <div>
                  <h4 className="font-semibold">Original Complaint</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-2">{dispute.description}</p>
              </div>
               <div>
                  <h4 className="font-semibold">Desired Outcome</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-2">{dispute.desired_outcome}</p>
              </div>
          </CardContent>
        </Card>

        {/* Communication Log */}
        <Card>
            <CardHeader><CardTitle>Communication Log</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender_id === admin.id ? 'justify-end' : ''}`}>
                             {msg.sender_id !== admin.id && <UserCircle className="w-8 h-8 text-gray-400 mt-1" />}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.sender_id === admin.id ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100'}`}>
                                <p className="font-semibold text-sm">{msg.sender_name}</p>
                                <p>{msg.message}</p>
                                <p className="text-xs text-gray-500 mt-2 text-right">{format(new Date(msg.created_date), 'p, MMM dd')}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                     <Textarea 
                        placeholder="Type your message to both parties here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={4}
                     />
                     <div className="flex justify-between items-center mt-2">
                        <Button variant="outline"><FileUp className="w-4 h-4 mr-2" /> Attach File</Button>
                        <Button onClick={handleSendMessage} disabled={isSubmitting}>
                            {isSubmitting ? <LoadingSpinner size="h-4 w-4" /> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                        </Button>
                     </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Right Column: Actions */}
      <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle>Booking Info</CardTitle></CardHeader>
            <CardContent className="text-sm">
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Venue:</strong> {booking.venue_id}</p>
                <p><strong>Event Date:</strong> {booking.event_date}</p>
                <p><strong>Amount:</strong> ${booking.total_amount}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label>Change Case Status</Label>
                    <Select onValueChange={handleStatusChange} value={dispute.status}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                    <Card className="bg-amber-50 border-amber-200">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Resolve Case</CardTitle></CardHeader>
                        <CardContent>
                             <form onSubmit={handleResolve} className="space-y-3">
                                <div>
                                    <Label htmlFor="resolution">Resolution Summary</Label>
                                    <Textarea id="resolution" placeholder="Final decision and reasoning..." required/>
                                </div>
                                <div>
                                    <Label htmlFor="refund">Refund Amount ($)</Label>
                                    <Input id="refund" type="number" step="0.01" placeholder="0.00" />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <LoadingSpinner size="h-4 w-4" /> : <><Gavel className="w-4 h-4 mr-2" /> Finalize Resolution</>}
                                </Button>
                             </form>
                        </CardContent>
                    </Card>
                )}
                
                 {dispute.status === 'resolved' && (
                     <div className="p-4 border rounded-lg bg-green-50 text-green-800">
                        <p className="font-bold">Case Resolved</p>
                        <p><strong>Resolution:</strong> {dispute.resolution}</p>
                        <p><strong>Refund:</strong> ${dispute.amount_refunded || 0}</p>
                        <p className="text-xs mt-2">Resolved by {dispute.resolved_by} on {format(new Date(dispute.resolved_at), 'PPP')}</p>
                     </div>
                 )}

            </CardContent>
        </Card>
      </div>
    </div>
  );
}