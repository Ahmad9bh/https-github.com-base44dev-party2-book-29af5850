import React, { useState, useEffect } from 'react';
import { UserFavorite } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, convertCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function MyFavorites() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const currentUser = await User.me();
        setUser(currentUser);
        
        const favorites = await UserFavorite.filter({ user_id: currentUser.id });
        const venueIds = favorites.map(fav => fav.venue_id);
        
        if (venueIds.length > 0) {
          const venues = await Venue.filter({ id: { '$in': venueIds } });
          setFavoriteVenues(venues);
        } else {
          setFavoriteVenues([]);
        }

      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to see your favorite venues.</p>
        <Button onClick={() => User.login()}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Your saved venues for future events.</p>
      </div>

      {favoriteVenues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 mb-6">Start browsing and save venues you love!</p>
            <Link to={createPageUrl('Browse')}>
              <Button>Browse Venues</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteVenues.map(venue => {
              const convertedPrice = convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency);
              return (
                  <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                          {venue.images && venue.images.length > 0 && (
                            <img
                                src={venue.images[0]}
                                alt={venue.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                          )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="mb-2">{venue.title}</CardTitle>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{venue.description}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{venue.location?.city}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Up to {venue.capacity} guests
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold">
                            {formatCurrency(convertedPrice, currentCurrency, currentLanguage)}/hour
                          </div>
                          <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                  </Card>
              );
          })}
        </div>
      )}
    </div>
  );
}