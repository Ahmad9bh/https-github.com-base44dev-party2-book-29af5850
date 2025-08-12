import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Key, Copy, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { ApiKey } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/api/entities';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AVAILABLE_PERMISSIONS = [
  { id: 'venues:read', label: 'Read Venues' },
  { id: 'venues:write', label: 'Write Venues' },
  { id: 'bookings:read', label: 'Read Bookings' },
  { id: 'bookings:write', label: 'Write Bookings' },
  { id: 'analytics:read', label: 'Read Analytics' }
];

export default function APIManagement() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newKeyData, setNewKeyData] = useState({ name: '', permissions: [] });
  const [generatedKey, setGeneratedKey] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const keys = await ApiKey.filter({ user_id: currentUser.id });
      setApiKeys(keys);
    } catch (err) {
      error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyData.name.trim()) {
      error('Key name is required');
      return;
    }

    try {
      // In a real app, the key would be generated on the backend and returned
      const newKeyString = 'pk_live_' + [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
      
      const newApiKey = await ApiKey.create({
        user_id: user.id,
        key_name: newKeyData.name,
        api_key: newKeyString, // This would be hashed on the backend
        permissions: newKeyData.permissions
      });

      setGeneratedKey(newApiKey.api_key);
      setNewKeyData({ name: '', permissions: [] });
      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      error('Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      await ApiKey.delete(keyId);
      success('API key deleted successfully');
      loadData();
    } catch (err) {
      error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your API Keys</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Create New Key</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Name</label>
                    <Input
                      placeholder="e.g., My Analytics App"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="space-y-2">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <div key={perm.id} className="flex items-center gap-2">
                          <Checkbox
                            id={perm.id}
                            checked={newKeyData.permissions.includes(perm.id)}
                            onCheckedChange={(checked) => {
                              const currentPerms = newKeyData.permissions;
                              const updatedPerms = checked
                                ? [...currentPerms, perm.id]
                                : currentPerms.filter(p => p !== perm.id);
                              setNewKeyData(prev => ({ ...prev, permissions: updatedPerms }));
                            }}
                          />
                          <label htmlFor={perm.id}>{perm.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreateKey} className="w-full">Create Key</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map(key => (
                <div key={key.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{key.key_name}</p>
                    <p className="text-sm text-gray-500">
                      ••••••••••••••••••••{key.api_key.slice(-4)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {key.permissions.map(perm => (
                        <Badge key={perm} variant="secondary">{perm}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(key.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">You haven't created any API keys yet.</p>
          )}
        </CardContent>
      </Card>

      {generatedKey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <Shield /> API Key Generated Successfully
            </CardTitle>
            <CardDescription>
              Please copy this key and store it securely. You will not be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
              <Input 
                readOnly 
                type={isKeyVisible ? 'text' : 'password'}
                value={generatedKey}
                className="font-mono flex-1 border-none bg-transparent"
              />
              <Button variant="ghost" size="icon" onClick={() => setIsKeyVisible(!isKeyVisible)}>
                {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Developer Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Documentation</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <h4>Getting Started</h4>
          <p>
            Authenticate to the API by providing your API key in the `Authorization` header.
          </p>
          <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          <h4>Example: Fetch Venues</h4>
          <pre><code>
            {`curl -X GET "https://api.party2go.com/v1/venues" \\
-H "Authorization: Bearer YOUR_API_KEY"`}
          </code></pre>
        </CardContent>
      </Card>
    </div>
  );
}