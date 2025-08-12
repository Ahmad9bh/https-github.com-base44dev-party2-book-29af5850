import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Payout } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useLocalization } from '@/components/common/LocalizationContext';
import { formatCurrency } from '@/components/common/FormatUtils';

export default function OwnerFinancials() {
  const [user, setUser] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentCurrency } = useLocalization();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const ownerPayouts = await Payout.filter({ venue_owner_id: currentUser.id }, '-created_date');
      setPayouts(ownerPayouts);
      
      const ownerVenues = await Venue.filter({ owner_id: currentUser.id });
      if (ownerVenues && ownerVenues.length > 0) {
        const venueIds = ownerVenues.map(v => v.id);
        const ownerBookings = await Booking.filter({ venue_id: { '$in': venueIds }, status: 'completed' }, '-event_date');
        setBookings(ownerBookings);
      }

    } catch (error) {
      console.error("Failed to load financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.venue_owner_payout || (b.total_amount * 0.85)), 0);
  const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <CardHeader>
        <CardTitle>My Financials</CardTitle>
        <CardDescription>Track your earnings and view your payout history.</CardDescription>
      </CardHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <Card>
          <CardHeader><CardTitle>Total Earnings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalEarnings, currentCurrency)}</p>
            <p className="text-sm text-gray-500">From all completed bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Paid Out</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalPaidOut, currentCurrency)}</p>
            <p className="text-sm text-gray-500">Received from the platform</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length > 0 ? payouts.map(payout => (
              <div key={payout.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{formatCurrency(payout.amount, payout.currency)}</p>
                  <p className="text-sm text-gray-500">Processed on {format(new Date(payout.processed_at), 'PPP')}</p>
                </div>
                <Badge className={payout.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {payout.status === 'processed' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                  {payout.status}
                </Badge>
              </div>
            )) : <p>No payout history yet.</p>}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader><CardTitle>Earnings from Bookings</CardTitle></CardHeader>
        <CardContent>
           <div className="space-y-2">
            {bookings.length > 0 ? bookings.map(booking => (
              <div key={booking.id} className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Booking on {format(new Date(booking.event_date), 'PPP')}</p>
                  <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                </div>
                <p className="font-semibold text-green-600">
                  + {formatCurrency(booking.venue_owner_payout || (booking.total_amount * 0.85), booking.currency)}
                </p>
              </div>
            )) : <p>No completed bookings to show earnings from yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}