import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, MapPin, Users, DollarSign, Star } from 'lucide-react';
import { getLocalizedText, formatCurrency } from '@/components/common/FormatUtils';

export default function MobileSearch({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  cities, 
  categories,
  amenities,
  onAmenityChange,
  sortOption,
  onSortChange,
  resetFilters,
  currentLanguage = 'en',
  currentCurrency = 'USD'
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
    updateActiveFilters({ ...filters, [key]: value });
  };

  const updateActiveFilters = (currentFilters) => {
    const active = [];
    
    if (currentFilters.category !== 'all') {
      active.push({ type: 'category', label: getLocalizedText(currentFilters.category, currentLanguage) });
    }
    if (currentFilters.city !== 'all') {
      active.push({ type: 'city', label: `📍 ${currentFilters.city}` });
    }
    if (currentFilters.minCapacity) {
      active.push({ type: 'capacity', label: `👥 ${currentFilters.minCapacity}+ guests` });
    }
    if (currentFilters.maxPrice < 1000) {
      active.push({ type: 'price', label: `💰 max ${formatCurrency(currentFilters.maxPrice, currentCurrency)}` });
    }
    if (currentFilters.amenities.length > 0) {
      active.push({ type: 'amenities', label: `🏢 ${currentFilters.amenities.length} amenities` });
    }
    
    setActiveFilters(active);
  };

  const clearAllFilters = () => {
    resetFilters();
    setActiveFilters([]);
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={getLocalizedText('search_venues_placeholder', currentLanguage)}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Venues</SheetTitle>
            </SheetHeader>
            
            <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Location Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <label className="font-medium">{getLocalizedText('location', currentLanguage)}</label>
                </div>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getLocalizedText('all_cities', currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getLocalizedText('all_cities', currentLanguage)}</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Category */}
              <div className="space-y-3">
                <label className="font-medium">{getLocalizedText('event_type', currentLanguage)}</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getLocalizedText('all_categories', currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getLocalizedText('all_categories', currentLanguage)}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {getLocalizedText(category, currentLanguage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <label className="font-medium">{getLocalizedText('capacity', currentLanguage)}</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min guests"
                      value={filters.minCapacity}
                      onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max guests"
                      value={filters.maxCapacity}
                      onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <label className="font-medium">{getLocalizedText('price_per_hour', currentLanguage)}</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <label className="font-medium">{getLocalizedText('amenities', currentLanguage)}</label>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.slice(0, 8).map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => onAmenityChange(amenity, checked)}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="font-medium">{getLocalizedText('sort_by', currentLanguage)}</label>
                <Select value={sortOption} onValueChange={onSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{getLocalizedText('sort_featured', currentLanguage)}</SelectItem>
                    <SelectItem value="price_asc">{getLocalizedText('sort_price_asc', currentLanguage)}</SelectItem>
                    <SelectItem value="price_desc">{getLocalizedText('sort_price_desc', currentLanguage)}</SelectItem>
                    <SelectItem value="rating">{getLocalizedText('sort_rating', currentLanguage)}</SelectItem>
                    <SelectItem value="newest">{getLocalizedText('sort_newest', currentLanguage)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                {getLocalizedText('reset', currentLanguage)}
              </Button>
              <Button onClick={() => setIsFiltersOpen(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Quick Access */}
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price_asc">Price ↑</SelectItem>
            <SelectItem value="price_desc">Price ↓</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-xs">{filter.label}</span>
              <button
                onClick={() => {
                  // Handle individual filter removal
                  if (filter.type === 'category') handleFilterChange('category', 'all');
                  if (filter.type === 'city') handleFilterChange('city', 'all');
                  // Add more specific removals as needed
                }}
                className="hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}