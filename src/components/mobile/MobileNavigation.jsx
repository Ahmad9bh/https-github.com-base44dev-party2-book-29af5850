import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, Heart, Briefcase, UserCircle, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function MobileNavigation({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Browse', icon: Search, page: 'Browse' },
    { name: 'Favorites', icon: Heart, page: 'MyFavorites', auth: true },
    { name: 'Bookings', icon: Briefcase, page: 'MyBookings', auth: true },
    { name: 'Profile', icon: UserCircle, page: 'UserProfile', auth: true }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          if (item.auth && !user) return null;
          
          const pageUrl = createPageUrl(item.page);
          const isActive = currentPath === pageUrl;

          return (
            <Link 
              key={item.name} 
              to={pageUrl} 
              className={`flex flex-col items-center justify-center space-y-1 w-full ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}