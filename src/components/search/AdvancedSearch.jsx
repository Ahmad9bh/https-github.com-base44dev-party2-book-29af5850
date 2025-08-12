import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Users, DollarSign, Star, Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { getLocalizedText, formatCurrency } from '@/components/common/FormatUtils';

const eventTypes = [
  'wedding', 'birthday', 'corporate', 'conference', 'party', 
  'graduation', 'anniversary', 'baby_shower', 'engagement', 'reunion'
];

const commonAmenities = [
  'Parking', 'WiFi', 'Sound System', 'Projector', 'Air Conditioning',
  'Kitchen Access', 'Tables & Chairs', 'Dance Floor', 'Bar Area',
  'Outdoor Space', 'Photography Allowed', 'Decorations Allowed'
];

export default function AdvancedSearch({ 
  onSearch, 
  initialFilters = {}, 
  currentLanguage = 'en',
  currentCurrency = 'USD'
}) {
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    event_type: 'all',
    min_capacity: '',
    max_capacity: '',
    min_price: 0,
    max_price: 1000,
    rating: 0,
    amenities: [],
    event_date: null,
    available_only: false,
    instant_book_only: false,
    featured_only: false,
    venue_type: 'all',
    ...initialFilters
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [appliedFilters, setAppliedFilters] = useState([]);

  useEffect(() => {
    updateAppliedFilters();
  }, [filters]);

  const updateAppliedFilters = () => {
    const applied = [];
    
    if (filters.query) applied.push({ type: 'query', label: `"${filters.query}"`, value: filters.query });
    if (filters.location) applied.push({ type: 'location', label: `📍 ${filters.location}`, value: filters.location });
    if (filters.event_type !== 'all') applied.push({ type: 'event_type', label: `🎉 ${getLocalizedText(filters.event_type, currentLanguage)}`, value: filters.event_type });
    if (filters.min_capacity) applied.push({ type: 'min_capacity', label: `👥 ${filters.min_capacity}+ guests`, value: filters.min_capacity });
    if (filters.max_capacity) applied.push({ type: 'max_capacity', label: `👥 max ${filters.max_capacity}`, value: filters.max_capacity });
    if (filters.min_price > 0) applied.push({ type: 'min_price', label: `💰 min ${formatCurrency(filters.min_price, currentCurrency)}`, value: filters.min_price });
    if (filters.max_price < 1000) applied.push({ type: 'max_price', label: `💰 max ${formatCurrency(filters.max_price, currentCurrency)}`, value: filters.max_price });
    if (filters.rating > 0) applied.push({ type: 'rating', label: `⭐ ${filters.rating}+ stars`, value: filters.rating });
    if (filters.event_date) applied.push({ type: 'event_date', label: `📅 ${format(filters.event_date, 'MMM d, yyyy')}`, value: filters.event_date });
    if (filters.available_only) applied.push({ type: 'available_only', label: '✅ Available only', value: true });
    if (filters.instant_book_only) applied.push({ type: 'instant_book_only', label: '⚡ Instant book', value: true });
    if (filters.featured_only) applied.push({ type: 'featured_only', label: '🌟 Featured only', value: true });
    
    filters.amenities.forEach(amenity => {
      applied.push({ type: 'amenity', label: `🏢 ${amenity}`, value: amenity });
    });

    setAppliedFilters(applied);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.type === 'amenity') {
      handleAmenityToggle(filterToRemove.value);
    } else if (filterToRemove.type === 'available_only' || filterToRemove.type === 'instant_book_only' || filterToRemove.type === 'featured_only') {
      handleFilterChange(filterToRemove.type, false);
    } else {
      const resetValues = {
        query: '', location: '', event_type: 'all', venue_type: 'all',
        min_capacity: '', max_capacity: '', min_price: 0, max_price: 1000,
        rating: 0, event_date: null
      };
      handleFilterChange(filterToRemove.type, resetValues[filterToRemove.type]);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      query: '', location: '', event_type: 'all', min_capacity: '', max_capacity: '',
      min_price: 0, max_price: 1000, rating: 0, amenities: [], event_date: null,
      available_only: false, instant_book_only: false, featured_only: false, venue_type: 'all'
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          {getLocalizedText('advanced_search', currentLanguage)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{getLocalizedText('basic_search', currentLanguage)}</TabsTrigger>
            <TabsTrigger value="location">{getLocalizedText('location_date', currentLanguage)}</TabsTrigger>
            <TabsTrigger value="filters">{getLocalizedText('filters', currentLanguage)}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div>
              <Label>{getLocalizedText('search_keywords', currentLanguage)}</Label>
              <Input
                placeholder={getLocalizedText('venue_name_description', currentLanguage)}
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{getLocalizedText('event_type', currentLanguage)}</Label>
                <Select value={filters.event_type} onValueChange={(value) => handleFilterChange('event_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getLocalizedText('any_event_type', currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getLocalizedText('all_event_types', currentLanguage)}</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getLocalizedText(type, currentLanguage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{getLocalizedText('venue_type', currentLanguage)}</Label>
                <Select value={filters.venue_type} onValueChange={(value) => handleFilterChange('venue_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getLocalizedText('any_type', currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getLocalizedText('all_types', currentLanguage)}</SelectItem>
                    <SelectItem value="indoor">{getLocalizedText('indoor_only', currentLanguage)}</SelectItem>
                    <SelectItem value="outdoor">{getLocalizedText('outdoor_only', currentLanguage)}</SelectItem>
                    <SelectItem value="both">{getLocalizedText('indoor_outdoor', currentLanguage)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-6">
            <div>
              <Label>{getLocalizedText('location', currentLanguage)}</Label>
              <Input
                placeholder={getLocalizedText('city_or_area', currentLanguage)}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label>{getLocalizedText('event_date', currentLanguage)}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.event_date ? format(filters.event_date, 'PPP') : getLocalizedText('select_date', currentLanguage)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.event_date}
                    onSelect={(date) => handleFilterChange('event_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getLocalizedText('min_guests', currentLanguage)}</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={filters.min_capacity}
                  onChange={(e) => handleFilterChange('min_capacity', e.target.value)}
                />
              </div>
              <div>
                <Label>{getLocalizedText('max_guests', currentLanguage)}</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={filters.max_capacity}
                  onChange={(e) => handleFilterChange('max_capacity', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6 mt-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                {getLocalizedText('price_range_per_hour', currentLanguage)}
              </Label>
              <div className="px-3">
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.min_price, filters.max_price]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('min_price', min);
                    handleFilterChange('max_price', max);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{formatCurrency(filters.min_price, currentCurrency)}</span>
                  <span>{formatCurrency(filters.max_price, currentCurrency)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                {getLocalizedText('minimum_rating', currentLanguage)}
              </Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    variant={filters.rating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('rating', rating)}
                    className="flex items-center gap-1"
                  >
                    <Star className="w-4 h-4" />
                    {rating === 0 ? getLocalizedText('any_rating', currentLanguage) : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                {getLocalizedText('amenities', currentLanguage)}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {commonAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available_only"
                  checked={filters.available_only}
                  onCheckedChange={(checked) => handleFilterChange('available_only', checked)}
                />
                <Label htmlFor="available_only">
                  {getLocalizedText('show_only_available', currentLanguage)}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instant_book"
                  checked={filters.instant_book_only}
                  onCheckedChange={(checked) => handleFilterChange('instant_book_only', checked)}
                />
                <Label htmlFor="instant_book">
                  {getLocalizedText('instant_book', currentLanguage)} {getLocalizedText('venues_only', currentLanguage)}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured_only"
                  checked={filters.featured_only}
                  onCheckedChange={(checked) => handleFilterChange('featured_only', checked)}
                />
                <Label htmlFor="featured_only">
                  {getLocalizedText('featured_venues_only', currentLanguage)}
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {getLocalizedText('applied_filters', currentLanguage)}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {getLocalizedText('clear_all', currentLanguage)}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter.label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={clearAllFilters} variant="outline" className="flex-1">
            {getLocalizedText('clear', currentLanguage)}
          </Button>
          <Button onClick={handleSearch} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            <Search className="w-4 h-4 mr-2" />
            {getLocalizedText('search_venues', currentLanguage)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}