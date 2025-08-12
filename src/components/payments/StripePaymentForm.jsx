
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { CreditCard, Lock, AlertTriangle } from 'lucide-react';

export default function StripePaymentForm({ 
  amount, 
  currency, 
  bookingDetails, 
  onPaymentSubmit, 
  processing, 
  error 
}) {
  const { currentLanguage } = useLocalization();
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Limit to 16 digits
    const limited = v.substring(0, 16);
    
    // Add spaces every 4 digits
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    
    return parts.join(' ');
  };

  const formatExpiry = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Limit to 4 digits
    const limited = v.substring(0, 4);
    
    // Add slash after 2 digits
    if (limited.length >= 2) {
      return limited.substring(0, 2) + '/' + limited.substring(2, 4);
    }
    return limited;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate cardholder name
    if (!cardDetails.name.trim()) {
      errors.name = 'Cardholder name is required';
    } else if (cardDetails.name.trim().length < 2) {
      errors.name = 'Please enter your full name';
    }
    
    // Validate card number
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (!cardNumber) {
      errors.number = 'Card number is required';
    } else if (cardNumber.length < 16) {
      errors.number = 'Please enter a valid 16-digit card number';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      errors.number = 'Card number must contain only digits';
    }
    
    // Validate expiry
    if (!cardDetails.expiry) {
      errors.expiry = 'Expiry date is required';
    } else if (cardDetails.expiry.length < 5) {
      errors.expiry = 'Please enter expiry date as MM/YY';
    } else {
      // Validate expiry format and date
      const [monthStr, yearStr] = cardDetails.expiry.split('/');
      const monthNum = parseInt(monthStr);
      const yearNum = parseInt(yearStr);
      
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

      if (isNaN(monthNum) || isNaN(yearNum) || monthStr.length !== 2 || yearStr.length !== 2) {
        errors.expiry = 'Invalid expiry date format. Use MM/YY.';
      } else if (monthNum < 1 || monthNum > 12) {
        errors.expiry = 'Please enter a valid month (01-12)';
      } else if (yearNum < currentYear) {
        errors.expiry = 'Card has expired';
      } else if (yearNum === currentYear && monthNum < currentMonth) {
        errors.expiry = 'Card has expired';
      }
    }
    
    // Validate CVC
    if (!cardDetails.cvc) {
      errors.cvc = 'CVC is required';
    } else if (cardDetails.cvc.length < 3) {
      errors.cvc = 'CVC must be at least 3 digits';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
      errors.cvc = 'CVC must contain only digits';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onPaymentSubmit(cardDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Venue Rental</span>
              <span>{formatCurrency(bookingDetails?.venueTotal || amount, currency, currentLanguage)}</span>
            </div>
            {bookingDetails?.platformFee > 0 && (
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>{formatCurrency(bookingDetails.platformFee, currency, currentLanguage)}</span>
              </div>
            )}
            {bookingDetails?.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(bookingDetails.discount, currency, currentLanguage)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(amount, currency, currentLanguage)}</span>
            </div>
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              type="text"
              value={cardDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              disabled={processing}
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              value={cardDetails.number}
              onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              disabled={processing}
              className={validationErrors.number ? 'border-red-500' : ''}
            />
            {validationErrors.number && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => handleInputChange('expiry', formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                disabled={processing}
                className={validationErrors.expiry ? 'border-red-500' : ''}
              />
              {validationErrors.expiry && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.expiry}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="text"
                value={cardDetails.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
                placeholder="123"
                maxLength={4}
                disabled={processing}
                className={validationErrors.cvc ? 'border-red-500' : ''}
              />
              {validationErrors.cvc && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cvc}</p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Test Card Notice */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Test Mode:</strong> Use card number <strong>4242 4242 4242 4242</strong> with any future expiry date and any 3-digit CVC for testing.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Processing Payment...
              </>
            ) : (
              `Pay ${formatCurrency(amount, currency, currentLanguage)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
