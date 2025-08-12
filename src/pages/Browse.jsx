import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';
import { UserFavorite } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, SlidersHorizontal, MapPin, Star, Users, Heart,
  Filter, Grid, List, Map, ChevronDown, X, Sparkles,
  Calendar, Camera, Wifi, Car, Music, Utensils, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = [
  'Wedding Venues', 'Corporate Spaces', 'Party Halls', 'Conference Centers',
  'Outdoor Venues', 'Luxury Venues', 'Budget Friendly', 'Banquet Halls'
];

const AMENITIES = [
  { icon: Wifi, label: 'Wi-Fi' },
  { icon: Car, label: 'Parking' },
  { icon: Music, label: 'Sound System' },
  { icon: Utensils, label: 'Catering' },
  { icon: Camera, label: 'Photography' },
  { icon: Shield, label: 'Security' }
];

export default function Browse() {
  const { currentCurrency, getLocalizedText } = useLocalization();
  const { toast } = useToast();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [capacityRange, setCapacityRange] = useState([1, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState(new Set());
  const [sortBy, setSortBy] = useState('featured');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    loadData();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [venues, searchQuery, selectedCity, selectedCategory, priceRange, capacityRange, selectedAmenities, sortBy, minRating]);

  const loadData = async () => {
    try {
      // Check if user is logged in
      try {
        const userData = await User.me();
        setUser(userData);
        // Load user favorites
        const userFavorites = await UserFavorite.filter({ user_id: userData.id });
        setFavorites(new Set(userFavorites.map(f => f.venue_id)));
      } catch (e) {
        setUser(null);
      }

      // Load venues
      const allVenues = await Venue.filter({ status: 'active' }, '-rating');
      setVenues(allVenues);
    } catch (error) {
      console.error('Failed to load venues:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load venues. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...venues];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venue =>
        venue.title?.toLowerCase().includes(query) ||
        venue.location?.city?.toLowerCase().includes(query) ||
        venue.category?.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(venue => venue.location?.city === selectedCity);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(venue =>
        venue.category?.includes(selectedCategory)
      );
    }

    // Price filter
    filtered = filtered.filter(venue =>
      venue.price_per_hour >= priceRange[0] && venue.price_per_hour <= priceRange[1]
    );

    // Capacity filter
    filtered = filtered.filter(venue =>
      venue.capacity >= capacityRange[0] && venue.capacity <= capacityRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(venue => (venue.rating || 0) >= minRating);
    }

    // Amenities filter
    if (selectedAmenities.size > 0) {
      filtered = filtered.filter(venue =>
        Array.from(selectedAmenities).every(amenity =>
          venue.amenities?.includes(amenity)
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price_per_hour - b.price_per_hour);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price_per_hour - a.price_per_hour);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'capacity':
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      default: // featured
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    setFilteredVenues(filtered);
  };

  const toggleFavorite = async (venueId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites."
      });
      return;
    }

    try {
      if (favorites.has(venueId)) {
        const favorite = await UserFavorite.filter({ user_id: user.id, venue_id: venueId });
        if (favorite.length > 0) {
          await UserFavorite.delete(favorite[0].id);
        }
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(venueId);
          return newSet;
        });
      } else {
        await UserFavorite.create({ user_id: user.id, venue_id: venueId });
        setFavorites(prev => new Set([...prev, venueId]));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites."
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setCapacityRange([1, 1000]);
    setSelectedAmenities(new Set());
    setMinRating(0);
    setSortBy('featured');
  };

  const getUniqueCities = () => {
    return [...new Set(venues.map(v => v.location?.city).filter(Boolean))].sort();
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCity,
    selectedCategory,
    priceRange[0] > 0 || priceRange[1] < 10000,
    capacityRange[0] > 1 || capacityRange[1] < 1000,
    selectedAmenities.size > 0,
    minRating > 0
  ].filter(Boolean).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getLocalizedText('browse_venues') || 'Browse Venues'}
              </h1>
              <p className="text-gray-600">
                {filteredVenues.length} venues found {searchQuery && `for "${searchQuery}"`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-red-500">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Map View */}
              <Button variant="outline" asChild>
                <Link to={createPageUrl('VenueMap')}>
                  <Map className="w-4 h-4 mr-2" />
                  Map View
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search venues by name, city, or event type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* City Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>All Cities</SelectItem>
                          {getUniqueCities().map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>All Categories</SelectItem>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Price Range (per hour)
                      </label>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={10000}
                          min={0}
                          step={100}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatCurrency(priceRange[0], 'USD', currentCurrency)}</span>
                          <span>{formatCurrency(priceRange[1], 'USD', currentCurrency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Range */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Guest Capacity
                      </label>
                      <div className="px-2">
                        <Slider
                          value={capacityRange}
                          onValueChange={setCapacityRange}
                          max={1000}
                          min={1}
                          step={10}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{capacityRange[0]} guests</span>
                          <span>{capacityRange[1]} guests</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Minimum Rating
                      </label>
                      <div className="flex gap-2">
                        {[0, 3, 4, 4.5].map(rating => (
                          <Button
                            key={rating}
                            variant={minRating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMinRating(rating)}
                          >
                            {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {AMENITIES.map(amenity => (
                          <Button
                            key={amenity.label}
                            variant={selectedAmenities.has(amenity.label) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedAmenities(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(amenity.label)) {
                                  newSet.delete(amenity.label);
                                } else {
                                  newSet.add(amenity.label);
                                }
                                return newSet;
                              });
                            }}
                            className="justify-start h-10"
                          >
                            <amenity.icon className="w-4 h-4 mr-2" />
                            <span className="text-xs">{amenity.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="capacity">Largest Capacity</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Venues Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              <AnimatePresence>
                {filteredVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <VenueCard 
                        venue={venue} 
                        isFavorite={favorites.has(venue.id)}
                        onToggleFavorite={() => toggleFavorite(venue.id)}
                        currentCurrency={currentCurrency}
                      />
                    ) : (
                      <VenueListItem 
                        venue={venue} 
                        isFavorite={favorites.has(venue.id)}
                        onToggleFavorite={() => toggleFavorite(venue.id)}
                        currentCurrency={currentCurrency}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredVenues.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Venue Card Component
const VenueCard = ({ venue, isFavorite, onToggleFavorite, currentCurrency }) => (
  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
    <div className="relative">
      <img
        src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
        alt={venue.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-4 left-4 flex gap-2">
        {venue.is_featured && (
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {venue.instant_book_enabled && (
          <Badge className="bg-green-500 text-white">
            <Calendar className="w-3 h-3 mr-1" />
            Instant Book
          </Badge>
        )}
      </div>
      <Button 
        size="sm" 
        variant="secondary" 
        className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
        onClick={onToggleFavorite}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>
      {venue.rating && (
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {venue.title}
        </h3>
      </div>
      <div className="flex items-center text-gray-600 mb-3">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">{venue.location?.city}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span className="text-sm">Up to {venue.capacity} guests</span>
        </div>
        <div className="text-right">
          <div className="font-bold text-indigo-600">
            {formatCurrency(venue.price_per_hour, venue.currency, currentCurrency)}
          </div>
          <div className="text-xs text-gray-500">per hour</div>
        </div>
      </div>
      <Button asChild className="w-full group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600">
        <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
          View Details
        </Link>
      </Button>
    </CardContent>
  </Card>
);

// Venue List Item Component
const VenueListItem = ({ venue, isFavorite, onToggleFavorite, currentCurrency }) => (
  <Card className="group hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex gap-6">
        <div className="relative w-48 h-32 flex-shrink-0">
          <img
            src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
            alt={venue.title}
            className="w-full h-full object-cover rounded-lg"
          />
          {venue.is_featured && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600">
              {venue.title}
            </h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onToggleFavorite}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{venue.location?.city}</span>
            {venue.rating && (
              <>
                <Star className="w-4 h-4 ml-4 mr-1 text-yellow-400 fill-current" />
                <span>{venue.rating.toFixed(1)}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Up to {venue.capacity} guests
              </div>
              {venue.category && venue.category.length > 0 && (
                <Badge variant="outline">{venue.category[0]}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold text-lg text-indigo-600">
                  {formatCurrency(venue.price_per_hour, venue.currency, currentCurrency)}
                </div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>
              <Button asChild>
                <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);