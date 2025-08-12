import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Star, Building } from 'lucide-react';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function OwnerStats({ venues = [], bookings = [] }) {
  const { currentCurrency } = useLocalization();

  const totalRevenue = bookings
    .filter(b => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.venue_owner_payout || (b.total_amount * 0.85) || 0), 0);

  const upcomingBookings = bookings.filter(b => 
    new Date(b.event_date) >= new Date() && b.status === 'confirmed'
  ).length;

  const totalVenues = venues.length;
  
  const averageRating = venues.length > 0 
    ? venues.reduce((sum, v) => sum + (v.rating || 0), 0) / venues.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currentCurrency)}</div>
          <p className="text-xs text-muted-foreground">All-time earnings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingBookings}</div>
          <p className="text-xs text-muted-foreground">Confirmed future events</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Venues</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVenues}</div>
          <p className="text-xs text-muted-foreground">Total listed venues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Across all your venues</p>
        </CardContent>
      </Card>
    </div>
  );
}