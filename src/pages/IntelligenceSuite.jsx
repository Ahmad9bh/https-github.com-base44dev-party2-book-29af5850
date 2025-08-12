import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Zap, BarChart, Bot, Sparkles, Droplets } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// AI Components
import AIPricingAdvisor from '@/components/ai/AIPricingAdvisor';
import SemanticSearch from '@/components/ai/SemanticSearch';
import ARViewer from '@/components/ai/ARViewer';
// We'll import more as we create them

export default function IntelligenceSuite() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [demoVenue, setDemoVenue] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me().catch(() => null);
        setUser(userData);

        const venueData = await Venue.list('-rating', 10);
        setVenues(venueData);
        if(venueData.length > 0) {
            // Find a venue with a model for the AR demo
            const arVenue = venueData.find(v => v.model_url) || venueData[0];
            // If no venue has a model, assign a demo one for the showcase
            if (!arVenue.model_url) {
                arVenue.model_url = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
            }
            setDemoVenue(arVenue);
        }

      } catch (err) {
        console.error("Failed to load data for AI suite", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            Party2Go Intelligence Suite
        </h1>
        <p className="text-xl text-gray-600">Experience the future of event planning with our AI-powered tools.</p>
      </div>

      <Tabs defaultValue="search_discovery" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search_discovery">AI Search & Discovery</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="operations">Operational AI</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="search_discovery" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Discovery Tools</CardTitle>
                    <CardDescription>Find your perfect venue faster than ever with natural language, voice, and visual search.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SemanticSearch 
                        onSearch={(q) => alert(`Performing keyword search for: ${q}`)} 
                        onFiltersApplied={(f) => alert(`Applying AI filters: ${JSON.stringify(f)}`)} 
                        onClear={() => alert('Search cleared!')}
                    />
                    {demoVenue && (
                        <div className="pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-2">Augmented Reality Preview</h3>
                            <p className="text-sm text-gray-600 mb-4">Visualize a venue in your own space using your phone's camera. Click the button below to try it with our demo venue, "{demoVenue.title}".</p>
                            <ARViewer modelUrl={demoVenue.model_url} venueName={demoVenue.title} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Personalized Venue Matching</CardTitle>
                    <CardDescription>Our AI learns your preferences to suggest venues you'll love. (Demonstration)</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">In a full implementation, this section would display a list of AI-curated venues based on your browsing history, favorites, and past bookings, providing a truly personalized discovery experience.</p>
                    {/* Placeholder for VenueRecommendationsAI component */}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Pricing Advisor</CardTitle>
                        <CardDescription>For venue owners: get data-driven pricing strategies to maximize your revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {demoVenue ? (
                           <AIPricingAdvisor 
                                venue={demoVenue} 
                                similarVenues={venues.filter(v => v.id !== demoVenue.id)} 
                                onApplySuggestion={(s) => alert(`Applying suggestion: ${JSON.stringify(s)}`)} 
                           />
                       ) : <p>No venues available for pricing analysis.</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Chatbot Assistant</CardTitle>
                        <CardDescription>Get instant help from our 24/7 AI assistant. (Check the bottom-right of your screen)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">Our chatbot, powered by a Large Language Model, can understand your needs, recommend venues, and answer your questions in real-time. Try asking it "Can you find me a venue for a small birthday party?".</p>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

         <TabsContent value="analytics" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Predictive Analytics & Forecasting</CardTitle>
                    <CardDescription>Leverage AI to anticipate market trends and booking demand.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">In a full implementation, this dashboard would show AI-generated forecasts for booking volumes, popular venue types, and revenue predictions for the upcoming quarter, helping admins and owners make smarter business decisions.</p>
                    {/* Placeholder for Predictive Analytics component */}
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}