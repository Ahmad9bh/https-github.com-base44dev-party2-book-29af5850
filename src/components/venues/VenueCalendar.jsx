import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { VenueAvailability } from '@/api/entities';
import { Booking } from '@/api/entities';
import { getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { format } from 'date-fns';

export default function VenueCalendar({ venueId }) {
  const { currentLanguage } = useLocalization();
  const [date, setDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [isBlockDateOpen, setIsBlockDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockReason, setBlockReason] = useState('maintenance');
  const [blockNotes, setBlockNotes] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    loadCalendarData();
  }, [venueId]);

  const loadCalendarData = async () => {
    try {
      const bookings = await Booking.filter({ venue_id: venueId, status: 'confirmed' });
      setBookedDates(bookings.map(b => new Date(b.event_date)));

      const availabilities = await VenueAvailability.filter({ venue_id: venueId });
      setBlockedDates(availabilities.map(a => new Date(a.blocked_date)));
    } catch (error) {
      console.error('Failed to load calendar data', error);
      toast({ title: getLocalizedText('failed_to_load_calendar', currentLanguage), variant: 'destructive' });
    }
  };

  const handleDayClick = (day, modifiers) => {
    if (modifiers.booked || modifiers.blocked) return;
    setSelectedDate(day);
    setIsBlockDateOpen(true);
  };
  
  const handleUnblockDate = async (dateToUnblock) => {
      try {
        const blockedEntry = await VenueAvailability.filter({ venue_id: venueId, blocked_date: format(dateToUnblock, 'yyyy-MM-dd') });
        if(blockedEntry.length > 0) {
           await VenueAvailability.delete(blockedEntry[0].id);
           toast({ title: getLocalizedText('date_unblocked_success', currentLanguage) });
           loadCalendarData();
        }
      } catch (error) {
          console.error("Failed to unblock date:", error);
          toast({ title: getLocalizedText('failed_to_unblock_date', currentLanguage), variant: 'destructive' });
      }
  };


  const handleBlockDate = async () => {
    try {
      await VenueAvailability.create({
        venue_id: venueId,
        blocked_date: format(selectedDate, 'yyyy-MM-dd'),
        reason: blockReason,
        notes: blockNotes,
        is_full_day: isFullDay
      });
      toast({ title: getLocalizedText('date_blocked_success', currentLanguage) });
      setIsBlockDateOpen(false);
      loadCalendarData();
    } catch (error) {
      console.error('Failed to block date:', error);
      toast({ title: getLocalizedText('failed_to_block_date', currentLanguage), variant: 'destructive' });
    }
  };
  
  const modifiers = {
      booked: bookedDates,
      blocked: blockedDates,
  };
  
  const modifiersStyles = {
      booked: { backgroundColor: '#ef4444', color: 'white', opacity: 0.8 },
      blocked: { backgroundColor: '#6b7280', color: 'white', opacity: 0.6, textDecoration: 'line-through' }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{getLocalizedText('availability_calendar', currentLanguage)}</h3>
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>{getLocalizedText('legend_available', currentLanguage)}</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>{getLocalizedText('legend_booked', currentLanguage)}</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-500"></div>{getLocalizedText('legend_blocked', currentLanguage)}</div>
            </div>
        </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        onDayClick={handleDayClick}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />
      {blockedDates.some(d => d.getTime() === date.getTime()) && (
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleUnblockDate(date)}>
              {getLocalizedText('unblock', currentLanguage)} {format(date, "PPP")}
          </Button>
      )}

      <Dialog open={isBlockDateOpen} onOpenChange={setIsBlockDateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getLocalizedText('block_date_title', currentLanguage)}: {selectedDate && format(selectedDate, "PPP")}</DialogTitle>
            <DialogDescription>{getLocalizedText('block_date_description', currentLanguage) || "Set this date as unavailable for bookings."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={blockReason} onValueChange={setBlockReason}>
              <SelectTrigger>
                <SelectValue placeholder={getLocalizedText('reason', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">{getLocalizedText('maintenance', currentLanguage)}</SelectItem>
                <SelectItem value="private_event">{getLocalizedText('private_event', currentLanguage)}</SelectItem>
                <SelectItem value="holiday">{getLocalizedText('holiday', currentLanguage)}</SelectItem>
                <SelectItem value="owner_unavailable">{getLocalizedText('owner_unavailable', currentLanguage)}</SelectItem>
              </SelectContent>
            </Select>
            <Textarea 
              placeholder={getLocalizedText('notes_optional', currentLanguage)}
              value={blockNotes}
              onChange={(e) => setBlockNotes(e.target.value)}
            />
             <div className="flex items-center space-x-2">
                <Checkbox id="full-day" checked={isFullDay} onCheckedChange={setIsFullDay} />
                <label htmlFor="full-day" className="text-sm font-medium leading-none">
                    {getLocalizedText('block_entire_day', currentLanguage)}
                </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDateOpen(false)}>{getLocalizedText('cancel', currentLanguage)}</Button>
            <Button onClick={handleBlockDate}>{getLocalizedText('block_date', currentLanguage)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}