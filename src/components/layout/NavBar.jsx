import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, LogOut, LayoutDashboard, Building, Calendar, Heart, MessageSquare, 
  Bell, Plus, Menu, X, Users as UsersIcon, Settings, AlertTriangle, Shield,
  Sparkles, Crown, Search
} from 'lucide-react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Dispute } from '@/api/entities';
import { SupportTicket } from '@/api/entities';
import { RealtimeNotification } from '@/api/entities';
import LanguageSelector from '@/components/common/LanguageSelector';
import CurrencySelector from '@/components/common/CurrencySelector';
import { useLocalization } from '@/components/common/LocalizationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar({ user, loading }) {
  const { getLocalizedText } = useLocalization();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState({
    pendingVenues: 0,
    openDisputes: 0,
    supportTickets: 0,
    total: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadNotifications();
      if (user.role === 'admin') {
        loadAdminNotifications();
      }
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const userNotifications = await RealtimeNotification.filter(
        { user_id: user.id, is_read: false }, 
        '-created_date', 
        10
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  };

  const loadAdminNotifications = async () => {
    try {
      const [pendingVenues, openDisputes, openTickets] = await Promise.all([
        Venue.filter({ status: 'pending_approval' }).catch(() => []),
        Dispute.filter({ status: 'open' }).catch(() => []),
        SupportTicket.filter({ status: 'open' }).catch(() => [])
      ]);

      const counts = {
        pendingVenues: pendingVenues.length,
        openDisputes: openDisputes.length,
        supportTickets: openTickets.length,
        total: pendingVenues.length + openDisputes.length + openTickets.length
      };

      setAdminNotifications(counts);
    } catch (error) {
      console.warn('Failed to load admin notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationLinks = [
    { name: 'Find Vendors', href: createPageUrl('BrowseVendors'), icon: UsersIcon },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to={createPageUrl('Home')} className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mr-8 hover:scale-105 transition-transform">
              Party2Go
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:space-x-8">
              <Button variant="ghost" asChild className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50">
                <Link to={createPageUrl('Browse')}>
                  <Search className="w-4 h-4 mr-2" />
                  Browse Venues
                </Link>
              </Button>
              {navigationLinks.map((link) => (
                <Button key={link.name} variant="ghost" asChild className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50">
                  <Link to={link.href}>
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side - Actions and User Menu */}
          <div className="flex items-center gap-3">
            {/* Language and Currency Selectors */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelector />
              <CurrencySelector />
            </div>

            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* Admin Dashboard Button */}
                {user.role === 'admin' && (
                  <Button variant="outline" size="sm" asChild className="hidden md:flex border-purple-200 text-purple-700 hover:bg-purple-50 relative">
                    <Link to={createPageUrl('AdminDashboard')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                      {adminNotifications.total > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                          {adminNotifications.total}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                )}

                {/* Add Venue Button - for owners */}
                {(user.user_type === 'venue_owner' || user.role === 'admin') && (
                  <Button variant="outline" size="sm" asChild className="hidden md:flex border-green-200 text-green-700 hover:bg-green-50">
                    <Link to={createPageUrl('AddVenue')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue
                    </Link>
                  </Button>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {(notifications.length > 0 || adminNotifications.total > 0) && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                          {notifications.length + adminNotifications.total}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Admin Notifications */}
                    {user.role === 'admin' && adminNotifications.total > 0 && (
                      <>
                        {adminNotifications.pendingVenues > 0 && (
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminDashboard?tab=venues')} className="flex items-center gap-3 p-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Venues Pending Approval</p>
                                <p className="text-xs text-gray-500">{adminNotifications.pendingVenues} venues need review</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {adminNotifications.openDisputes > 0 && (
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminDashboard?tab=disputes')} className="flex items-center gap-3 p-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Open Disputes</p>
                                <p className="text-xs text-gray-500">{adminNotifications.openDisputes} disputes need attention</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {adminNotifications.supportTickets > 0 && (
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('SupportCenter')} className="flex items-center gap-3 p-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Support Tickets</p>
                                <p className="text-xs text-gray-500">{adminNotifications.supportTickets} tickets awaiting response</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* User Notifications */}
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} asChild>
                          <Link to={notification.link || '#'} className="flex items-center gap-3 p-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : user.role !== 'admin' && (
                      <DropdownMenuItem disabled>
                        <div className="text-center py-4 text-gray-500">
                          No new notifications
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-indigo-200">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile_image} />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.role === 'admin' && (
                        <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.full_name || 'User'}
                          {user.role === 'admin' && (
                            <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">Admin</Badge>
                          )}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('UserProfile')}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyBookings')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyFavorites')}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favorites</span>
                      </Link>
                    </DropdownMenuItem>

                    {(user.user_type === 'venue_owner' || user.role === 'admin') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('MyVenues')}>
                            <Building className="mr-2 h-4 w-4" />
                            <span>My Venues</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('OwnerDashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Owner Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Messages')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('SecuritySettings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => User.login()}>
                  Log In
                </Button>
                <Button onClick={() => User.login()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link to={createPageUrl('Browse')} onClick={() => setMobileMenuOpen(false)}>
                    <Search className="w-4 h-4 mr-2" />
                    Browse Venues
                  </Link>
                </Button>
                {navigationLinks.map((link) => (
                  <Button key={link.name} variant="ghost" asChild className="w-full justify-start">
                    <Link to={link.href} onClick={() => setMobileMenuOpen(false)}>
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.name}
                    </Link>
                  </Button>
                ))}
                
                {user && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link to={createPageUrl('MyBookings')} onClick={() => setMobileMenuOpen(false)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          My Bookings
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link to={createPageUrl('UserProfile')} onClick={() => setMobileMenuOpen(false)}>
                          <UserIcon className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                    </div>
                  </>
                )}

                <div className="border-t pt-2 mt-2 flex gap-2">
                  <LanguageSelector />
                  <CurrencySelector />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}