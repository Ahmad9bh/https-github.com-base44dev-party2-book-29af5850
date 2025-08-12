import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Review } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

export default function WriteReview() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (bookingId) {
      loadData();
    } else {
      error('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId]);

  const loadData = async () => {
    try {
      const [currentUser, bookingData] = await Promise.all([
        User.me(),
        Booking.get(bookingId)
      ]);
      
      setUser(currentUser);
      setBooking(bookingData);
      
      // Check if user owns this booking
      if (bookingData.user_id !== currentUser.id) {
        error('You can only review your own bookings.');
        window.location.href = createPageUrl('MyBookings');
        return;
      }
      
      // Check if booking is completed
      if (bookingData.status !== 'completed') {
        error('You can only review completed bookings.');
        window.location.href = createPageUrl('MyBookings');
        return;
      }
      
      if (bookingData.venue_id) {
        const venueData = await Venue.get(bookingData.venue_id);
        setVenue(venueData);
      }
      
      // Check if user already reviewed this booking
      if (bookingData.review_id) {
        error('You have already submitted a review for this booking.');
        window.location.href = createPageUrl('MyBookings');
        return;
      }
      
    } catch (err) {
      console.error('Failed to load booking data:', err);
      error('Failed to load booking information.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      error('Please select a rating by clicking on the stars.');
      return;
    }
    
    if (!comment.trim()) {
      error('Please write a review comment.');
      return;
    }
    
    if (comment.trim().length < 10) {
      error('Review comment must be at least 10 characters long.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create the review
      const reviewData = {
        venue_id: venue.id,
        user_id: user.id,
        booking_id: booking.id,
        rating: rating,
        comment: comment.trim(),
        user_name: user.full_name || user.email,
        user_avatar: user.profile_image || null
      };
      
      console.log('Submitting review data:', reviewData);
      const newReview = await Review.create(reviewData);
      console.log('Review created:', newReview);
      
      // Update booking to reference this review
      await Booking.update(booking.id, {
        review_id: newReview.id
      });
      
      // Update venue's rating statistics
      const existingReviews = await Review.filter({ venue_id: venue.id });
      const totalReviews = existingReviews.length;
      const averageRating = existingReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      await Venue.update(venue.id, {
        rating: parseFloat(averageRating.toFixed(1)),
        total_reviews: totalReviews
      });
      
      setSubmitted(true);
      success('Thank you for your review! It has been submitted successfully.');
      
      // Redirect after a delay to show success message
      setTimeout(() => {
        window.location.href = createPageUrl('MyBookings');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to submit review:', err);
      error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking || !venue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the booking you're trying to review.</p>
        <Button onClick={() => window.location.href = createPageUrl('MyBookings')}>
          Go to My Bookings
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-green-50 rounded-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-4">Review Submitted Successfully!</h1>
          <p className="text-green-700 mb-6">Thank you for taking the time to review {venue.title}.</p>
          <Button onClick={() => window.location.href = createPageUrl('MyBookings')}>
            Return to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
        <p className="text-gray-600">Share your experience with {venue.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{venue.title}</h3>
                <p className="text-gray-600">{venue.location?.city}</p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Date:</strong> {format(new Date(booking.event_date), 'PPP')}</p>
                <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
                <p><strong>Guests:</strong> {booking.guest_count}</p>
                <p><strong>Event Type:</strong> {booking.event_type}</p>
              </div>

              {venue.images && venue.images.length > 0 && (
                <img 
                  src={venue.images[0]} 
                  alt={venue.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    How would you rate your experience?
                  </Label>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        className="transition-colors duration-200 hover:scale-110 transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {rating === 0 && 'Click on a star to rate'}
                    {rating === 1 && 'Poor - Far below expectations'}
                    {rating === 2 && 'Fair - Below expectations'}
                    {rating === 3 && 'Good - Met expectations'}
                    {rating === 4 && 'Very Good - Exceeded expectations'}
                    {rating === 5 && 'Excellent - Far exceeded expectations'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
                    Tell us about your experience
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience at this venue. What did you like? What could be improved? This will help other users make informed decisions."
                    className="h-32 resize-none"
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {comment.length}/1000 characters (minimum 10 characters)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('MyBookings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || rating === 0 || comment.trim().length < 10}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}