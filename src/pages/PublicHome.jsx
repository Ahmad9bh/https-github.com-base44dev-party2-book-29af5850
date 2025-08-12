import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { Search, MapPin, Shield, Star, Users, Heart, Clock } from 'lucide-react';

// Completely standalone homepage with ZERO dependencies on auth or user context
export default function PublicHome() {
  // Set page title immediately
  React.useEffect(() => {
    document.title = 'Party2Go | Premium Venue Booking Platform';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find and book perfect venues for weddings, corporate events, birthdays, and celebrations worldwide.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Party2Go</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Browse')}>
                <Button variant="ghost">Browse Venues</Button>
              </Link>
              <Button onClick={() => window.location.href = 'https://base44.app/login'}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Perfect Venues for Every Occasion
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover exceptional venues worldwide for weddings, corporate events, and celebrations. Book instantly with trusted venue partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to={createPageUrl('Browse')}>
                <Button size="lg" className="text-lg px-8 py-4 bg-indigo-600 hover:bg-indigo-700">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Venues
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Verified Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Explore top venues in major cities around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop"
                  alt="Dubai"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Dubai</h3>
                  <p className="text-sm opacity-90">UAE</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Premium venues</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                  alt="Riyadh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Riyadh</h3>
                  <p className="text-sm opacity-90">Saudi Arabia</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Premium venues</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1539650116574-75c0c6d73ddc?w=400&h=300&fit=crop"
                  alt="Doha"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Doha</h3>
                  <p className="text-sm opacity-90">Qatar</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Premium venues</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1580837119756-563d608dd119?w=400&h=300&fit=crop"
                  alt="Kuwait"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Kuwait</h3>
                  <p className="text-sm opacity-90">Kuwait</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Premium venues</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Party2Go?
            </h2>
            <p className="text-xl text-gray-600">
              We make venue booking easy, reliable, and enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-indigo-600" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Smart Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find perfect venues using advanced filters and smart algorithms
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Secure Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Secure payments with full protection for your data and transactions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Dedicated Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Dedicated support team to ensure your event success at every step
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-indigo-200">Premium Venues</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-indigo-200">Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-indigo-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-indigo-200">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Venue?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who found their dream venues with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Browse')}>
              <Button size="lg" className="text-lg px-8 py-4 bg-indigo-600 hover:bg-indigo-700">
                Search Venues Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Party2Go. All rights reserved.</p>
          <p className="mt-2">Contact: support@party2go.co</p>
        </div>
      </footer>
    </div>
  );
}