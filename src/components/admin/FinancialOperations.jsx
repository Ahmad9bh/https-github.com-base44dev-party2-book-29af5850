
import React, { useState } from 'react';
import { RefundRequest, Payout, Booking } from '@/api/entities/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { Check, X, Clock, Send } from 'lucide-react';

export default function FinancialOperations({ refundRequests, payouts, bookings, venues, users, onUpdate }) {
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState({});

  const handleRefundStatus = async (request, newStatus) => {
    setLoadingStates(prev => ({ ...prev, [`refund-${request.id}`]: true }));
    try {
      await RefundRequest.update(request.id, { status: newStatus });
      toast({
        title: `Refund request ${newStatus}`,
        description: `The request for booking ${request.booking_id} has been updated.`,
      });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update refund request.', variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [`refund-${request.id}`]: false }));
    }
  };

  const handleProcessPayout = async (booking) => {
     setLoadingStates(prev => ({ ...prev, [`payout-${booking.id}`]: true }));
     try {
       const venue = venues.find(v => v.id === booking.venue_id);

       if (!venue || !venue.owner_id) {
         toast({ title: 'Error', description: `Could not find owner for booking ${booking.id}.`, variant: 'destructive' });
         setLoadingStates(prev => ({ ...prev, [`payout-${booking.id}`]: false }));
         return;
       }

       const owner = users.find(u => u.id === venue.owner_id);

       const payoutAmount = booking.venue_owner_payout || booking.total_amount * 0.85;
       await Payout.create({
         venue_owner_id: venue.owner_id,
         venue_owner_name: owner ? owner.full_name : 'Owner Not Found',
         amount: payoutAmount,
         currency: booking.currency,
         status: 'processed',
         processed_by: 'admin', // Should be current admin ID
         processed_at: new Date().toISOString(),
         booking_ids: [booking.id],
       });
       await Booking.update(booking.id, { payout_id: 'processed' }); // Mark as paid
       toast({ title: 'Payout Processed', description: `Payout for booking ${booking.id} sent.` });
       onUpdate();
     } catch (error) {
        console.error("Payout Error:", error);
        toast({ title: 'Error', description: 'Failed to process payout.', variant: 'destructive' });
     } finally {
       setLoadingStates(prev => ({ ...prev, [`payout-${booking.id}`]: false }));
     }
  };

  const pendingRefunds = refundRequests.filter(r => r.status === 'pending');
  const pendingPayouts = bookings.filter(b => b.status === 'completed' && !b.payout_id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRefunds.length > 0 ? (
            <div className="space-y-4">
              {pendingRefunds.map(req => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <p><strong>Booking ID:</strong> {req.booking_id}</p>
                  <p><strong>Amount:</strong> {req.amount} {req.currency}</p>
                  <p><strong>Reason:</strong> {req.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="destructive" onClick={() => handleRefundStatus(req, 'rejected')} disabled={loadingStates[`refund-${req.id}`]}>
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => handleRefundStatus(req, 'approved')} disabled={loadingStates[`refund-${req.id}`]}>
                      <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>No pending refunds.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
          <CardDescription>Bookings that are completed but not yet paid out to owners.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length > 0 ? (
            <div className="space-y-4">
              {pendingPayouts.map(booking => (
                 <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center">
                   <div>
                     <p><strong>Booking ID:</strong> {booking.id}</p>
                     <p><strong>Venue Owner Payout:</strong> {booking.venue_owner_payout || (booking.total_amount * 0.85).toFixed(2)} {booking.currency}</p>
                   </div>
                   <Button onClick={() => handleProcessPayout(booking)} disabled={loadingStates[`payout-${booking.id}`]}>
                    <Send className="w-4 h-4 mr-2"/> Process Payout
                   </Button>
                 </div>
              ))}
            </div>
          ) : <p>No pending payouts.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
