import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Edit, Eye, Building, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import OwnerBookingsManagement from '@/components/owner/OwnerBookingsManagement';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function MyVenues() {
  const { getLocalizedText } = useLocalization();
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if(isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const ownerVenues = await Venue.filter({ owner_id: currentUser.id });
      setVenues(ownerVenues || []);

      if (ownerVenues && ownerVenues.length > 0) {
        const venueIds = ownerVenues.map(v => v.id);
        const allBookings = await Booking.filter({ venue_id: { '$in': venueIds } }, '-event_date');
        setBookings(allBookings || []);
      }
    } catch (error) {
      console.error("Failed to load owner's data:", error);
    } finally {
      if(isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center py-10">{getLocalizedText('my_venues_login_required', currentLanguage) || 'You must be logged in to view your venues.'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getLocalizedText('my_venues_title') || 'My Venues'}</h1>
          <p className="text-gray-600">{getLocalizedText('my_venues_subtitle') || 'Manage your venue listings and bookings.'}</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Link to={createPageUrl('AddVenue')}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {getLocalizedText('add_new_venue') || 'Add New Venue'}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Booking Management Section */}
      <div className="mb-8">
        <OwnerBookingsManagement bookings={bookings} onUpdate={() => loadData(true)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getLocalizedText('my_venues_listed_venues_title') || 'Your Listed Venues'}</CardTitle>
          <CardDescription>
            {getLocalizedText('my_venues_listed_venues_subtitle') || 'Here are all the venues you have listed on Party2Go.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map(venue => (
                <Card key={venue.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Building className="w-8 h-8 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold">{venue.title}</h3>
                        <p className="text-sm text-gray-500">{venue.location?.city}</p>
                        <Badge className="mt-2">{venue.status}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                        <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />{getLocalizedText('view') || 'View'}</Button>
                      </Link>
                      <Link to={createPageUrl(`EditVenue?id=${venue.id}`)}>
                        <Button size="sm"><Edit className="w-4 h-4 mr-2" />{getLocalizedText('edit') || 'Edit'}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{getLocalizedText('my_venues_no_venues_listed') || "You haven't listed any venues yet."}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}