
import React, { useState, useEffect } from 'react';
import { Review } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { getLocalizedText } from '@/components/common/FormatUtils';

function StarRating({ rating }) {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <Star
                    key={index}
                    className={`w-5 h-5 ${index < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

export default function ReviewSystem({ venueId, averageRating, totalReviews, currentLanguage }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            if (!venueId) return;
            try {
                setLoading(true);
                const fetchedReviews = await Review.filter({ venue_id: venueId }, '-created_date', 100);
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        loadReviews();
    }, [venueId]);

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        return {
            star,
            count,
            percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
        };
    });
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{getLocalizedText('reviews', currentLanguage)} ({totalReviews})</CardTitle>
            </CardHeader>
            <CardContent>
                {totalReviews > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Rating Summary */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center">
                            <p className="text-5xl font-bold">{averageRating.toFixed(1)}</p>
                            <StarRating rating={averageRating} />
                            <p className="text-gray-500 mt-2">{getLocalizedText('based_on_reviews', currentLanguage, { count: totalReviews })}</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="md:col-span-2 space-y-2">
                            {ratingDistribution.map(item => (
                                <div key={item.star} className="flex items-center gap-4">
                                    <span className="text-sm">{item.star} {getLocalizedText('star', currentLanguage)}</span>
                                    <Progress value={item.percentage} className="flex-1" />
                                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">{getLocalizedText('no_reviews_yet_be_first', currentLanguage)}</p>
                )}

                {/* Individual Reviews */}
                {reviews.length > 0 && (
                    <div className="mt-8 space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.user_avatar} alt={review.user_name} />
                                    <AvatarFallback>{review.user_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-4 mb-1">
                                      <p className="font-semibold">{review.user_name}</p>
                                      <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-gray-500 text-sm mb-2">
                                        {formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
                                    </p>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
