
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DeleteAccount() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { success, error } = useToast();

  const [confirmationText, setConfirmationText] = useState('');
  const [reason, setReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const deleteConfirmationText = 'DELETE MY ACCOUNT';

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      // Load user's bookings and venues to show impact
      const [userBookings, userVenues] = await Promise.all([
        Booking.filter({ user_id: userData.id }),
        Venue.filter({ owner_id: userData.id })
      ]);

      setBookings(userBookings);
      setVenues(userVenues);
    } catch (err) {
      console.error('Failed to load account data:', err);
      error('Failed to load account information.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== deleteConfirmationText) {
      error('Please type the confirmation text exactly as shown.');
      return;
    }

    if (!agreedToTerms) {
      error('You must agree to the terms before deleting your account.');
      return;
    }

    setDeleting(true);
    try {
      // First, cancel all active bookings
      const activeBookings = bookings.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      );
      
      for (const booking of activeBookings) {
        await Booking.update(booking.id, {
          status: 'cancelled',
          cancellation_reason: 'Account deleted by user'
        });
      }

      // Deactivate all owned venues
      const activeVenues = venues.filter(v => v.status === 'active');
      for (const venue of activeVenues) {
        await Venue.update(venue.id, {
          status: 'deleted',
          deleted_at: new Date().toISOString()
        });
      }

      // Mark user as deleted and scramble email to allow reuse
      const timestamp = Date.now();
      const scrambledEmail = `deleted_${timestamp}@deleted.com`;
      
      await User.updateMyUserData({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deletion_reason: reason,
        email: scrambledEmail, // This allows the original email to be reused
        full_name: `[DELETED USER ${timestamp}]`,
        phone: null,
        profile_image: null,
        company_name: null
      });

      success('Account deletion completed. You will be logged out shortly.');
      
      // Logout after a short delay
      setTimeout(() => {
        User.logout();
      }, 2000);

    } catch (err) {
      console.error('Failed to delete account:', err);
      error('Failed to delete account. Please try again or contact support.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const activeBookings = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  );
  const activeVenues = venues.filter(v => v.status === 'active');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to={createPageUrl('UserProfile')} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold text-red-600 mb-2 mt-4">Delete Account</h1>
        <p className="text-gray-600">Permanently delete your Party2Book account and all associated data.</p>
      </div>

      <div className="space-y-6">
        {/* Impact Warning */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action cannot be undone. Deleting your account will permanently remove all your data.
          </AlertDescription>
        </Alert>

        {/* Account Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle>What will be deleted?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                {activeBookings.length > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    {activeBookings.length} active bookings will be cancelled
                  </div>
                )}
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{venues.length}</div>
                <div className="text-sm text-gray-600">Owned Venues</div>
                {activeVenues.length > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    {activeVenues.length} venues will be deactivated
                  </div>
                )}
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">All</div>
                <div className="text-sm text-gray-600">Personal Data</div>
                <div className="text-xs text-red-600 mt-1">
                  Profile, messages, reviews
                </div>
              </div>
            </div>

            {(activeBookings.length > 0 || activeVenues.length > 0) && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  You have active bookings or venues that will be affected. Consider resolving these first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Deletion Form */}
        <Card>
          <CardHeader>
            <CardTitle>Account Deletion Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="reason">Reason for leaving (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Help us improve by telling us why you're leaving..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="confirmation">
                Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{deleteConfirmationText}</code> to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={deleteConfirmationText}
                className="font-mono"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreement"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <Label htmlFor="agreement" className="text-sm leading-5">
                I understand that this action is permanent and cannot be undone. I agree to the deletion of my account and all associated data.
              </Label>
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button variant="outline" asChild>
                  <Link to={createPageUrl('UserProfile')}>
                    Cancel
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleting ||
                    confirmationText !== deleteConfirmationText ||
                    !agreedToTerms
                  }
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Not sure about deleting?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you're experiencing issues, consider these alternatives:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm">Temporarily deactivate your account instead</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm">Contact our support team for help</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm">Update your privacy and notification settings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
