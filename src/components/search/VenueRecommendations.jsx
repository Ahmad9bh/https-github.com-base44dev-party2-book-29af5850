import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { PersonalizationEngine } from '@/components/personalization/PersonalizationEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';
import { MapPin } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function VenueRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Trending This Week');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const allVenues = await Venue.filter({ status: 'active' });
        let recs = [];

        if (user) {
          recs = await PersonalizationEngine.getRecommendations(user.id, allVenues);
          if (recs.length > 0) {
            setTitle('Recommended For You');
          }
        }
        
        // Fallback for new users or if no specific recommendations are found
        if (recs.length === 0) {
          setTitle('Trending This Week');
          recs = allVenues
            .filter(v => v.is_featured)
            .sort(() => 0.5 - Math.random()) // Shuffle featured
            .slice(0, 10);
        }
        
        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if no recommendations
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex space-x-4 pb-4">
          {recommendations.map(venue => (
            <Card key={venue.id} className="inline-block w-[280px] hover:shadow-xl transition-shadow duration-300">
              <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                <div className="overflow-hidden rounded-t-lg">
                  <img
                    src={venue.images?.[0] || `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80`}
                    alt={venue.title}
                    className="h-40 w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold truncate">{venue.title}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{venue.location?.city}</span>
                  </div>
                  <p className="text-sm font-medium mt-2">
                    {formatCurrency(venue.price_per_hour, venue.currency)}/hr
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}