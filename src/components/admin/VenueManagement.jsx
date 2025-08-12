import React, { useState } from 'react';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Star, Ban, CheckCircle, Eye, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/components/common/FormatUtils';
import { format } from 'date-fns';

export default function VenueManagement({ venues, onUpdate, onFeatureToggle, onStatusChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [suspendingVenue, setSuspendingVenue] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const { success, error } = useToast();

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchTerm || 
      venue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || venue.status === filterStatus;
    
    const venueCategories = Array.isArray(venue.category) ? venue.category : [];
    const matchesCategory = filterCategory === 'all' || 
      (venueCategories.length > 0 && venueCategories.includes(filterCategory));
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSuspendVenue = async (venueId) => {
    if (!suspensionReason.trim()) {
      error('Please provide a reason for suspension.');
      return;
    }

    try {
      await Venue.update(venueId, {
        status: 'suspended',
        suspension_reason: suspensionReason,
        suspended_at: new Date().toISOString(),
        suspended_by: 'admin' // In real app, this would be current admin user ID
      });

      success('Venue suspended successfully.');
      setSuspendingVenue(null);
      setSuspensionReason('');
      onUpdate();
    } catch (err) {
      console.error('Failed to suspend venue:', err);
      error('Failed to suspend venue.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueCategories = () => {
    const categories = new Set();
    venues.forEach(venue => {
      if (venue.category) {
        const venueCategories = Array.isArray(venue.category) ? venue.category : [venue.category];
        venueCategories.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Venue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by venue name, city, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Venue List */}
      <Card>
        <CardHeader>
          <CardTitle>Venues ({filteredVenues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVenues.map(venue => {
              const venueCategories = Array.isArray(venue.category) ? venue.category : [];
              return (
                <div key={venue.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {venue.images && venue.images.length > 0 && (
                          <img
                            src={venue.images[0]}
                            alt={venue.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{venue.title}</h3>
                            {venue.is_featured && (
                              <Crown className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{venue.location?.city}</p>
                          <p className="text-sm text-gray-500">Owner: {venue.owner_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getStatusColor(venue.status)}>
                          {venue.status}
                        </Badge>
                        {venue.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        {venueCategories.slice(0, 3).map((category, index) => (
                          <Badge key={index} variant="outline">{category}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Price/Hour</p>
                          <p className="font-semibold">
                            {formatCurrency(venue.price_per_hour, venue.currency || 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Capacity</p>
                          <p className="font-semibold">{venue.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{(venue.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-semibold">
                            {format(new Date(venue.created_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      {venue.suspension_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">{venue.suspension_reason}</p>
                          {venue.suspended_at && (
                            <p className="text-xs text-red-600 mt-1">
                              Suspended on {format(new Date(venue.suspended_at), 'PPP')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)} target="_blank">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      
                      {venue.status === 'active' && (
                        <Button
                          variant={venue.is_featured ? "default" : "outline"}
                          size="sm"
                          onClick={() => onFeatureToggle(venue.id, venue.is_featured)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {venue.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      )}

                      {venue.status !== 'suspended' && venue.status !== 'rejected' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSuspendingVenue(venue.id)}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend Venue</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for suspending "{venue.title}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Suspension Reason</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Enter the reason for suspension..."
                                  value={suspensionReason}
                                  onChange={(e) => setSuspensionReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSuspendingVenue(null);
                                    setSuspensionReason('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleSuspendVenue(suspendingVenue)}
                                >
                                  Suspend Venue
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {venue.status === 'suspended' && (
                        <Button
                          size="sm"
                          onClick={() => onStatusChange(venue.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}