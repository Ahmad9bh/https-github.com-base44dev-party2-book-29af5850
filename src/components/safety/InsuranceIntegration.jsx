import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, DollarSign, Calendar, Users, Building, AlertTriangle, CheckCircle, Info, Phone, FileText } from 'lucide-react';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';

const INSURANCE_PLANS = [
  {
    id: 'basic_liability',
    name: 'Basic Liability',
    price: 25,
    coverage: 500000,
    features: [
      'General liability coverage',
      'Property damage protection',
      'Basic medical expenses',
      '24/7 claim support'
    ],
    recommended: false
  },
  {
    id: 'standard_protection',
    name: 'Standard Protection',
    price: 45,
    coverage: 1000000,
    features: [
      'Enhanced liability coverage',
      'Equipment damage protection',
      'Vendor liability coverage',
      'Weather-related cancellation',
      'Priority claim processing'
    ],
    recommended: true
  },
  {
    id: 'premium_coverage',
    name: 'Premium Coverage',
    price: 75,
    coverage: 2000000,
    features: [
      'Comprehensive liability coverage',
      'Liquor liability protection',
      'Professional liability',
      'Non-appearance insurance',
      'Terrorism coverage',
      'Dedicated claim manager'
    ],
    recommended: false
  },
  {
    id: 'enterprise_protection',
    name: 'Enterprise Protection',
    price: 150,
    coverage: 5000000,
    features: [
      'Maximum liability coverage',
      'Multi-event coverage',
      'International coverage',
      'Cyber liability protection',
      'Director & officer coverage',
      'Legal expense coverage'
    ],
    recommended: false
  }
];

const COVERAGE_CATEGORIES = [
  {
    id: 'general_liability',
    name: 'General Liability',
    description: 'Protects against third-party injury and property damage claims',
    icon: Shield
  },
  {
    id: 'property_damage',
    name: 'Property Damage',
    description: 'Covers damage to venue property during events',
    icon: Building
  },
  {
    id: 'event_cancellation',
    name: 'Event Cancellation',
    description: 'Reimburses costs when events are cancelled due to covered reasons',
    icon: Calendar
  },
  {
    id: 'vendor_liability',
    name: 'Vendor Liability',
    description: 'Covers liability from vendors and contractors at your event',
    icon: Users
  }
];

export default function InsuranceIntegration({ bookingId, venueId, isVenueOwner = false }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [insuranceQuote, setInsuranceQuote] = useState(null);
  const { success, error } = useToast();

  const [insuranceForm, setInsuranceForm] = useState({
    event_type: '',
    guest_count: 0,
    event_duration: 4,
    alcohol_served: false,
    outdoor_activities: false,
    live_entertainment: false,
    catering_provided: false,
    special_equipment: false,
    high_risk_activities: false,
    additional_coverage: []
  });

  const [existingPolicies, setExistingPolicies] = useState([]);

  useEffect(() => {
    loadInsuranceData();
  }, [bookingId, venueId]);

  const loadInsuranceData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      if (bookingId) {
        const bookingData = await Booking.get(bookingId);
        setBooking(bookingData);
        
        if (bookingData.venue_id) {
          const venueData = await Venue.get(bookingData.venue_id);
          setVenue(venueData);
        }

        // Pre-fill form with booking data
        setInsuranceForm(prev => ({
          ...prev,
          event_type: bookingData.event_type || '',
          guest_count: bookingData.guest_count || 0,
          event_duration: bookingData.end_time && bookingData.start_time ? 
            calculateDuration(bookingData.start_time, bookingData.end_time) : 4
        }));
      } else if (venueId) {
        const venueData = await Venue.get(venueId);
        setVenue(venueData);
      }

      // Load existing insurance policies (mock data)
      setExistingPolicies([
        {
          id: 'pol_123',
          policy_number: 'INS-2024-001',
          plan: 'standard_protection',
          status: 'active',
          coverage_amount: 1000000,
          premium: 45,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          event_id: bookingId
        }
      ]);

    } catch (err) {
      console.error('Failed to load insurance data:', err);
      error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    // Simple duration calculation - would be more sophisticated in real app
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return Math.max(1, end - start);
  };

  const calculateInsuranceQuote = () => {
    if (!selectedPlan) {
      error('Please select an insurance plan');
      return;
    }

    const basePlan = INSURANCE_PLANS.find(p => p.id === selectedPlan);
    let adjustedPrice = basePlan.price;
    let riskFactors = [];

    // Risk-based pricing adjustments
    if (insuranceForm.guest_count > 100) {
      adjustedPrice *= 1.2;
      riskFactors.push('Large event (100+ guests)');
    }

    if (insuranceForm.guest_count > 500) {
      adjustedPrice *= 1.5;
      riskFactors.push('Very large event (500+ guests)');
    }

    if (insuranceForm.alcohol_served) {
      adjustedPrice *= 1.3;
      riskFactors.push('Alcohol service');
    }

    if (insuranceForm.outdoor_activities) {
      adjustedPrice *= 1.2;
      riskFactors.push('Outdoor activities');
    }

    if (insuranceForm.live_entertainment) {
      adjustedPrice *= 1.1;
      riskFactors.push('Live entertainment');
    }

    if (insuranceForm.high_risk_activities) {
      adjustedPrice *= 1.8;
      riskFactors.push('High-risk activities');
    }

    if (insuranceForm.event_duration > 8) {
      adjustedPrice *= 1.2;
      riskFactors.push('Extended duration (8+ hours)');
    }

    const quote = {
      plan: basePlan,
      base_premium: basePlan.price,
      adjusted_premium: Math.round(adjustedPrice),
      risk_factors: riskFactors,
      coverage_amount: basePlan.coverage,
      policy_fee: 15,
      total_cost: Math.round(adjustedPrice) + 15,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    setInsuranceQuote(quote);
    setShowQuoteDialog(true);
  };

  const purchaseInsurance = async () => {
    try {
      if (!insuranceQuote) return;

      // In a real application, this would integrate with an insurance provider API
      const policyData = {
        booking_id: bookingId,
        venue_id: venueId,
        user_id: user.id,
        plan_id: selectedPlan,
        premium: insuranceQuote.total_cost,
        coverage_amount: insuranceQuote.coverage_amount,
        policy_details: insuranceForm,
        status: 'pending_payment'
      };

      // Mock policy creation
      const newPolicy = {
        id: `pol_${Date.now()}`,
        policy_number: `INS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...policyData,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: booking ? booking.event_date : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      setExistingPolicies(prev => [...prev, newPolicy]);
      success('Insurance policy purchased successfully!');
      setShowQuoteDialog(false);
      setInsuranceQuote(null);

      // Update booking with insurance information
      if (bookingId) {
        await Booking.update(bookingId, {
          insurance_policy_id: newPolicy.id,
          insurance_coverage: insuranceQuote.coverage_amount
        });
      }

    } catch (err) {
      console.error('Failed to purchase insurance:', err);
      error('Failed to purchase insurance policy');
    }
  };

  const handleFormChange = (field, value) => {
    setInsuranceForm(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Insurance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Event Insurance Protection
          </CardTitle>
          <p className="text-gray-600">
            Protect your event with comprehensive insurance coverage
          </p>
        </CardHeader>
        <CardContent>
          {existingPolicies.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Your Active Policies</h3>
              {existingPolicies.map(policy => (
                <div key={policy.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Policy #{policy.policy_number}</h4>
                      <p className="text-sm text-gray-600">
                        {INSURANCE_PLANS.find(p => p.id === policy.plan)?.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Coverage</p>
                      <p className="font-medium">{formatCurrency(policy.coverage_amount, 'USD')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Premium</p>
                      <p className="font-medium">{formatCurrency(policy.premium, 'USD')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valid Until</p>
                      <p className="font-medium">{new Date(policy.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                No insurance coverage found. Consider purchasing event insurance for peace of mind.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Coverage Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Types of Coverage Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COVERAGE_CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Insurance Plans</CardTitle>
          <p className="text-gray-600">Choose the right coverage for your event</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSURANCE_PLANS.map(plan => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                } ${plan.recommended ? 'border-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-4">
                  {plan.recommended && (
                    <Badge className="mb-2 bg-blue-100 text-blue-800">Recommended</Badge>
                  )}
                  <h3 className="font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">{formatCurrency(plan.price, 'USD')}</span>
                    <span className="text-gray-600 text-sm">/event</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Coverage up to</p>
                    <p className="font-semibold">{formatCurrency(plan.coverage, 'USD')}</p>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Quote Form */}
      <Card>
        <CardHeader>
          <CardTitle>Get Insurance Quote</CardTitle>
          <p className="text-gray-600">Tell us about your event to get an accurate quote</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Event Type</Label>
                <Select 
                  value={insuranceForm.event_type} 
                  onValueChange={(value) => handleFormChange('event_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="birthday">Birthday Party</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Guest Count</Label>
                <Input
                  type="number"
                  value={insuranceForm.guest_count}
                  onChange={(e) => handleFormChange('guest_count', parseInt(e.target.value))}
                  min="1"
                  max="10000"
                />
              </div>
              <div>
                <Label>Event Duration (hours)</Label>
                <Input
                  type="number"
                  value={insuranceForm.event_duration}
                  onChange={(e) => handleFormChange('event_duration', parseInt(e.target.value))}
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Event Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'alcohol_served', label: 'Alcohol will be served' },
                  { key: 'outdoor_activities', label: 'Outdoor activities planned' },
                  { key: 'live_entertainment', label: 'Live entertainment/performers' },
                  { key: 'catering_provided', label: 'Professional catering' },
                  { key: 'special_equipment', label: 'Special equipment (AV, staging)' },
                  { key: 'high_risk_activities', label: 'High-risk activities (extreme sports, etc.)' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={insuranceForm[item.key]}
                      onCheckedChange={(checked) => handleFormChange(item.key, checked)}
                    />
                    <Label htmlFor={item.key} className="text-sm">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={calculateInsuranceQuote}
                disabled={!selectedPlan || !insuranceForm.event_type}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Insurance Quote</DialogTitle>
          </DialogHeader>
          {insuranceQuote && (
            <div className="space-y-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {insuranceQuote.plan.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Coverage Amount</p>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency(insuranceQuote.coverage_amount, 'USD')}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Premium</p>
                    <p className="font-semibold text-blue-900 text-lg">
                      {formatCurrency(insuranceQuote.total_cost, 'USD')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Premium Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Premium</span>
                    <span>{formatCurrency(insuranceQuote.base_premium, 'USD')}</span>
                  </div>
                  {insuranceQuote.adjusted_premium !== insuranceQuote.base_premium && (
                    <div className="flex justify-between">
                      <span>Risk Adjustments</span>
                      <span>+{formatCurrency(insuranceQuote.adjusted_premium - insuranceQuote.base_premium, 'USD')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Policy Fee</span>
                    <span>{formatCurrency(insuranceQuote.policy_fee, 'USD')}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Cost</span>
                    <span>{formatCurrency(insuranceQuote.total_cost, 'USD')}</span>
                  </div>
                </div>
              </div>

              {insuranceQuote.risk_factors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Risk Factors Considered</h4>
                  <ul className="space-y-1">
                    {insuranceQuote.risk_factors.map((factor, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-yellow-600" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What's Covered</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {insuranceQuote.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  This quote is valid until {new Date(insuranceQuote.valid_until).toLocaleDateString()}.
                  Coverage begins immediately upon payment confirmation.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={purchaseInsurance} className="bg-blue-600 hover:bg-blue-700">
                  Purchase Insurance
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            Emergency Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">24/7 Claims Hotline</h3>
              <p className="text-2xl font-bold text-red-600">1-800-CLAIMS</p>
              <p className="text-sm text-gray-600">Available 24/7 for emergency claims</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Online Claims</h3>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                File a Claim Online
              </Button>
              <p className="text-sm text-gray-600 mt-2">Submit claims with documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}