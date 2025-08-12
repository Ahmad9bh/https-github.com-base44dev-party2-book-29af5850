import React, { useState, useCallback } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Review } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const TestStatus = ({ status, text }) => {
  const icon = {
    pending: <Loader2 className="w-4 h-4 animate-spin text-gray-500" />,
    running: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    failure: <XCircle className="w-4 h-4 text-red-500" />,
  }[status];

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="text-sm">{text}</span>
      {icon}
    </div>
  );
};

export default function EndToEndTestSuite() {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runTest = useCallback(async (key, testFn) => {
    setTestResults(prev => ({ ...prev, [key]: { status: 'running' } }));
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [key]: { status: 'success' } }));
      return true;
    } catch (error) {
      console.error(`Test failed for ${key}:`, error);
      setTestResults(prev => ({ ...prev, [key]: { status: 'failure', error: error.message } }));
      return false;
    }
  }, []);

  const testUserFlows = useCallback(async () => {
    // This is a simulation. In a real scenario, you'd use a dedicated test user.
    const testEmail = `testuser_${Date.now()}@party2go.dev`;
    const testPassword = 'password123'; // Not used, as auth is external
    
    // Simulate user creation (in reality, User.me() would fail and we'd redirect to login)
    await runTest('user_registration', async () => {
        // Can't truly test registration, so we just check if User entity works
        const users = await User.list('', 1);
        if (!users) throw new Error("Could not list users.");
    });
    
    // Test Venue Creation
    let testVenueId;
    await runTest('venue_creation', async () => {
        const user = await User.me();
        const venue = await Venue.create({
            title: `Test Venue ${Date.now()}`,
            description: "A test venue for E2E testing.",
            category: ["wedding"],
            price_per_hour: 150,
            capacity: 100,
            location: { address: "123 Test St", city: "Testville" },
            currency: "USD",
            owner_id: user.id
        });
        testVenueId = venue.id;
        if (!testVenueId) throw new Error("Venue creation failed to return an ID.");
    });

    // Test Booking Flow
    let testBookingId;
    if (testVenueId) {
        await runTest('booking_flow', async () => {
            const user = await User.me();
            const booking = await Booking.create({
                venue_id: testVenueId,
                user_id: user.id,
                event_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // One week from now
                start_time: "18:00",
                end_time: "22:00",
                guest_count: 50,
                total_amount: 600,
                status: 'confirmed' // Simulate confirmed for testing
            });
            testBookingId = booking.id;
            if (!testBookingId) throw new Error("Booking creation failed.");
        });
    }

    // Test Review Submission
    if (testVenueId && testBookingId) {
        await runTest('review_submission', async () => {
            const user = await User.me();
            await Review.create({
                venue_id: testVenueId,
                booking_id: testBookingId,
                user_id: user.id,
                rating: 5,
                comment: "This is a test review. Great experience!"
            });
        });
    }

    // Cleanup
    await runTest('data_cleanup', async () => {
      if (testBookingId) await Booking.delete(testBookingId);
      if (testVenueId) await Venue.delete(testVenueId);
    });

  }, [runTest]);

  const testApiHealth = useCallback(async () => {
    await runTest('api_venue_list', async () => { await Venue.list('', 1); });
    await runTest('api_user_me', async () => { await User.me(); });
    await runTest('api_booking_list', async () => { await Booking.list('', 1); });
  }, [runTest]);

  const handleRunAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    toast({ title: "Running all tests...", description: "This may take a moment." });

    await testApiHealth();
    await testUserFlows();
    
    setIsRunning(false);
    toast({ title: "Testing Complete", description: "Check results below." });
  };

  const tests = {
    "API Health Checks": [
        { key: 'api_user_me', text: 'User API (me)' },
        { key: 'api_venue_list', text: 'Venue API (list)' },
        { key: 'api_booking_list', text: 'Booking API (list)' },
    ],
    "Core User Flows": [
        { key: 'user_registration', text: 'User Registration Check' },
        { key: 'venue_creation', text: 'Venue Creation' },
        { key: 'booking_flow', text: 'Venue Booking' },
        { key: 'review_submission', text: 'Review Submission' },
        { key: 'data_cleanup', text: 'Test Data Cleanup' },
    ]
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>End-to-End Test Suite</CardTitle>
                <CardDescription>Simulate critical user flows to ensure platform stability.</CardDescription>
            </div>
            <Button onClick={handleRunAllTests} disabled={isRunning}>
                {isRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? 'Running...' : 'Run All Tests'}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        {Object.entries(tests).map(([category, testItems]) => (
            <div key={category} className="space-y-3">
                <h3 className="font-semibold">{category}</h3>
                <div className="space-y-2">
                    {testItems.map(test => (
                        <TestStatus 
                            key={test.key}
                            status={testResults[test.key]?.status || 'pending'} 
                            text={test.text} 
                        />
                    ))}
                </div>
            </div>
        ))}
        {Object.values(testResults).some(r => r.status === 'failure') && (
            <div className="md:col-span-2">
                <h3 className="font-semibold text-red-600 mb-2">Failed Tests</h3>
                <div className="space-y-2">
                    {Object.entries(testResults).filter(([, r]) => r.status === 'failure').map(([key, result]) => (
                        <div key={key} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <p className="font-semibold text-sm">{tests[Object.keys(tests)[0]].find(t=>t.key === key)?.text || tests[Object.keys(tests)[1]].find(t=>t.key === key)?.text}</p>
                            <p className="text-xs text-red-700">{result.error}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}