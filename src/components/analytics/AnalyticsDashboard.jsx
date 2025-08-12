import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Calendar,
  Star,
  Percent
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, parseISO } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function AnalyticsDashboard({ bookings, venues, payouts }) {
  // Monthly revenue data
  const monthlyRevenue = useMemo(() => {
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return last12Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthBookings = bookings.filter(b => {
        const bookingDate = parseISO(b.created_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd && 
               (b.status === 'completed' || b.status === 'confirmed');
      });

      const revenue = monthBookings.reduce((sum, b) => sum + (b.platform_fee || 0), 0);
      const venueRevenue = monthBookings.reduce((sum, b) => sum + (b.venue_owner_payout || 0), 0);
      const totalBookings = monthBookings.length;

      return {
        month: format(month, 'MMM yyyy'),
        revenue: revenue,
        venueRevenue: venueRevenue,
        totalRevenue: revenue + venueRevenue,
        bookings: totalBookings
      };
    });
  }, [bookings]);

  // Popular venues
  const popularVenues = useMemo(() => {
    const venueBookings = {};
    bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .forEach(booking => {
        if (!venueBookings[booking.venue_id]) {
          venueBookings[booking.venue_id] = {
            bookings: 0,
            revenue: 0,
            venue: venues.find(v => v.id === booking.venue_id)
          };
        }
        venueBookings[booking.venue_id].bookings += 1;
        venueBookings[booking.venue_id].revenue += booking.total_amount || 0;
      });

    return Object.values(venueBookings)
      .filter(v => v.venue)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10)
      .map(v => ({
        name: v.venue.title,
        bookings: v.bookings,
        revenue: v.revenue,
        city: v.venue.location?.city || 'Unknown'
      }));
  }, [bookings, venues]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const categories = {};
    venues.forEach(venue => {
      const venueCategories = Array.isArray(venue.category) ? venue.category : [];
      venueCategories.forEach(cat => {
        if (!categories[cat]) {
          categories[cat] = { count: 0, bookings: 0 };
        }
        categories[cat].count += 1;
        
        // Count bookings for this venue
        const venueBookings = bookings.filter(b => 
          b.venue_id === venue.id && (b.status === 'completed' || b.status === 'confirmed')
        ).length;
        categories[cat].bookings += venueBookings;
      });
    });

    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [venues, bookings]);

  // Geographic distribution
  const geographicDistribution = useMemo(() => {
    const cities = {};
    venues.forEach(venue => {
      const city = venue.location?.city || 'Unknown';
      if (!cities[city]) {
        cities[city] = { venues: 0, bookings: 0 };
      }
      cities[city].venues += 1;
      
      const venueBookings = bookings.filter(b => 
        b.venue_id === venue.id && (b.status === 'completed' || b.status === 'confirmed')
      ).length;
      cities[city].bookings += venueBookings;
    });

    return Object.entries(cities)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.venues - a.venues)
      .slice(0, 8);
  }, [venues, bookings]);

  // Key metrics calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.platform_fee || 0), 0);

  const totalVenueRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.venue_owner_payout || 0), 0);

  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length;
  const averageBookingValue = completedBookings > 0 ? (totalRevenue + totalVenueRevenue) / completedBookings : 0;

  const activeVenues = venues.filter(v => v.status === 'active').length;
  const averageVenueRating = venues.length > 0 
    ? venues.reduce((sum, v) => sum + (v.rating || 0), 0) / venues.length 
    : 0;

  // Growth calculations (comparing last 2 months)
  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const revenueGrowth = previousMonth?.revenue 
    ? ((currentMonth?.revenue - previousMonth?.revenue) / previousMonth?.revenue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth > 0 ? (
                <><TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-green-600">+{revenueGrowth.toFixed(1)}%</span></>
              ) : (
                <><TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                <span className="text-red-600">{revenueGrowth.toFixed(1)}%</span></>
              )}
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageBookingValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {completedBookings} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVenues}</div>
            <p className="text-xs text-muted-foreground">
              Average rating: {averageVenueRating.toFixed(1)} ⭐
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVenueRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              To venue owners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="count"
                  nameKey="name"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryDistribution.slice(0, 6).map((cat, index) => (
                <Badge 
                  key={cat.name} 
                  variant="outline" 
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Venues by City</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={geographicDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="venues" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Venues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularVenues.map((venue, index) => (
              <div key={venue.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{venue.name}</p>
                    <p className="text-sm text-gray-500">{venue.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{venue.bookings} bookings</p>
                  <p className="text-sm text-gray-500">${venue.revenue.toFixed(2)} revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}