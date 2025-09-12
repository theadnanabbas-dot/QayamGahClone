import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  MapPin, 
  Upload, 
  X, 
  ArrowLeft,
  Loader2,
  Camera,
  Home,
  Users,
  Bath,
  Bed,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

// Form schema - simplified version
const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  pricePerHour: z.string().min(1, "Price per hour is required"),
  pricePerDay: z.string().optional(),
  minHours: z.number().min(1),
  maxGuests: z.number().min(1),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  cityId: z.string().min(1, "City is required"),
  categoryId: z.string().min(1, "Category is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  mainImage: z.string().min(1, "Main image is required"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

// Google Maps interface
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Types
interface City {
  id: string;
  name: string;
  slug: string;
}

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
}

// Map Component
function MapLocationPicker({ 
  onLocationSelect, 
  initialPosition 
}: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition?: { lat: number; lng: number };
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isMapLoaded && mapRef.current && window.google) {
      // Default to Karachi, Pakistan if no initial position
      const defaultPosition = initialPosition || { lat: 24.8607, lng: 67.0011 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultPosition,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Add initial marker
      const marker = new window.google.maps.Marker({
        position: defaultPosition,
        map: map,
        draggable: true,
        title: "Property Location"
      });

      markerRef.current = marker;

      // Get initial address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: defaultPosition }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          onLocationSelect(defaultPosition.lat, defaultPosition.lng, results[0].formatted_address);
        }
      });

      // Handle map clicks
      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        marker.setPosition({ lat, lng });
        
        // Reverse geocoding to get address
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            onLocationSelect(lat, lng, results[0].formatted_address);
          } else {
            onLocationSelect(lat, lng, `${lat}, ${lng}`);
          }
        });
      });

      // Handle marker drag
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            onLocationSelect(lat, lng, results[0].formatted_address);
          } else {
            onLocationSelect(lat, lng, `${lat}, ${lng}`);
          }
        });
      });

      // Add search box
      const searchBox = new window.google.maps.places.SearchBox(
        document.getElementById('map-search') as HTMLInputElement
      );

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        
        onLocationSelect(lat, lng, place.formatted_address || place.name || `${lat}, ${lng}`);
      });
    }
  }, [isMapLoaded, onLocationSelect, initialPosition]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="map-search">Search Location</Label>
        <Input
          id="map-search"
          type="text"
          placeholder="Search for a location..."
          className="w-full"
          data-testid="input-map-search"
        />
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border bg-gray-100 dark:bg-gray-800"
        data-testid="google-map"
      >
        {!isMapLoaded && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading map...</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click on the map or drag the marker to select the property location
      </p>
    </div>
  );
}

// Amenities list
const AVAILABLE_AMENITIES = [
  "WiFi", "Air Conditioning", "Parking", "Kitchen", "Washing Machine",
  "TV", "Balcony", "Garden", "Pool", "Gym", "Security", "Elevator",
  "Furnished", "Pet Friendly", "Smoking Allowed", "Wheelchair Accessible"
];

export default function AddProperty() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("property_owner_token");
    const userData = localStorage.getItem("property_owner_user");
    
    if (!token || !userData) {
      setLocation("/property-owner/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "property_owner") {
        setLocation("/property-owner/login");
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      setLocation("/property-owner/login");
    }
  }, [setLocation]);

  // Fetch cities and categories
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  const { data: categories = [] } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  // Form setup
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      pricePerHour: "",
      pricePerDay: "",
      minHours: 1,
      maxGuests: 1,
      address: "",
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      images: [],
      mainImage: "",
      cityId: "",
      categoryId: "",
      ownerId: user?.id || "",
    }
  });

  // Update ownerId when user is available
  useEffect(() => {
    if (user?.id) {
      form.setValue("ownerId", user.id);
    }
  }, [user, form]);

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await fetch(`/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create property");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Property Created",
        description: "Your property has been successfully added!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setLocation("/property-owner");
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Property",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: PropertyFormData) => {
    if (!mapLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map.",
        variant: "destructive"
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please add at least one property image.",
        variant: "destructive"
      });
      return;
    }

    const propertyData = {
      title: data.title,
      description: data.description || "",
      pricePerHour: data.pricePerHour,
      pricePerDay: data.pricePerDay || "",
      minHours: data.minHours,
      maxGuests: data.maxGuests,
      address: mapLocation.address,
      latitude: mapLocation.lat.toString(),
      longitude: mapLocation.lng.toString(),
      cityId: data.cityId,
      categoryId: data.categoryId,
      ownerId: user.id,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      amenities: selectedAmenities,
      images: selectedImages,
      mainImage: selectedImages[mainImageIndex],
    };

    createPropertyMutation.mutate(propertyData);
  };

  // Handle image addition (placeholder URLs for demo)
  const addImage = () => {
    const imageUrl = `/api/images/properties/property-${Date.now()}.jpg`;
    setSelectedImages(prev => [...prev, imageUrl]);
    if (selectedImages.length === 0) {
      setMainImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (index === mainImageIndex && selectedImages.length > 1) {
      setMainImageIndex(0);
    } else if (selectedImages.length === 1) {
      setMainImageIndex(0);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setMapLocation({ lat, lng, address });
    form.setValue("address", address);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/property-owner" data-testid="link-back-dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">Add New Property</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Luxury Villa in Gulberg"
                            {...field}
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Guests</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-max-guests"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Hours</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-min-hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your property, its features, and what makes it special..."
                          rows={4}
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location
                </CardTitle>
                <CardDescription>
                  Select the exact location of your property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapLocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialPosition={{ lat: 24.8607, lng: 67.0011 }}
                />
                {mapLocation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected Location:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {mapLocation.address}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          Bedrooms
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-bedrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          Bathrooms
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-bathrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Price per Hour (PKR)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="500"
                            {...field}
                            data-testid="input-price-hour"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day (PKR) - Optional</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="5000"
                            {...field}
                            data-testid="input-price-day"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AVAILABLE_AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          data-testid={`checkbox-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={amenity} className="text-sm font-normal">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Property Images
                </CardTitle>
                <CardDescription>
                  Add photos of your property (first image will be the main image)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  className="w-full"
                  data-testid="button-add-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Image (Demo - Auto Generated)
                </Button>
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {index === mainImageIndex && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Main
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index !== mainImageIndex && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setMainImageIndex(index)}
                            data-testid={`button-set-main-${index}`}
                          >
                            Set as Main
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-4">
              <Link href="/property-owner">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={createPropertyMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit"
              >
                {createPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Property...
                  </>
                ) : (
                  "Create Property"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}