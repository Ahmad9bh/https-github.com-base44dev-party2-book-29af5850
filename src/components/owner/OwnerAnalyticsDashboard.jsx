import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Star, Clock, MapPin, Target, Award, Building } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, getDay, parseISO } from 'date-fns';
import { formatCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function OwnerAnalyticsDashboard({ bookings = [], venues = [] }) {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      averageRating: 0,
      occupancyRate: 0,
      revenueGrowth: 0
    },
    performance: {
      revenueByMonth: [],
      bookingsByMonth: [],
      venueComparison: []
    },
    insights: {
      peakHours: [],
      popularDays: [],
      eventTypeBreakdown: [],
      seasonalTrends: []
    }
  });

  useEffect(() => {
    if (bookings.length > 0 || venues.length > 0) {
      calculateOwnerAnalytics();
    }
  }, [bookings, venues, selectedPeriod, selectedVenue]);

  const calculateOwnerAnalytics = () => {
    const now = new Date();
    const periodMonths = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const startDate = startOfMonth(subMonths(now, periodMonths - 1));
    const endDate = endOfMonth(now);

    // Filter bookings based on selected venue and period
    let filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.created_date);
      const isInPeriod = bookingDate >= startDate && bookingDate <= endDate;
      const isSelectedVenue = selectedVenue === 'all' || booking.venue_id === selectedVenue;
      return isInPeriod && isSelectedVenue;
    });

    // Filter venues if specific venue selected
    let filteredVenues = selectedVenue === 'all' ? venues : venues.filter(v => v.id === selectedVenue);

    // Calculate overview metrics
    const overview = calculateOverviewMetrics(filteredBookings, filteredVenues, startDate);
    
    // Calculate performance data
    const performance = calculatePerformanceData(filteredBookings, startDate, endDate);
    
    // Calculate business insights
    const insights = calculateBusinessInsights(filteredBookings, filteredVenues);

    setAnalytics({
      overview,
      performance,
      insights
    });
  };

  const calculateOverviewMetrics = (bookings, venues, startDate) => {
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.venue_owner_payout || b.total_amount * 0.85 || 0), 0);
    
    // Calculate average rating across venues
    const venuesWithRatings = venues.filter(v => v.rating && v.rating > 0);
    const averageRating = venuesWithRatings.length > 0 ? 
      venuesWithRatings.reduce((sum, v) => sum + v.rating, 0) / venuesWithRatings.length : 0;

    // Calculate occupancy rate (simplified - based on bookings vs available days)
    const totalPossibleBookingDays = venues.length * 30 * (selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12);
    const actualBookingDays = confirmedBookings.length;
    const occupancyRate = totalPossibleBookingDays > 0 ? (actualBookingDays / totalPossibleBookingDays) * 100 : 0;

    // Calculate revenue growth (compare current period to previous period)
    const previousPeriodStart = subMonths(startDate, selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12);
    const previousPeriodBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.created_date);
      return bookingDate >= previousPeriodStart && bookingDate < startDate && ['confirmed', 'completed'].includes(booking.status);
    });
    
    const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + (b.venue_owner_payout || b.total_amount * 0.85 || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalBookings: bookings.length,
      averageRating,
      occupancyRate,
      revenueGrowth
    };
  };

  const calculatePerformanceData = (bookings, startDate, endDate) => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Revenue by month
    const revenueByMonth = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd && ['confirmed', 'completed'].includes(b.status);
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthBookings.reduce((sum, b) => sum + (b.venue_owner_payout || b.total_amount * 0.85 || 0), 0),
        bookings: monthBookings.length
      };
    });

    // Venue comparison (if multiple venues)
    const venueComparison = venues.map(venue => {
      const venueBookings = bookings.filter(b => b.venue_id === venue.id);
      const confirmedBookings = venueBookings.filter(b => ['confirmed', 'completed'].includes(b.status));
      
      return {
        id: venue.id,
        name: venue.title,
        bookings: venueBookings.length,
        revenue: confirmedBookings.reduce((sum, b) => sum + (b.venue_owner_payout || b.total_amount * 0.85 || 0), 0),
        rating: venue.rating || 0,
        conversionRate: venueBookings.length > 0 ? (confirmedBookings.length / venueBookings.length) * 100 : 0
      };
    });

    return {
      revenueByMonth,
      bookingsByMonth: revenueByMonth,
      venueComparison
    };
  };

  const calculateBusinessInsights = (bookings, venues) => {
    // Popular booking times
    const hourBookings = bookings.reduce((acc, b) => {
      if (b.start_time) {
        try {
          const hour = parseInt(b.start_time.split(':')[0]);
          if (hour >= 0 && hour <= 23) {
            acc[hour] = (acc[hour] || 0) + 1;
          }
        } catch (e) {
          // Handle invalid time format
        }
      }
      return acc;
    }, {});

    const peakHours = Object.entries(hourBookings)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ 
        hour: `${hour}:00`, 
        count,
        label: `${hour}:00 - ${parseInt(hour) + 1}:00`
      }));

    // Popular days of week
    const dayBookings = bookings.reduce((acc, b) => {
      if (b.event_date) {
        try {
          const day = getDay(new Date(b.event_date));
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
          acc[dayName] = (acc[dayName] || 0) + 1;
        } catch (e) {
          // Handle invalid date
        }
      }
      return acc;
    }, {});

    const popularDays = Object.entries(dayBookings)
      .sort(([,a], [,b]) => b - a)
      .map(([day, count]) => ({ day, count }));

    // Event type breakdown
    const eventTypes = bookings.reduce((acc, b) => {
      if (b.event_type) {
        acc[b.event_type] = (acc[b.event_type] || 0) + 1;
      }
      return acc;
    }, {});

    const eventTypeBreakdown = Object.entries(eventTypes)
      .sort(([,a], [,b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    return {
      peakHours,
      popularDays,
      eventTypeBreakdown,
      seasonalTrends: [] // Can be expanded later
    };
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "text-blue-600", suffix = "" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {venues.length > 1 && (
            <select 
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
            >
              <option value="all">All Venues</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.title}</option>
              ))}
            </select>
          )}
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="3months">3M</TabsTrigger>
              <TabsTrigger value="6months">6M</TabsTrigger>
              <TabsTrigger value="12months">12M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.overview.totalRevenue, currentCurrency, currentLanguage)}
          change={analytics.overview.revenueGrowth}
          icon={DollarSign}
          color="text-green-600"
        />
        <StatCard
          title="Total Bookings"
          value={analytics.overview.totalBookings}
          icon={Calendar}
          color="text-blue-600"
        />
        <StatCard
          title="Average Rating"
          value={analytics.overview.averageRating.toFixed(1)}
          icon={Star}
          color="text-yellow-600"
        />
        <StatCard
          title="Occupancy Rate"
          value={analytics.overview.occupancyRate.toFixed(1)}
          suffix="%"
          icon={Target}
          color="text-purple-600"
        />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="venues">Venue Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.performance.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value, currentCurrency), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.performance.bookingsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Booking Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.insights.peakHours.map((time, index) => (
                    <div key={time.hour} className="flex items-center justify-between">
                      <span className="font-medium">{time.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(time.count / analytics.insights.peakHours[0]?.count) * 100} className="w-20" />
                        <span className="text-sm text-gray-600">{time.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.insights.popularDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.insights.eventTypeBreakdown}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {analytics.insights.eventTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          {analytics.performance.venueComparison.length > 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Venue Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.venueComparison.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{venue.name}</h4>
                        <p className="text-sm text-gray-600">{venue.bookings} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(venue.revenue, currentCurrency)}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{venue.rating.toFixed(1)}</span>
                          </div>
                          <span>{venue.conversionRate.toFixed(1)}% conversion</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Single Venue</h3>
                <p className="text-gray-600">Add more venues to see performance comparisons</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}