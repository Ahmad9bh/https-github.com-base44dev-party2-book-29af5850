import React, { useState } from 'react';
import { User } from '@/api/entities';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Briefcase, User as UserIcon } from 'lucide-react';

export default function RoleManager({ user, onClose, onUpdate }) {
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [newUserType, setNewUserType] = useState(user?.user_type || 'regular');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveRole = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await User.update(user.id, {
        role: newRole,
        user_type: newUserType,
      });
      toast({
        title: "Success",
        description: `${user.full_name}'s roles have been updated.`,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Roles for {user.full_name}</DialogTitle>
        <DialogDescription>
          Change the system role and user type for this account. Be careful, as this grants or revokes permissions.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="system-role">System Role</Label>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger id="system-role">
              <SelectValue placeholder="Select system role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> User</div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Admin</div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Admins have full platform access. Users have standard customer access.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-type">User Type</Label>
          <Select value={newUserType} onValueChange={setNewUserType}>
            <SelectTrigger id="user-type">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">
                <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Regular User</div>
              </SelectItem>
              <SelectItem value="venue_owner">
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Venue Owner</div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Venue Owners can list and manage venues.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSaveRole} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}