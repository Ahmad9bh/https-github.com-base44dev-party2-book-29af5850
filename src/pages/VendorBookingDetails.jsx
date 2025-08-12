import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VendorBooking } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { DollarSign, Calendar, Users, MessageSquare, Check, Star, PartyPopper, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';

export default function VendorBookingDetails() {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('id');
    const [booking, setBooking] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (bookingId) {
            loadBookingData();
        }
    }, [bookingId]);

    const loadBookingData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            const bookingData = await VendorBooking.get(bookingId);
            setBooking(bookingData);
            setQuotePrice(bookingData.quoted_price || '');

            const vendorData = await Vendor.get(bookingData.vendor_id);
            setVendor(vendorData);

            if (currentUser.id === vendorData.user_id) {
                setIsOwner(true);
            }
        } catch (error) {
            console.error('Failed to load booking details:', error);
            toast({ title: 'Error', description: 'Could not load booking details.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updateData) => {
        setUpdating(true);
        try {
            const updatedBooking = await VendorBooking.update(booking.id, updateData);
            setBooking(updatedBooking);
            toast({ title: 'Success', description: 'Booking status updated.' });
        } catch (error) {
            console.error('Failed to update booking:', error);
            toast({ title: 'Error', description: 'Could not update booking.', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    const handleSendQuote = () => {
        if (!quotePrice || isNaN(quotePrice) || quotePrice <= 0) {
            toast({ title: 'Invalid Price', description: 'Please enter a valid price for the quote.', variant: 'destructive' });
            return;
        }
        handleUpdate({ quoted_price: parseFloat(quotePrice), status: 'quoted' });
    };

    const handleAcceptQuote = () => handleUpdate({ status: 'confirmed' });
    const handleMarkAsCompleted = () => handleUpdate({ status: 'completed' });
    const handleCancelBooking = () => handleUpdate({ status: 'cancelled' });

    if (loading) return <LoadingSpinner />;
    if (!booking || !vendor) return <div className="text-center py-10">Booking not found.</div>;

    const statusInfo = {
        inquiry: { text: "Customer sent an inquiry. Respond with a quote.", color: "bg-blue-100 text-blue-800" },
        quoted: { text: "You sent a quote. Waiting for customer to accept.", color: "bg-yellow-100 text-yellow-800" },
        confirmed: { text: "Booking Confirmed! Service is scheduled.", color: "bg-green-100 text-green-800" },
        completed: { text: "Service completed. We hope it was a great event!", color: "bg-purple-100 text-purple-800" },
        cancelled: { text: "This booking has been cancelled.", color: "bg-gray-100 text-gray-800" }
    };

    const currentStatus = statusInfo[booking.status];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Booking Details for {vendor.company_name}</CardTitle>
                            <CardDescription>Booking ID: {booking.id}</CardDescription>
                        </div>
                        <Badge className={`${currentStatus?.color} py-2 px-4`}>{booking.status.toUpperCase()}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-6">
                        <PartyPopper className="h-4 w-4" />
                        <AlertDescription>{currentStatus?.text}</AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-semibold mb-2">Event Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><Calendar className="w-4 h-4 inline mr-2" /><strong>Date:</strong> {format(new Date(booking.event_date), 'PPP')}</p>
                                <p><Users className="w-4 h-4 inline mr-2" /><strong>Guests:</strong> {booking.guest_count}</p>
                                <p><strong className="ml-6">Service:</strong> {booking.service_type}</p>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Contact Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {booking.customer_name}</p>
                                <p><strong>Email:</strong> {booking.customer_email}</p>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="my-6" />

                    {isOwner ? (
                        /* VENDOR VIEW */
                        <div className="space-y-4">
                            <h3 className="font-semibold">Manage Quote</h3>
                            <div>
                                <Label htmlFor="quote">Quote Price ({booking.currency})</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="quote"
                                        type="number"
                                        value={quotePrice}
                                        onChange={(e) => setQuotePrice(e.target.value)}
                                        disabled={booking.status !== 'inquiry'}
                                    />
                                    <Button onClick={handleSendQuote} disabled={booking.status !== 'inquiry' || updating}>
                                        {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {booking.status === 'inquiry' ? 'Send Quote' : 'Quote Sent'}
                                    </Button>
                                </div>
                            </div>
                            {booking.status === 'confirmed' && (
                                <Button onClick={handleMarkAsCompleted} className="w-full bg-purple-600 hover:bg-purple-700" disabled={updating}>
                                    {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Mark as Completed
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* CUSTOMER VIEW */
                        <div className="space-y-4">
                             <h3 className="font-semibold">Quote Information</h3>
                             {booking.status === 'inquiry' && <p className="text-sm text-gray-600">The vendor is reviewing your request and will send a quote soon.</p>}
                             {booking.status === 'quoted' && (
                                 <div className="text-center space-y-4 p-4 bg-gray-50 rounded-lg">
                                     <p className="text-lg">Price Quoted:</p>
                                     <p className="text-4xl font-bold">{formatCurrency(booking.quoted_price, booking.currency)}</p>
                                     <Button onClick={handleAcceptQuote} size="lg" disabled={updating}>
                                        {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                         <Check className="w-4 h-4 mr-2" /> Accept Quote & Confirm
                                     </Button>
                                 </div>
                             )}
                             {booking.status === 'confirmed' && <p className="text-sm text-green-700 font-medium">Your booking is confirmed!</p>}
                             {booking.status === 'completed' && (!booking.review_id) && (
                                <Button asChild className="w-full">
                                    <Link to={createPageUrl(`WriteVendorReview?bookingId=${booking.id}`)}>
                                        <Star className="w-4 h-4 mr-2" /> Write a Review
                                    </Link>
                                </Button>
                             )}
                        </div>
                    )}
                    
                    <Separator className="my-6" />

                    <div className="flex justify-end">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button variant="destructive" onClick={handleCancelBooking} disabled={updating}>
                                Cancel Booking
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}