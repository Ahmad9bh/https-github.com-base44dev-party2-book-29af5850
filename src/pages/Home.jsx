import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { ContentBlock } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MapPin, Star, Calendar, Users, ArrowRight, 
  CheckCircle, Shield, Clock, Award, Play, ChevronRight,
  Sparkles, Heart, TrendingUp, Globe
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function Home() {
  const { currentLanguage, currentCurrency, getLocalizedText } = useLocalization();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVenues: 1200,
    totalBookings: 15000,
    cities: 25,
    avgRating: 4.8
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }

      // Load featured venues
      const featured = await Venue.filter(
        { is_featured: true, status: 'active' }, 
        '-rating', 
        8
      );
      setFeaturedVenues(featured);

      // Load platform stats
      const allVenues = await Venue.filter({ status: 'active' });
      const cities = [...new Set(allVenues.map(v => v.location?.city).filter(Boolean))];
      
      setStats({
        totalVenues: allVenues.length,
        totalBookings: Math.floor(allVenues.length * 12.5), // Estimated
        cities: cities.length,
        avgRating: 4.8
      });

    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${createPageUrl('Browse')}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(createPageUrl('Browse'));
    }
  };

  const features = [
    {
      icon: Shield,
      title: getLocalizedText('verified_venues') || 'Verified Venues',
      description: getLocalizedText('all_venues_verified') || 'All venues are personally verified and vetted by our team'
    },
    {
      icon: Clock,
      title: getLocalizedText('instant_booking') || 'Instant Booking',
      description: getLocalizedText('book_immediately') || 'Book instantly for last-minute events with instant confirmation'
    },
    {
      icon: Award,
      title: getLocalizedText('premium_service') || 'Premium Service',
      description: getLocalizedText('dedicated_support') || 'Dedicated support team available 24/7 for your events'
    },
    {
      icon: Globe,
      title: getLocalizedText('region_coverage') || 'Regional Coverage',
      description: getLocalizedText('across_middle_east') || 'Serving venues across UAE, Saudi Arabia, and the Middle East'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Al-Rashid",
      role: "Event Planner",
      content: "Party2Go made finding the perfect wedding venue effortless. The platform is intuitive and the venues are exactly as described.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b632?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Mohammed Hassan",
      role: "Corporate Events Manager",
      content: "We've booked multiple corporate events through Party2Go. The professionalism and quality are unmatched.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Fatima Al-Zahra",
      role: "Private Client",
      content: "The variety of venues and seamless booking process made my daughter's graduation party unforgettable.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Event Venue</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {getLocalizedText('hero_subtitle') || 'Discover and book premium venues across the Middle East for weddings, corporate events, and celebrations'}
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600" />
                <Input
                  type="text"
                  placeholder={getLocalizedText('search_placeholder') || 'Search venues by name, city, or event type...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-32 h-14 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-2xl shadow-lg"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button variant="outline" size="lg" asChild className="rounded-full border-2 hover:bg-indigo-50">
                <Link to={createPageUrl('Browse')}>
                  <MapPin className="w-5 h-5 mr-2" />
                  Browse All Venues
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-full border-2 hover:bg-purple-50">
                <Link to={createPageUrl('VenueMap')}>
                  <Search className="w-5 h-5 mr-2" />
                  Map View
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-full border-2 hover:bg-green-50">
                <Link to={createPageUrl('BrowseVendors')}>
                  <Users className="w-5 h-5 mr-2" />
                  Find Vendors
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Premium Venues', value: stats.totalVenues.toLocaleString(), icon: MapPin },
                { label: 'Happy Clients', value: stats.totalBookings.toLocaleString(), icon: Users },
                { label: 'Cities Covered', value: `${stats.cities}+`, icon: Globe },
                { label: 'Average Rating', value: stats.avgRating, icon: Star }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getLocalizedText('featured_venues') || 'Featured Premium Venues'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked exceptional venues that guarantee an unforgettable experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVenues.slice(0, 8).map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&auto=format&q=80'}
                      alt={venue.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="secondary" className="rounded-full w-8 h-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
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
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link to={createPageUrl('Browse')}>
                View All Venues
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Party2Go?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make venue booking simple, secure, and stress-free
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6 group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <feature.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of event organizers across the region
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-8 text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center justify-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="text-left">
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Join thousands of satisfied customers who found their ideal venue through Party2Go
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8">
                <Link to={createPageUrl('Browse')} className="flex items-center">
                  Start Browsing Venues
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 rounded-full px-8">
                  <Link to={createPageUrl('AddVenue')} className="flex items-center">
                    List Your Venue
                    <Plus className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}