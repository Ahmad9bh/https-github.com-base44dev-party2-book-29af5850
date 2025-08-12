import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Send, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const FEEDBACK_CATEGORIES = [
    { id: 'feature_request', label: 'Feature Request', color: 'bg-blue-100 text-blue-800' },
    { id: 'bug_report', label: 'Bug Report', color: 'bg-red-100 text-red-800' },
    { id: 'improvement', label: 'Improvement', color: 'bg-green-100 text-green-800' },
    { id: 'general', label: 'General Feedback', color: 'bg-gray-100 text-gray-800' }
];

export default function FeedbackCollector({ showInModal = false }) {
    const [feedback, setFeedback] = useState('');
    const [category, setCategory] = useState('general');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await User.me();
            setUser(userData);
        } catch (error) {
            // User not logged in
            setUser(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) {
            toast.error('Please enter your feedback');
            return;
        }

        setSubmitting(true);
        try {
            // In a real implementation, this would send to a feedback API
            // For now, we'll simulate the submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Thank you for your feedback! We really appreciate it.');
            
            // Reset form
            setFeedback('');
            setRating(0);
            setCategory('general');
            
        } catch (error) {
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                >
                    <Star className="w-full h-full fill-current" />
                </button>
            ))}
        </div>
    );

    return (
        <Card className={showInModal ? '' : 'max-w-2xl mx-auto'}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Share Your Feedback
                </CardTitle>
                <p className="text-gray-600">Help us improve Party2Go with your insights and suggestions</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overall Rating */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            How would you rate your overall experience?
                        </label>
                        {renderStars()}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Feedback Category</label>
                        <div className="flex flex-wrap gap-2">
                            {FEEDBACK_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                                        category === cat.id 
                                            ? cat.color + ' ring-2 ring-blue-500' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Your Feedback
                        </label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what you think! What features would you like to see? What can we improve?"
                            rows={5}
                            className="resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting || !feedback.trim()}>
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Feedback
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Thank You Message */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900">Your Voice Matters</h4>
                            <p className="text-sm text-blue-800 mt-1">
                                Every piece of feedback helps us build a better platform. 
                                We read every submission and use your insights to prioritize improvements.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}