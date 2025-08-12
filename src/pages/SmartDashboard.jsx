import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, Heart, Calendar, MapPin } from 'lucide-react';
import { PersonalizationEngine, usePersonalization } from '@/components/personalization/PersonalizationEngine';
import SmartOnboarding from '@/components/personalization/SmartOnboarding';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SmartDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { recommendations, trackBehavior } = usePersonalization(user?.id);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        // Check if user needs onboarding
        const hasPreferences = await PersonalizationEngine.getPersonalizedRecommendations(userData.id, 1);
        if (hasPreferences.length === 0) {
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload(); // Refresh to load new recommendations
  };

  if (loading) return <LoadingSpinner />;

  if (showOnboarding) {
    return (
      <SmartOnboarding 
        userId={user.id} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          Smart Dashboard
        </h1>
        <p className="text-gray-600">Your personalized venue discovery experience</p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Recommended Just for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(venue => (
                  <div 
                    key={venue.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      trackBehavior('view', { venue_id: venue.id, source: 'recommendations' }, venue.id);
                      window.location.href = createPageUrl(`VenueDetails?id=${venue.id}`);
                    }}
                  >
                    <img 
                      src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'} 
                      alt={venue.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{venue.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {venue.location?.city}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-600">${venue.price_per_hour}/hr</span>
                        {venue.personalization_score > 0 && (
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            {Math.round(venue.personalization_score * 10)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Popular venues based on recent booking activity</p>
              {/* Trending venues would be loaded here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Venues you've looked at recently</p>
              {/* Recent venues would be loaded here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Based on your activity, we've learned your preferences:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Preferred Price Range:</span>
                  <span className="font-medium">$100 - $300/hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorite Location:</span>
                  <span className="font-medium">Dubai</span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred Event Type:</span>
                  <span className="font-medium">Corporate Events</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setShowOnboarding(true)}>
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}