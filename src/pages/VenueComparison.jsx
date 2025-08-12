import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Star, Users, MapPin, Wifi, Car, Coffee, Music, Camera, Utensils, Shield, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';

const amenityIcons = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  catering: <Coffee className="w-4 h-4" />,
  sound_system: <Music className="w-4 h-4" />,
  projector: <Camera className="w-4 h-4" />,
  kitchen: <Utensils className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
};

export default function VenueComparison() {
  const [searchParams] = useSearchParams();
  const venueIds = searchParams.get('venues')?.split(',') || [];
  
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      if (venueIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const venuePromises = venueIds.map(id => Venue.get(id));
        const venueData = await Promise.all(venuePromises);
        setVenues(venueData.filter(Boolean)); // Remove any null results
      } catch (error) {
        console.error('Failed to load venues for comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, [venueIds.join(',')]);

  const removeVenue = (venueId) => {
    const updatedIds = venueIds.filter(id => id !== venueId);
    const newUrl = `${createPageUrl('VenueComparison')}?venues=${updatedIds.join(',')}`;
    window.location.href = newUrl;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (venues.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No Venues to Compare</h1>
        <p className="text-gray-600 mb-6">
          Start comparing venues by selecting them from the browse page.
        </p>
        <Link to={createPageUrl('Browse')}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Browse Venues
          </Button>
        </Link>
      </div>
    );
  }

  // Get all unique amenities across all venues
  const allAmenities = [...new Set(venues.flatMap(v => v.amenities || []))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Venues</h1>
          <p className="text-gray-600">Compare features, pricing, and amenities side by side</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Images Row */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-${Math.min(venues.length, 3)} gap-4`}>
                {venues.map((venue) => (
                  <div key={venue.id} className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => removeVenue(venue.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop'}
                        alt={venue.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mt-2">{venue.title}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {venue.location?.city || 'Location not specified'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Feature</th>
                      {venues.map(venue => (
                        <th key={venue.id} className="text-center py-3 px-2 font-semibold min-w-[200px]">
                          {venue.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Price per Hour</td>
                      {venues.map(venue => (
                        <td key={venue.id} className="py-3 px-2 text-center">
                          <div className="font-semibold text-lg text-green-600">
                            {formatCurrency(venue.price_per_hour, venue.currency)}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Capacity</td>
                      {venues.map(venue => (
                        <td key={venue.id} className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">{venue.capacity} guests</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Rating</td>
                      {venues.map(venue => (
                        <td key={venue.id} className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{venue.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-gray-500 text-sm">({venue.total_reviews || 0} reviews)</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Status</td>
                      {venues.map(venue => (
                        <td key={venue.id} className="py-3 px-2 text-center">
                          <Badge className={venue.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {venue.status === 'active' ? 'Available' : venue.status}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Amenities Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Amenity</th>
                      {venues.map(venue => (
                        <th key={venue.id} className="text-center py-3 px-2 font-semibold min-w-[200px]">
                          {venue.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allAmenities.map((amenity, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 font-medium capitalize">
                          <div className="flex items-center gap-2">
                            {amenityIcons[amenity] || <div className="w-4 h-4" />}
                            {amenity.replace('_', ' ')}
                          </div>
                        </td>
                        {venues.map(venue => (
                          <td key={venue.id} className="py-3 px-2 text-center">
                            {venue.amenities?.includes(amenity) ? (
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className={`grid grid-cols-${Math.min(venues.length, 3)} gap-4`}>
                {venues.map((venue) => (
                  <div key={venue.id} className="space-y-3">
                    <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`BookVenue?venue_id=${venue.id}`)}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to={createPageUrl('Browse')}>
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Browsing Venues
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}