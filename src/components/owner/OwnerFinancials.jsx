import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Payout } from '@/api/entities';
import OwnerAnalyticsDashboard from '@/components/analytics/OwnerAnalyticsDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OwnerFinancials() {
    const { currentCurrency, currentLanguage } = useLocalization();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ bookings: [], venues: [], payouts: [] });

    useEffect(() => {
        const loadFinancialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const currentUser = await User.me();
                if (!currentUser) {
                    throw new Error("User not logged in.");
                }

                const ownedVenues = await Venue.filter({ owner_id: currentUser.id });
                const venueIds = ownedVenues.map(v => v.id);

                if (venueIds.length > 0) {
                    const [bookingsData, payoutsData] = await Promise.all([
                        Booking.filter({ venue_id: { '$in': venueIds } }),
                        Payout.filter({ venue_owner_id: currentUser.id })
                    ]);

                    setData({
                        venues: ownedVenues,
                        bookings: bookingsData || [],
                        payouts: payoutsData || []
                    });
                } else {
                     setData({ venues: [], bookings: [], payouts: [] });
                }

            } catch (err) {
                console.error("Failed to load financial data:", err);
                setError("Could not load your financial dashboard. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadFinancialData();
    }, []);

    const handleExport = () => {
        // Placeholder for CSV export functionality
        alert('CSV export functionality coming soon!');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                </CardContent>
            </Card>
        );
    }
    
    if (data.venues.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Available</h3>
                     <p className="text-gray-600">You need to have at least one active venue with bookings to see financial data.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Analytics based on your confirmed bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OwnerAnalyticsDashboard bookings={data.bookings} venues={data.venues} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Payout History</CardTitle>
                        <CardDescription>Summary of all payouts you have received.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent>
                    {data.payouts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Transaction ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.payouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>{formatDate(payout.processed_at, currentLanguage)}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(payout.amount, payout.currency || currentCurrency, currentLanguage)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${payout.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {payout.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-gray-500 truncate" title={payout.transaction_id}>
                                            {payout.transaction_id ? `${payout.transaction_id.substring(0, 15)}...` : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No payout history found.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tax &amp; Reporting Tools</CardTitle>
                    <CardDescription>Generate reports for your accounting needs.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-gray-500 py-12">
                     <p>Tax reporting and document generation tools are coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}