import React, { useEffect } from 'react';

// Initialize analytics (Plausible or GA4)
const Analytics = () => {
  useEffect(() => {
    // Plausible Analytics (recommended for privacy compliance)
    if (typeof window !== 'undefined' && !window.plausible) {
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', window.location.hostname);
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);

      // Define plausible function
      window.plausible = window.plausible || function() {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
    }

    // Track page view
    if (window.plausible) {
      window.plausible('pageview');
    }
  }, []);

  return null;
};

// Custom event tracking
export const trackEvent = (eventName, props = {}) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
};

// Common event trackers
export const trackVenueView = (venueId, venueName) => {
  trackEvent('Venue View', { venue_id: venueId, venue_name: venueName });
};

export const trackBookingAttempt = (venueId, amount) => {
  trackEvent('Booking Attempt', { venue_id: venueId, amount });
};

export const trackBookingComplete = (venueId, amount, currency) => {
  trackEvent('Booking Complete', { venue_id: venueId, amount, currency });
};

export const trackSearch = (query, resultsCount) => {
  trackEvent('Search', { query, results_count: resultsCount });
};

export default Analytics;