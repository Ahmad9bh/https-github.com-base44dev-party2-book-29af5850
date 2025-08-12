import React, { useState } from 'react';
import { TeamMember } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Send, UserPlus, Users, Briefcase, CalendarCheck2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedNotificationService } from '@/components/notifications/EnhancedNotificationService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PERMISSIONS_CONFIG = [
  { id: 'manage_bookings', label: 'Manage Bookings', icon: <CalendarCheck2 className="w-4 h-4 mr-2" />, description: 'Approve, reject, and manage all bookings.' },
  { id: 'edit_venues', label: 'Edit Venues', icon: <Briefcase className="w-4 h-4 mr-2" />, description: 'Edit venue details, photos, and amenities.' }
];

export default function TeamManagement({ owner, team, onTeamUpdate }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);
  const { toast } = useToast();

  const handlePermissionChange = (permissionId) => {
    setPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || permissions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter an email and select at least one permission.',
      });
      return;
    }

    setIsInviting(true);
    try {
      // Check if user is already a team member or has a pending invite
      const existing = team.find(member => member.staff_email.toLowerCase() === inviteEmail.toLowerCase());
      if (existing) {
        toast({
          variant: 'destructive',
          title: 'Already Invited',
          description: `An invitation is already ${existing.status} for this email.`,
        });
        return;
      }

      await TeamMember.create({
        owner_id: owner.id,
        staff_email: inviteEmail.toLowerCase(),
        status: 'pending',
        permissions,
        invited_by: owner.id,
      });

      // Send email notification
      await EnhancedNotificationService.notifyTeamInvitation(inviteEmail, owner.full_name);

      toast({
        title: 'Invitation Sent!',
        description: `An invitation has been sent to ${inviteEmail}.`,
      });
      setInviteEmail('');
      setPermissions([]);
      onTeamUpdate(); // Refresh the team list
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send Invitation',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setIsRemoving(memberId);
    try {
      // You might want to soft delete (set status to 'revoked') instead of hard delete
      await TeamMember.update(memberId, { status: 'revoked' });
      toast({
        title: 'Team Member Removed',
        description: 'Access has been revoked for this team member.',
      });
      onTeamUpdate();
    } catch (error) {
      console.error('Failed to remove team member:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Remove',
        description: 'Could not remove team member. Please try again.',
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Current Team</span>
            </CardTitle>
            <CardDescription>View and manage staff who have access to your venues.</CardDescription>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't invited any team members yet.</p>
            ) : (
              <div className="space-y-4">
                {team.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{member.staff_email}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        {getStatusBadge(member.status)}
                        <span>•</span>
                        <span>Permissions: {member.permissions.join(', ')}</span>
                      </div>
                    </div>
                    {member.status !== 'revoked' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isRemoving === member.id}
                        >
                          {isRemoving === member.id ? <LoadingSpinner size="h-4 w-4" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                        </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              <span>Invite New Member</span>
            </CardTitle>
            <CardDescription>Grant access to a staff member by sending an invitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <Label htmlFor="email">Staff Member's Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-4 pt-2">
                  {PERMISSIONS_CONFIG.map(p => (
                     <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                       <Checkbox
                         id={p.id}
                         checked={permissions.includes(p.id)}
                         onCheckedChange={() => handlePermissionChange(p.id)}
                       />
                       <div className="grid gap-1.5 leading-none">
                         <label htmlFor={p.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                           {p.icon} {p.label}
                         </label>
                         <p className="text-xs text-muted-foreground">{p.description}</p>
                       </div>
                     </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isInviting}>
                {isInviting ? (
                    <LoadingSpinner />
                ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Invitation</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}