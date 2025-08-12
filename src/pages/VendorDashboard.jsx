import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { VendorBooking } from '@/api/entities';
import { VendorReview } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Calendar, Star, DollarSign, TrendingUp, 
  Users, MessageSquare, Settings, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

export default function VendorDashboard() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Get vendor profile
      const vendorProfiles = await Vendor.filter({ user_id: currentUser.id });
      if (vendorProfiles.length === 0) {
        // Redirect to vendor registration if no profile exists
        window.location.href = createPageUrl('AddVendor');
        return;
      }

      const vendorProfile = vendorProfiles[0];
      setVendor(vendorProfile);

      // Load vendor bookings
      const vendorBookings = await VendorBooking.filter({ vendor_id: vendorProfile.id }, '-created_date', 50);
      setBookings(vendorBookings);

      // Load vendor reviews
      const vendorReviews = await VendorReview.filter({ vendor_id: vendorProfile.id }, '-created_date', 20);
      setReviews(vendorReviews);

      // Calculate stats
      const totalRevenue = vendorBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.final_price || 0), 0);

      const completedBookings = vendorBookings.filter(b => b.status === 'completed').length;
      const totalBookings = vendorBookings.length;
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      const averageRating = vendorReviews.length > 0 
        ? vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length 
        : 0;

      setStats({
        totalBookings: totalBookings,
        totalRevenue: totalRevenue,
        averageRating: averageRating,
        completionRate: completionRate
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!vendor) {
    return (
      <div className="text-center py-8">
        <p>No vendor profile found. Please create your vendor profile first.</p>
        <Link to={createPageUrl('AddVendor')}>
          <Button className="mt-4">Create Vendor Profile</Button>
        </Link>
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {vendor.company_name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to={createPageUrl(`EditVendor?id=${vendor.id}`)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Profile
            </Link>
          </Button>
          <Button asChild>
            <Link to={createPageUrl('BrowseVendors')}>
              <Plus className="w-4 h-4 mr-2" />
              View Marketplace
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue, vendor.currency || 'USD', currentCurrency)}
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
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{booking.customer_name}</h3>
                        <p className="text-sm text-gray-600">{booking.event_type} - {booking.event_date}</p>
                        <p className="text-sm text-gray-500">{booking.guest_count} guests</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={createPageUrl(`VendorBookingDetails?id=${booking.id}`)}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Your booking requests will appear here when customers contact you.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user_name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.event_date}</span>
                      </div>
                      <p className="text-gray-700">{review.review_text}</p>
                      {review.vendor_response && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-700">Your Response:</p>
                          <p className="text-sm text-gray-600 mt-1">{review.vendor_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Customer reviews will appear here after completed events.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <span className="font-medium">{vendor.response_time_hours || 24} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Events</span>
                    <span className="font-medium">{vendor.total_events || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Years in Business</span>
                    <span className="font-medium">{vendor.years_in_business || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Team Size</span>
                    <span className="font-medium">{vendor.team_size || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completeness</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span>{stats.averageRating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${(stats.averageRating/5)*100}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Booking Conversion</span>
                      <span>{stats.completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${stats.completionRate}%`}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}