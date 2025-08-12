import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, MapPin, Share2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import FavoritesManager from '@/components/venues/FavoritesManager';

export default function MobileVenueCard({ venue, currentCurrency, onShare }) {
  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: venue.title,
        text: `Check out this venue: ${venue.title}`,
        url: window.location.origin + createPageUrl(`VenueDetails?id=${venue.id}`),
      });
    } else {
      onShare && onShare('Share feature not available on this device.');
    }
  };

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
        <div className="relative">
          <img
            src={venue.images?.[0] || `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80`}
            alt={venue.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 left-2">
            {venue.is_featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
          </div>
          <div className="absolute top-2 right-2">
            <FavoritesManager venueId={venue.id} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-2">{venue.title}</h3>
            <button onClick={handleShare} className="text-gray-500 p-2 -mr-2">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{venue.location?.city}</span>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{venue.rating?.toFixed(1) || 'New'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Up to {venue.capacity} guests</span>
              </div>
            </div>
            
            <div className="font-semibold text-base">
              {formatCurrency(venue.price_per_hour, currentCurrency)}/hr
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}