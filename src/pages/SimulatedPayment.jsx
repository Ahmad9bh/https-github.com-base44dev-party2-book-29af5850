import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { createPageUrl } from '@/utils';

export default function SimulatedPayment() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your subscription is being activated.",
        variant: "success",
      });
      
      // Redirect to success page with a simulated session ID
      const simulatedSessionId = `cs_test_simulated_${Date.now()}`;
      navigate(createPageUrl(`SubscriptionSuccess?vendorId=${vendorId}&session_id=${simulatedSessionId}`));
      
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Payment</CardTitle>
          <CardDescription>Enter your card details to complete the subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-10" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <Input id="expiry" placeholder="MM / YY" className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <Input id="cvc" placeholder="123" className="pl-10" required />
                </div>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Confirm Payment ($10.00)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}