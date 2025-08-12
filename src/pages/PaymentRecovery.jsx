import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// 👇 rename the entity to avoid clashing with the component name
import { PaymentRecovery as PaymentRecoveryEntity } from '@/api/entities';
import { Booking } from '@/api/entities';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CreditCard, RefreshCw } from 'lucide-react';

import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/components/common/FormatUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PaymentRecovery() {
  const [searchParams] = useSearchParams();
  const recoveryId = searchParams.get('recovery_id');

  const [recovery, setRecovery] = useState(null);
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecoveryData();
  }, [recoveryId]);

  const loadRecoveryData = async () => {
    if (!recoveryId) {
      setError('No recovery ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await User.me();

      // 👇 use the aliased entity
      const recoveryData = await PaymentRecoveryEntity.get(recoveryId);

      if (recoveryData.user_id !== currentUser.id) {
        throw new Error('This recovery link is not for your account');
      }

      if (new Date() > new Date(recoveryData.expires_at)) {
        throw new Error('This payment recovery link has expired');
      }

      if (recoveryData.recovery_status === 'recovered') {
        throw new Error('This payment has already been completed');
      }

      setUser(currentUser);
      setRecovery(recoveryData);

      const bookingData = await Booking.get(recoveryData.booking_id);
      const venueData = await Venue.get(bookingData.venue_id);

      setBooking(bookingData);
      setVenue(venueData);
    } catch (err) {
      console.error('Failed to load recovery data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonRecovery = async () => {
    if (confirm('Are you sure you want to abandon this payment? Your booking will be cancelled.')) {
      try {
        // 👇 aliased entity here too
        await PaymentRecoveryEntity.update(recovery.id, { recovery_status: 'abandoned' });

        await Booking.update(booking.id, {
          status: 'cancelled',
          payment_status: 'abandoned'
        });

        alert('Payment recovery abandoned. Your booking has been cancelled.');
        window.location.href = createPageUrl('MyBooki
