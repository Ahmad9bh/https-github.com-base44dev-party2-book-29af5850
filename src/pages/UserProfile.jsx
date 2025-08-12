
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Booking } from '@/api/entities';
import { GroupBooking } from '@/api/entities'; // New Import
import { Venue } from '@/api/entities';
import { UserFavorite } from '@/api/entities';
import { TeamMember } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, Camera, Save, Shield, Trash2, Settings, User as UserIcon, Heart, Calendar, Building2, Crown, AlertCircle, Clock, XCircle, StarIcon, CheckCircle, MapPin, Users, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CountryCurrencySelector from '@/components/common/CountryCurrencySelector';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isValid, parseISO } from 'date-fns';
import { getLocalizedText, formatCurrency } from '@/components/common/FormatUtils';

// Helper for safe date formatting
const safeFormatDate = (dateValue, formatString = 'PPP') => {
  if (!dateValue) return 'Date not set';
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  return isValid(date) ? format(date, formatString) : 'Invalid date';
};

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]); // New state for group bookings
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [venues, setVenues] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [processingInvite, setProcessingInvite] = useState(null);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_image: '',
    company_name: '',
    preferred_language: 'en',
    preferred_currency: 'USD',
    country: '',
    user_type: 'guest'
  });

  // Derived state for current language and currency based on profileData
  const currentLanguage = profileData.preferred_language || 'en';
  const currentCurrency = profileData.preferred_currency || 'USD';

  useEffect(() => {
    loadUserData();
  }, []);

  const getInitials = (name) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      // Basic URL validation
      new URL(url);
      // Check for common image file extensions
      return url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) !== null;
    } catch {
      return false;
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);
      
      setProfileData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        profile_image: userData.profile_image || '',
        company_name: userData.company_name || '',
        preferred_language: userData.preferred_language || 'en',
        preferred_currency: userData.preferred_currency || 'USD',
        country: userData.country || '',
        user_type: userData.user_type || 'guest'
      });

      // Load user's bookings and associated venues
      const userBookings = await Booking.filter({ user_id: userData.id }, '-created_date', 20);
      setBookings(userBookings);
      
      // New: Load user's group bookings (as organizer)
      const userGroupBookings = await GroupBooking.filter({ primary_booker_id: userData.id }, '-created_date', 20);
      setGroupBookings(userGroupBookings);

      const allVenueIds = new Set([
        ...userBookings.map(b => b.venue_id),
        ...userGroupBookings.map(b => b.venue_id)
      ].filter(Boolean));

      if (allVenueIds.size > 0) {
        const venueData = await Venue.filter({ id: { '$in': Array.from(allVenueIds) } });
        const venuesMap = venueData.reduce((acc, v) => {
          acc[v.id] = v;
          return acc;
        }, {});
        setVenues(venuesMap);
      }

      // Load user's favorite venues
      const userFavorites = await UserFavorite.filter({ user_id: userData.id });
      const favoriteVenueIds = userFavorites.map(fav => fav.venue_id);
      if (favoriteVenueIds.length > 0) {
        const favVenuesData = await Venue.filter({ id: { '$in': favoriteVenueIds } });
        setFavoriteVenues(favVenuesData);
      }

      // Load pending team invitations
      const pendingInvites = await TeamMember.filter({ staff_email: userData.email, status: 'pending' });
      setInvitations(pendingInvites);

    } catch (err) {
      console.error('Failed to load user data:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to load profile data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        description: 'Image must be smaller than 5MB',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        description: 'Please select a valid image file (JPG, PNG, GIF, or WebP)',
      });
      return;
    }

    setUploading(true);
    try {
      const { file_url } = UploadFile({ file });
      if (file_url && isValidImageUrl(file_url)) {
        setProfileData(prev => ({ ...prev, profile_image: file_url }));
        toast({
          variant: "success",
          description: 'Profile image uploaded successfully!',
        });
      } else {
        throw new Error('Invalid image URL returned from upload');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast({
        variant: "destructive",
        description: 'Failed to upload image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(profileData);
      setUser(prev => ({ ...prev, ...profileData }));
      toast({
        variant: "success",
        description: 'Profile updated successfully!',
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast({
        variant: "destructive",
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Renamed and updated getStatusColor to getStatusInfo
  const getStatusInfo = (booking) => {
    if (booking.change_request_status === 'pending') {
      return { text: getLocalizedText('change_request_pending', currentLanguage), color: 'bg-yellow-100 text-yellow-800' };
    }
    if (booking.status === 'cancellation_requested') {
      return { text: getLocalizedText('cancellation_requested', currentLanguage), color: 'bg-purple-100 text-purple-800' };
    }
    
    const statusKey = booking.status;
    let color = 'bg-gray-100 text-gray-800'; // Default color

    switch (statusKey) {
        case 'awaiting_payment':
            color = 'bg-blue-100 text-blue-800';
            break;
        case 'confirmed':
            color = 'bg-green-100 text-green-800';
            break;
        case 'pending':
        case 'payment_pending':
            color = 'bg-yellow-100 text-yellow-800';
            break;
        case 'rejected':
        case 'payment_failed':
            color = 'bg-red-100 text-red-800';
            break;
        case 'completed':
            color = 'bg-blue-100 text-blue-800';
            break;
        case 'cancelled_pending_refund':
            color = 'bg-purple-100 text-purple-800';
            break;
        case 'cancelled':
        default:
            color = 'bg-gray-100 text-gray-800';
            break;
    }

    return {
        text: getLocalizedText(statusKey, currentLanguage),
        color: color
    };
  };

  const handleInviteAction = async (invitationId, action) => {
    setProcessingInvite(invitationId);
    try {
      if (action === 'accept') {
        await TeamMember.update(invitationId, {
          status: 'active',
          staff_user_id: user.id
        });
        toast({
          variant: "success",
          title: 'Invitation Accepted!',
          description: "You can now manage the owner's venues.",
        });
      } else { // decline
        await TeamMember.delete(invitationId);
        toast({
          variant: "default",
          title: 'Invitation Declined',
          description: 'The invitation has been removed.',
        });
      }
      loadUserData(); // Refresh data
    } catch (err) {
      toast({
        variant: "destructive",
        title: 'Action Failed',
        description: 'Could not process the invitation. Please try again.',
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`flex md:grid overflow-x-auto no-scrollbar md:w-full ${profileData.user_type === 'venue_owner' ? 'md:grid-cols-7' : 'md:grid-cols-6'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2 flex-shrink-0">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          {profileData.user_type === 'venue_owner' && (
            <TabsTrigger value="my-venues" className="flex items-center gap-2 flex-shrink-0">
              <Building2 className="w-4 h-4" />
              My Venues
            </TabsTrigger>
          )}
          <TabsTrigger value="bookings" className="flex items-center gap-2 flex-shrink-0">
            <Calendar className="w-4 h-4" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="group-bookings" className="flex items-center gap-2 flex-shrink-0">
             <Users className="w-4 h-4" />
             Group Bookings
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2 flex-shrink-0">
            <Heart className="w-4 h-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2 flex-shrink-0">
            <Mail className="w-4 h-4" />
            Invitations
            {invitations.length > 0 && (
              <Badge className="ml-2 bg-indigo-600 text-white">{invitations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      {isValidImageUrl(profileData.profile_image) ? (
                        <AvatarImage 
                          src={profileData.profile_image} 
                          alt={profileData.full_name || 'Profile Image'} 
                        />
                      ) : null}
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {getInitials(profileData.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3 w-full">
                    <label htmlFor="avatar-upload" className="cursor-pointer w-full">
                      <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                        {uploading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            <span className="font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span className="font-medium">Change Photo</span>
                          </>
                        )}
                      </div>
                    </label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 text-center max-w-xs">
                      Upload a JPG, PNG, GIF, or WebP image. Maximum file size: 5MB. For best results, use a square image.
                    </p>
                    
                    {/* Remove photo button if image exists */}
                    {isValidImageUrl(profileData.profile_image) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProfileData(prev => ({ ...prev, profile_image: '' }))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                       <Label>Account Type</Label>
                        <div className="flex items-center gap-2 mt-2">
                            {profileData.user_type === 'venue_owner' ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 py-1 px-3 text-sm">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Venue Owner
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 py-1 px-3 text-sm">
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Regular User
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Account type cannot be changed.
                        </p>
                    </div>
                  </div>

                  {profileData.user_type === 'venue_owner' && (
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={profileData.company_name}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                      />
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <CountryCurrencySelector
                      selectedCountry={profileData.country}
                      selectedCurrency={profileData.preferred_currency}
                      selectedLanguage={profileData.preferred_language}
                      onCountryChange={(value) => handleSelectChange('country', value)}
                      onCurrencyChange={(value) => handleSelectChange('preferred_currency', value)}
                      onLanguageChange={(value) => handleSelectChange('preferred_language', value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {profileData.user_type === 'venue_owner' && (
          <TabsContent value="my-venues" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Venues</CardTitle>
                <p className="text-sm text-gray-500">View, edit, and manage your listed venues.</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Venue Dashboard</h3>
                  <p className="text-gray-600 mb-4">Go to your dashboard to manage your venues, bookings, and analytics.</p>
                  <Button asChild>
                    <Link to={createPageUrl('MyVenues')}>Go to My Venues Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <p className="text-sm text-gray-500">View and manage your venue bookings</p>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.map(booking => {
                    const venue = venues[booking.venue_id];
                    const statusInfo = getStatusInfo(booking);

                    const canWriteReview = booking.status === 'completed' && !booking.review_id;
                    const hasWrittenReview = booking.status === 'completed' && booking.review_id;

                    return (
                       <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12">
                          <div className="md:col-span-4 lg:col-span-3">
                            <img
                              src={venue?.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
                              alt={venue?.title || 'Venue image'}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          </div>
                          <div className="md:col-span-8 lg:col-span-9 p-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                              <div>
                                <CardTitle className="text-xl mb-1">
                                  {venue?.title || 'Venue details loading...'}
                                </CardTitle>
                                <div className="text-xs text-gray-500">
                                  Booking ID: {booking.id.slice(0, 12)}...
                                </div>
                              </div>
                              <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                            </div>
                            
                            <Separator className="my-4" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span>{safeFormatDate(booking.event_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span>{booking.start_time} - {booking.end_time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span>{booking.guest_count} guests</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span>{venue?.location?.city || 'Location not specified'}</span>
                              </div>
                              <div className="flex items-center gap-2 font-medium">
                                <span>Total:</span>
                                <span>{formatCurrency(booking.total_amount || 0, booking.currency || currentCurrency, currentLanguage)}</span>
                              </div>
                            </div>
                            
                            <Separator className="my-4" />

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Action Buttons */}
                              {venue && <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}><Button variant="outline" size="sm">View Venue</Button></Link>}
                              
                              {booking.status === 'confirmed' && (
                                <>
                                  <Link to={createPageUrl(`ChangeBooking?booking_id=${booking.id}`)}><Button variant="outline" size="sm">Change Date/Time</Button></Link>
                                  <Link to={createPageUrl(`CancelBooking?booking_id=${booking.id}`)}><Button variant="destructive" size="sm">Cancel Booking</Button></Link>
                                </>
                              )}

                              {canWriteReview && (
                                <Link to={createPageUrl(`WriteReview?booking_id=${booking.id}`)}>
                                  <Button variant="default" size="sm"><StarIcon className="w-4 h-4 mr-2" /> Write Review</Button>
                                </Link>
                              )}
                              {hasWrittenReview && (
                                <Button variant="outline" size="sm" disabled><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Review Submitted</Button>
                              )}
                              
                              {booking.status === 'pending' && <Button variant="outline" size="sm" disabled>Awaiting Confirmation</Button>}
                              {booking.status === 'payment_failed' && <Link to={createPageUrl(`Payment?booking_id=${booking.id}`)}><Button variant="destructive" size="sm">Retry Payment</Button></Link>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-4">Start exploring venues to make your first booking!</p>
                  <Button asChild>
                    <Link to={createPageUrl('Browse')}>Browse Venues</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="group-bookings" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Group Bookings</CardTitle>
                    <CardDescription>Track the status of events you're organizing with others.</CardDescription>
                </CardHeader>
                <CardContent>
                    {groupBookings.length > 0 ? (
                        <div className="space-y-4">
                            {groupBookings.map(gb => {
                                const venue = venues[gb.venue_id];
                                const paidCount = gb.contributors.filter(c => c.payment_status === 'paid').length;
                                const totalCount = gb.contributors.length;
                                const progress = (paidCount / totalCount) * 100;
                                return (
                                    <Card key={gb.id} className="p-4">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{venue?.title || 'Loading...'}</h3>
                                                <p className="text-sm text-gray-500">{safeFormatDate(gb.event_date)}</p>
                                                <Badge variant={gb.status === 'confirmed' ? 'default' : 'outline'} className="mt-2 capitalize">{gb.status}</Badge>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Link to={createPageUrl(`GroupBooking?id=${gb.id}`)}>
                                                    <Button>View Details</Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Label className="text-sm">{paidCount} of {totalCount} paid</Label>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No Group Bookings Yet</h3>
                            <p className="text-gray-600">Organize an event with friends to see it here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Favorite Venues</CardTitle>
              <p className="text-sm text-gray-500">Venues you've saved for later</p>
            </CardHeader>
            <CardContent>
              {favoriteVenues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteVenues.map(venue => (
                    <Card key={venue.id} className="group overflow-hidden relative">
                       <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                        <div className="relative">
                          <img
                            src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
                            alt={venue.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        <div className="p-4 bg-white">
                            <h3 className="font-semibold text-lg truncate">{venue.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{venue.location?.city}</span>
                            </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-4">Start adding venues to your favorites to see them here!</p>
                  <Button asChild>
                    <Link to={createPageUrl('Browse')}>Browse Venues</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <p className="text-sm text-gray-500">Manage your account security</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={createPageUrl('SecuritySettings')}>
                      Change Password
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={createPageUrl('SecuritySettings')}>
                      Configure 2FA
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <p className="text-sm text-gray-500">Irreversible and destructive actions</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="destructive" asChild>
                    <Link to={createPageUrl('DeleteAccount')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Invitations</CardTitle>
              <CardDescription>Accept or decline invitations to manage venues for other owners.</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">You have no pending invitations.</p>
              ) : (
                <div className="space-y-4">
                  {invitations.map(invite => (
                    <div key={invite.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p>You've been invited to manage venues for <span className="font-semibold">{invite.owner_id}</span>.</p>
                        <p className="text-sm text-gray-500 mt-1">Permissions: {invite.permissions.join(', ')}</p>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInviteAction(invite.id, 'decline')}
                          disabled={processingInvite === invite.id}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleInviteAction(invite.id, 'accept')}
                          disabled={processingInvite === invite.id}
                        >
                          {processingInvite === invite.id ? <LoadingSpinner size="h-4 w-4" /> : 'Accept'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
