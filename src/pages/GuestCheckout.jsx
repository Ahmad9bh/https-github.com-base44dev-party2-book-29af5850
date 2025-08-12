import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CreditCard, User as UserIcon, Mail, Phone } from 'lucide-react';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Conference', 'Party', 'Graduation', 'Anniversary', 'Baby Shower', 'Engagement', 'Reunion'];

export default function GuestCheckout() {
  const { currentLanguage, currentCurrency } = useLocalization();
  const { toast } = useToast();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const venueId = urlParams.get('venue_id');
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventDate, setEventDate] = useState();
  const [formData, setFormData] = useState({
    guest_count: '',
    start_time: '18:00',
    end_time: '22:00',
    event_type: '',
    special_requests: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    create_account: false,
    password: '',
    newsletter_signup: false
  });

  useEffect(() => {
    if (!venueId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No venue selected for booking."
      });
      navigate('/Browse');
      return;
    }
    loadVenue();
  }, [venueId]);

  const loadVenue = async () => {
    try {
      const venueData = await Venue.filter({ id: venueId, status: 'active' });
      if (venueData.length === 0) {
        throw new Error('Venue not found or not available');
      }
      setVenue(venueData[0]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load venue details."
      });
      navigate('/Browse');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!venue || !formData.start_time || !formData.end_time) return 0;
    
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    if (hours <= 0) return 0;
    return venue.price_per_hour * hours;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!eventDate || !formData.contact_name || !formData.contact_email || !formData.guest_count) {
        throw new Error('Please fill in all required fields');
      }

      let userId = null;

      // Check if user wants to create an account
      if (formData.create_account) {
        if (!formData.password) {
          throw new Error('Password is required to create an account');
        }

        // Create user account (this would typically require backend user creation)
        // For now, we'll create a guest booking
        toast({
          title: "Account Creation",
          description: "Account creation during checkout will be available soon. Proceeding as guest."
        });
      }

      // Create booking
      const bookingData = {
        venue_id: venueId,
        user_id: userId, // null for guest bookings
        event_date: format(eventDate, 'yyyy-MM-dd'),
        start_time: formData.start_time,
        end_time: formData.end_time,
        guest_count: parseInt(formData.guest_count),
        event_type: formData.event_type,
        special_requests: formData.special_requests,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        total_amount: calculateTotal(),
        currency: venue.currency,
        status: 'pending'
      };

      const booking = await Booking.create(bookingData);

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted. You'll receive a confirmation email shortly."
      });

      // Redirect to payment or confirmation page
      navigate(`/Payment?booking_id=${booking.id}`);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Failed to submit booking. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!venue) {
    return <div className="text-center py-8">Venue not found</div>;
  }

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
        <p className="text-gray-600">Book {venue.title} as a guest - no account required</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="guest_count">Guest Count *</Label>
                    <Input
                      id="guest_count"
                      name="guest_count"
                      type="number"
                      min="1"
                      max={venue.capacity}
                      value={formData.guest_count}
                      onChange={handleInputChange}
                      placeholder={`Up to ${venue.capacity} guests`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({...prev, event_type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <Textarea
                    id="special_requests"
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or requests..."
                    className="h-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_name">Full Name *</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email Address *</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                {/* Account Creation Option */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <input
                      id="create_account"
                      name="create_account"
                      type="checkbox"
                      checked={formData.create_account}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <Label htmlFor="create_account">Create an account for faster future bookings</Label>
                  </div>

                  {formData.create_account && (
                    <div className="mt-4">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        minLength="6"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      id="newsletter_signup"
                      name="newsletter_signup"
                      type="checkbox"
                      checked={formData.newsletter_signup}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <Label htmlFor="newsletter_signup">Subscribe to our newsletter for venue updates</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              disabled={submitting || !eventDate} 
              className="w-full h-12 text-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
                  alt={venue.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg">{venue.title}</h3>
                <p className="text-gray-600 text-sm">{venue.location?.city}</p>
              </div>

              {eventDate && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{format(eventDate, 'PPP')}</span>
                  </div>
                  {formData.start_time && formData.end_time && (
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{formData.start_time} - {formData.end_time}</span>
                    </div>
                  )}
                  {formData.guest_count && (
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span>{formData.guest_count}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount, venue.currency, currentCurrency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes all fees. Final amount may vary based on additional services.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}