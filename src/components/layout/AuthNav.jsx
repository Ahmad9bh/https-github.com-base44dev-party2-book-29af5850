
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Heart, MessageSquare, LayoutDashboard, User as UserIcon, LogOut, Home, PlusCircle, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getLocalizedText } from '@/components/common/FormatUtils';

export default function AuthNav({ user, loading, isMobile = false, onLinkClick = () => {}, currentLanguage }) {
  const handleLogout = async () => {
    onLinkClick();
    await User.logout();
    window.location.href = createPageUrl('Home');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return <div className="h-10 w-28 bg-gray-200 rounded-md animate-pulse" />;
  }

  if (!user) {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-2">
          <Button asChild onClick={onLinkClick}><Link to={createPageUrl('Home')}>{getLocalizedText('log_in', currentLanguage)}</Link></Button>
          <Button variant="outline" asChild onClick={onLinkClick}><Link to={createPageUrl('Home')}>{getLocalizedText('sign_up', currentLanguage)}</Link></Button>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost"><Link to={createPageUrl('Home')}>{getLocalizedText('log_in', currentLanguage)}</Link></Button>
        <Button asChild><Link to={createPageUrl('Home')}>{getLocalizedText('sign_up', currentLanguage)}</Link></Button>
      </div>
    );
  }

  const userMenuItems = [
    { href: createPageUrl('UserProfile'), label: getLocalizedText('my_profile', currentLanguage), icon: UserIcon },
    { href: createPageUrl('MyBookings'), label: getLocalizedText('my_bookings', currentLanguage), icon: Briefcase },
    { href: createPageUrl('MyFavorites'), label: getLocalizedText('my_favorites', currentLanguage), icon: Heart },
    { href: createPageUrl('Messages'), label: getLocalizedText('messages', currentLanguage), icon: MessageSquare },
    { href: createPageUrl('MyVendorProfile'), label: 'My Vendor Profile', icon: Briefcase },
  ];

  if (user.user_type === 'venue_owner') {
    userMenuItems.push({ href: createPageUrl('MyVenues'), label: getLocalizedText('my_venues_dashboard', currentLanguage), icon: Home });
  }
  
  if (user.role === 'admin') {
    userMenuItems.push({ href: createPageUrl('AdminDashboard'), label: 'Admin Dashboard', icon: Shield });
  }

  if (isMobile) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
                <Avatar>
                    <AvatarImage src={user.profile_image} alt={user.full_name} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </div>
            <DropdownMenuSeparator />
            {userMenuItems.map(item => (
                 <Link key={item.href} to={item.href} onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                     <item.icon className="w-4 h-4" />
                     <span>{item.label}</span>
                 </Link>
            ))}
            <DropdownMenuSeparator />
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 px-3 py-2">
                <LogOut className="w-4 h-4"/>
                <span>{getLocalizedText('log_out', currentLanguage)}</span>
            </Button>
        </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.profile_image} alt={user.full_name} />
            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <Link to={item.href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{getLocalizedText('log_out', currentLanguage)}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
