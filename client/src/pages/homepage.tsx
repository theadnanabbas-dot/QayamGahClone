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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Star, Users, Building, Home, Calendar, Phone, Mail, Clock, Eye, EyeOff, Plus, Search, Shield, CheckCircle, User, Facebook, Twitter, Instagram, ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import heroImage from "@assets/stock_images/modern_hotel_room_in_52cb8a42.jpg";

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

// Sticky Header Component
function StickyHeader({ onOpenVendorModal }: { onOpenVendorModal: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b" data-testid="header-sticky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-primary">Qayamgah</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/listings" data-testid="link-properties">
              <span className="text-foreground hover:text-primary transition-colors font-medium">Properties</span>
            </Link>
            <Link href="/hotels" data-testid="link-hotels">
              <span className="text-foreground hover:text-primary transition-colors font-medium">Hotels</span>
            </Link>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-how-it-works">
              How it Works
            </a>
            <a href="#benefits" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-benefits">
              Benefits
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onOpenVendorModal}
              data-testid="button-login"
            >
              Login
            </Button>
            <Button 
              onClick={onOpenVendorModal}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-register-owner"
            >
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4">
              <Link href="/property" data-testid="mobile-link-properties">
                <span className="text-foreground hover:text-primary block py-2">Properties</span>
              </Link>
              <Link href="/hotels" data-testid="mobile-link-hotels">
                <span className="text-foreground hover:text-primary block py-2">Hotels</span>
              </Link>
              <a href="#how-it-works" className="text-foreground hover:text-primary block py-2" data-testid="mobile-link-how-it-works">
                How it Works
              </a>
              <a href="#benefits" className="text-foreground hover:text-primary block py-2" data-testid="mobile-link-benefits">
                Benefits
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" onClick={onOpenVendorModal} className="justify-start" data-testid="mobile-button-login">
                  Login
                </Button>
                <Button onClick={onOpenVendorModal} className="bg-primary hover:bg-primary/90 text-white justify-start" data-testid="mobile-button-register">
                  Register
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  const [location, setLocation] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  
  const handleSearch = () => {
    // Route to search page with parameters
    const searchParams = new URLSearchParams({
      location: location,
      lookingFor: lookingFor,
      date: checkInDate
    });
    window.location.href = `/property?${searchParams.toString()}`;
  };

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})` }}
      data-testid="section-hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in" data-testid="text-hero-title">
            Choose flexibility
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90" data-testid="text-hero-subtitle">
            First time in Pakistan book for 3, 6, 12 or 24 hours and choose the check-in time you want.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground text-left">Location</label>
                <Select value={location} onValueChange={setLocation} data-testid="select-location">
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karachi">Karachi</SelectItem>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                    <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                    <SelectItem value="faisalabad">Faisalabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground text-left">Looking For?</label>
                <Select value={lookingFor} onValueChange={setLookingFor} data-testid="select-looking-for">
                  <SelectTrigger>
                    <SelectValue placeholder="Property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="hotel">Hotel Room</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="office">Office Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground text-left">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full" 
                  data-testid="input-checkin" 
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-10"
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: "Search & Select",
      description: "Browse properties by location and book for your desired duration - 3, 6, 12, or 24 hours."
    },
    {
      icon: CheckCircle,
      title: "Choose Your Time",
      description: "Pick your check-in time that works for you. No more rigid hotel schedules."
    },
    {
      icon: Home,
      title: "Enjoy Your Stay",
      description: "Check in at your chosen time and enjoy flexible accommodation that fits your needs."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50" data-testid="section-how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book hourly accommodation in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group" data-testid={`step-${index + 1}`}>
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" data-testid={`step-title-${index + 1}`}>
                {step.title}
              </h3>
              <p className="text-muted-foreground" data-testid={`step-description-${index + 1}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Check in and out at your preferred times. Perfect for business travelers, layovers, and day use."
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "All bookings are secure and guaranteed. Pay online with confidence and get instant confirmation."
    },
    {
      icon: Star,
      title: "Quality Properties",
      description: "Handpicked properties with verified quality standards. Only the best accommodations make it to our platform."
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Round-the-clock customer support to assist you with any queries or issues during your stay."
    }
  ];

  return (
    <section id="benefits" className="py-20" data-testid="section-benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-benefits-title">
            Why Book by the Hour?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the convenience and flexibility of hourly accommodation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow group" data-testid={`benefit-${index + 1}`}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3" data-testid={`benefit-title-${index + 1}`}>
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm" data-testid={`benefit-description-${index + 1}`}>
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
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

  const featuredProperties = properties?.filter(p => p.isFeatured).slice(0, 8);

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50" data-testid="section-featured-properties">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
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
    <section className="py-20 bg-gray-50" data-testid="section-featured-properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-featured-title">
            Featured Properties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked properties across Pakistan's major cities
          </p>
        </div>
        
        <Carousel className="w-full" data-testid="carousel-featured-properties">
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProperties?.map((property) => (
              <CarouselItem key={property.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Link href={`/property-details/${property.slug}`} data-testid={`link-property-${property.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="h-48 w-full object-cover rounded-t-lg"
                        data-testid={`img-property-${property.slug}`}
                      />
                      {property.isNew && (
                        <Badge className="absolute top-3 left-3 bg-green-500" data-testid={`badge-new-${property.slug}`}>
                          New
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-primary" data-testid={`badge-featured-${property.slug}`}>
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2" data-testid={`text-property-title-${property.slug}`}>
                        {property.title}
                      </h3>
                      <div className="flex items-center text-muted-foreground mb-3">
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
                          <div className="text-xl font-bold text-primary" data-testid={`text-property-price-${property.slug}`}>
                            Rs. {property.pricePerHour}
                          </div>
                          <div className="text-sm text-muted-foreground">per hour</div>
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
        
        <div className="text-center mt-12">
          <Link href="/property" data-testid="link-view-all-properties">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "How does hourly booking work?",
      answer: "You can book accommodations for flexible durations of 3, 6, 12, or 24 hours. Simply select your preferred check-in time and duration when making a reservation."
    },
    {
      question: "Can I extend my booking?",
      answer: "Yes, subject to availability, you can extend your booking by contacting our 24/7 customer support or through the property directly."
    },
    {
      question: "What cities do you operate in?",
      answer: "We currently operate in major Pakistani cities including Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad, with plans to expand to more cities soon."
    },
    {
      question: "Is my booking guaranteed?",
      answer: "Yes, all confirmed bookings are guaranteed. You'll receive instant confirmation via email and SMS with all booking details."
    },
    {
      question: "What amenities are included?",
      answer: "Amenities vary by property but typically include WiFi, air conditioning, clean linens, and basic toiletries. Check individual property listings for specific amenities."
    },
    {
      question: "How do I cancel my booking?",
      answer: "You can cancel your booking through your account dashboard or by contacting customer support. Cancellation policies vary by property."
    }
  ];

  return (
    <section className="py-20" data-testid="section-faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about hourly bookings
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full" data-testid="accordion-faq">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-${index + 1}`}>
              <AccordionTrigger className="text-left" data-testid={`faq-question-${index + 1}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index + 1}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// Footer Section
function Footer() {
  return (
    <footer className="bg-foreground text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary" data-testid="footer-logo">Qayamgah</h3>
            <p className="text-gray-300" data-testid="footer-description">
              Pakistan's leading platform for flexible hourly accommodation. Book by the hour, check in on your time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" data-testid="footer-links-title">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/property" data-testid="footer-link-properties"><span className="text-gray-300 hover:text-primary transition-colors">Properties</span></Link></li>
              <li><Link href="/hotels" data-testid="footer-link-hotels"><span className="text-gray-300 hover:text-primary transition-colors">Hotels</span></Link></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-link-how-it-works">How It Works</a></li>
              <li><a href="#benefits" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-link-benefits">Benefits</a></li>
            </ul>
          </div>
          
          {/* Cities */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" data-testid="footer-cities-title">Cities</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-city-karachi">Karachi</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-city-lahore">Lahore</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-city-islamabad">Islamabad</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors" data-testid="footer-city-rawalpindi">Rawalpindi</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" data-testid="footer-contact-title">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span data-testid="footer-phone">+92-21-1234567</span>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span data-testid="footer-email">info@qayamgah.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400" data-testid="footer-copyright">
              © 2024 Qayamgah. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-legal-privacy">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-legal-terms">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-legal-support">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Vendor Registration Modal (keeping the existing functionality)
function VendorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<'signup' | 'personal'>('signup');
  const { toast } = useToast();

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const personalForm = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNo1: "",
      phoneNo2: "",
      cnic: "",
      address: "",
      city: "",
      country: "Pakistan",
      agreeToTerms: false
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiRequest("POST", "/api/admin/vendors", {
        email: data.email,
        password: data.password,
        role: "property_owner"
      });
      return response;
    },
    onSuccess: () => {
      setCurrentStep('personal');
      toast({
        title: "Account Created",
        description: "Please complete your personal details"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    }
  });

  const personalMutation = useMutation({
    mutationFn: async (data: PersonalDetailsFormData) => {
      const response = await apiRequest("PATCH", "/api/admin/vendors", {
        email: signupForm.getValues().email,
        ...data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Complete",
        description: "Welcome to Qayamgah! You can now login to your account."
      });
      onClose();
      setCurrentStep('signup');
      signupForm.reset();
      personalForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'signup' ? 'Create Account' : 'Complete Profile'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'signup' && (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit((data) => signupMutation.mutate(data))} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter your email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Create a password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating Account..." : "Continue"}
              </Button>
            </form>
          </Form>
        )}

        {currentStep === 'personal' && (
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit((data) => personalMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={personalForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={personalForm.control}
                name="phoneNo1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="03001234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="cnic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345-1234567-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Complete address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        I agree to the Terms & Conditions
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={personalMutation.isPending}
              >
                {personalMutation.isPending ? "Completing Registration..." : "Complete Registration"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Main Homepage Component
export default function Homepage() {
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <StickyHeader onOpenVendorModal={() => setIsVendorModalOpen(true)} />
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FeaturedPropertiesSection />
      <FAQSection />
      <Footer />
      
      <VendorModal 
        isOpen={isVendorModalOpen} 
        onClose={() => setIsVendorModalOpen(false)} 
      />
    </div>
  );
}