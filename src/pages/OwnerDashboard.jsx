import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Building, Calendar, DollarSign, MessageSquare, BarChart2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import OwnerStats from '@/components/owner/OwnerStats';

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser.user_type === 'venue_owner' || currentUser.role === 'admin') {
          const ownerVenues = await Venue.filter({ owner_id: currentUser.id });
          setVenues(ownerVenues || []);

          if (ownerVenues.length > 0) {
            const venueIds = ownerVenues.map(v => v.id);
            const venueBookings = await Booking.filter({ venue_id: { '$in': venueIds } });
            setBookings(venueBookings || []);
          }
        }
      } catch (error) {
        console.error("Failed to load owner data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || (user.user_type !== 'venue_owner' && user.role !== 'admin')) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You must be a venue owner to access this page.</p>
        <Link to={createPageUrl('Home')}>
          <Button className="mt-4">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.full_name}!</p>
        </div>
        <Link to={createPageUrl('AddVenue')}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Venue
          </Button>
        </Link>
      </div>

      <OwnerStats venues={venues} bookings={bookings} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-indigo-600" /> My Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your venue listings, edit details, and control availability.</p>
            <Link to={createPageUrl('MyVenues')}><Button variant="outline">Manage Venues</Button></Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View upcoming and past bookings. Confirm or reject new requests.</p>
            <Link to={createPageUrl('MyVenues')}><Button variant="outline">Manage Bookings</Button></Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-600" /> Financials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Track your earnings, view payout history, and manage your financial details.</p>
            <Link to={createPageUrl('OwnerFinancials')}><Button variant="outline">View Financials</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}