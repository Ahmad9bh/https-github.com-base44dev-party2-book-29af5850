import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, MapPin, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { formatCurrency, convertCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MOBILE_STEPS = {
  VENUE_INFO: 1,
  EVENT_DETAILS: 2,
  CONTACT_INFO: 3,
  CONFIRMATION: 4
};

const EVENT_TYPES = [
  'wedding', 'birthday_party', 'corporate_event', 'baby_shower', 
  'graduation', 'anniversary', 'engagement', 'conference', 'other'
];

export default function MobileBookingFlow({ venue, onBack, onComplete }) {
  const { currentLanguage, currentCurrency } = useLocalization();
  const { success, error } = useToast();
  
  const [currentStep, setCurrentStep] = useState(MOBILE_STEPS.VENUE_INFO);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_date: null,
    start_time: '',
    end_time: '',
    guest_count: '',
    event_type: '',
    special_requests: '',
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });
  const [errors, setErrors] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    calculateCost();
  }, [formData.start_time, formData.end_time, venue]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        contact_name: userData.full_name || '',
        contact_email: userData.email || ''
      }));
    } catch (err) {
      console.error('User not logged in:', err);
    }
  };

  const calculateCost = () => {
    if (!formData.start_time || !formData.end_time || !venue) return;
    
    const start = parseTime(formData.start_time);
    const end = parseTime(formData.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    
    if (hours > 0) {
      const convertedPrice = convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency);
      setTotalCost(convertedPrice * hours);
    }
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case MOBILE_STEPS.EVENT_DETAILS:
        if (!formData.event_date) newErrors.event_date = 'Event date is required';
        if (!formData.start_time) newErrors.start_time = 'Start time is required';
        if (!formData.end_time) newErrors.end_time = 'End time is required';
        if (!formData.guest_count || formData.guest_count <= 0) newErrors.guest_count = 'Guest count is required';
        if (!formData.event_type) newErrors.event_type = 'Event type is required';
        
        if (formData.start_time && formData.end_time) {
          const start = parseTime(formData.start_time);
          const end = parseTime(formData.end_time);
          if (end <= start) {
            newErrors.end_time = 'End time must be after start time';
          }
        }
        
        if (formData.guest_count > venue.capacity) {
          newErrors.guest_count = `Maximum capacity is ${venue.capacity} guests`;
        }
        break;
        
      case MOBILE_STEPS.CONTACT_INFO:
        if (!formData.contact_name.trim()) newErrors.contact_name = 'Name is required';
        if (!formData.contact_email.trim()) newErrors.contact_email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.contact_email)) newErrors.contact_email = 'Valid email is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < MOBILE_STEPS.CONFIRMATION) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > MOBILE_STEPS.VENUE_INFO) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(MOBILE_STEPS.CONTACT_INFO)) return;
    
    setLoading(true);
    try {
      const bookingData = {
        venue_id: venue.id,
        user_id: user?.id,
        event_date: format(formData.event_date, 'yyyy-MM-dd'),
        start_time: formData.start_time,
        end_time: formData.end_time,
        guest_count: parseInt(formData.guest_count),
        event_type: formData.event_type,
        special_requests: formData.special_requests,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        total_amount: totalCost,
        currency: currentCurrency,
        status: venue.instant_book_enabled ? 'confirmed' : 'pending'
      };

      const booking = await Booking.create(bookingData);
      success('Booking request submitted successfully!');
      onComplete(booking);
    } catch (err) {
      console.error('Booking failed:', err);
      error('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const StepProgress = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: 4 }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-8 h-1 mx-2 ${step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case MOBILE_STEPS.VENUE_INFO:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Venue Details</h2>
              <p className="text-gray-600">Review venue information before booking</p>
            </div>
            
            {venue.images?.[0] && (
              <img 
                src={venue.images[0]} 
                alt={venue.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{venue.title}</h3>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {venue.location?.city}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Up to {venue.capacity} guests
              </div>
              <div className="text-lg font-semibold text-indigo-600">
                {formatCurrency(convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency), currentCurrency)} per hour
              </div>
            </div>
            
            {venue.description && (
              <p className="text-gray-600 text-sm">{venue.description}</p>
            )}
          </div>
        );

      case MOBILE_STEPS.EVENT_DETAILS:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Event Details</h2>
              <p className="text-gray-600">Tell us about your event</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.event_date ? format(formData.event_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.event_date}
                      onSelect={(date) => updateFormData('event_date', date)}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    />
                  </PopoverContent>
                </Popover>
                {errors.event_date && <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => updateFormData('start_time', e.target.value)}
                    className={errors.start_time ? 'border-red-500' : ''}
                  />
                  {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateFormData('end_time', e.target.value)}
                    className={errors.end_time ? 'border-red-500' : ''}
                  />
                  {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                <Input
                  type="number"
                  min="1"
                  max={venue.capacity}
                  value={formData.guest_count}
                  onChange={(e) => updateFormData('guest_count', e.target.value)}
                  placeholder={`Max ${venue.capacity} guests`}
                  className={errors.guest_count ? 'border-red-500' : ''}
                />
                {errors.guest_count && <p className="text-red-500 text-sm mt-1">{errors.guest_count}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <Select value={formData.event_type} onValueChange={(value) => updateFormData('event_type', value)}>
                  <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {getLocalizedText(type, currentLanguage) || type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event_type && <p className="text-red-500 text-sm mt-1">{errors.event_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                <Textarea
                  value={formData.special_requests}
                  onChange={(e) => updateFormData('special_requests', e.target.value)}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case MOBILE_STEPS.CONTACT_INFO:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">How can we reach you?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => updateFormData('contact_name', e.target.value)}
                  placeholder="Your full name"
                  className={errors.contact_name ? 'border-red-500' : ''}
                />
                {errors.contact_name && <p className="text-red-500 text-sm mt-1">{errors.contact_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => updateFormData('contact_email', e.target.value)}
                  placeholder="your@email.com"
                  className={errors.contact_email ? 'border-red-500' : ''}
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => updateFormData('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case MOBILE_STEPS.CONFIRMATION:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
              <p className="text-gray-600">Review your booking details</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{venue.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.event_date && format(formData.event_date, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.start_time} - {formData.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{formData.guest_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Type:</span>
                  <span className="font-medium">{getLocalizedText(formData.event_type, currentLanguage) || formData.event_type}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost:</span>
                    <span className="text-indigo-600">{formatCurrency(totalCost, currentCurrency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {venue.instant_book_enabled 
                  ? "Your booking will be confirmed immediately after submission."
                  : "Your booking request will be sent to the venue owner for approval."
                }
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={currentStep === 1 ? onBack : prevStep} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Book Venue</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress */}
        <StepProgress />

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > MOBILE_STEPS.VENUE_INFO && (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              Back
            </Button>
          )}
          
          {currentStep < MOBILE_STEPS.CONFIRMATION ? (
            <Button onClick={nextStep} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <LoadingSpinner size="h-4 w-4" /> : 'Submit Booking'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}