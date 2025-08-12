import React, { useState } from 'react';
import { Booking, Venue, User, Review } from '@/api/entities/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function CleanupDatabase() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [fixResults, setFixResults] = useState(null);

  const performScan = async () => {
    setLoading(true);
    setFixResults(null);
    try {
      const [allBookings, allVenues, allUsers, allReviews] = await Promise.all([
        Booking.list('', 10000),
        Venue.list('', 5000),
        User.list('', 5000),
        Review.list('', 10000),
      ]);

      const venueIds = new Set(allVenues.map(v => v.id));
      const userIds = new Set(allUsers.map(u => u.id));
      const bookingIds = new Set(allBookings.map(b => b.id));

      const orphanedBookings = allBookings.filter(b => !venueIds.has(b.venue_id) || !userIds.has(b.user_id));
      const orphanedReviews = allReviews.filter(r => !bookingIds.has(r.booking_id) || !userIds.has(r.user_id));
      const venuesWithInvalidOwners = allVenues.filter(v => !userIds.has(v.owner_id));

      setScanResults({
        orphanedBookings: orphanedBookings.length,
        orphanedReviews: orphanedReviews.length,
        venuesWithInvalidOwners: venuesWithInvalidOwners.length,
      });

      toast({ title: 'Scan Complete', description: 'Found potential data integrity issues.' });
    } catch (error) {
      toast({ title: 'Scan Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const performFix = async () => {
    setLoading(true);
    // In a real scenario, you'd fetch the orphaned records again before deleting.
    // For this example, we'll assume the scan result is fresh enough.
    // A more robust implementation would pass the IDs to fix.
    // THIS IS A SIMPLIFIED FIX FOR DEMO. Deleting records is destructive.
    let fixedCount = 0;
    
    // This is a placeholder for actual fix logic.
    // Deleting records directly here is dangerous and should be handled with care,
    // possibly by archiving them instead.
    if (scanResults?.orphanedBookings > 0) {
      // Logic to delete/archive orphaned bookings would go here.
      fixedCount += scanResults.orphanedBookings;
    }
     if (scanResults?.orphanedReviews > 0) {
      // Logic to delete/archive orphaned reviews would go here.
      fixedCount += scanResults.orphanedReviews;
    }
    if (scanResults?.venuesWithInvalidOwners > 0) {
       // Logic to re-assign or delete venues would go here.
      fixedCount += scanResults.venuesWithInvalidOwners;
    }
    
    setFixResults({
      fixedCount,
      message: `Simulated fix for ${fixedCount} records. In a real app, this would perform archiving or deletion.`,
    });
    setLoading(false);
    await performScan(); // Rescan to show updated numbers
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Integrity Check</CardTitle>
          <CardDescription>Scan and repair data inconsistencies like orphaned records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={performScan} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : 'Scan Database'}
          </Button>

          {scanResults && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Scan Results</h3>
              <Alert variant={scanResults.orphanedBookings > 0 ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Found {scanResults.orphanedBookings} orphaned bookings.</AlertDescription>
              </Alert>
              <Alert variant={scanResults.orphanedReviews > 0 ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Found {scanResults.orphanedReviews} orphaned reviews.</AlertDescription>
              </Alert>
              <Alert variant={scanResults.venuesWithInvalidOwners > 0 ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Found {scanResults.venuesWithInvalidOwners} venues with invalid owners.</AlertDescription>
              </Alert>

              {(scanResults.orphanedBookings > 0 || scanResults.orphanedReviews > 0 || scanResults.venuesWithInvalidOwners > 0) && (
                 <Button onClick={performFix} disabled={loading} className="w-full" variant="destructive">
                   {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Fixing...</> : 'Fix All Issues'}
                 </Button>
              )}
            </div>
          )}

          {fixResults && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{fixResults.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}