import React, { useState, useEffect } from 'react';
import { CannedResponse } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, MessageSquare, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const RESPONSE_CATEGORIES = [
  { value: 'booking_inquiry', label: 'Booking Inquiry', color: 'bg-blue-100 text-blue-800' },
  { value: 'pricing', label: 'Pricing', color: 'bg-green-100 text-green-800' },
  { value: 'availability', label: 'Availability', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'amenities', label: 'Amenities', color: 'bg-purple-100 text-purple-800' },
  { value: 'policies', label: 'Policies', color: 'bg-red-100 text-red-800' },
  { value: 'directions', label: 'Directions', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' }
];

const DEFAULT_RESPONSES = [
  {
    title: 'Thank You for Interest',
    content: 'Thank you for your interest in our venue! I\'d be happy to help you with your event. Could you please let me know the date, time, and number of guests you\'re expecting?',
    category: 'booking_inquiry'
  },
  {
    title: 'Availability Check',
    content: 'Let me check the availability for your requested date and get back to you shortly. In the meantime, feel free to ask any questions about our venue and amenities.',
    category: 'availability'
  },
  {
    title: 'Pricing Information',
    content: 'Our pricing varies depending on the day, time, and duration of your event. The base rate is shown on our listing, but I can provide you with a detailed quote based on your specific requirements.',
    category: 'pricing'
  },
  {
    title: 'Amenities Overview',
    content: 'Our venue includes all the amenities listed on our page. We also provide tables, chairs, basic sound system, and complimentary WiFi. Additional services can be arranged upon request.',
    category: 'amenities'
  },
  {
    title: 'Booking Confirmed',
    content: 'Great news! Your booking has been confirmed. I\'ve sent you all the details via email. Looking forward to hosting your event! Please don\'t hesitate to reach out if you have any questions.',
    category: 'booking_inquiry'
  }
];

export default function CannedResponseManager({ onResponseSelect = null, showSelector = false }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userResponses = await CannedResponse.filter(
        { owner_id: userData.id, is_active: true },
        '-usage_count',
        50
      );
      
      // If no responses exist, create default ones
      if (userResponses.length === 0) {
        const defaultResponses = await Promise.all(
          DEFAULT_RESPONSES.map(response =>
            CannedResponse.create({ ...response, owner_id: userData.id })
          )
        );
        setResponses(defaultResponses);
      } else {
        setResponses(userResponses);
      }
    } catch (error) {
      console.error('Failed to load canned responses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load saved responses.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in both title and content.'
      });
      return;
    }

    try {
      if (editingResponse) {
        await CannedResponse.update(editingResponse.id, formData);
        toast({
          title: 'Success',
          description: 'Response updated successfully.'
        });
      } else {
        await CannedResponse.create({
          ...formData,
          owner_id: user.id
        });
        toast({
          title: 'Success',
          description: 'New response created successfully.'
        });
      }
      
      setFormData({ title: '', content: '', category: 'general' });
      setShowCreateDialog(false);
      setEditingResponse(null);
      loadResponses();
    } catch (error) {
      console.error('Failed to save response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save response.'
      });
    }
  };

  const handleUseResponse = async (response) => {
    // Increment usage count
    await CannedResponse.update(response.id, { 
      usage_count: (response.usage_count || 0) + 1 
    });
    
    // Call parent callback if provided
    if (onResponseSelect) {
      onResponseSelect(response.content);
    }
    
    toast({
      title: 'Response Used',
      description: 'Template added to your message.'
    });
  };

  const handleDelete = async (response) => {
    if (!confirm('Are you sure you want to delete this response?')) return;
    
    try {
      await CannedResponse.update(response.id, { is_active: false });
      toast({
        title: 'Success',
        description: 'Response deleted successfully.'
      });
      loadResponses();
    } catch (error) {
      console.error('Failed to delete response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete response.'
      });
    }
  };

  const filteredResponses = selectedCategory === 'all' 
    ? responses 
    : responses.filter(r => r.category === selectedCategory);

  const getCategoryInfo = (category) => {
    return RESPONSE_CATEGORIES.find(c => c.value === category) || RESPONSE_CATEGORIES[6];
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {showSelector ? 'Quick Responses' : 'Manage Canned Responses'}
          </h3>
          <p className="text-sm text-gray-600">
            {showSelector ? 'Select a template to use in your message' : 'Create and manage your message templates'}
          </p>
        </div>
        {!showSelector && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Response
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingResponse ? 'Edit Response' : 'Create New Response'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Thank You for Interest"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Type your message template here..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setEditingResponse(null);
                      setFormData({ title: '', content: '', category: 'general' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingResponse ? 'Update' : 'Create'} Response
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All ({responses.length})
        </Button>
        {RESPONSE_CATEGORIES.map(category => {
          const count = responses.filter(r => r.category === category.value).length;
          if (count === 0) return null;
          
          return (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Responses Grid */}
      <div className="grid gap-4">
        {filteredResponses.map((response) => {
          const categoryInfo = getCategoryInfo(response.category);
          
          return (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-base">{response.title}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      {response.usage_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <BarChart3 className="w-3 h-3" />
                          Used {response.usage_count} times
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {showSelector && (
                      <Button
                        size="sm"
                        onClick={() => handleUseResponse(response)}
                      >
                        Use Template
                      </Button>
                    )}
                    {!showSelector && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingResponse(response);
                            setFormData({
                              title: response.title,
                              content: response.content,
                              category: response.category
                            });
                            setShowCreateDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(response)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {response.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'all' 
              ? "Create your first canned response to save time when messaging customers."
              : `No responses in the ${getCategoryInfo(selectedCategory).label} category.`
            }
          </p>
          {!showSelector && selectedCategory === 'all' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Response
            </Button>
          )}
        </div>
      )}
    </div>
  );
}