import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function CleanupVenues() {
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentUserData, allVenues, allUsers] = await Promise.all([
        User.me(),
        Venue.list('-created_date', 1000),
        User.list('-created_date', 1000)
      ]);
      
      setCurrentUser(currentUserData);
      setVenues(allVenues);
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const findInvalidVenues = () => {
    const validUserIds = new Set(users.map(u => u.id));
    return venues.filter(venue => {
      return !venue.owner_id || 
             venue.owner_id.includes('demo_') || 
             venue.owner_id.includes('sample-') || 
             !validUserIds.has(venue.owner_id);
    });
  };

  const fixInvalidVenues = async () => {
    setFixing(true);
    const invalidVenues = findInvalidVenues();
    const adminUsers = users.filter(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    // Use admin user as fallback, or the current user, or any available user
    const fallbackOwner = adminUsers.length > 0 ? adminUsers[0] : 
                         (currentUser ? currentUser : 
                         (regularUsers.length > 0 ? regularUsers[0] : null));

    if (!fallbackOwner) {
      setResults({ success: false, message: 'No valid users found to assign as venue owners.' });
      setFixing(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const venue of invalidVenues) {
      try {
        await Venue.update(venue.id, {
          owner_id: fallbackOwner.id,
          owner_name: fallbackOwner.full_name || 'Admin User'
        });
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Failed to update venue "${venue.title}": ${error.message}`);
      }
    }

    setResults({
      success: errorCount === 0,
      successCount,
      errorCount,
      errors,
      message: `Fixed ${successCount} venues${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
    });

    // Reload data to show updated venues
    await loadData();
    setFixing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading venue data...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const invalidVenues = findInvalidVenues();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Venue Data Cleanup</h1>
        <p className="text-gray-600">Fix venues with invalid or missing owner IDs.</p>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Cleanup Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{venues.length}</div>
                <div className="text-sm text-blue-800">Total Venues</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{invalidVenues.length}</div>
                <div className="text-sm text-red-800">Invalid Owner IDs</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{users.length}</div>
                <div className="text-sm text-green-800">Available Users</div>
              </div>
            </div>

            {invalidVenues.length > 0 ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {invalidVenues.length} venues with invalid owner IDs. These need to be fixed to prevent app errors.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={fixInvalidVenues}
                  disabled={fixing}
                  className="w-full"
                >
                  {fixing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fixing Venues...
                    </>
                  ) : (
                    'Fix Invalid Venues'
                  )}
                </Button>
              </div>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All venues have valid owner IDs. No cleanup needed!
                </AlertDescription>
              </Alert>
            )}

            {results && (
              <Alert className={`mt-4 ${results.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center">
                  {results.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className="ml-2">
                    {results.message}
                  </AlertDescription>
                </div>
                {results.errors && results.errors.length > 0 && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm text-gray-600">Show errors</summary>
                      <ul className="mt-2 text-xs text-red-600 space-y-1">
                        {results.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Invalid Venues List */}
        {invalidVenues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Venues with Invalid Owner IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invalidVenues.map(venue => (
                  <div key={venue.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                    <div>
                      <p className="font-medium">{venue.title}</p>
                      <p className="text-sm text-gray-600">
                        Invalid Owner ID: <code className="bg-gray-200 px-1 rounded">{venue.owner_id || 'null'}</code>
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {venue.location?.city || 'No location'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}