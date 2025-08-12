import React, { useState, useEffect } from 'react';
import { UserFavorite } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import cacheManager from '@/components/utils/CacheManager';

export default function FavoritesManager({ venueId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        const favoritesSet = await cacheManager.getUserFavoritesSet(currentUser.id);
        setIsFavorited(favoritesSet.has(venueId));
      } catch (err) {
        setUser(null);
        setIsFavorited(false);
      } finally {
        setLoading(false);
      }
    };
    checkFavoriteStatus();
  }, [venueId]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save favorites.",
        variant: "destructive"
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isFavorited) {
        const existingFavorites = await UserFavorite.filter({ user_id: user.id, venue_id: venueId }, '', 1);
        if (existingFavorites.length > 0) {
          await UserFavorite.delete(existingFavorites[0].id);
          setIsFavorited(false);
          toast({ title: "Removed from favorites" });
        }
      } else {
        await UserFavorite.create({ user_id: user.id, venue_id: venueId });
        setIsFavorited(true);
        toast({ title: "Added to favorites" });
      }
      
      // Invalidate the cache to ensure fresh data on next load
      cacheManager.invalidateFavoritesCache(user.id);
      
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-white/80 hover:bg-white"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFavoriteToggle();
      }}
      disabled={loading}
    >
      <Heart 
        className={`w-5 h-5 transition-colors ${
          isFavorited 
            ? 'text-red-500 fill-current' 
            : 'text-gray-700'
        } ${loading ? 'opacity-50' : ''}`} 
      />
    </Button>
  );
}