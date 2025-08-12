import React, { useState, useEffect, useRef } from 'react';
import { Vendor } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PartyPopper } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubscriptionSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: showError } = useToast();
  const hasProcessed = useRef(false); // Prevent duplicate processing

  const urlParams = new URLSearchParams(window.location.search);
  const vendorId = urlParams.get('vendorId');
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    // Prevent duplicate processing
    if (hasProcessed.current) return;
    
    if (!vendorId || !sessionId) {
      setError("Missing subscription information.");
      setLoading(false);
      return;
    }

    const processSubscription = async () => {
      // Mark as processed to prevent duplicates
      hasProcessed.current = true;
      
      try {
        // 1. In a real app, you would verify the Stripe session ID with your backend.
        console.log('Verifying session:', sessionId);

        // 2. Get user info
        const user = await User.me();

        // 3. Create the Subscription record
        await Subscription.create({
            user_id: user.id,
            plan_type: "vendor_monthly",
            billing_cycle: "monthly",
            amount: 10,
            currency: "USD",
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            stripe_subscription_id: `sub_sim_${Date.now()}`
        });

        // 4. Update the Vendor record
        await Vendor.update(vendorId, {
          subscription_status: 'active',
          stripe_customer_id: `cus_sim_${Date.now()}`
        });

        success("Subscription activated successfully!");
      } catch (err) {
        console.error("Failed to process subscription:", err);
        setError("There was a problem activating your subscription. Please contact support.");
        showError("Failed to activate subscription.");
      } finally {
        setLoading(false);
      }
    };

    processSubscription();
  }, []); // Empty dependency array to run only once

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button asChild className="mt-6"><Link to={createPageUrl('Home')}>Go to Homepage</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <PartyPopper className="w-12 h-12 text-green-500" />
          <CardTitle className="text-2xl">Welcome to the Marketplace!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
                Your subscription is active! Your vendor profile is now being reviewed by our team.
                You will be notified once it's approved and live.
            </p>
            <Button asChild>
                <Link to={createPageUrl('MyVendorProfile')}>Go to My Vendor Profile</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}