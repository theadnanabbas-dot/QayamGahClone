import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Star, Users, Building, Home, Calendar, Phone, Mail, Clock, Eye, EyeOff, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Vendor Registration Schemas
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNo1: z.string().min(10, "Phone number must be at least 10 digits"),
  phoneNo2: z.string().optional(),
  cnic: z.string().min(13, "CNIC must be at least 13 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Conditions"
  })
});

type SignupFormData = z.infer<typeof signupSchema>;
type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

// Types from our schema
interface City {
  id: string;
  name: string;
  slug: string;
  image: string;
  heroImage: string;
  propertyCount: number;
}

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

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
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  publishedAt: string;
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

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>+92-21-1234567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span>info@qayamgah.com</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowVendorModal(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-register-owner"
            >
              Register as Owner
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20" data-testid="section-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
            Book hourly accommodations across Pakistan's major cities
          </p>
          
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select className="w-full p-3 border border-gray-300 rounded-md" data-testid="select-location">
                  <option>Select City</option>
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-md" data-testid="input-checkin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
                <select className="w-full p-3 border border-gray-300 rounded-md" data-testid="select-duration">
                  <option>Select Duration</option>
                  <option>2 Hours</option>
                  <option>4 Hours</option>
                  <option>6 Hours</option>
                  <option>8 Hours</option>
                  <option>12 Hours</option>
                  <option>24 Hours</option>
                </select>
              </div>
            </div>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90" data-testid="button-search">
              Search Properties
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Property Categories Grid
function CategoriesSection() {
  const { data: categories, isLoading } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-categories-title">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories?.map((category) => (
            <Link href={`/property?category=${category.slug}`} key={category.id} data-testid={`link-category-${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-category-name-${category.slug}`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" data-testid={`text-category-description-${category.slug}`}>
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Properties Section
function FeaturedPropertiesSection() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const featuredProperties = properties?.filter(p => p.isFeatured).slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16" data-testid="section-featured-properties">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
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
      </section>
    );
  }

  return (
    <section className="py-16" data-testid="section-featured-properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-featured-title">
          Featured Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties?.map((property) => (
            <Link href={`/property-details/${property.slug}`} key={property.id} data-testid={`link-property-${property.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="h-48 w-full object-cover rounded-t-lg"
                    data-testid={`img-property-${property.slug}`}
                  />
                  {property.isNew && (
                    <Badge className="absolute top-2 left-2 bg-green-500" data-testid={`badge-new-${property.slug}`}>
                      New
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-blue-500" data-testid={`badge-featured-${property.slug}`}>
                    Featured
                  </Badge>
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
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/property" data-testid="link-view-all-properties">
            <Button variant="outline" size="lg">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Explore by Cities Section
function ExploreCitiesSection() {
  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-explore-cities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Explore by Cities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-explore-cities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-cities-title">
          Explore by Cities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities?.map((city) => (
            <Link href={`/property?city=${city.slug}`} key={city.id} data-testid={`link-city-${city.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img 
                    src={city.heroImage} 
                    alt={city.name}
                    className="h-40 w-full object-cover rounded-t-lg"
                    data-testid={`img-city-${city.slug}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2" data-testid={`text-city-name-${city.slug}`}>
                        {city.name}
                      </h3>
                      <p className="text-lg" data-testid={`text-city-count-${city.slug}`}>
                        {city.propertyCount} Properties
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// New Properties Carousel
function NewPropertiesSection() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const newProperties = properties?.filter(p => p.isNew).slice(0, 8);

  if (isLoading || !newProperties?.length) {
    return null;
  }

  return (
    <section className="py-16" data-testid="section-new-properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-new-properties-title">
          New Properties
        </h2>
        
        <Carousel className="w-full" data-testid="carousel-new-properties">
          <CarouselContent className="-ml-2 md:-ml-4">
            {newProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Link href={`/property-details/${property.slug}`} data-testid={`link-new-property-${property.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="h-40 w-full object-cover rounded-t-lg"
                        data-testid={`img-new-property-${property.slug}`}
                      />
                      <Badge className="absolute top-2 left-2 bg-green-500" data-testid={`badge-new-property-${property.slug}`}>
                        New
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2" data-testid={`text-new-property-title-${property.slug}`}>
                        {property.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-xs" data-testid={`text-new-property-address-${property.slug}`}>
                          {property.city}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs font-medium" data-testid={`text-new-property-rating-${property.slug}`}>
                            {property.rating}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary" data-testid={`text-new-property-price-${property.slug}`}>
                            Rs. {property.pricePerHour}
                          </div>
                          <div className="text-xs text-gray-500">per hour</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}

// Stats Counter Section
function StatsSection() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  const totalProperties = properties?.length || 0;
  const totalCities = cities?.length || 0;
  const featuredProperties = properties?.filter(p => p.isFeatured).length || 0;

  return (
    <section className="py-16 bg-primary text-white" data-testid="section-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-stats-title">
          Why Choose Qayamgah?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" data-testid="text-stats-properties">
              {totalProperties}+
            </div>
            <div className="text-lg" data-testid="text-stats-properties-label">
              Properties
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" data-testid="text-stats-cities">
              {totalCities}+
            </div>
            <div className="text-lg" data-testid="text-stats-cities-label">
              Cities
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" data-testid="text-stats-happy-customers">
              1000+
            </div>
            <div className="text-lg" data-testid="text-stats-happy-customers-label">
              Happy Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" data-testid="text-stats-featured">
              {featuredProperties}+
            </div>
            <div className="text-lg" data-testid="text-stats-featured-label">
              Featured Properties
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"]
  });

  if (isLoading) {
    return (
      <section className="py-16" data-testid="section-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-testimonials-title">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials?.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4" data-testid={`text-testimonial-content-${testimonial.id}`}>
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                    data-testid={`img-testimonial-${testimonial.id}`}
                  />
                  <div>
                    <div className="font-semibold" data-testid={`text-testimonial-name-${testimonial.id}`}>
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500" data-testid={`text-testimonial-role-${testimonial.id}`}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Blog Section
function BlogSection() {
  const { data: blogs, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"]
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-blog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-blog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white" data-testid="text-blog-title">
          Latest Blog Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs?.slice(0, 3).map((blog) => (
            <Link href={`/blog/${blog.slug}`} key={blog.id} data-testid={`link-blog-${blog.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="h-40 w-full object-cover rounded-t-lg"
                  data-testid={`img-blog-${blog.slug}`}
                />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-blog-title-${blog.slug}`}>
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4" data-testid={`text-blog-excerpt-${blog.slug}`}>
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span data-testid={`text-blog-date-${blog.slug}`}>
                      {new Date(blog.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/blog" data-testid="link-view-all-blogs">
            <Button variant="outline" size="lg">
              View All Blog Posts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12" data-testid="section-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-logo">
              Qayamgah
            </h3>
            <p className="text-gray-400 mb-4" data-testid="text-footer-description">
              Your trusted partner for hourly accommodation bookings across Pakistan.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm" data-testid="text-footer-phone">
                  +92-21-1234567
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-quick-links">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/property" data-testid="link-footer-properties">Properties</Link></li>
              <li><Link href="/hotels" data-testid="link-footer-hotels">Hotels</Link></li>
              <li><Link href="/neighborhood" data-testid="link-footer-neighborhood">Neighborhood</Link></li>
              <li><Link href="/vendor/signup" data-testid="link-footer-list-property">List Property</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-cities">
              Cities
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/property?city=karachi" data-testid="link-footer-karachi">Karachi</Link></li>
              <li><Link href="/property?city=lahore" data-testid="link-footer-lahore">Lahore</Link></li>
              <li><Link href="/property?city=islamabad" data-testid="link-footer-islamabad">Islamabad</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-contact">
              Contact Info
            </h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm" data-testid="text-footer-email">
                  info@qayamgah.com
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm" data-testid="text-footer-hours">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p data-testid="text-footer-copyright">
            © 2025 Qayamgah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Homepage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <FeaturedPropertiesSection />
      <ExploreCitiesSection />
      <NewPropertiesSection />
      <StatsSection />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
    </div>
  );
}