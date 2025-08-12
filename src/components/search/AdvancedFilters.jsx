import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { formatCurrency, getLocalizedText } from '@/components/common/FormatUtils';

export default function AdvancedFilters({
  filters,
  onFilterChange,
  cities,
  categories,
  amenities,
  onAmenityChange,
  resetFilters,
  currentLanguage,
  currentCurrency
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border mb-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Price Range */}
        <div className="space-y-2">
          <Label>{getLocalizedText('price_range_per_hour', currentLanguage) || 'Price Range (per hour)'}</Label>
          <div className="flex items-center justify-between">
            <span>{formatCurrency(0, currentCurrency, currentLanguage)}</span>
            <span>{formatCurrency(filters.maxPrice, currentCurrency, currentLanguage)}</span>
          </div>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={[filters.maxPrice]}
            onValueChange={(value) => onFilterChange('maxPrice', value[0])}
          />
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="minCapacity">{getLocalizedText('minimum_capacity', currentLanguage) || 'Minimum Capacity'}</Label>
          <Input
            id="minCapacity"
            type="number"
            placeholder={getLocalizedText('e_g_50', currentLanguage) || 'e.g. 50'}
            value={filters.minCapacity}
            onChange={(e) => onFilterChange('minCapacity', e.target.value)}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{getLocalizedText('city', currentLanguage) || 'City'}</Label>
          <Select
            value={filters.city}
            onValueChange={(value) => onFilterChange('city', value)}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder={getLocalizedText('select_city', currentLanguage) || 'Select City'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{getLocalizedText('all_cities', currentLanguage) || 'All Cities'}</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">{getLocalizedText('event_category', currentLanguage) || 'Event Category'}</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder={getLocalizedText('select_category', currentLanguage) || 'Select Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{getLocalizedText('all_categories', currentLanguage) || 'All Categories'}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{getLocalizedText(category, currentLanguage) || category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>{getLocalizedText('amenities', currentLanguage) || 'Amenities'}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {amenities.map(amenity => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={(checked) => onAmenityChange(amenity, checked)}
              />
              <Label htmlFor={amenity} className="text-sm">
                {getLocalizedText(amenity.toLowerCase().replace(/ /g, '_'), currentLanguage) || amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
          <X className="w-4 h-4" />
          {getLocalizedText('reset_filters', currentLanguage) || 'Reset Filters'}
        </Button>
      </div>
    </div>
  );
}