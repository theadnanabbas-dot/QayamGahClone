import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2 } from "lucide-react";
import PropertyOwnerLayout from "./layout";
import PropertyWizardModal from "@/components/PropertyWizardModal";

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

interface WizardFormData {
  propertyType?: "commercial" | "private";
  similarTo?: string;
  propertyName?: string;
  propertyPhone?: string;
  propertyAddress?: string;
  roomCategoriesCount?: number;
  propertySummary?: string;
  amenities?: string[];
  roomCategories?: Array<{
    name?: string;
    image?: string;
    maxGuestCapacity?: number;
    bathrooms?: number;
    beds?: number;
    areaSqFt?: number;
    pricePer4Hours?: number;
    pricePer6Hours?: number;
    pricePer12Hours?: number;
    pricePer24Hours?: number;
  }>;
}

// Sample images for demo (used when creating properties)
const sampleImages = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2",
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5"
];

function AddPropertyContent() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user from localStorage
  const userString = localStorage.getItem("property_owner_user");
  const user = userString ? JSON.parse(userString) : null;

  // Fetch cities and categories
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  const { data: categories = [] } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (wizardData: WizardFormData) => {
      // Transform wizard data to property API format
      const propertyData = {
        title: wizardData.propertyName || "",
        description: wizardData.propertySummary || "",
        propertyType: wizardData.propertyType || "private",
        phoneNumber: wizardData.propertyPhone || "",
        roomCategoriesCount: wizardData.roomCategoriesCount || 1,
        slug: (wizardData.propertyName || "").toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || "property",
        // Use default pricing for now (will be replaced by room categories)
        pricePerHour: "500",
        pricePerDay: "5000", 
        minHours: 4,
        maxGuests: wizardData.roomCategories?.[0]?.maxGuestCapacity || 2,
        address: wizardData.propertyAddress || "",
        cityId: cities[0]?.id || "", // Default to first city for now
        categoryId: categories.find(c => c.slug === wizardData.similarTo)?.id || categories[0]?.id || "",
        ownerId: user?.id || "",
        bedrooms: wizardData.roomCategories?.[0]?.beds || 1,
        bathrooms: wizardData.roomCategories?.[0]?.bathrooms || 1,
        amenities: wizardData.amenities || [],
        images: sampleImages.slice(0, 3), // Use first 3 sample images
        mainImage: sampleImages[0],
        isFeature: false,
        isActive: true,
        rating: "0.00"
      };

      // Create the property first
      const propertyResponse = await fetch(`/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData)
      });

      if (!propertyResponse.ok) {
        const error = await propertyResponse.json();
        throw new Error(error.error || "Failed to create property");
      }

      const property = await propertyResponse.json();

      // Create room categories
      const roomCategoriesPromises = (wizardData.roomCategories || []).map(async (room, index) => {
        const roomData = {
          propertyId: property.id,
          name: room.name || `Room Category ${index + 1}`,
          image: sampleImages[index % sampleImages.length],
          maxGuestCapacity: room.maxGuestCapacity || 2,
          bathrooms: room.bathrooms || 1,
          beds: room.beds || 1,
          areaSqFt: room.areaSqFt || null,
          pricePer4Hours: room.pricePer4Hours?.toString() || "0",
          pricePer6Hours: room.pricePer6Hours?.toString() || "0",
          pricePer12Hours: room.pricePer12Hours?.toString() || "0",
          pricePer24Hours: room.pricePer24Hours?.toString() || "0"
        };

        const roomResponse = await fetch(`/api/room-categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roomData)
        });

        if (!roomResponse.ok) {
          const error = await roomResponse.json();
          throw new Error(error.error || "Failed to create room category");
        }

        return roomResponse.json();
      });

      await Promise.all(roomCategoriesPromises);
      return property;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Property created successfully with room categories.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsWizardOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const handleWizardSubmit = (data: WizardFormData) => {
    createPropertyMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]" data-testid="add-property-page">
      <div className="w-full max-w-2xl mx-auto px-4">
        <Card className="text-center shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Ready to Add Your Property?
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
              List your rental space and start earning. Our step-by-step wizard makes it easy to get started.
            </p>
          </CardHeader>
          <CardContent className="pb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => setIsWizardOpen(true)}
              disabled={createPropertyMutation.isPending}
              data-testid="button-add-property"
            >
              <Plus className="h-6 w-6 mr-2" />
              Add Property
            </Button>
            
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>✓ Quick 4-step setup process</p>
              <p>✓ Multiple room categories support</p>
              <p>✓ Flexible pricing options</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Wizard Modal */}
      <PropertyWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        cities={cities}
        categories={categories}
      />
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