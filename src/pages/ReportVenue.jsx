import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VenueReport } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/toast';

export default function ReportVenue() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venue_id');
  
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'misleading_info', label: 'Misleading Information' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'fake_listing', label: 'Fake Listing' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (venueId) {
      loadData();
    }
  }, [venueId]);

  const loadData = async () => {
    try {
      const [currentUser, venueData] = await Promise.all([
        User.me(),
        Venue.get(venueId)
      ]);
      
      setUser(currentUser);
      setVenue(venueData);
      
    } catch (err) {
      console.error('Failed to load venue data:', err);
      error('Failed to load venue information.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType) {
      error('Please select a report type.');
      return;
    }
    
    if (!description.trim() || description.trim().length < 20) {
      error('Please provide a detailed description (minimum 20 characters).');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await VenueReport.create({
        venue_id: venue.id,
        reporter_id: user.id,
        report_type: reportType,
        description: description.trim()
      });
      
      success('Thank you for your report. We will review it and take appropriate action if needed.');
      
      setTimeout(() => {
        window.location.href = createPageUrl(`VenueDetails?id=${venue.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to submit report:', err);
      error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!venue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Venue Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the venue you're trying to report.</p>
        <Button onClick={() => window.location.href = createPageUrl('Browse')}>
          Browse Venues
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
        <p className="text-gray-600">Help us maintain quality by reporting issues with this venue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Venue Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {venue.images && venue.images.length > 0 && (
                  <img
                    src={venue.images[0]}
                    alt={venue.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-medium">{venue.title}</p>
                  <p className="text-sm text-gray-600">{venue.location?.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{venue.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${venue.price_per_hour}/hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <CardTitle>Report Issue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div>
                  <Label htmlFor="reportType">Type of Issue *</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide detailed information about the issue. Include specific examples if possible."
                    rows={6}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 20 characters ({description.length}/20)
                  </p>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>
                        False reports may result in account suspension. Please only report genuine issues that violate our terms of service or community guidelines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl(`VenueDetails?id=${venue.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !reportType || description.trim().length < 20}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {submitting ? 'Submitting Report...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}