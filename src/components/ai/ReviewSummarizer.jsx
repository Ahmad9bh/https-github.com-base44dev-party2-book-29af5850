import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Review } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ReviewSummarizer({ venueId }) {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (venueId) {
      loadReviews();
    }
  }, [venueId]);

  const loadReviews = async () => {
    try {
      const venueReviews = await Review.filter({ venue_id: venueId }, '-created_date', 100);
      setReviews(venueReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const generateSummary = async () => {
    if (reviews.length === 0) return;
    
    setLoading(true);
    try {
      const reviewData = reviews.map(r => ({
        rating: r.rating,
        comment: r.comment,
        date: r.created_date
      }));

      const aiSummary = await InvokeLLM({
        prompt: `Analyze these venue reviews and provide a comprehensive summary:

Reviews: ${JSON.stringify(reviewData, null, 2)}

Provide insights on:
1. Overall sentiment and common themes
2. Most praised aspects
3. Common complaints or issues
4. Trends over time
5. Specific recommendations for improvement
6. Key strengths to highlight

Be specific and actionable in your analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_sentiment: {
              type: "string",
              enum: ["very_positive", "positive", "mixed", "negative", "very_negative"]
            },
            sentiment_score: { type: "number" },
            key_strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  mentions: { type: "number" },
                  sentiment: { type: "string" }
                }
              }
            },
            areas_for_improvement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  mentions: { type: "number" },
                  suggestions: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: { type: "string" },
            trends: {
              type: "object",
              properties: {
                rating_trend: { type: "string" },
                recent_feedback: { type: "string" }
              }
            },
            recommended_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSummary(aiSummary);
    } catch (error) {
      console.error('Failed to generate review summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'very_positive': return 'text-green-600 bg-green-100';
      case 'positive': return 'text-green-600 bg-green-50';
      case 'mixed': return 'text-yellow-600 bg-yellow-100';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'very_negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment?.includes('positive')) return <TrendingUp className="w-4 h-4" />;
    if (sentiment?.includes('negative')) return <TrendingDown className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Review Analysis
            </CardTitle>
            <Badge variant="outline">
              {reviews.length} reviews analyzed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!summary ? (
            <div className="text-center py-8">
              <Button onClick={generateSummary} disabled={loading}>
                {loading ? <LoadingSpinner size="h-4 w-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {loading ? 'Analyzing Reviews...' : 'Generate AI Summary'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Sentiment */}
              <div className="text-center p-6 border rounded-lg">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getSentimentColor(summary.overall_sentiment)}`}>
                  {getSentimentIcon(summary.overall_sentiment)}
                  <span className="font-medium capitalize">
                    {summary.overall_sentiment?.replace('_', ' ')}
                  </span>
                </div>
                <Progress 
                  value={summary.sentiment_score * 20} 
                  className="mt-4 max-w-md mx-auto" 
                />
                <p className="text-sm text-gray-600 mt-2">
                  Sentiment Score: {summary.sentiment_score}/5
                </p>
              </div>

              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-3">Executive Summary</h4>
                <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Key Strengths */}
              {summary.key_strengths?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    Key Strengths
                  </h4>
                  <div className="grid gap-3">
                    {summary.key_strengths.map((strength, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <span className="font-medium">{strength.aspect}</span>
                          <p className="text-sm text-green-700">{strength.sentiment}</p>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {strength.mentions} mentions
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {summary.areas_for_improvement?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    Areas for Improvement
                  </h4>
                  <div className="grid gap-3">
                    {summary.areas_for_improvement.map((area, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{area.aspect}</span>
                          <Badge variant="outline" className="bg-white">
                            {area.mentions} mentions
                          </Badge>
                        </div>
                        {area.suggestions?.length > 0 && (
                          <ul className="text-sm text-red-700 space-y-1">
                            {area.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-red-600 rounded-full mt-2"></div>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              {summary.trends && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Trends</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Rating Trend</h5>
                      <p className="text-gray-700">{summary.trends.rating_trend}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Recent Feedback</h5>
                      <p className="text-gray-700">{summary.trends.recent_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              {summary.recommended_actions?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recommended Actions</h4>
                  <div className="space-y-2">
                    {summary.recommended_actions.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-blue-800">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={generateSummary} variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}