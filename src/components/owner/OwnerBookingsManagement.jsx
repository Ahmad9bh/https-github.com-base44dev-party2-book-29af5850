import React, { useState } from 'react';
import { Booking } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalization } from '@/components/common/LocalizationContext';

export default function OwnerBookingsManagement({ bookings, onUpdate }) {
  const { getLocalizedText } = useLocalization();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState({});

  const handleBookingStatusChange = async (booking, newStatus) => {
    setLoadingStates(prev => ({ ...prev, [booking.id]: true }));
    try {
      await Booking.update(booking.id, { status: newStatus });
      toast({
        title: getLocalizedText('booking_updated_toast_title') || `Booking ${newStatus}`,
        description: getLocalizedText('booking_updated_toast_desc', { contact_name: booking.contact_name, status: newStatus }) || `The booking for ${booking.contact_name} has been ${newStatus}.`,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast({
        title: getLocalizedText('error') || "Error",
        description: getLocalizedText('booking_update_failed_toast_desc') || "Failed to update booking status.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const now = new Date();
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.event_date) >= now);
  const pastBookings = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status) || (b.status === 'confirmed' && new Date(b.event_date) < now));

  const BookingList = ({ bookingList, isPending = false }) => (
    <div className="space-y-4">
      {bookingList.length > 0 ? (
        bookingList.map(booking => (
          <div key={booking.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="font-semibold">{booking.contact_name}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(booking.event_date), 'PPP')} from {booking.start_time} to {booking.end_time}
              </div>
              <div className="text-sm text-gray-500">{booking.guest_count} guests</div>
              <Badge className={`mt-2 ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
            </div>
            {isPending && (
              <div className="flex gap-2 self-end md:self-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBookingStatusChange(booking, 'rejected')}
                  disabled={loadingStates[booking.id]}
                >
                  <X className="w-4 h-4 mr-2" />
                  {getLocalizedText('reject') || 'Reject'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBookingStatusChange(booking, 'confirmed')}
                  disabled={loadingStates[booking.id]}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {getLocalizedText('approve') || 'Approve'}
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">{getLocalizedText('no_bookings_in_category') || 'No bookings in this category.'}</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getLocalizedText('bookings_dashboard_title') || 'Bookings Dashboard'}</CardTitle>
        <CardDescription>{getLocalizedText('bookings_dashboard_subtitle') || 'Manage all bookings for your venues.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">{getLocalizedText('pending') || 'Pending'} <Badge className="ml-2">{pendingBookings.length}</Badge></TabsTrigger>
            <TabsTrigger value="upcoming">{getLocalizedText('upcoming') || 'Upcoming'} <Badge className="ml-2">{upcomingBookings.length}</Badge></TabsTrigger>
            <TabsTrigger value="past">{getLocalizedText('past') || 'Past'} <Badge className="ml-2">{pastBookings.length}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <BookingList bookingList={pendingBookings} isPending={true} />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <BookingList bookingList={upcomingBookings} />
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <BookingList bookingList={pastBookings} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}