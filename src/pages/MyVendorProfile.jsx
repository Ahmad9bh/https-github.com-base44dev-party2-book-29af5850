import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Rocket, Badge } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge'; // Renaming to avoid conflict

export default function MyVendorProfile() {
    const [user, setUser] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                
                const vendorData = await Vendor.filter({ user_id: userData.id });
                if (vendorData.length > 0) {
                    setVendor(vendorData[0]);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!vendor) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">You haven't created a vendor profile yet.</h2>
                <Button asChild className="mt-4">
                    <Link to={createPageUrl('AddVendor')}>Create Vendor Profile</Link>
                </Button>
            </div>
        );
    }

    if (vendor.subscription_status !== 'active') {
        return (
            <div className="max-w-lg mx-auto px-4 py-12 text-center">
                <Card>
                    <CardHeader>
                        <Rocket className="w-12 h-12 text-purple-500 mx-auto" />
                        <CardTitle>Activate Your Vendor Profile</CardTitle>
                        <CardDescription>
                            Join the marketplace to get discovered by new customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6">Your profile is ready. Subscribe now to make it visible in our marketplace and start receiving booking inquiries.</p>
                        <Button asChild size="lg">
                            <Link to={createPageUrl(`VendorSubscription?vendorId=${vendor.id}`)}>
                                Subscribe to Activate
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
         <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Vendor Profile</CardTitle>
                    <CardDescription>This is your public profile. Keep it updated!</CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-bold text-lg">{vendor.company_name}</h3>
                    <p>{vendor.description}</p>
                    <UiBadge className="mt-4 bg-green-100 text-green-800">Subscription Active</UiBadge>
                </CardContent>
            </Card>
        </div>
    );
}