
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Star, Building, MapPin, Activity, Target, Award, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, parseISO, isValid } from 'date-fns';
import { formatCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function AdminAnalyticsDashboard({ data }) {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [loading, setLoading] = useState(true); // Renamed from initial true to true for calculation
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const [analytics, setAnalytics] = useState({
    platform: {
      totalRevenue: 0,
      platformFees: 0,
      totalBookings: 0,
      totalVenues: 0,
      totalUsers: 0,
      avgRating: 0,
      growthRate: 0
    },
    trends: {
      revenue: [],
      bookings: [],
      users: [],
      venues: []
    },
    geography: {
      topCities: [],
      venuesByCity: []
    },
    business: {
      topVenues: [],
      topOwners: [],
      conversionFunnel: {
        initiated: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        conversionRate: 0
      },
      marketShare: []
    }
  });

  useEffect(() => {
    if (data && (Array.isArray(data.venues) && data.venues.length > 0 || Array.isArray(data.bookings) && data.bookings.length > 0 || Array.isArray(data.users) && data.users.length > 0 || Array.isArray(data.reviews) && data.reviews.length > 0)) {
      setLoading(true);
      calculatePlatformAnalytics();
      setLoading(false);
    } else {
        setLoading(false);
    }
  }, [data, selectedPeriod]);

  const calculatePlatformAnalytics = () => {
    const now = new Date();
    const periodMonths = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const startDate = startOfMonth(subMonths(now, periodMonths - 1));
    const endDate = endOfMonth(now);

    // Filter data for the selected period
    // Note: 'data' here refers to the prop passed to the component.
    const periodBookings = data.bookings.filter(booking => {
      const bookingDate = new Date(booking.created_date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    const periodUsers = data.users.filter(user => {
      const userDate = new Date(user.created_date);
      return userDate >= startDate && userDate <= endDate;
    });

    const periodVenues = data.venues.filter(venue => {
      const venueDate = new Date(venue.created_date);
      return venueDate >= startDate && venueDate <= endDate;
    });

    // Calculate platform metrics
    const platformMetrics = calculatePlatformMetricsFn(data, periodBookings);
    
    // Calculate trends
    const trendData = calculateTrendsFn(data, startDate, endDate);
    
    // Calculate geography insights
    const geoData = calculateGeographyInsightsFn(data.venues, data.bookings);
    
    // Calculate business insights  
    const businessData = calculateBusinessInsightsFn(data.venues, data.bookings, data.users);

    setAnalytics({
      platform: platformMetrics,
      trends: trendData,
      geography: geoData,
      business: businessData
    });
  };

  // Renamed to avoid conflict with the component's calculatePlatformAnalytics
  const calculatePlatformMetricsFn = (allData, periodBookings) => {
    const confirmedBookings = allData.bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const platformFees = confirmedBookings.reduce((sum, b) => sum + (b.platform_fee || (b.total_amount * 0.15) || 0), 0);
    
    const activeVenues = allData.venues.filter(v => v.status === 'active');
    const avgRating = allData.reviews.length > 0 ? 
      allData.reviews.reduce((sum, r) => sum + r.rating, 0) / allData.reviews.length : 0;

    // Calculate growth rate based on last 2 months of period
    const lastMonthBookings = periodBookings.filter(b => {
      const bookingDate = new Date(b.created_date);
      return bookingDate >= startOfMonth(subMonths(new Date(), 1));
    }).length;

    const previousMonthBookings = periodBookings.filter(b => {
      const bookingDate = new Date(b.created_date);
      return bookingDate >= startOfMonth(subMonths(new Date(), 2)) && 
             bookingDate < startOfMonth(subMonths(new Date(), 1));
    }).length;

    const growthRate = previousMonthBookings > 0 ? 
      ((lastMonthBookings - previousMonthBookings) / previousMonthBookings) * 100 : 0;

    return {
      totalRevenue,
      platformFees,
      totalBookings: allData.bookings.length,
      totalVenues: activeVenues.length,
      totalUsers: allData.users.length,
      avgRating,
      growthRate
    };
  };

  // Renamed to avoid conflict
  const calculateTrendsFn = (allData, startDate, endDate) => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Revenue trends
    const revenueTrends = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthBookings = allData.bookings.filter(b => {
        const bookingDate = new Date(b.created_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd && 
               ['confirmed', 'completed'].includes(b.status);
      });
      
      const revenue = monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const platformFee = monthBookings.reduce((sum, b) => sum + (b.platform_fee || (b.total_amount * 0.15) || 0), 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue,
        platformFee,
        bookings: monthBookings.length
      };
    });

    // User growth trends
    const userTrends = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const newUsers = allData.users.filter(u => {
        const userDate = new Date(u.created_date);
        return userDate >= monthStart && userDate <= monthEnd;
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        newUsers: newUsers.length,
        guests: newUsers.filter(u => u.user_type === 'guest' || !u.user_type).length,
        owners: newUsers.filter(u => u.user_type === 'venue_owner').length
      };
    });

    // Venue growth trends
    const venueTrends = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const newVenues = allData.venues.filter(v => {
        const venueDate = new Date(v.created_date);
        return venueDate >= monthStart && venueDate <= monthEnd;
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        newVenues: newVenues.length,
        approved: newVenues.filter(v => v.status === 'active').length,
        pending: newVenues.filter(v => v.status === 'pending_approval').length
      };
    });

    return {
      revenue: revenueTrends,
      bookings: revenueTrends,
      users: userTrends,
      venues: venueTrends
    };
  };

  // Renamed to avoid conflict
  const calculateGeographyInsightsFn = (venues, bookings) => {
    // Top cities by booking volume
    const cityBookings = bookings.reduce((acc, booking) => {
      const venue = venues.find(v => v.id === booking.venue_id);
      const city = venue?.location?.city;
      if (city) {
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    }, {});

    const topCities = Object.entries(cityBookings)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([city, bookings]) => ({ city, bookings }));

    // Venues by city
    const venuesByCity = venues.reduce((acc, venue) => {
      const city = venue.location?.city;
      if (city) {
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    }, {});

    const topVenueCities = Object.entries(venuesByCity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([city, count]) => ({ city, count }));

    return {
      topCities,
      venuesByCity: topVenueCities
    };
  };

  // Renamed to avoid conflict
  const calculateBusinessInsightsFn = (venues, bookings, users) => {
    // Top performing venues
    const venuePerformance = venues.map(venue => {
      const venueBookings = bookings.filter(b => b.venue_id === venue.id);
      const revenue = venueBookings
        .filter(b => ['confirmed', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      return {
        id: venue.id,
        name: venue.title,
        owner: venue.owner_name || 'Unknown',
        bookings: venueBookings.length,
        revenue,
        rating: venue.rating || 0,
        city: venue.location?.city || 'Unknown'
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Top venue owners
    const ownerPerformance = users.filter(u => u.user_type === 'venue_owner').map(owner => {
      const ownerVenues = venues.filter(v => v.owner_id === owner.id);
      const ownerBookings = bookings.filter(b => 
        ownerVenues.some(v => v.id === b.venue_id)
      );
      const revenue = ownerBookings
        .filter(b => ['confirmed', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      return {
        id: owner.id,
        name: owner.full_name,
        email: owner.email,
        venues: ownerVenues.length,
        bookings: ownerBookings.length,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Conversion funnel
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).length;
    const cancelledBookings = bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length;

    const conversionFunnel = {
      initiated: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
    };

    // Market share by event type
    const eventTypeBookings = bookings.reduce((acc, b) => {
      if (b.event_type) {
        acc[b.event_type] = (acc[b.event_type] || 0) + 1;
      }
      return acc;
    }, {});

    const marketShare = Object.entries(eventTypeBookings)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([type, count]) => ({ 
        type, 
        count, 
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0 
      }));

    return {
      topVenues: venuePerformance,
      topOwners: ownerPerformance,
      conversionFunnel,
      marketShare
    };
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "text-blue-600" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
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

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!data || !Array.isArray(data.venues) || !Array.isArray(data.bookings) || (data.venues.length === 0 && data.bookings.length === 0 && data.users.length === 0 && data.reviews.length === 0)) {
    return <Card><CardContent><p className="p-4 text-center">No data available to display analytics.</p></CardContent></Card>;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
        <div className="flex items-center gap-4">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="3months">3 Months</TabsTrigger>
              <TabsTrigger value="6months">6 Months</TabsTrigger>
              <TabsTrigger value="12months">12 Months</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(analytics.platform.totalRevenue, currentCurrency, currentLanguage)}
          change={analytics.platform.growthRate}
          icon={DollarSign}
          color="text-green-600"
        />
        <StatCard
          title="Platform Fees"
          value={formatCurrency(analytics.platform.platformFees, currentCurrency, currentLanguage)}
          icon={Target}
          color="text-blue-600"
        />
        <StatCard
          title="Total Bookings"
          value={analytics.platform.totalBookings.toLocaleString()}
          icon={Calendar}
          color="text-purple-600"
        />
        <StatCard
          title="Active Venues"
          value={analytics.platform.totalVenues.toLocaleString()}
          icon={Building}
          color="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.platform.totalUsers.toLocaleString()}
          icon={Users}
          color="text-orange-600"
        />
        <StatCard
          title="Platform Rating"
          value={analytics.platform.avgRating.toFixed(1)}
          icon={Star}
          color="text-yellow-600"
        />
        <StatCard
          title="Growth Rate"
          value={`${analytics.platform.growthRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatCard
          title="Active Markets"
          value={analytics.geography.topCities.length}
          icon={MapPin}
          color="text-red-600"
        />
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Platform Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.trends.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      formatCurrency(value, currentCurrency), 
                      name === 'revenue' ? 'Total Revenue' : 'Platform Fees'
                    ]} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="platformFee" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Booking Requests</span>
                  <div className="flex items-center gap-2">
                    <Progress value={100} className="w-32" />
                    <span>{analytics.business.conversionFunnel.initiated}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmed Bookings</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(analytics.business.conversionFunnel.confirmed / (analytics.business.conversionFunnel.initiated || 1)) * 100} 
                      className="w-32" 
                    />
                    <span>{analytics.business.conversionFunnel.confirmed}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cancelled/Rejected</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(analytics.business.conversionFunnel.cancelled / (analytics.business.conversionFunnel.initiated || 1)) * 100}
                      className="w-32" 
                    />
                    <span>{analytics.business.conversionFunnel.cancelled}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-lg font-semibold">
                    Conversion Rate: {(analytics.business.conversionFunnel.conversionRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.trends.users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="Total New Users" />
                      <Line type="monotone" dataKey="guests" stroke="#82ca9d" name="Guests" />
                      <Line type="monotone" dataKey="owners" stroke="#ffc658" name="Venue Owners" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trends.venues}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newVenues" fill="#8884d8" name="New Venues" />
                      <Bar dataKey="approved" fill="#82ca9d" name="Approved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Cities by Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.geography.topCities.slice(0, 8).map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{index + 1}</span>
                        <span>{city.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(city.bookings / (analytics.geography.topCities[0]?.bookings || 1)) * 100} 
                          className="w-20" 
                        />
                        <span className="text-sm text-gray-600">{city.bookings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venues by City</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.geography.venuesByCity}
                        dataKey="count"
                        nameKey="city"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ city, count }) => `${city}: ${count}`}
                      >
                        {analytics.geography.venuesByCity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.business.topVenues.slice(0, 5).map((venue, index) => (
                    <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <span className="font-medium">{venue.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{venue.city} • {venue.bookings} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(venue.revenue, currentCurrency)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm">{venue.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share by Event Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.business.marketShare.map((segment, index) => (
                    <div key={segment.type} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{segment.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={segment.percentage} className="w-24" />
                        <span className="text-sm text-gray-600">{segment.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Venue Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Owner</th>
                      <th className="text-left p-2">Venues</th>
                      <th className="text-left p-2">Bookings</th>
                      <th className="text-left p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.business.topOwners.slice(0, 10).map((owner, index) => (
                      <tr key={owner.id} className="border-b">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-gray-600 text-xs">{owner.email}</p>
                          </div>
                        </td>
                        <td className="p-2">{owner.venues}</td>
                        <td className="p-2">{owner.bookings}</td>
                        <td className="p-2 font-semibold">{formatCurrency(owner.revenue, currentCurrency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
