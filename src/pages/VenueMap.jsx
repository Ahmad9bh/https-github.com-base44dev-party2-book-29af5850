import React, { useState, useEffect, useRef } from 'react';
import { Venue } from '@/api/entities';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Users, Star, Navigation, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, convertCurrency, getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map controller to handle location updates
function MapController({ center, venues, onVenueSelect }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);

  return null;
}

// Custom marker component for venues
function VenueMarker({ venue, onSelect, currentCurrency, currentLanguage }) {
  const convertedPrice = convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency);
  const venueCategories = Array.isArray(venue.category) ? venue.category : [];

  return (
    <Marker 
      position={[venue.location.latitude, venue.location.longitude]}
      eventHandlers={{
        click: () => onSelect(venue)
      }}
    >
      <Popup>
        <div className="w-64">
          {venue.images && venue.images[0] && (
            <img 
              src={venue.images[0]} 
              alt={venue.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <h3 className="font-semibold text-lg mb-1">{venue.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{venue.description}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{venue.location?.city}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {currentLanguage === 'ar' ? `حتى ${venue.capacity} ضيف` : `Up to ${venue.capacity} guests`}
            </span>
          </div>

          {venueCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {venueCategories.slice(0, 2).map((cat, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {getLocalizedText(cat, currentLanguage)}
                </Badge>
              ))}
              {venueCategories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{venueCategories.length - 2} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(convertedPrice, currentCurrency, currentLanguage)}/{currentLanguage === 'ar' ? 'ساعة' : 'hour'}
            </div>
            <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
              <Button size="sm">
                {currentLanguage === 'ar' ? 'عرض' : 'View'}
              </Button>
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function VenueMap() {
  const { currentLanguage, currentCurrency } = useLocalization();
  
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]); // Default to Riyadh
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    maxPrice: '',
    minCapacity: ''
  });
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadVenues();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [venues, searchQuery, filters]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const activeVenues = await Venue.filter({ status: 'active' });
      
      // Filter venues that have valid coordinates
      const venuesWithCoords = activeVenues.filter(venue => 
        venue.location && 
        venue.location.latitude && 
        venue.location.longitude &&
        !isNaN(venue.location.latitude) &&
        !isNaN(venue.location.longitude)
      );
      
      setVenues(venuesWithCoords);
      
      // Set map center to the first venue if available
      if (venuesWithCoords.length > 0) {
        const firstVenue = venuesWithCoords[0];
        setMapCenter([firstVenue.location.latitude, firstVenue.location.longitude]);
      }
      
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userLoc);
          setMapCenter(userLoc);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use default location if geolocation fails
        }
      );
    }
  };

  const applyFilters = () => {
    let filtered = [...venues];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(venue => {
        const venueCategories = Array.isArray(venue.category) ? venue.category : [];
        return venueCategories.includes(filters.category);
      });
    }

    // Price filter
    if (filters.maxPrice) {
      filtered = filtered.filter(venue => {
        const convertedPrice = convertCurrency(venue.price_per_hour, venue.currency || 'USD', currentCurrency);
        return convertedPrice <= parseFloat(filters.maxPrice);
      });
    }

    // Capacity filter
    if (filters.minCapacity) {
      filtered = filtered.filter(venue => venue.capacity >= parseInt(filters.minCapacity));
    }

    setFilteredVenues(filtered);
  };

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
    setMapCenter([venue.location.latitude, venue.location.longitude]);
  };

  const searchByCity = (cityName) => {
    const cityVenues = filteredVenues.filter(venue => 
      venue.location?.city?.toLowerCase().includes(cityName.toLowerCase())
    );
    
    if (cityVenues.length > 0) {
      const firstVenue = cityVenues[0];
      setMapCenter([firstVenue.location.latitude, firstVenue.location.longitude]);
    }
  };

  const getEventCategories = () => {
    const categories = [...new Set(venues.flatMap(venue =>
      Array.isArray(venue.category) ? venue.category : []
    ))];
    return categories.sort();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getLocalizedText('map_view', currentLanguage)}
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={currentLanguage === 'ar' ? 'ابحث عن الأماكن أو المدن...' : 'Search venues or cities...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchByCity(e.target.value);
                  }
                }}
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={currentLanguage === 'ar' ? 'نوع المناسبة' : 'Event Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{currentLanguage === 'ar' ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                {getEventCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {getLocalizedText(category, currentLanguage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder={currentLanguage === 'ar' ? 'أقصى سعر' : 'Max Price'}
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-32"
            />

            <Input
              type="number"
              placeholder={currentLanguage === 'ar' ? 'أدنى سعة' : 'Min Capacity'}
              value={filters.minCapacity}
              onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
              className="w-32"
            />

            {userLocation && (
              <Button
                variant="outline"
                onClick={() => setMapCenter(userLocation)}
                className="flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {currentLanguage === 'ar' ? 'موقعي' : 'My Location'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={10}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            center={mapCenter} 
            venues={filteredVenues}
            onVenueSelect={handleVenueSelect}
          />

          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center">
                  <Navigation className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">
                    {currentLanguage === 'ar' ? 'موقعك الحالي' : 'Your Current Location'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Venue markers */}
          {filteredVenues.map(venue => (
            <VenueMarker
              key={venue.id}
              venue={venue}
              onSelect={handleVenueSelect}
              currentCurrency={currentCurrency}
              currentLanguage={currentLanguage}
            />
          ))}
        </MapContainer>

        {/* Results counter */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {filteredVenues.length} {currentLanguage === 'ar' ? 'مكان موجود' : 'venues found'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h3 className="font-semibold mb-2 text-sm">
            {currentLanguage === 'ar' ? 'المفتاح' : 'Legend'}
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{currentLanguage === 'ar' ? 'الأماكن المتاحة' : 'Available Venues'}</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>{currentLanguage === 'ar' ? 'موقعك' : 'Your Location'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}