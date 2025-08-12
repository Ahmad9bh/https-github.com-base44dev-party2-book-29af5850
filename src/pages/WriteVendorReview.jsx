import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { VendorBooking } from '@/api/entities';
import { VendorReview } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function WriteVendorReview() {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const vendorId = searchParams.get('vendorId');
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [user, setUser] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [serviceQuality, setServiceQuality] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [punctuality, setPunctuality] = useState(0);
    const [valueForMoney, setValueForMoney] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, [bookingId, vendorId]);

    const loadData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            if (bookingId) {
                const bookingData = await VendorBooking.get(bookingId);
                setBooking(bookingData);
                const vendorData = await Vendor.get(bookingData.vendor_id);
                setVendor(vendorData);
            } else if (vendorId) {
                const vendorData = await Vendor.get(vendorId);
                setVendor(vendorData);
                // Create a mock booking for review purposes
                setBooking({
                    vendor_id: vendorId,
                    customer_name: currentUser.full_name,
                    event_date: new Date().toISOString().split('T')[0],
                    service_type: vendorData.service_type
                });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast({ title: 'Error', description: 'Could not load vendor information.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (starRating, setter) => {
        setter(starRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast({ title: 'Rating Required', description: 'Please select an overall rating.', variant: 'destructive' });
            return;
        }
        
        if (!reviewText.trim()) {
            toast({ title: 'Review Required', description: 'Please write a review.', variant: 'destructive' });
            return;
        }
        
        setSubmitting(true);
        
        try {
            const reviewData = {
                vendor_id: vendor.id,
                user_id: user.id,
                booking_id: bookingId || null,
                rating: rating,
                review_text: reviewText.trim(),
                service_quality: serviceQuality || rating,
                communication: communication || rating,
                punctuality: punctuality || rating,
                value_for_money: valueForMoney || rating,
                would_recommend: rating >= 4,
                event_type: booking.service_type || 'general',
                event_date: booking.event_date || new Date().toISOString().split('T')[0],
                user_name: user.full_name || user.email,
                user_avatar: user.profile_image || null,
                is_verified: !!bookingId
            };
            
            await VendorReview.create(reviewData);
            
            // Update vendor's rating statistics
            const existingReviews = await VendorReview.filter({ vendor_id: vendor.id });
            const totalReviews = existingReviews.length;
            const averageRating = existingReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
            
            await Vendor.update(vendor.id, {
                rating: parseFloat(averageRating.toFixed(1)),
                total_reviews: totalReviews
            });
            
            setSubmitted(true);
            toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
            
            setTimeout(() => {
                navigate(createPageUrl(`VendorProfile?id=${vendor.id}`));
            }, 2000);
            
        } catch (error) {
            console.error('Failed to submit review:', error);
            toast({ title: 'Error', description: 'Could not submit review. Please try again.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ value, setValue, label }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star, setValue)}
                        className="transition-colors duration-200 hover:scale-110"
                    >
                        <Star
                            className={`w-6 h-6 ${
                                star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner />;
    if (!vendor) return <div className="text-center py-10">Vendor not found.</div>;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <Card>
                    <CardContent className="p-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
                        <p className="text-gray-600 mb-6">Thank you for sharing your experience with {vendor.company_name}.</p>
                        <Button onClick={() => navigate(createPageUrl(`VendorProfile?id=${vendor.id}`))}>
                            Back to Vendor Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
                <p className="text-gray-600">Share your experience with {vendor.company_name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vendor Details */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{vendor.company_name}</h3>
                                <p className="text-gray-600 capitalize">{vendor.service_type}</p>
                                <p className="text-gray-600">{vendor.city}, {vendor.country}</p>
                            </div>
                            
                            {vendor.profile_image_url && (
                                <img 
                                    src={vendor.profile_image_url} 
                                    alt={vendor.company_name}
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
                            <CardDescription>Help other customers by sharing your honest feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Overall Rating */}
                                <div>
                                    <Label className="text-base font-semibold mb-3 block">
                                        Overall Rating
                                    </Label>
                                    <div className="flex items-center gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-colors duration-200 hover:scale-110"
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
                                        {rating === 5 && 'Excellent - Outstanding service'}
                                    </p>
                                </div>

                                {/* Detailed Ratings */}
                                <div className="grid grid-cols-2 gap-4">
                                    <StarRating value={serviceQuality} setValue={setServiceQuality} label="Service Quality" />
                                    <StarRating value={communication} setValue={setCommunication} label="Communication" />
                                    <StarRating value={punctuality} setValue={setPunctuality} label="Punctuality" />
                                    <StarRating value={valueForMoney} setValue={setValueForMoney} label="Value for Money" />
                                </div>

                                {/* Review Text */}
                                <div>
                                    <Label htmlFor="reviewText" className="text-base font-semibold mb-3 block">
                                        Write Your Review
                                    </Label>
                                    <Textarea
                                        id="reviewText"
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell others about your experience with this vendor. What did they do well? What could be improved?"
                                        className="h-32 resize-none"
                                        maxLength={1000}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {reviewText.length}/1000 characters
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(createPageUrl(`VendorProfile?id=${vendor.id}`))}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting || rating === 0 || !reviewText.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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