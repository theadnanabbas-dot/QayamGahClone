import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Search, Building2, Crown, Award } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

// Types from our schema
interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  pricePerHour: number;
  rating: number;
  images: string[];
  isNew: boolean;
  isFeatured: boolean;
  category: string;
  amenities: string[];
}

interface City {
  id: string;
  name: string;
  slug: string;
  propertyCount: number;
}

// Header Component
function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-primary">Qayamgah</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/property" data-testid="link-properties">
              <span className="text-gray-700 dark:text-gray-300 hover:text-primary">Properties</span>
            </Link>
            <Link href="/hotels" data-testid="link-hotels">
              <span className="text-primary font-medium">Hotels</span>
            </Link>
            <Link href="/neighborhood" data-testid="link-neighborhood">
              <span className="text-gray-700 dark:text-gray-300 hover:text-primary">Neighborhood</span>
            </Link>
            <Link href="/vendor/signup" data-testid="link-vendor-signup">
              <span className="text-gray-700 dark:text-gray-300 hover:text-primary">List Property</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Hero Section for Hotels
function HotelsHeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16" data-testid="section-hotels-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-hotels-hero-title">
              Premium Hotels
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-blue-100" data-testid="text-hotels-hero-subtitle">
            Experience luxury and comfort in Pakistan's finest hotels available for hourly booking
          </p>
          
          <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="flex gap-2">
              <Input 
                type="text" 
                placeholder="Search hotels..."
                className="flex-1"
                data-testid="input-hotels-search"
              />
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-hotels-search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Hotel Features Section
function HotelFeaturesSection() {
  const features = [
    {
      icon: Crown,
      title: "Luxury Accommodations",
      description: "Experience world-class comfort with premium amenities and services"
    },
    {
      icon: Award,
      title: "Award-Winning Service",
      description: "Our hotels maintain the highest standards of hospitality and guest satisfaction"
    },
    {
      icon: Building2,
      title: "Prime Locations",
      description: "Located in the heart of major cities with easy access to business districts"
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-hotel-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-hotel-features-title">
          Why Choose Our Hotels?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center" data-testid={`card-hotel-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Hotel Card Component
function HotelCard({ hotel }: { hotel: Property }) {
  return (
    <Link href={`/property-details/${hotel.slug}`} data-testid={`link-hotel-${hotel.slug}`}>
      <Card className="hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative">
          <img 
            src={hotel.images[0]} 
            alt={hotel.title}
            className="h-56 w-full object-cover rounded-t-lg"
            data-testid={`img-hotel-${hotel.slug}`}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {hotel.isNew && (
              <Badge className="bg-green-500" data-testid={`badge-hotel-new-${hotel.slug}`}>
                New
              </Badge>
            )}
            {hotel.isFeatured && (
              <Badge className="bg-blue-500" data-testid={`badge-hotel-featured-${hotel.slug}`}>
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500" data-testid={`badge-hotel-category-${hotel.slug}`}>
              <Building2 className="h-3 w-3 mr-1" />
              Hotel
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl" data-testid={`text-hotel-title-${hotel.slug}`}>
              {hotel.title}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="font-semibold" data-testid={`text-hotel-rating-${hotel.slug}`}>
                {hotel.rating}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm" data-testid={`text-hotel-address-${hotel.slug}`}>
              {hotel.address}, {hotel.city}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2" data-testid={`text-hotel-description-${hotel.slug}`}>
            {hotel.description}
          </p>
          
          {/* Premium Amenities for Hotels */}
          <div className="flex flex-wrap gap-1 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-hotel-amenity-${hotel.slug}-${index}`}>
                {amenity}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-2xl font-bold text-primary" data-testid={`text-hotel-price-${hotel.slug}`}>
              Rs. {hotel.pricePerHour}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">per hour</div>
              <Button size="sm" className="mt-1" data-testid={`button-hotel-book-${hotel.slug}`}>
                Book Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HotelsListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [filteredHotels, setFilteredHotels] = useState<Property[]>([]);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  // Filter only hotels
  const hotels = properties?.filter(property => 
    property.category.toLowerCase().includes('hotel')
  ) || [];

  // Filter and sort hotels
  useEffect(() => {
    let filtered = [...hotels];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hotel =>
        hotel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // City filter
    if (cityFilter && cityFilter !== "all") {
      filtered = filtered.filter(hotel => 
        hotel.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price-high":
        filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        filtered = filtered.filter(h => h.isFeatured).concat(filtered.filter(h => !h.isFeatured));
        break;
    }

    setFilteredHotels(filtered);
  }, [hotels, searchTerm, cityFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <HotelsHeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <HotelsHeroSection />
      <HotelFeaturesSection />
      
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-6" data-testid="section-hotel-filters">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-hotel-search"
              />
            </div>
            
            <div>
              <Select onValueChange={setCityFilter} data-testid="select-hotel-city">
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select onValueChange={setSortBy} data-testid="select-hotel-sort">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-hotels-page-title">
              Premium Hotels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2" data-testid="text-hotels-results-count">
              {filteredHotels.length} hotels found
              {cityFilter !== "all" && cities && (
                <span> in {cities.find(c => c.slug === cityFilter)?.name || cityFilter}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredHotels.length} of {hotels.length} hotels
            </span>
          </div>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-hotels">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="section-no-hotels">
            <div className="text-gray-400 mb-4">
              <Building2 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setCityFilter("all");
                setSortBy("featured");
              }}
              data-testid="button-clear-hotel-filters"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}