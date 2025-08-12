
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NavBar from '@/components/layout/NavBar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LocalizationProvider } from '@/components/common/LocalizationContext';
import { ToastProvider } from '@/components/ui/toast';
import PWAInstaller from '@/components/pwa/PWAInstaller';
import OfflineMode from '@/components/common/OfflineMode';
import ChatbotAssistant from '@/components/ai/ChatbotAssistant';
import PushNotificationManager from '@/components/pwa/PushNotificationManager';
import RealtimeNotificationManager from '@/components/notifications/RealtimeNotificationManager';
import Analytics from '@/components/analytics/Analytics';
import SecurityHeaders from '@/components/security/SecurityHeaders';
import { AlertTriangle } from 'lucide-react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { withErrorHandling } from '@/components/common/SafeApiCall';

const PUBLIC_PAGES = [
  'Home', 'Browse', 'VenueDetails', 'VenueMap', 'GuestCheckout',
  'TermsOfService', 'PrivacyPolicy', 'CookiePolicy',
  'CancellationPolicy', 'CommunityGuidelines',
  'CleanupVenues', 'CleanupDatabase', 'ConfigureStripe', 'SystemMonitoring',
  'PublicHome', 'IntelligenceSuite', 'BrowseVendors', 'VendorProfile', 
  'SupportCenter', 'EnterpriseManagement', 'SecuritySettings',
  'DeploymentDashboard', 'ContentManager', 'MarketingDashboard', 'AddVenue'
];

const ADMIN_ONLY_PAGES = [
  'AdminDashboard', 'DeploymentDashboard', 'SystemMonitoring', 'FlowDiagnostics', 'SmokeTest',
  'RoleTesting', 'PlatformSettingsManager', 'TestSystemFlows'
];

const OWNER_ONLY_PAGES = [
  'MyVenues', 'EditVenue', 'OwnerDashboard', 'OwnerFinancials'
];

function MaintenanceBanner() {
    return (
        <div className="bg-yellow-500 text-white text-center p-2 text-sm font-semibold flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            The platform is currently in maintenance mode. Some features may be unavailable.
        </div>
    );
}

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState('LIVE');
  const navigate = useNavigate();
  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  useEffect(() => {
    const checkUserAndStatus = withErrorHandling(async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Role-based routing enforcement
        const isOwnerPage = OWNER_ONLY_PAGES.includes(currentPageName);
        const isAdminPage = ADMIN_ONLY_PAGES.includes(currentPageName);

        if (isAdminPage && currentUser.role !== 'admin') {
          navigate('/Home');
          return;
        }

        if (isOwnerPage && currentUser.user_type !== 'venue_owner' && currentUser.role !== 'admin') {
          navigate('/Home');
          return;
        }

      } catch (e) {
        setUser(null);
        if (!isPublicPage) {
          navigate('/Home');
        }
      } finally {
        setLoading(false);
      }
    });

    checkUserAndStatus();
  }, [currentPageName, isPublicPage, navigate]);

  useEffect(() => {
    // Register service worker for PWA
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname !== 'localhost' && 
       window.location.hostname !== '127.0.0.1' && 
       !window.location.hostname.includes('preview'));
    
    if ('serviceWorker' in navigator && isProduction) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Load 3D model viewer script
    const scriptId = 'model-viewer-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (loading && !isPublicPage) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user && !isPublicPage) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to view this page.</p>
          <Link to={createPageUrl('Home')} className="text-blue-600 hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const footerLinks = [
    { name: 'Terms of Service', page: 'TermsOfService' },
    { name: 'Privacy Policy', page: 'PrivacyPolicy' },
    { name: 'Cookie Policy', page: 'CookiePolicy' },
    { name: 'Cancellation Policy', page: 'CancellationPolicy' },
    { name: 'Community Guidelines', page: 'CommunityGuidelines' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Security and Analytics Components */}
      <SecurityHeaders />
      <Analytics />
      
      {appStatus === 'MAINTENANCE' && <MaintenanceBanner />}
      <NavBar user={user} loading={loading} />
      
      <main className={`flex-grow w-full ${isMobile ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {!isMobile && (
        <footer className="bg-white border-t">
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Party2Go</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Premium venue booking platform connecting event organizers with exceptional spaces across the Middle East.
                </p>
                <p className="text-xs text-gray-500">
                  &copy; {new Date().getFullYear()} Party2Go. All rights reserved.
                </p>
              </div>
              
              {/* Quick Links */}
              <div className="col-span-1">
                <h4 className="text-md font-medium text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Browse')} className="block text-sm text-gray-600 hover:text-gray-900">Browse Venues</Link>
                  <Link to={createPageUrl('BrowseVendors')} className="block text-sm text-gray-600 hover:text-gray-900">Find Vendors</Link>
                  <Link to={createPageUrl('AddVenue')} className="block text-sm text-gray-600 hover:text-gray-900">List Your Venue</Link>
                  <Link to={createPageUrl('SupportCenter')} className="block text-sm text-gray-600 hover:text-gray-900">Support Center</Link>
                </div>
              </div>
              
              {/* Legal */}
              <div className="col-span-1">
                <h4 className="text-md font-medium text-gray-900 mb-4">Legal</h4>
                <div className="space-y-2">
                  {footerLinks.map(link => (
                    <Link key={link.page} to={createPageUrl(link.page)} className="block text-sm text-gray-600 hover:text-gray-900">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Contact & Social */}
              <div className="col-span-1">
                <h4 className="text-md font-medium text-gray-900 mb-4">Connect</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>support@party2go.co</p>
                  <p>Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* PWA and Enhancement Components */}
      <PWAInstaller />
      <OfflineMode />
      <PushNotificationManager />
      <ChatbotAssistant />
      
      {/* Real-time Notifications */}
      <RealtimeNotificationManager user={user} />

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation user={user} />}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LocalizationProvider>
          <LayoutContent key={currentPageName} currentPageName={currentPageName}>
            {children}
          </LayoutContent>
        </LocalizationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
