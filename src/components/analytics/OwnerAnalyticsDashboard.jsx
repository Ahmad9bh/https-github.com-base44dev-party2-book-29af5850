import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/components/common/FormatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function OwnerAnalyticsDashboard({ bookings = [], venues = [] }) {
  const analytics = useMemo(() => {
    // Filter confirmed/completed bookings only
    const confirmedBookings = bookings.filter(b => 
      ['confirmed', 'completed'].includes(b.status) && b.total_amount > 0
    );

    // Total revenue calculation
    const totalRevenue = confirmedBookings.reduce((sum, booking) => {
      return sum + (booking.venue_owner_payout || (booking.total_amount * 0.85)); // Assume 15% platform fee
    }, 0);

    // Monthly revenue data for the last 12 months
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now
    });

    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthBookings = confirmedBookings.filter(booking => {
        const bookingDate = new Date(booking.event_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const revenue = monthBookings.reduce((sum, booking) => {
        return sum + (booking.venue_owner_payout || (booking.total_amount * 0.85));
      }, 0);

      return {
        month: format(month, 'MMM yyyy'),
        revenue: revenue,
        bookings: monthBookings.length
      };
    });

    // Venue performance data
    const venuePerformance = venues.map(venue => {
      const venueBookings = confirmedBookings.filter(b => b.venue_id === venue.id);
      const venueRevenue = venueBookings.reduce((sum, booking) => {
        return sum + (booking.venue_owner_payout || (booking.total_amount * 0.85));
      }, 0);

      return {
        name: venue.title,
        bookings: venueBookings.length,
        revenue: venueRevenue,
        averageBookingValue: venueBookings.length > 0 ? venueRevenue / venueBookings.length : 0
      };
    });

    // Growth calculation (current vs previous month)
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    const revenueGrowth = previousMonth?.revenue > 0 
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalBookings: confirmedBookings.length,
      monthlyData,
      venuePerformance,
      revenueGrowth,
      averageBookingValue: confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0
    };
  }, [bookings, venues]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <div className={`text-xs flex items-center ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(analytics.revenueGrowth).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageBookingValue)}</div>
            <p className="text-xs text-muted-foreground">Per confirmed booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venues.length}</div>
            <p className="text-xs text-muted-foreground">Total venues</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                strokeWidth={3}
                dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bookings by Month */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Venue Performance */}
      {analytics.venuePerformance.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Venue Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.venuePerformance
                .sort((a, b) => b.revenue - a.revenue)
                .map((venue, index) => (
                <div key={venue.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-sm text-gray-600">{venue.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(venue.revenue)}</p>
                    <p className="text-sm text-gray-600">
                      Avg: {formatCurrency(venue.averageBookingValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Distribution Pie Chart */}
      {analytics.venuePerformance.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution by Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.venuePerformance.filter(v => v.revenue > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {analytics.venuePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {analytics.venuePerformance.map((venue, index) => (
                <div key={venue.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{venue.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}