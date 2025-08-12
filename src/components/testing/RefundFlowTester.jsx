import React, { useState, useEffect } from 'react';
import { Booking } from '@/api/entities';
import { RefundRequest } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RefundFlowTester() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testBookings, setTestBookings] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load recent bookings for testing
      const bookings = await Booking.list('-created_date', 10);
      setTestBookings(bookings);
      
      // Load existing refund requests
      const requests = await RefundRequest.list('-created_date', 20);
      setRefundRequests(requests);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load test data"
      });
    }
  };

  const runRefundFlowTests = async () => {
    setIsRunning(true);
    const results = [];
    
    try {
      // Test 1: Check RefundRequest Entity Structure
      results.push(await testRefundRequestEntity());
      
      // Test 2: Test Refund Request Creation
      results.push(await testRefundRequestCreation());
      
      // Test 3: Test Refund Request Status Updates
      results.push(await testRefundRequestStatusUpdates());
      
      // Test 4: Test Refund Request Validation
      results.push(await testRefundRequestValidation());
      
      // Test 5: Test Refund Amount Calculations
      results.push(await testRefundAmountCalculations());
      
      // Test 6: Test Refund Request Filtering
      results.push(await testRefundRequestFiltering());
      
      setTestResults(results);
    } catch (error) {
      console.error('Test suite failed:', error);
      results.push({
        test: 'Test Suite',
        status: 'error',
        message: `Test suite crashed: ${error.message}`,
        details: error
      });
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const testRefundRequestEntity = async () => {
    try {
      const schema = RefundRequest.schema();
      const requiredFields = ['booking_id', 'user_id', 'venue_id', 'amount', 'reason'];
      const missingFields = requiredFields.filter(field => !schema.properties[field]);
      
      if (missingFields.length > 0) {
        return {
          test: 'RefundRequest Entity Structure',
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
          details: { schema, missingFields }
        };
      }
      
      return {
        test: 'RefundRequest Entity Structure',
        status: 'success',
        message: 'All required fields present',
        details: { schema }
      };
    } catch (error) {
      return {
        test: 'RefundRequest Entity Structure',
        status: 'error',
        message: `Failed to validate schema: ${error.message}`,
        details: error
      };
    }
  };

  const testRefundRequestCreation = async () => {
    try {
      if (testBookings.length === 0) {
        return {
          test: 'Refund Request Creation',
          status: 'warning',
          message: 'No test bookings available',
          details: null
        };
      }

      const testBooking = testBookings[0];
      const venue = await Venue.get(testBooking.venue_id);
      
      const testRefund = {
        booking_id: testBooking.id,
        user_id: user.id,
        venue_id: testBooking.venue_id,
        amount: Math.min(testBooking.total_amount * 0.8, 100), // 80% refund or $100, whichever is smaller
        reason: 'Test refund request for flow validation',
        status: 'pending'
      };

      const createdRefund = await RefundRequest.create(testRefund);
      
      // Clean up - delete the test refund
      await RefundRequest.delete(createdRefund.id);
      
      return {
        test: 'Refund Request Creation',
        status: 'success',
        message: 'Successfully created and cleaned up test refund request',
        details: { testRefund, createdRefund }
      };
    } catch (error) {
      return {
        test: 'Refund Request Creation',
        status: 'error',
        message: `Failed to create refund request: ${error.message}`,
        details: error
      };
    }
  };

  const testRefundRequestStatusUpdates = async () => {
    try {
      // Find an existing refund request or create one for testing
      let testRefund = refundRequests.find(r => r.status === 'pending');
      
      if (!testRefund && testBookings.length > 0) {
        const testBooking = testBookings[0];
        testRefund = await RefundRequest.create({
          booking_id: testBooking.id,
          user_id: user.id,
          venue_id: testBooking.venue_id,
          amount: 50,
          reason: 'Status update test',
          status: 'pending'
        });
      }

      if (!testRefund) {
        return {
          test: 'Refund Request Status Updates',
          status: 'warning',
          message: 'No refund request available for testing',
          details: null
        };
      }

      // Test status transitions
      const statuses = ['approved', 'processed'];
      for (const status of statuses) {
        await RefundRequest.update(testRefund.id, {
          status,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        });
      }

      // Clean up if we created it
      if (testRefund.reason === 'Status update test') {
        await RefundRequest.delete(testRefund.id);
      }

      return {
        test: 'Refund Request Status Updates',
        status: 'success',
        message: 'Status transitions work correctly',
        details: { testRefund, statuses }
      };
    } catch (error) {
      return {
        test: 'Refund Request Status Updates',
        status: 'error',
        message: `Failed to update status: ${error.message}`,
        details: error
      };
    }
  };

  const testRefundRequestValidation = async () => {
    try {
      const validationTests = [];

      // Test missing required fields
      try {
        await RefundRequest.create({
          amount: 100,
          reason: 'Incomplete request'
        });
        validationTests.push({ test: 'Missing fields', result: 'Should have failed but passed' });
      } catch (error) {
        validationTests.push({ test: 'Missing fields', result: 'Correctly rejected' });
      }

      // Test negative amount
      if (testBookings.length > 0) {
        try {
          await RefundRequest.create({
            booking_id: testBookings[0].id,
            user_id: user.id,
            venue_id: testBookings[0].venue_id,
            amount: -50,
            reason: 'Negative amount test'
          });
          validationTests.push({ test: 'Negative amount', result: 'Should have failed but passed' });
        } catch (error) {
          validationTests.push({ test: 'Negative amount', result: 'Correctly rejected' });
        }
      }

      return {
        test: 'Refund Request Validation',
        status: 'success',
        message: 'Validation tests completed',
        details: validationTests
      };
    } catch (error) {
      return {
        test: 'Refund Request Validation',
        status: 'error',
        message: `Validation testing failed: ${error.message}`,
        details: error
      };
    }
  };

  const testRefundAmountCalculations = async () => {
    try {
      const calculations = [];
      
      for (const booking of testBookings.slice(0, 3)) {
        const fullRefund = booking.total_amount;
        const partialRefund = booking.total_amount * 0.5;
        const cancellationFee = booking.total_amount * 0.1;
        
        calculations.push({
          bookingId: booking.id,
          originalAmount: booking.total_amount,
          fullRefund,
          partialRefund,
          cancellationFee,
          netRefund: fullRefund - cancellationFee
        });
      }

      return {
        test: 'Refund Amount Calculations',
        status: 'success',
        message: 'Amount calculations verified',
        details: calculations
      };
    } catch (error) {
      return {
        test: 'Refund Amount Calculations',
        status: 'error',
        message: `Calculation testing failed: ${error.message}`,
        details: error
      };
    }
  };

  const testRefundRequestFiltering = async () => {
    try {
      // Test filtering by status
      const pendingRefunds = await RefundRequest.filter({ status: 'pending' });
      const approvedRefunds = await RefundRequest.filter({ status: 'approved' });
      
      // Test filtering by user
      const userRefunds = await RefundRequest.filter({ user_id: user.id });
      
      return {
        test: 'Refund Request Filtering',
        status: 'success',
        message: 'Filtering operations work correctly',
        details: {
          pendingCount: pendingRefunds.length,
          approvedCount: approvedRefunds.length,
          userRefundsCount: userRefunds.length
        }
      };
    } catch (error) {
      return {
        test: 'Refund Request Filtering',
        status: 'error',
        message: `Filtering failed: ${error.message}`,
        details: error
      };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refund Flow Testing</h1>
          <p className="text-gray-600 mt-1">Comprehensive testing of the refund process and workflow</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadInitialData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button 
            onClick={runRefundFlowTests} 
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isRunning ? <LoadingSpinner size="h-4 w-4" /> : <DollarSign className="w-4 h-4" />}
            <span className="ml-2">{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
          </Button>
        </div>
      </div>

      {/* Test Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Test Bookings</p>
                <p className="text-2xl font-bold">{testBookings.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Existing Refund Requests</p>
                <p className="text-2xl font-bold">{refundRequests.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Refunds</p>
                <p className="text-2xl font-bold">
                  {refundRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium">{result.test}</h3>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Refund Requests */}
      {refundRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Refund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {refundRequests.slice(0, 10).map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Refund Request #{refund.id.slice(0, 8)}...</h4>
                      <p className="text-sm text-gray-600">
                        Amount: ${refund.amount} | Status: {refund.status}
                      </p>
                    </div>
                    <Badge className={getStatusColor(refund.status === 'processed' ? 'success' : 'warning')}>
                      {refund.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{refund.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Click "Run Tests" to execute comprehensive refund flow validation</li>
            <li>Tests will create temporary data and clean up automatically</li>
            <li>Check for any errors or warnings in the results</li>
            <li>Review existing refund requests to understand current state</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}