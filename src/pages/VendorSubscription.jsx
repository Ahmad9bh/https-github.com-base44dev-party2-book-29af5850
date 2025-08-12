import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Vendor } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';

export default function VendorSubscription() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId');
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    const fetchVendor = async () => {
      try {
        const vendorData = await Vendor.get(vendorId);
        setVendor(vendorData);
      } catch (error) {
        console.error("Failed to fetch vendor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">Vendor not found</h2>
        <p className="text-gray-600 mt-2">Could not find vendor information to start a subscription.</p>
        <Button asChild className="mt-4"><Link to={createPageUrl('Home')}>Go Home</Link></Button>
      </div>
    );
  }
  
  const features = [
    "Appear in Marketplace Search",
    "Direct Messaging with Customers",
    "Featured Placement Options",
    "Advanced Analytics",
    "Priority Support"
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-purple-100 rounded-full p-3 w-fit">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Join the Marketplace</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Unlock new customers and grow your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold">$10</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="w-full">
            <Link to={createPageUrl(`SimulatedPayment?vendorId=${vendorId}`)}>
              Proceed to Payment
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}