import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  MapPin, 
  Star, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Users, 
  Calendar, 
  Clock, 
  User,
  Map,
  Grid3X3,
  Heart,
  Share2,
  ChevronDown,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

// Types from our schema - matching actual API response
interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  cityId: string;
  categoryId: string;
  ownerId: string;
  rating: number;
  images: string[];
  mainImage: string;
  isFeature: boolean; // Note: API uses 'isFeature' not 'isFeatured'
  isActive: boolean;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  phoneNumber?: string;
  roomCategoriesCount: number;
  createdAt: string;
  // Computed fields for display
  city?: string; // Will be resolved from cityId
  category?: string; // Will be resolved from categoryId
  pricePerHour?: number; // Will be computed from room categories
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

// Header Component - ByHours Style
function ListingsHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40" data-testid="header-listings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold" style={{ color: '#CC2B47' }}>Qayamgah</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/property" data-testid="link-properties">
                <span className="text-gray-700 hover:text-[#CC2B47] font-medium">Properties</span>
              </Link>
              <Link href="/hotels" data-testid="link-hotels">
                <span className="text-gray-700 hover:text-[#CC2B47] font-medium">Hotels</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="button-help">
              <span className="text-gray-700">Help</span>
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-login">
              <User className="h-4 w-4 mr-2" />
              <span className="text-gray-700">Login</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Enhanced Search & Filter Bar - ByHours Style
function EnhancedSearchFilters({ 
  onLocationChange, 
  onDateChange, 
  onHoursChange, 
  onGuestsChange, 
  onPriceChange,
  onCategoryChange,
  onSearch,
  filters,
  isFiltersOpen,
  onToggleFilters
}: {
  onLocationChange: (location: string) => void;
  onDateChange: (date: string) => void;
  onHoursChange: (hours: string) => void;
  onGuestsChange: (guests: number) => void;
  onPriceChange: (price: number[]) => void;
  onCategoryChange: (category: string) => void;
  onSearch: () => void;
  filters: any;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
}) {
  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });
  
  const { data: categories } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  return (
    <div className="bg-white border-b border-gray-200" data-testid="section-enhanced-search">
      {/* Main Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Location */}
            <div className="p-4">
              <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Where</label>
              <Select value={filters.location} onValueChange={onLocationChange} data-testid="select-location">
                <SelectTrigger className="border-0 p-0 h-auto shadow-none">
                  <SelectValue placeholder="Search destinations" />
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
            
            {/* Check-in Date */}
            <div className="p-4">
              <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Check-in</label>
              <Input 
                type="date" 
                value={filters.checkInDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="border-0 p-0 h-auto shadow-none"
                data-testid="input-checkin-date"
              />
            </div>
            
            {/* Hours */}
            <div className="p-4">
              <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Hours</label>
              <Select value={filters.hours} onValueChange={onHoursChange} data-testid="select-hours">
                <SelectTrigger className="border-0 p-0 h-auto shadow-none">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3h">3 hours</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="12h">12 hours</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Guests */}
            <div className="p-4">
              <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Guests</label>
              <Select value={filters.guests.toString()} onValueChange={(value) => onGuestsChange(parseInt(value))} data-testid="select-guests">
                <SelectTrigger className="border-0 p-0 h-auto shadow-none">
                  <SelectValue placeholder="Add guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} guest{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filters Toggle */}
            <div className="p-4">
              <Button 
                variant="ghost" 
                onClick={onToggleFilters}
                className="h-auto p-0 text-[#252525] hover:text-[#CC2B47]"
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {isFiltersOpen && <X className="h-4 w-4 ml-2" />}
              </Button>
            </div>
            
            {/* Search Button */}
            <div className="p-4">
              <Button 
                onClick={onSearch}
                className="w-full bg-[#CC2B47] hover:bg-[#AD2D43] text-white"
                data-testid="button-search"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Extended Filters */}
      {isFiltersOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4" data-testid="extended-filters">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  Price per hour: Rs. {filters.priceRange[0]} - Rs. {filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={onPriceChange}
                  max={10000}
                  min={500}
                  step={250}
                  className="w-full"
                  data-testid="slider-price"
                />
              </div>
              
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Property Type</label>
                <Select value={filters.category} onValueChange={onCategoryChange} data-testid="select-category">
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Minimum Rating</label>
                <Select value={filters.minRating} onValueChange={(value) => filters.minRating = value} data-testid="select-rating">
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Property Card Component - ByHours Style
function PropertyListingCard({ property }: { property: Property }) {
  const [isFavorited, setIsFavorited] = useState(false);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-property-${property.slug}`}>
      <div className="relative">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="h-48 w-full object-cover"
          data-testid={`img-property-${property.slug}`}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isActive && (
            <Badge className="bg-green-500 text-white" data-testid={`badge-active-${property.slug}`}>
              Active
            </Badge>
          )}
          {property.isFeature && (
            <Badge className="bg-[#CC2B47] text-white" data-testid={`badge-featured-${property.slug}`}>
              Featured
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => setIsFavorited(!isFavorited)}
            data-testid={`button-favorite-${property.slug}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            data-testid={`button-share-${property.slug}`}
          >
            <Share2 className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-[#252525] leading-tight" data-testid={`text-property-title-${property.slug}`}>
            {property.title}
          </h3>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-[#252525]" data-testid={`text-property-rating-${property.slug}`}>
              {property.rating}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-[#8C8C8C] mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm" data-testid={`text-property-address-${property.slug}`}>
            {property.address}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[#8C8C8C] mb-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{property.maxGuests} guests</span>
          </div>
          <div className="flex items-center">
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <span>{property.bathrooms} bath</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#252525]" data-testid={`text-property-price-${property.slug}`}>
              {property.pricePerHour ? `Rs. ${property.pricePerHour}` : 'Price available'}
            </div>
            <div className="text-sm text-[#8C8C8C]">per hour</div>
          </div>
          <Link href={`/property-details/${property.slug}`} data-testid={`link-book-now-${property.slug}`}>
            <Button className="bg-[#CC2B47] hover:bg-[#AD2D43] text-white">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Map Component - Placeholder for Google Maps
function MapComponent({ properties }: { properties: Property[] }) {
  return (
    <div className="h-full bg-gray-100 relative overflow-hidden" data-testid="map-container">
      {/* Map Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Map className="h-16 w-16 text-[#8C8C8C] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#252525] mb-2">Map View</h3>
          <p className="text-[#8C8C8C] text-sm max-w-xs">
            Google Maps integration placeholder. 
            {properties.length} properties will be shown here.
          </p>
        </div>
      </div>
      
      {/* Placeholder Map Pins */}
      <div className="absolute inset-0">
        {properties.slice(0, 8).map((property, index) => (
          <div 
            key={property.id}
            className="absolute w-8 h-8 bg-[#CC2B47] rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${20 + (index % 4) * 20}%`,
              top: `${20 + Math.floor(index / 4) * 30}%`
            }}
            data-testid={`map-pin-${property.slug}`}
          >
            <MapPin className="h-4 w-4 text-white" />
          </div>
        ))}
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="sm" variant="outline" className="bg-white" data-testid="button-map-zoom-in">+</Button>
        <Button size="sm" variant="outline" className="bg-white" data-testid="button-map-zoom-out">-</Button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-xs text-[#8C8C8C] mb-2">Map Legend</div>
        <div className="flex items-center text-xs text-[#252525]">
          <div className="w-3 h-3 bg-[#CC2B47] rounded-full mr-2"></div>
          Available Properties
        </div>
      </div>
    </div>
  );
}

// Results Header Component
function ResultsHeader({ 
  resultCount, 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortChange 
}: {
  resultCount: number;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid="results-header">
      <div>
        <h2 className="text-2xl font-bold text-[#252525]" data-testid="text-results-title">
          {resultCount} properties found
        </h2>
        <p className="text-[#8C8C8C] text-sm mt-1">
          Showing available properties for your search
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-200 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            className="px-3"
            data-testid="button-view-grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            className="px-3"
            data-testid="button-view-list"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange} data-testid="select-sort">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Best Match</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Main Listings Catalog Component
export default function ListingsCatalog() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Filter states
  const [filters, setFilters] = useState({
    location: 'all',
    checkInDate: '',
    hours: '6h',
    guests: 2,
    priceRange: [1000, 5000],
    category: 'all',
    minRating: '0'
  });
  
  const [sortBy, setSortBy] = useState('featured');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter and sort properties
  useEffect(() => {
    if (!properties) return;

    console.log('Properties received from API:', properties.length, properties.slice(0, 3).map(p => ({slug: p.slug, title: p.title})));
    let filtered = [...properties];

    // Apply filters (only if they have meaningful values)
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.address?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.cityId?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(property => 
        property.category?.toLowerCase().includes(filters.category.toLowerCase()) ||
        property.categoryId?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Price filter - skip for now since pricing is in room categories
    // filtered = filtered.filter(property => 
    //   property.pricePerHour >= filters.priceRange[0] && property.pricePerHour <= filters.priceRange[1]
    // );

    // Guests filter
    filtered = filtered.filter(property => property.maxGuests >= filters.guests);

    // Rating filter (only if minimum rating is set)
    if (filters.minRating && filters.minRating !== '0') {
      filtered = filtered.filter(property => parseFloat(property.rating.toString()) >= parseFloat(filters.minRating));
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        // Skip price sorting for now since pricing is in room categories
        break;
      case "price-high":
        // Skip price sorting for now since pricing is in room categories
        break;
      case "rating":
        filtered.sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "featured":
      default:
        filtered = filtered.filter(p => p.isFeature).concat(filtered.filter(p => !p.isFeature));
        break;
    }

    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [properties, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    // Trigger search with current filters
    console.log('Searching with filters:', filters);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ListingsHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="min-h-screen bg-gray-50" data-testid="page-listings-catalog">
      <ListingsHeader />
      <EnhancedSearchFilters
        onLocationChange={(location) => setFilters(prev => ({ ...prev, location }))}
        onDateChange={(date) => setFilters(prev => ({ ...prev, checkInDate: date }))}
        onHoursChange={(hours) => setFilters(prev => ({ ...prev, hours }))}
        onGuestsChange={(guests) => setFilters(prev => ({ ...prev, guests }))}
        onPriceChange={(priceRange) => setFilters(prev => ({ ...prev, priceRange }))}
        onCategoryChange={(category) => setFilters(prev => ({ ...prev, category }))}
        onSearch={handleSearch}
        filters={filters}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
      />
      
      {/* Main Content - 65/35 Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Listings Section - 65% */}
          <div className="lg:col-span-2 overflow-y-auto">
            <ResultsHeader
              resultCount={filteredProperties.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            
            {/* Properties Grid */}
            {paginatedProperties.length > 0 ? (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`} data-testid="grid-listings">
                  {paginatedProperties.map((property) => (
                    <PropertyListingCard key={property.id} property={property} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center" data-testid="pagination">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={() => setCurrentPage(prev => prev - 1)}
                              data-testid="pagination-previous"
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                data-testid={`pagination-page-${pageNum}`}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              data-testid="pagination-next"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16" data-testid="section-no-results">
                <div className="text-[#8C8C8C] mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-[#252525] mb-2">
                  No properties found
                </h3>
                <p className="text-[#8C8C8C] mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={() => setFilters({
                    location: 'all',
                    checkInDate: '',
                    hours: '6h',
                    guests: 2,
                    priceRange: [1000, 5000],
                    category: 'all',
                    minRating: '0'
                  })}
                  className="bg-[#CC2B47] hover:bg-[#AD2D43] text-white"
                  data-testid="button-clear-filters"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Map Section - 35% */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-250px)] rounded-lg overflow-hidden border border-gray-200">
              <MapComponent properties={filteredProperties} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}