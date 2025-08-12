import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Building2, Calendar, CheckCircle, Clock, AlertCircle, Banknote } from 'lucide-react';
import { Commission } from '@/api/entities';
import { Payout } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function CommissionManager() {
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [venueOwners, setVenueOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const { success, error } = useToast();

  const [commissionStats, setCommissionStats] = useState({
    totalCommissions: 0,
    pendingPayouts: 0,
    processedPayouts: 0,
    averageCommissionRate: 15
  });

  const [bulkPayoutData, setBulkPayoutData] = useState({
    venue_owner_ids: [],
    amount_threshold: 100,
    notes: '',
    payout_method: 'bank_transfer'
  });

  useEffect(() => {
    loadCommissionData();
  }, [selectedPeriod]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      
      // Load all related data
      const [commissionsData, payoutsData, bookingsData, ownersData] = await Promise.all([
        Commission.list('-created_date', 500),
        Payout.list('-processed_at', 200),
        Booking.filter({ status: 'completed' }),
        User.filter({ user_type: 'venue_owner' })
      ]);

      setCommissions(commissionsData);
      setPayouts(payoutsData);
      setPendingBookings(bookingsData.filter(b => !commissionsData.some(c => c.booking_id === b.id)));
      setVenueOwners(ownersData);

      // Calculate commission stats
      const periodCommissions = getCommissionsForPeriod(commissionsData);
      const totalCommissions = periodCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const pendingPayouts = periodCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.net_payout || 0), 0);
      const processedPayouts = payoutsData.reduce((sum, p) => sum + (p.amount || 0), 0);

      setCommissionStats({
        totalCommissions,
        pendingPayouts,
        processedPayouts,
        averageCommissionRate: 15 // This would be calculated from actual data
      });

      success(`Loaded ${commissionsData.length} commissions and ${payoutsData.length} payouts`);
    } catch (err) {
      console.error('Failed to load commission data:', err);
      error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getCommissionsForPeriod = (commissionsData) => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      default:
        return commissionsData;
    }

    return commissionsData.filter(commission => {
      const commissionDate = new Date(commission.created_date);
      return commissionDate >= startDate && commissionDate <= endDate;
    });
  };

  const processCommissionsForBookings = async () => {
    try {
      const commissionsToCreate = [];
      
      for (const booking of pendingBookings) {
        const commissionRate = 0.15; // 15% - this could be configurable per venue
        const commissionAmount = booking.total_amount * commissionRate;
        const platformFee = booking.total_amount * 0.03; // 3% platform fee
        const netPayout = booking.total_amount - commissionAmount - platformFee;

        commissionsToCreate.push({
          booking_id: booking.id,
          venue_id: booking.venue_id,
          venue_owner_id: booking.venue_owner_id || 'unknown',
          booking_amount: booking.total_amount,
          commission_rate: commissionRate * 100,
          commission_amount: commissionAmount,
          platform_fee: platformFee,
          net_payout: netPayout,
          currency: booking.currency || 'USD',
          status: 'pending'
        });
      }

      // Create commissions in bulk
      for (const commission of commissionsToCreate) {
        await Commission.create(commission);
      }

      success(`Processed ${commissionsToCreate.length} new commissions`);
      loadCommissionData();
    } catch (err) {
      console.error('Failed to process commissions:', err);
      error('Failed to process commissions');
    }
  };

  const processBulkPayout = async () => {
    try {
      if (bulkPayoutData.venue_owner_ids.length === 0) {
        error('Please select at least one venue owner');
        return;
      }

      const payoutsToCreate = [];
      
      for (const ownerId of bulkPayoutData.venue_owner_ids) {
        const ownerCommissions = commissions.filter(c => 
          c.venue_owner_id === ownerId && 
          c.status === 'pending' && 
          c.net_payout >= bulkPayoutData.amount_threshold
        );

        if (ownerCommissions.length === 0) continue;

        const totalAmount = ownerCommissions.reduce((sum, c) => sum + c.net_payout, 0);
        const bookingIds = ownerCommissions.map(c => c.booking_id);
        const owner = venueOwners.find(o => o.id === ownerId);

        payoutsToCreate.push({
          venue_owner_id: ownerId,
          venue_owner_name: owner?.full_name || owner?.email || 'Unknown',
          amount: totalAmount,
          currency: 'USD',
          status: 'processed',
          processed_by: 'system', // Would be current admin user ID
          processed_at: new Date().toISOString(),
          booking_ids: bookingIds,
          notes: bulkPayoutData.notes
        });

        // Update commission statuses
        for (const commission of ownerCommissions) {
          await Commission.update(commission.id, { status: 'paid' });
        }
      }

      // Create payouts
      for (const payout of payoutsToCreate) {
        await Payout.create(payout);
      }

      success(`Processed ${payoutsToCreate.length} payouts`);
      setShowPayoutDialog(false);
      setBulkPayoutData({
        venue_owner_ids: [],
        amount_threshold: 100,
        notes: '',
        payout_method: 'bank_transfer'
      });
      loadCommissionData();
    } catch (err) {
      console.error('Failed to process bulk payout:', err);
      error('Failed to process bulk payout');
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = venueOwners.find(o => o.id === ownerId);
    return owner ? owner.full_name || owner.email : 'Unknown Owner';
  };

  const getOwnerPendingAmount = (ownerId) => {
    return commissions
      .filter(c => c.venue_owner_id === ownerId && c.status === 'pending')
      .reduce((sum, c) => sum + (c.net_payout || 0), 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600">Manage platform commissions and venue owner payouts</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
            <DialogTrigger asChild>
              <Button>
                <Banknote className="w-4 h-4 mr-2" />
                Process Payouts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Process Bulk Payouts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Venue Owners</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                    {venueOwners.map(owner => {
                      const pendingAmount = getOwnerPendingAmount(owner.id);
                      if (pendingAmount === 0) return null;
                      
                      return (
                        <div key={owner.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={owner.id}
                              checked={bulkPayoutData.venue_owner_ids.includes(owner.id)}
                              onChange={(e) => {
                                const ids = e.target.checked
                                  ? [...bulkPayoutData.venue_owner_ids, owner.id]
                                  : bulkPayoutData.venue_owner_ids.filter(id => id !== owner.id);
                                setBulkPayoutData({...bulkPayoutData, venue_owner_ids: ids});
                              }}
                            />
                            <label htmlFor={owner.id} className="cursor-pointer">
                              {owner.full_name || owner.email}
                            </label>
                          </div>
                          <Badge variant="outline">
                            {formatCurrency(pendingAmount, 'USD')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount_threshold">Minimum Payout Amount</Label>
                  <Input
                    id="amount_threshold"
                    type="number"
                    value={bulkPayoutData.amount_threshold}
                    onChange={(e) => setBulkPayoutData({...bulkPayoutData, amount_threshold: parseFloat(e.target.value)})}
                    min="0"
                    step="10"
                  />
                </div>

                <div>
                  <Label htmlFor="payout_method">Payout Method</Label>
                  <Select
                    value={bulkPayoutData.payout_method}
                    onValueChange={(value) => setBulkPayoutData({...bulkPayoutData, payout_method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe Connect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bulkPayoutData.notes}
                    onChange={(e) => setBulkPayoutData({...bulkPayoutData, notes: e.target.value})}
                    placeholder="Add any notes about this payout batch..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={processBulkPayout}>
                    Process Payouts
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Commission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(commissionStats.totalCommissions, 'USD')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {formatCurrency(commissionStats.pendingPayouts, 'USD')}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed Payouts</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(commissionStats.processedPayouts, 'USD')}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Commission Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {commissionStats.averageCommissionRate}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      {pendingBookings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Pending Commission Processing
                </h3>
                <p className="text-yellow-700">
                  {pendingBookings.length} completed bookings need commission processing
                </p>
              </div>
              <Button onClick={processCommissionsForBookings} className="bg-yellow-600 hover:bg-yellow-700">
                Process {pendingBookings.length} Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="commissions" className="w-full">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="owners">Venue Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCommissionsForPeriod(commissions).map(commission => (
                  <div key={commission.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">Booking #{commission.booking_id.slice(0, 8)}</h3>
                          <Badge className={getStatusColor(commission.status)}>
                            {commission.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Owner: {getOwnerName(commission.venue_owner_id)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrency(commission.net_payout, commission.currency)}
                        </p>
                        <p className="text-sm text-gray-600">Net Payout</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Booking Amount</p>
                        <p className="font-medium">{formatCurrency(commission.booking_amount, commission.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission ({commission.commission_rate}%)</p>
                        <p className="font-medium">{formatCurrency(commission.commission_amount, commission.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Platform Fee</p>
                        <p className="font-medium">{formatCurrency(commission.platform_fee, commission.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{format(new Date(commission.created_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map(payout => (
                  <div key={payout.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{payout.venue_owner_name}</h3>
                        <p className="text-sm text-gray-600">
                          {payout.booking_ids.length} bookings included
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(payout.amount, payout.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(payout.processed_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {payout.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {payout.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Venue Owner Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venueOwners.map(owner => {
                  const ownerCommissions = commissions.filter(c => c.venue_owner_id === owner.id);
                  const pendingAmount = getOwnerPendingAmount(owner.id);
                  const totalEarnings = ownerCommissions.reduce((sum, c) => sum + (c.net_payout || 0), 0);
                  
                  if (ownerCommissions.length === 0) return null;

                  return (
                    <div key={owner.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{owner.full_name || owner.email}</h3>
                          <p className="text-sm text-gray-600">
                            {ownerCommissions.length} commission records
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatCurrency(totalEarnings, 'USD')}
                          </p>
                          <p className="text-sm text-gray-600">Total Earnings</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Pending Payout</p>
                          <p className="font-medium text-yellow-600">
                            {formatCurrency(pendingAmount, 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Already Paid</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(totalEarnings - pendingAmount, 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Commission Rate</p>
                          <p className="font-medium">15%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}