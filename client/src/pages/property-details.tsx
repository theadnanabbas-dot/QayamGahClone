import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Star, Wifi, Car, Coffee, Tv, Bath, Bed, Clock, Phone, Calendar, Users } from "lucide-react";
import { Link, useRoute } from "wouter";
import CalendarBooking from "@/components/calendar-booking";

// Types from our schema
interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  rating: string;
  images: string[];
  isNew: boolean;
  isFeatured: boolean;
  category: string;
  amenities: string[];
  latitude: string;
  longitude: string;
  ownerId: string;
  maxGuests?: number;
}

interface RoomCategory {
  id: string;
  propertyId: string;
  name: string;
  maxGuestCapacity: number;
  pricePer4Hours: string;
  pricePer6Hours: string;
  pricePer12Hours: string;
  pricePer24Hours: string;
  beds: number;
  bathrooms: number;
  areaSqFt?: number;
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

// Amenity Icon Mapping
function getAmenityIcon(amenity: string) {
  const amenityMap: { [key: string]: any } = {
    'wifi': Wifi,
    'wi-fi': Wifi,
    'internet': Wifi,
    'parking': Car,
    'car parking': Car,
    'coffee': Coffee,
    'tea': Coffee,
    'refreshments': Coffee,
    'tv': Tv,
    'television': Tv,
    'cable tv': Tv,
    'bathroom': Bath,
    'washroom': Bath,
    'private bathroom': Bath,
    'bed': Bed,
    'bedroom': Bed,
    'king bed': Bed,
    'double bed': Bed,
  };
  
  const lowerAmenity = amenity.toLowerCase();
  for (const key in amenityMap) {
    if (lowerAmenity.includes(key)) {
      return amenityMap[key];
    }
  }
  return Users; // Default icon
}

// Legacy Booking Form Component (replaced by CalendarBooking)
function LegacyBookingForm({ property }: { property: Property }) {
  return (
    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
      <div className="flex items-center justify-center gap-1 mb-2">
        <Phone className="h-4 w-4" />
        <span>Call for instant booking: +92-21-1234567</span>
      </div>
      <div className="flex items-center justify-center gap-1">
        <Clock className="h-4 w-4" />
        <span>Available 24/7</span>
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const [match, params] = useRoute("/property-details/:slug");
  const slug = params?.slug;

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const property = properties?.find(p => p.slug === slug);

  // Get room categories for this property
  const { data: roomCategories } = useQuery<RoomCategory[]>({
    queryKey: ["/api/room-categories", property?.id],
    queryFn: () => 
      fetch(`/api/room-categories?propertyId=${property!.id}`)
        .then(res => res.json()),
    enabled: !!property?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Property Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/property">
            <Button>Browse All Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" data-testid="nav-breadcrumb">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/property" className="hover:text-primary">Properties</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white" data-testid="text-breadcrumb-current">
              {property.title}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8" data-testid="section-image-gallery">
              <Carousel className="w-full">
                <CarouselContent>
                  {property.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img 
                        src={image} 
                        alt={`${property.title} - Image ${index + 1}`}
                        className="h-96 w-full object-cover rounded-lg"
                        data-testid={`img-property-gallery-${index}`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {/* Property Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8" data-testid="section-property-info">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {property.isNew && (
                      <Badge className="bg-green-500" data-testid="badge-new">New</Badge>
                    )}
                    {property.isFeatured && (
                      <Badge className="bg-blue-500" data-testid="badge-featured">Featured</Badge>
                    )}
                    <Badge variant="secondary" data-testid="badge-category">{property.category}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-property-title">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span data-testid="text-property-address">
                      {property.address}, {property.city}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-lg font-semibold" data-testid="text-property-rating">
                    {property.rating}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed" data-testid="text-property-description">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8" data-testid="section-amenities">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center space-x-3" data-testid={`amenity-${index}`}>
                      <IconComponent className="h-5 w-5 text-primary" />
                      <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Categories */}
            {roomCategories && roomCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8" data-testid="section-room-categories">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Room Categories & Pricing
                </h2>
                <div className="space-y-4">
                  {roomCategories.map((category) => (
                    <Card key={category.id} className="border border-gray-200 dark:border-gray-700" data-testid={`card-room-category-${category.id}`}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Room Details */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start space-x-4">
                              <img
                                src={`/api/images/room-categories/${category.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                                alt={category.name}
                                className="w-24 h-24 object-cover rounded-lg"
                                data-testid={`img-room-category-${category.id}`}
                                onError={(e) => {
                                  e.currentTarget.src = '/api/images/placeholder-room.jpg';
                                }}
                              />
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" data-testid={`text-room-name-${category.id}`}>
                                  {category.name}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span data-testid={`text-room-capacity-${category.id}`}>
                                      Max {category.maxGuestCapacity} guests
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Bed className="h-4 w-4" />
                                    <span data-testid={`text-room-beds-${category.id}`}>
                                      {category.beds} bed{category.beds !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Bath className="h-4 w-4" />
                                    <span data-testid={`text-room-bathrooms-${category.id}`}>
                                      {category.bathrooms} bathroom{category.bathrooms !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {category.areaSqFt && (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs">📐</span>
                                      <span data-testid={`text-room-area-${category.id}`}>
                                        {category.areaSqFt} sq ft
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pricing Options */}
                          <div className="lg:col-span-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Duration Pricing
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between" data-testid={`pricing-4h-${category.id}`}>
                                <span className="text-gray-600 dark:text-gray-400">4 hours:</span>
                                <span className="font-semibold text-primary">PKR {parseFloat(category.pricePer4Hours).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between" data-testid={`pricing-6h-${category.id}`}>
                                <span className="text-gray-600 dark:text-gray-400">6 hours:</span>
                                <span className="font-semibold text-primary">PKR {parseFloat(category.pricePer6Hours).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between" data-testid={`pricing-12h-${category.id}`}>
                                <span className="text-gray-600 dark:text-gray-400">12 hours:</span>
                                <span className="font-semibold text-primary">PKR {parseFloat(category.pricePer12Hours).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between" data-testid={`pricing-24h-${category.id}`}>
                                <span className="text-gray-600 dark:text-gray-400">24 hours:</span>
                                <span className="font-semibold text-primary">PKR {parseFloat(category.pricePer24Hours).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Book Now Button */}
                          <div className="lg:col-span-1 flex items-center justify-center">
                            <Button 
                              className="w-full"
                              onClick={() => {
                                // Navigate to checkout page with pre-selected room category
                                const bookingData = {
                                  propertyId: property?.id || '',
                                  propertyTitle: property?.title || '',
                                  roomCategoryId: category.id,
                                  roomCategoryName: category.name,
                                  stayType: '4h', // Default to 4h
                                  selectedDate: '', // Will be required to fill on checkout
                                  startTime: '09:00', // Default start time
                                  guests: '1', // Default guests
                                  totalPrice: parseFloat(category.pricePer4Hours) // Default 4h price
                                };
                                const params = new URLSearchParams(
                                  Object.entries(bookingData)
                                    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
                                    .map(([key, value]) => [key, String(value)])
                                );
                                const checkoutUrl = `/checkout?${params.toString()}`;
                                window.location.href = checkoutUrl;
                              }}
                              data-testid={`button-book-now-${category.id}`}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6" data-testid="section-location">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Location
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-gray-700 dark:text-gray-300" data-testid="text-location-address">
                    {property.address}, {property.city}
                  </span>
                </div>
                
                {/* Placeholder for map */}
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center" data-testid="placeholder-map">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive map will be available soon</p>
                    <p className="text-sm mt-1">
                      Coordinates: {property.latitude}, {property.longitude}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1" data-testid="section-booking">
            {roomCategories && roomCategories.length > 0 ? (
              <CalendarBooking 
                property={{
                  id: property.id,
                  title: property.title,
                  maxGuests: property.maxGuests || 4
                }}
                roomCategories={roomCategories}
                onBookingSuccess={(booking) => {
                  console.log('Booking created:', booking);
                }}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact for Booking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Room options are being prepared. Please contact us directly for immediate booking.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[#CC2B47]" />
                    <span>+92-21-1234567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#CC2B47]" />
                    <span>Available 24/7</span>
                  </div>
                  <Button className="w-full bg-[#CC2B47] hover:bg-[#AD2D43] mt-4" data-testid="button-contact-booking">
                    Contact for Booking
                  </Button>
                </div>
              </div>
            )}
            <LegacyBookingForm property={property} />
          </div>
        </div>

        {/* Related Properties */}
        <div className="mt-16" data-testid="section-related-properties">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Similar Properties in {property.city}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties
              ?.filter(p => p.id !== property.id && p.city === property.city)
              .slice(0, 3)
              .map((relatedProperty) => (
                <Link href={`/property-details/${relatedProperty.slug}`} key={relatedProperty.id} data-testid={`link-related-${relatedProperty.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <img 
                      src={relatedProperty.images[0]} 
                      alt={relatedProperty.title}
                      className="h-32 w-full object-cover rounded-t-lg"
                      data-testid={`img-related-${relatedProperty.slug}`}
                    />
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1" data-testid={`text-related-title-${relatedProperty.slug}`}>
                        {relatedProperty.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{relatedProperty.city}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{relatedProperty.rating}</span>
                        </div>
                        <div className="text-sm font-bold text-primary">
                          View Details
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}