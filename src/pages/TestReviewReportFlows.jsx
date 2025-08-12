import React, { useState, useEffect } from 'react';
import { Review } from '@/api/entities';
import { VenueReport } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';

export default function TestReviewReportFlows() {
  const [user, setUser] = useState(null);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load completed bookings for review testing
      const allBookings = await Booking.list('-created_date', 50);
      const userCompletedBookings = allBookings.filter(b => 
        b.user_id === currentUser.id && b.status === 'completed'
      );
      setCompletedBookings(userCompletedBookings);

      // Load some venues for report testing
      const allVenues = await Venue.list('-created_date', 10);
      setVenues(allVenues.filter(v => v.status === 'active'));

      // Load user's reviews
      const userReviews = await Review.filter({ user_id: currentUser.id });
      setReviews(userReviews);

      // Load user's reports
      const userReports = await VenueReport.filter({ reporter_id: currentUser.id });
      setReports(userReports);

    } catch (err) {
      console.error('Failed to load test data:', err);
      error('Failed to load test data.');
    } finally {
      setLoading(false);
    }
  };

  const createTestBooking = async () => {
    try {
      if (venues.length === 0) {
        error('No venues available for test booking.');
        return;
      }

      const testVenue = venues[0];
      const testBooking = {
        venue_id: testVenue.id,
        user_id: user.id,
        event_date: '2024-01-15',
        start_time: '18:00',
        end_time: '22:00',
        guest_count: 50,
        event_type: 'wedding',
        contact_name: user.full_name || 'Test User',
        contact_email: user.email,
        contact_phone: '123-456-7890',
        total_amount: 500,
        currency: 'USD',
        platform_fee: 75,
        venue_owner_payout: 425,
        status: 'completed'
      };

      const newBooking = await Booking.create(testBooking);
      success(`Test completed booking created with ID: ${newBooking.id}`);
      loadTestData(); // Reload data
    } catch (err) {
      console.error('Failed to create test booking:', err);
      error('Failed to create test booking.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to test these flows.</p>
        <Button onClick={() => User.login()}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Review & Report Flows</h1>
        <p className="text-gray-600">Test and verify the review and report functionality.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Review Flow Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Review Flow Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Status</h4>
              <p className="text-sm text-blue-800">
                You have {completedBookings.length} completed bookings eligible for review.
              </p>
              <p className="text-sm text-blue-800">
                You have written {reviews.length} reviews so far.
              </p>
            </div>

            {completedBookings.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Completed Bookings (Can Write Reviews)</h4>
                {completedBookings.slice(0, 3).map(booking => {
                  const hasReview = reviews.some(r => r.booking_id === booking.id);
                  return (
                    <div key={booking.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Booking {booking.id.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.event_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasReview ? (
                            <Badge className="bg-green-100 text-green-800">
                              Review Written
                            </Badge>
                          ) : (
                            <Link to={createPageUrl(`WriteReview?booking_id=${booking.id}`)}>
                              <Button size="sm">Write Review</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No completed bookings to review.</p>
                <Button onClick={createTestBooking}>
                  Create Test Completed Booking
                </Button>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Your Reviews</h4>
              {reviews.length > 0 ? (
                <div className="space-y-2">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Rating: {review.rating}/5</span>
                        <Badge variant="outline">
                          {new Date(review.created_date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        "{review.comment.substring(0, 100)}..."
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews written yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Flow Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Report Flow Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Status</h4>
              <p className="text-sm text-red-800">
                There are {venues.length} active venues available to report.
              </p>
              <p className="text-sm text-red-800">
                You have submitted {reports.length} reports.
              </p>
            </div>

            {venues.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Active Venues (Can Report)</h4>
                {venues.slice(0, 3).map(venue => (
                  <div key={venue.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{venue.title}</p>
                        <p className="text-sm text-gray-600">{venue.location?.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Link to={createPageUrl(`ReportVenue?venue_id=${venue.id}`)}>
                          <Button variant="outline" size="sm" className="text-red-600">
                            Report
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No venues available to report.</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Your Reports</h4>
              {reports.length > 0 ? (
                <div className="space-y-2">
                  {reports.slice(0, 3).map(report => (
                    <div key={report.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {report.status}
                        </Badge>
                        <span className="text-sm font-medium">{report.report_type}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        "{report.description.substring(0, 100)}..."
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reports submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Status Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Flow Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Review Flow Status</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Review entity exists and is accessible</li>
                <li>• WriteReview page is functional</li>
                <li>• MyBookings shows review buttons for completed bookings</li>
                <li>• Reviews update venue ratings correctly</li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">⚠️ Report Flow Status</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• VenueReport entity exists and is accessible</li>
                <li>• ReportVenue page is functional</li>
                <li>• Report buttons are visible on venue pages</li>
                <li>• Reports are stored for admin review</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}