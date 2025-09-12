import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
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

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
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
              <span className="text-primary font-medium">Properties</span>
            </Link>
            <Link href="/hotels" data-testid="link-hotels">
              <span className="text-gray-700 dark:text-gray-300 hover:text-primary">Hotels</span>
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

// Search and Filter Component
function SearchFilters({ onSearch, onCityFilter, onCategoryFilter, onSortChange }: {
  onSearch: (term: string) => void;
  onCityFilter: (city: string) => void;
  onCategoryFilter: (category: string) => void;
  onSortChange: (sort: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });
  
  const { data: categories } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm py-6" data-testid="section-search-filters">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                data-testid="input-search"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={handleSearch}
                data-testid="button-search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* City Filter */}
          <div>
            <Select onValueChange={onCityFilter} data-testid="select-city">
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
          
          {/* Category Filter */}
          <div>
            <Select onValueChange={onCategoryFilter} data-testid="select-category">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <div>
            <Select onValueChange={onSortChange} data-testid="select-sort">
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property-details/${property.slug}`} data-testid={`link-property-${property.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="h-48 w-full object-cover rounded-t-lg"
            data-testid={`img-property-${property.slug}`}
          />
          <div className="absolute top-2 left-2 flex gap-2">
            {property.isNew && (
              <Badge className="bg-green-500" data-testid={`badge-new-${property.slug}`}>
                New
              </Badge>
            )}
            {property.isFeatured && (
              <Badge className="bg-blue-500" data-testid={`badge-featured-${property.slug}`}>
                Featured
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2" data-testid={`text-property-title-${property.slug}`}>
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm" data-testid={`text-property-address-${property.slug}`}>
              {property.address}, {property.city}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2" data-testid={`text-property-description-${property.slug}`}>
            {property.description}
          </p>
          
          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-4">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-amenity-${property.slug}-${index}`}>
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs" data-testid={`badge-amenity-more-${property.slug}`}>
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium" data-testid={`text-property-rating-${property.slug}`}>
                {property.rating}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary" data-testid={`text-property-price-${property.slug}`}>
                Rs. {property.pricePerHour}
              </div>
              <div className="text-sm text-gray-500">per hour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PropertyListing() {
  const [, setLocation] = useLocation();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (city) setCityFilter(city);
    if (category) setCategoryFilter(category);
    if (search) setSearchTerm(search);
  }, []);

  // Filter and sort properties
  useEffect(() => {
    if (!properties) return;

    let filtered = [...properties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // City filter
    if (cityFilter && cityFilter !== "all") {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(property => 
        property.category?.toLowerCase().includes(categoryFilter.toLowerCase())
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
      case "newest":
        filtered = filtered.filter(p => p.isNew).concat(filtered.filter(p => !p.isNew));
        break;
      case "featured":
      default:
        filtered = filtered.filter(p => p.isFeatured).concat(filtered.filter(p => !p.isFeatured));
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, cityFilter, categoryFilter, sortBy]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCityFilter = (city: string) => {
    setCityFilter(city);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <SearchFilters 
          onSearch={handleSearch}
          onCityFilter={handleCityFilter}
          onCategoryFilter={handleCategoryFilter}
          onSortChange={handleSortChange}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
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
      <SearchFilters 
        onSearch={handleSearch}
        onCityFilter={handleCityFilter}
        onCategoryFilter={handleCategoryFilter}
        onSortChange={handleSortChange}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Properties
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2" data-testid="text-results-count">
              {filteredProperties.length} properties found
              {cityFilter !== "all" && cities && (
                <span> in {cities.find(c => c.slug === cityFilter)?.name || cityFilter}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProperties.length} of {properties?.length || 0} properties
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-properties">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="section-no-results">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setCityFilter("all");
                setCategoryFilter("all");
                setSortBy("featured");
              }}
              data-testid="button-clear-filters"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}