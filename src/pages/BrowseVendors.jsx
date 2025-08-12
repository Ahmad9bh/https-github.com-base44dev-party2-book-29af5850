import React, { useState, useEffect } from 'react';
import { Vendor } from '@/api/entities';
import { VendorReview } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Clock, 
  Award,
  Filter,
  Camera,
  Music,
  ChefHat,
  Palette,
  Car,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useToast } from '@/components/ui/use-toast';

const serviceIcons = {
  catering: ChefHat,
  photography: Camera,
  dj: Music,
  decorations: Palette,
  entertainment: Users,
  transportation: Car,
  security: Shield,
  planning: Users,
  cleaning: Users,
  other: Users
};

export default function BrowseVendors() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const { toast } = useToast();

  useEffect(() => {
    loadVendors();
    checkUser();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendors, searchTerm, selectedServiceType, selectedCity, sortBy]);

  const checkUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const fetchedVendors = await Vendor.filter({ status: 'active' }, '-rating', 100);
      
      // Load ratings for each vendor
      const vendorsWithReviews = await Promise.all(
        fetchedVendors.map(async (vendor) => {
          try {
            const reviews = await VendorReview.filter({ vendor_id: vendor.id });
            const avgRating = reviews.length > 0 
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
              : 0;
            
            return {
              ...vendor,
              rating: avgRating,
              total_reviews: reviews.length
            };
          } catch (error) {
            return vendor;
          }
        })
      );

      setVendors(vendorsWithReviews);
    } catch (error) {
      console.error('Failed to load vendors:', error);
      toast({
        title: "Error loading vendors",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Service type filter
    if (selectedServiceType !== 'all') {
      filtered = filtered.filter(vendor => vendor.service_type === selectedServiceType);
    }

    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(vendor => vendor.city === selectedCity);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
        break;
      case 'reviews':
        filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
      case 'experience':
        filtered.sort((a, b) => (b.years_in_business || 0) - (a.years_in_business || 0));
        break;
      default:
        break;
    }

    setFilteredVendors(filtered);
  };

  const getServiceTypes = () => {
    const types = [...new Set(vendors.map(vendor => vendor.service_type))];
    return types.sort();
  };

  const getCities = () => {
    const cities = [...new Set(vendors.map(vendor => vendor.city).filter(Boolean))];
    return cities.sort();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Vendors</h1>
              <p className="text-gray-600 mt-2">
                Discover professional vendors to make your event perfect
              </p>
            </div>
            {user && (
              <Link to={createPageUrl('AddVendor')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Vendor
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search vendors by name, service, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {getServiceTypes().map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {getCities().map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria.</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedServiceType('all');
              setSelectedCity('all');
            }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VendorCard({ vendor }) {
  const ServiceIcon = serviceIcons[vendor.service_type] || Users;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={vendor.profile_image_url} alt={vendor.company_name} />
              <AvatarFallback>
                <ServiceIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{vendor.company_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {vendor.service_type.charAt(0).toUpperCase() + vendor.service_type.slice(1)}
                </Badge>
                {vendor.is_verified && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {vendor.description}
        </p>

        {vendor.specialties && vendor.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vendor.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {vendor.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{vendor.specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{vendor.city}</span>
          </div>
          {vendor.years_in_business && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{vendor.years_in_business}+ years</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {vendor.rating > 0 ? (
              <>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({vendor.total_reviews} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">New vendor</span>
            )}
          </div>
          
          {vendor.base_price && (
            <div className="text-right">
              <div className="font-semibold text-indigo-600">
                From {formatCurrency(vendor.base_price, vendor.currency)}
              </div>
              <div className="text-xs text-gray-500">
                {vendor.pricing_model === 'per_hour' ? '/hour' : 
                 vendor.pricing_model === 'per_person' ? '/person' : '/event'}
              </div>
            </div>
          )}
        </div>

        <Link to={createPageUrl(`VendorProfile?id=${vendor.id}`)}>
          <Button className="w-full">View Profile</Button>
        </Link>
      </CardContent>
    </Card>
  );
}