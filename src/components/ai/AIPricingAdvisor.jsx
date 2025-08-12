import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  DollarSign, 
  Calendar,
  Users,
  BarChart3,
  Lightbulb,
  Target
} from 'lucide-react';
import { formatCurrency } from '@/components/common/FormatUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AIPricingAdvisor({ venue, onPricingUpdate }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [marketData, setMarketData] = useState(null);
  
  useEffect(() => {
    if (venue) {
      loadPricingAnalysis();
    }
  }, [venue]);

  const loadPricingAnalysis = async () => {
    setLoading(true);
    try {
      // Get comparable venues and booking data
      const [allVenues, recentBookings] = await Promise.all([
        Venue.filter({ status: 'active', category: { '$in': venue.category || [] } }),
        Booking.filter({ venue_id: venue.id, status: { '$in': ['confirmed', 'completed'] } }, '-event_date', 50)
      ]);

      // Filter comparable venues (same city, similar capacity)
      const comparableVenues = allVenues.filter(v => 
        v.id !== venue.id &&
        v.location?.city === venue.location?.city &&
        Math.abs(v.capacity - venue.capacity) <= venue.capacity * 0.3 // Within 30% capacity
      );

      // Prepare market analysis data
      const marketAnalysis = {
        venue: {
          title: venue.title,
          current_price: venue.price_per_hour,
          capacity: venue.capacity,
          category: venue.category,
          city: venue.location?.city,
          rating: venue.rating,
          total_bookings: recentBookings.length,
          amenities: venue.amenities
        },
        comparable_venues: comparableVenues.map(v => ({
          title: v.title,
          price_per_hour: v.price_per_hour,
          capacity: v.capacity,
          rating: v.rating,
          total_bookings: v.total_bookings || 0
        })),
        recent_bookings: recentBookings.map(b => ({
          event_date: b.event_date,
          guest_count: b.guest_count,
          total_amount: b.total_amount,
          event_type: b.event_type
        })),
        market_metrics: {
          avg_price_in_city: comparableVenues.length > 0 
            ? comparableVenues.reduce((sum, v) => sum + v.price_per_hour, 0) / comparableVenues.length 
            : venue.price_per_hour,
          competitor_count: comparableVenues.length,
          booking_frequency: recentBookings.length > 0 
            ? calculateBookingFrequency(recentBookings) 
            : 'low'
        }
      };

      // Get AI analysis
      const aiResponse = await InvokeLLM({
        prompt: `As a venue pricing expert, analyze this venue's pricing strategy and provide recommendations.

Venue Data: ${JSON.stringify(marketAnalysis, null, 2)}

Please provide a comprehensive pricing analysis with:
1. Current pricing assessment (overpriced/underpriced/market-rate)
2. Specific pricing recommendations with reasoning
3. Revenue optimization strategies
4. Seasonal/demand-based pricing suggestions
5. Competitive positioning analysis

Format your response as detailed recommendations with specific price points and reasoning.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            pricing_assessment: {
              type: "string",
              enum: ["significantly_overpriced", "slightly_overpriced", "market_rate", "slightly_underpriced", "significantly_underpriced"]
            },
            recommended_price_range: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
                optimal: { type: "number" }
              }
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            },
            revenue_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  description: { type: "string" },
                  potential_impact: { type: "string" }
                }
              }
            },
            seasonal_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  suggested_price: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            competitive_analysis: {
              type: "object",
              properties: {
                market_position: { type: "string" },
                advantages: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAnalysis(aiResponse);
      setMarketData(marketAnalysis);
      
      // Generate actionable recommendations
      generateRecommendations(aiResponse, marketAnalysis);

    } catch (error) {
      console.error('Failed to load pricing analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBookingFrequency = (bookings) => {
    if (bookings.length === 0) return 'low';
    
    // Calculate bookings per month
    const monthsSpan = 3; // Looking at last 3 months
    const bookingsPerMonth = bookings.length / monthsSpan;
    
    if (bookingsPerMonth >= 4) return 'high';
    if (bookingsPerMonth >= 2) return 'medium';
    return 'low';
  };

  const generateRecommendations = (aiAnalysis, marketData) => {
    const recs = [];
    
    // Price adjustment recommendation
    if (aiAnalysis.recommended_price_range) {
      const currentPrice = venue.price_per_hour;
      const optimalPrice = aiAnalysis.recommended_price_range.optimal;
      
      if (Math.abs(currentPrice - optimalPrice) > currentPrice * 0.1) {
        recs.push({
          type: 'price_adjustment',
          title: 'Price Optimization',
          description: `Consider adjusting your price from ${formatCurrency(currentPrice)} to ${formatCurrency(optimalPrice)} per hour`,
          impact: Math.abs((optimalPrice - currentPrice) / currentPrice * 100).toFixed(1) + '% change',
          action: () => onPricingUpdate && onPricingUpdate(optimalPrice)
        });
      }
    }

    // Market positioning
    const avgMarketPrice = marketData.market_metrics.avg_price_in_city;
    if (venue.price_per_hour < avgMarketPrice * 0.8) {
      recs.push({
        type: 'market_positioning',
        title: 'Underpriced vs Market',
        description: `Your venue is priced below market average (${formatCurrency(avgMarketPrice)}). Consider a gradual increase.`,
        impact: 'Potential revenue increase',
        action: () => onPricingUpdate && onPricingUpdate(avgMarketPrice * 0.9)
      });
    }

    setRecommendations(recs);
  };

  const getPricingStatusColor = (assessment) => {
    switch (assessment) {
      case 'significantly_overpriced': return 'bg-red-100 text-red-800';
      case 'slightly_overpriced': return 'bg-orange-100 text-orange-800';
      case 'market_rate': return 'bg-green-100 text-green-800';
      case 'slightly_underpriced': return 'bg-blue-100 text-blue-800';
      case 'significantly_underpriced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2">Analyzing market data and pricing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadPricingAnalysis}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Run Pricing Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(analysis.recommended_price_range?.optimal || venue.price_per_hour)}
              </div>
              <p className="text-sm text-gray-600">Recommended Price</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge className={getPricingStatusColor(analysis.pricing_assessment)}>
                {analysis.pricing_assessment?.replace('_', ' ')}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">Current Status</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(marketData?.market_metrics?.avg_price_in_city || 0)}
              </div>
              <p className="text-sm text-gray-600">Market Average</p>
            </div>
          </div>

          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="strategies">Revenue Strategies</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Pricing</TabsTrigger>
              <TabsTrigger value="competitive">Competition</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-3">
                {analysis.key_insights?.map((insight, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-4">
              <div className="grid gap-4">
                {analysis.revenue_strategies?.map((strategy, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">{strategy.strategy}</h4>
                      <p className="text-gray-600 text-sm mb-2">{strategy.description}</p>
                      <Badge variant="outline">{strategy.potential_impact}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              <div className="space-y-3">
                {analysis.seasonal_recommendations?.map((season, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{season.period}</h4>
                      <p className="text-sm text-gray-600">{season.reasoning}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(season.suggested_price)}</div>
                      <Button size="sm" variant="outline" onClick={() => onPricingUpdate && onPricingUpdate(season.suggested_price)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Market Position</h4>
                  <p className="text-gray-600">{analysis.competitive_analysis?.market_position}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Your Advantages</h5>
                    <ul className="space-y-1">
                      {analysis.competitive_analysis?.advantages?.map((advantage, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">Opportunities</h5>
                    <ul className="space-y-1">
                      {analysis.competitive_analysis?.opportunities?.map((opportunity, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                    <Badge variant="outline" className="mt-1">{rec.impact}</Badge>
                  </div>
                  {rec.action && (
                    <Button size="sm" onClick={rec.action}>
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}