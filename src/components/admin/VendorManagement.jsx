
import React, { useState } from 'react';
import { Vendor } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Check, X, ShieldCheck, ShieldAlert, Eye, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Corrected import to use-toast based on common shadcn patterns
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function VendorManagement({ vendors, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const { toast } = useToast(); // Destructure toast directly

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      await Vendor.update(vendorId, { status: newStatus });
      toast({
        title: 'Success!',
        description: `Vendor status updated to ${newStatus}.`,
        variant: 'success',
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to update vendor status:', err);
      toast({
        title: 'Error!',
        description: 'Failed to update vendor status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'none': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm || 
      vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    const matchesSubscription = filterSubscription === 'all' || vendor.subscription_status === filterSubscription;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const pendingApprovalVendors = vendors.filter(v => v.status === 'pending_approval');
  const activeSubscriptions = vendors.filter(v => v.subscription_status === 'active').length;
  const monthlyRevenue = activeSubscriptions * 10; // $10 per vendor per month

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Vendor Revenue</p>
                <p className="text-2xl font-bold text-green-600">${monthlyRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-blue-600">{activeSubscriptions}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{pendingApprovalVendors.length}</p>
              </div>
              <ShieldAlert className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by company name, service type, or city..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubscription} onValueChange={setFilterSubscription}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="none">No Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVendors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No vendors found matching your criteria.</p>
            ) : (
              filteredVendors.map(vendor => (
                <div key={vendor.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {vendor.profile_image_url && (
                          <img
                            src={vendor.profile_image_url}
                            alt={vendor.company_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{vendor.company_name}</h3>
                          <p className="text-gray-600 capitalize">{vendor.service_type}</p>
                          <p className="text-sm text-gray-500">{vendor.city}, {vendor.country}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getSubscriptionStatusColor(vendor.subscription_status)}>
                          {vendor.subscription_status === 'active' ? (
                            <ShieldCheck className="w-3 h-3 mr-1" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 mr-1" />
                          )}
                          {vendor.subscription_status} subscription
                        </Badge>
                        {vendor.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Base Price</p>
                          <p className="font-semibold">${vendor.base_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <p className="font-semibold">{vendor.rating?.toFixed(1) || 'N/A'} ⭐</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reviews</p>
                          <p className="font-semibold">{vendor.total_reviews || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Monthly Revenue</p>
                          <p className="font-semibold text-green-600">
                            {vendor.subscription_status === 'active' ? '$10' : '$0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={createPageUrl(`VendorProfile?id=${vendor.id}`)} target="_blank">
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      
                      {vendor.status === 'pending_approval' && vendor.subscription_status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(vendor.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}

                      {vendor.status === 'pending_approval' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(vendor.id, 'inactive')}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      )}

                      {vendor.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(vendor.id, 'inactive')}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>

                  {vendor.subscription_status !== 'active' && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-700">
                        ⚠️ This vendor needs an active subscription ($10/month) before they can be approved and visible on the marketplace.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
