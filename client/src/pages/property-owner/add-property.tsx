import { useState, useEffect, useRef } from "react";
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
import { z } from "zod";
import PropertyOwnerLayout from "./layout";

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

// Sample images for demo
const sampleImages = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2",
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5"
];

// Amenities list
const availableAmenities = [
  "WiFi", "Air Conditioning", "Heating", "Parking", "Kitchen", "Washing Machine",
  "TV", "Balcony", "Garden", "Pool", "Gym", "Security", "Elevator", "Pet Friendly"
];

function AddPropertyContent() {
  // Get current user from localStorage
  const userString = localStorage.getItem("property_owner_user");
  const user = userString ? JSON.parse(userString) : null;

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Property created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      form.reset();
      setSelectedImages([]);
      setSelectedAmenities([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const handleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      const newImages = selectedImages.filter(img => img !== imageUrl);
      setSelectedImages(newImages);
      form.setValue("images", newImages);
      if (mainImageIndex >= newImages.length && newImages.length > 0) {
        setMainImageIndex(0);
        form.setValue("mainImage", newImages[0]);
      } else if (newImages.length === 0) {
        form.setValue("mainImage", "");
      }
    } else {
      const newImages = [...selectedImages, imageUrl];
      setSelectedImages(newImages);
      form.setValue("images", newImages);
      if (selectedImages.length === 0) {
        form.setValue("mainImage", imageUrl);
      }
    }
  };

  const setMainImage = (index: number) => {
    setMainImageIndex(index);
    form.setValue("mainImage", selectedImages[index]);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(newAmenities);
    form.setValue("amenities", newAmenities);
  };

  const onSubmit = (data: PropertyFormData) => {
    // Ensure we have images and main image
    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...data,
      images: selectedImages,
      mainImage: selectedImages[mainImageIndex],
      amenities: selectedAmenities,
    };

    createPropertyMutation.mutate(submissionData);
  };

  return (
    <div className="space-y-6" data-testid="add-property-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Add New Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          List a new rental property to start earning.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Modern 2BR Apartment in Downtown" {...field} data-testid="input-property-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="input-property-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Hour (Rs.)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} data-testid="input-price-hour" />
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
                      <FormLabel>Price Per Day (Rs.) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} data-testid="input-price-day" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          data-testid="input-min-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          data-testid="input-max-guests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
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
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          data-testid="input-bathrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Select images for your property. The first selected image will be the main image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sampleImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImages.includes(imageUrl)
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleImageSelection(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {selectedImages.includes(imageUrl) && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <span className="bg-green-500 text-white rounded-full p-1">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedImages.includes(imageUrl) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`mt-2 w-full ${
                          selectedImages.indexOf(imageUrl) === mainImageIndex
                            ? "bg-green-50 border-green-500 text-green-600"
                            : ""
                        }`}
                        onClick={() => setMainImage(selectedImages.indexOf(imageUrl))}
                      >
                        {selectedImages.indexOf(imageUrl) === mainImageIndex ? "Main" : "Set Main"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Select the amenities available in your property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-discard"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={createPropertyMutation.isPending}
              data-testid="button-submit"
            >
              {createPropertyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Property
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function AddProperty() {
  return (
    <PropertyOwnerLayout>
      <AddPropertyContent />
    </PropertyOwnerLayout>
  );
}