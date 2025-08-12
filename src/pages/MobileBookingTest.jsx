import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MobileBookingFlow from '@/components/mobile/MobileBookingFlow';
import { formatCurrency, convertCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function MobileBookingTest() {
  const { currentCurrency } = useLocalization();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestVenues();
  }, []);

  const loadTestVenues = async () => {
    try {
      const activeVenues = await Venue.filter({ status: 'active' });
      setVenues(activeVenues.slice(0, 3)); // Show first 3 venues for testing
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookVenue = (venue) => {
    setSelectedVenue(venue);
    setShowBookingFlow(true);
  };

  const handleBookingComplete = (booking) => {
    setShowBookingFlow(false);
    setSelectedVenue(null);
    alert(`Booking submitted successfully! Booking ID: ${booking.id}`);
  };

  const handleBackToVenues = () => {
    setShowBookingFlow(false);
    setSelectedVenue(null);
  };

  if (showBookingFlow && selectedVenue) {
    return (
      <MobileBookingFlow 
        venue={selectedVenue}
        onBack={handleBackToVenues}
        onComplete={handleBookingComplete}
      />
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mobile Booking Test</h1>
          <p className="text-gray-600">Test the mobile booking experience on different screen sizes</p>
        </div>

        <div className="space-y-4">
          {venues.map(venue => {
            const convertedPrice = convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency);
            
            return (
              <Card key={venue.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  {venue.images?.[0] && (
                    <img 
                      src={venue.images[0]} 
                      alt={venue.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{venue.title}</h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {venue.location?.city}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        Up to {venue.capacity} guests
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {venue.rating ? venue.rating.toFixed(1) : 'New'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-indigo-600">
                        {formatCurrency(convertedPrice, currentCurrency)}/hr
                      </div>
                      {venue.instant_book_enabled && (
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Instant Book
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)} className="flex-1">
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                      <Button 
                        onClick={() => handleBookVenue(venue)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {venues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No venues available for testing</p>
            <Link to={createPageUrl('AddVenue')}>
              <Button>Add a Test Venue</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to={createPageUrl('Browse')}>
            <Button variant="outline">View All Venues</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}