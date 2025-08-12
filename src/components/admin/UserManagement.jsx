
import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities'; // Assuming Booking entity path
import { Venue } from '@/api/entities';   // Assuming Venue entity path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Ban, CheckCircle, AlertTriangle, Mail, Phone, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import RoleManager from './RoleManager'; // Import RoleManager

export default function UserManagement({ users, bookings, venues, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [editingUser, setEditingUser] = useState(null); // For role editing
  const { success, error } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getUserStats = (userId) => {
    const userBookings = bookings.filter(b => b.user_id === userId);
    const userVenues = venues.filter(v => v.owner_id === userId);
    
    return {
      totalBookings: userBookings.length,
      completedBookings: userBookings.filter(b => b.status === 'completed').length,
      totalVenues: userVenues.length,
      activeVenues: userVenues.filter(v => v.status === 'active').length
    };
  };

  const handleSuspendUser = async (userId) => {
    if (!suspensionReason.trim()) {
      error('Please provide a reason for suspension.');
      return;
    }

    try {
      await User.update(userId, {
        status: 'suspended',
        suspension_reason: suspensionReason,
        suspended_at: new Date().toISOString(),
        suspended_by: 'admin' // In real app, this would be current admin user ID
      });

      success('User suspended successfully.');
      setSuspendingUser(null);
      setSuspensionReason('');
      onUpdate();
    } catch (err) {
      console.error('Failed to suspend user:', err);
      error('Failed to suspend user.');
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      await User.update(userId, {
        status: 'active',
        suspension_reason: null,
        suspended_at: null,
        suspended_by: null
      });

      success('User reactivated successfully.');
      onUpdate();
    } catch (err) {
      console.error('Failed to reactivate user:', err);
      error('Failed to reactivate user.');
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (!deletionReason.trim()) {
      error('Please provide a reason for permanent deletion.');
      return;
    }

    try {
      // First, cancel all active bookings for this user
      const userBookings = bookings.filter(b => b.user_id === userId);
      const activeBookings = userBookings.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      );
      
      for (const booking of activeBookings) {
        await Booking.update(booking.id, {
          status: 'cancelled',
          cancellation_reason: 'User account permanently deleted by admin'
        });
      }

      // Deactivate all owned venues
      const userVenues = venues.filter(v => v.owner_id === userId);
      for (const venue of userVenues) {
        await Venue.update(venue.id, {
          status: 'deleted', // Assuming 'deleted' is a valid status for venues
          deleted_at: new Date().toISOString()
        });
      }

      // Instead of deleting, mark user as permanently deleted and scramble email
      const timestamp = Date.now();
      const scrambledEmail = `deleted_${timestamp}@deleted.com`;
      
      await User.update(userId, {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deletion_reason: deletionReason,
        email: scrambledEmail, // This allows the original email to be reused
        full_name: `[DELETED USER ${timestamp}]`,
        phone: null,
        profile_image: null,
        company_name: null
      });

      success('User permanently deleted successfully. The email address can now be reused.');
      setDeletingUser(null);
      setDeletionReason('');
      onUpdate();
    } catch (err) {
      console.error('Failed to permanently delete user:', err);
      error('Failed to permanently delete user.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deleted': return 'bg-orange-100 text-orange-800'; // Added for deleted status
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem> {/* Added deleted status */}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => {
              const stats = getUserStats(user.id);
              const isDeleted = user.status === 'deleted';
              const isSuspended = user.status === 'suspended';

              return (
                <div key={user.id} className={`border rounded-lg p-4 ${isDeleted ? 'opacity-70 bg-gray-50' : ''}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{user.full_name || user.email}</h3>
                          {!isDeleted && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{user.email}</span>
                              {user.phone && (
                                <>
                                  <Phone className="w-4 h-4 ml-2" />
                                  <span>{user.phone}</span>
                                </>
                              )}
                            </div>
                          )}
                          {isDeleted && (
                             <p className="text-sm text-gray-500 italic">User data obfuscated (Permanently Deleted)</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getStatusColor(user.status || 'active')}>
                          {user.status || 'active'}
                        </Badge>
                        <Badge className={getRoleColor(user.role || 'user')}>
                          {user.role || 'user'}
                        </Badge>
                        {user.user_type && user.user_type !== 'guest' && (
                          <Badge variant="outline">{user.user_type}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Bookings</p>
                          <p className="font-semibold">{stats.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Completed</p>
                          <p className="font-semibold text-green-600">{stats.completedBookings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Venues Owned</p>
                          <p className="font-semibold">{stats.totalVenues}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Active Venues</p>
                          <p className="font-semibold text-green-600">{stats.activeVenues}</p>
                        </div>
                      </div>

                      {user.suspension_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Suspended</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">{user.suspension_reason}</p>
                          {user.suspended_at && (
                            <p className="text-xs text-red-600 mt-1">
                              Suspended on {format(new Date(user.suspended_at), 'PPP')}
                            </p>
                          )}
                        </div>
                      )}
                       {user.deletion_reason && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-800">
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Permanently Deleted</span>
                          </div>
                          <p className="text-sm text-orange-700 mt-1">{user.deletion_reason}</p>
                          {user.deleted_at && (
                            <p className="text-xs text-orange-600 mt-1">
                              Deleted on {format(new Date(user.deleted_at), 'PPP')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Role Management Button */}
                      {!isDeleted && (
                        <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Manage Role
                            </Button>
                          </DialogTrigger>
                          {/* RoleManager component is expected to render DialogContent internally */}
                          <RoleManager
                            user={editingUser}
                            onClose={() => setEditingUser(null)}
                            onUpdate={onUpdate}
                          />
                        </Dialog>
                      )}

                      {/* Suspension/Reactivation Button */}
                      {!isDeleted && (
                        isSuspended ? (
                          <Button
                            onClick={() => handleReactivateUser(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => setSuspendingUser(user.id)}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend User</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for suspending {user.full_name || user.email}.
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
                                      setSuspendingUser(null);
                                      setSuspensionReason('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleSuspendUser(suspendingUser)}
                                  >
                                    Suspend User
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )
                      )}

                      {/* Permanent Delete Button - only available if not already deleted */}
                      {!isDeleted && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingUser(user.id)}
                              className="bg-red-700 hover:bg-red-800"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Permanent Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Permanently Delete User</DialogTitle>
                              <DialogDescription>
                                <strong>Warning:</strong> This will permanently delete {user.full_name || user.email} and allow their email to be reused. All personal data will be obfuscated. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="deletion-reason">Deletion Reason</Label>
                                <Textarea
                                  id="deletion-reason"
                                  placeholder="Enter the reason for permanent deletion..."
                                  value={deletionReason}
                                  onChange={(e) => setDeletionReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setDeletingUser(null);
                                    setDeletionReason('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handlePermanentDelete(deletingUser)}
                                  className="bg-red-700 hover:bg-red-800"
                                >
                                  Permanently Delete
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
