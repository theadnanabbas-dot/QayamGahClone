import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Step 1: Property Type
const PropertyTypeStep = ({ formData, onUpdate }: { formData: WizardFormData; onUpdate: (data: Partial<WizardFormData>) => void }) => {
  return (
    <div className="space-y-6" data-testid="step-property-type">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">What kind of property?</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose the type that best describes your property</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
        <Button
          type="button"
          variant={formData.propertyType === "commercial" ? "default" : "outline"}
          className="h-20 flex flex-col space-y-2"
          onClick={() => onUpdate({ propertyType: "commercial" })}
          data-testid="button-commercial"
        >
          <span className="text-lg">🏢</span>
          <span>Commercial / Hotels</span>
        </Button>
        
        <Button
          type="button"
          variant={formData.propertyType === "private" ? "default" : "outline"}
          className="h-20 flex flex-col space-y-2"
          onClick={() => onUpdate({ propertyType: "private" })}
          data-testid="button-private"
        >
          <span className="text-lg">🏠</span>
          <span>Private / BnB's</span>
        </Button>
      </div>
    </div>
  );
};

// Step 2: Property Category
const PropertyCategoryStep = ({ formData, onUpdate, categories }: { 
  formData: WizardFormData; 
  onUpdate: (data: Partial<WizardFormData>) => void;
  categories: PropertyCategory[];
}) => {
  const propertyTypeCategories = [
    { id: "hotel", name: "Hotel", icon: "🏨" },
    { id: "apartment", name: "Apartment", icon: "🏢" },
    { id: "guest-house", name: "Guest House", icon: "🏡" },
    { id: "motel", name: "Motel", icon: "🏩" },
    { id: "house", name: "House", icon: "🏠" },
  ];

  return (
    <div className="space-y-6" data-testid="step-property-category">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Property is similar to…</h2>
        <p className="text-gray-600 dark:text-gray-400">Select the category that best matches your property</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {propertyTypeCategories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={formData.similarTo === category.id ? "default" : "outline"}
            className="h-20 flex flex-col space-y-2"
            onClick={() => onUpdate({ similarTo: category.id })}
            data-testid={`button-category-${category.id}`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

// Step 3: Property Details  
const PropertyDetailsStep = ({ formData, onUpdate, cities, categories }: {
  formData: WizardFormData;
  onUpdate: (data: Partial<WizardFormData>) => void;
  cities: City[];
  categories: PropertyCategory[];
}) => {
  return (
    <div className="space-y-6" data-testid="step-property-details">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Provide your property details</h2>
        <p className="text-gray-600 dark:text-gray-400">Tell us about your property</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Property Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Property Name *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter property name"
            value={formData.propertyName || ""}
            onChange={(e) => onUpdate({ propertyName: e.target.value })}
            data-testid="input-property-name"
          />
        </div>

        {/* Property Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">Property Phone No. *</label>
          <input
            type="tel"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter property phone number"
            value={formData.propertyPhone || ""}
            onChange={(e) => onUpdate({ propertyPhone: e.target.value })}
            data-testid="input-property-phone"
          />
        </div>

        {/* Property Address */}
        <div>
          <label className="block text-sm font-medium mb-2">Property Address *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter property address"
            value={formData.propertyAddress || ""}
            onChange={(e) => onUpdate({ propertyAddress: e.target.value })}
            data-testid="input-property-address"
          />
        </div>

        {/* Room Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">Room Categories *</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.roomCategoriesCount || 1}
            onChange={(e) => onUpdate({ roomCategoriesCount: parseInt(e.target.value) })}
            data-testid="select-room-categories"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'Category' : 'Categories'}
              </option>
            ))}
          </select>
        </div>

        {/* Property Summary */}
        <div>
          <label className="block text-sm font-medium mb-2">Property Summary</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Brief description of your property"
            value={formData.propertySummary || ""}
            onChange={(e) => onUpdate({ propertySummary: e.target.value })}
            data-testid="textarea-property-summary"
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Wi-Fi", "Parking", "Breakfast", "AC", "TV", "Pool", "Gym", "Security"].map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.amenities?.includes(amenity) || false}
                  onChange={(e) => {
                    const currentAmenities = formData.amenities || [];
                    if (e.target.checked) {
                      onUpdate({ amenities: [...currentAmenities, amenity] });
                    } else {
                      onUpdate({ amenities: currentAmenities.filter(a => a !== amenity) });
                    }
                  }}
                  data-testid={`checkbox-amenity-${amenity.toLowerCase()}`}
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Room Categories Details
const RoomCategoriesStep = ({ formData, onUpdate }: {
  formData: WizardFormData;
  onUpdate: (data: Partial<WizardFormData>) => void;
}) => {
  const roomCount = formData.roomCategoriesCount || 1;
  const roomCategories = formData.roomCategories || [];

  const updateRoomCategory = (index: number, updates: Partial<RoomCategoryData>) => {
    const newRoomCategories = [...roomCategories];
    newRoomCategories[index] = { ...newRoomCategories[index], ...updates };
    onUpdate({ roomCategories: newRoomCategories });
  };

  return (
    <div className="space-y-6" data-testid="step-room-categories">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Tell us about your room categories</h2>
        <p className="text-gray-600 dark:text-gray-400">Provide details for each room category</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {[...Array(roomCount)].map((_, index) => {
          const room = roomCategories[index] || {};
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4" data-testid={`room-category-${index}`}>
              <h3 className="text-lg font-semibold">Room Category {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Category Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Room Category Name *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Deluxe Suite"
                    value={room.name || ""}
                    onChange={(e) => updateRoomCategory(index, { name: e.target.value })}
                    data-testid={`input-room-name-${index}`}
                  />
                </div>

                {/* Maximum Guest Capacity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Guest Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="4"
                    value={room.maxGuestCapacity || ""}
                    onChange={(e) => updateRoomCategory(index, { maxGuestCapacity: parseInt(e.target.value) })}
                    data-testid={`input-room-capacity-${index}`}
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2"
                    value={room.bathrooms || ""}
                    onChange={(e) => updateRoomCategory(index, { bathrooms: parseInt(e.target.value) })}
                    data-testid={`input-room-bathrooms-${index}`}
                  />
                </div>

                {/* Beds */}
                <div>
                  <label className="block text-sm font-medium mb-2">Beds *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2"
                    value={room.beds || ""}
                    onChange={(e) => updateRoomCategory(index, { beds: parseInt(e.target.value) })}
                    data-testid={`input-room-beds-${index}`}
                  />
                </div>

                {/* Area */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    value={room.areaSqFt || ""}
                    onChange={(e) => updateRoomCategory(index, { areaSqFt: parseInt(e.target.value) })}
                    data-testid={`input-room-area-${index}`}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div>
                <h4 className="font-medium mb-3">Pricing</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per 4 Hour</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2000"
                      value={room.pricePer4Hours || ""}
                      onChange={(e) => updateRoomCategory(index, { pricePer4Hours: parseFloat(e.target.value) })}
                      data-testid={`input-room-price-4h-${index}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per 6 Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2800"
                      value={room.pricePer6Hours || ""}
                      onChange={(e) => updateRoomCategory(index, { pricePer6Hours: parseFloat(e.target.value) })}
                      data-testid={`input-room-price-6h-${index}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per 12 Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4500"
                      value={room.pricePer12Hours || ""}
                      onChange={(e) => updateRoomCategory(index, { pricePer12Hours: parseFloat(e.target.value) })}
                      data-testid={`input-room-price-12h-${index}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per 24 Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="7000"
                      value={room.pricePer24Hours || ""}
                      onChange={(e) => updateRoomCategory(index, { pricePer24Hours: parseFloat(e.target.value) })}
                      data-testid={`input-room-price-24h-${index}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

interface RoomCategoryData {
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
}

interface WizardFormData {
  // Step 1
  propertyType?: "commercial" | "private";
  // Step 2
  similarTo?: string;
  // Step 3
  propertyName?: string;
  propertyPhone?: string;
  propertyAddress?: string;
  roomCategoriesCount?: number;
  propertySummary?: string;
  amenities?: string[];
  // Step 4
  roomCategories?: RoomCategoryData[];
}

interface PropertyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WizardFormData) => void;
  cities: City[];
  categories: PropertyCategory[];
}

export default function PropertyWizardModal({
  isOpen,
  onClose,
  onSubmit,
  cities,
  categories
}: PropertyWizardModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    roomCategoriesCount: 1,
    amenities: [],
    roomCategories: []
  });
  const { toast } = useToast();

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.propertyType;
      case 2:
        return !!formData.similarTo;
      case 3:
        return !!(formData.propertyName && formData.propertyPhone && formData.propertyAddress);
      case 4:
        const roomCount = formData.roomCategoriesCount || 1;
        const roomCategories = formData.roomCategories || [];
        
        // Check if we have enough room categories defined
        if (roomCategories.length < roomCount) return false;
        
        // Validate each room category has required fields
        for (let i = 0; i < roomCount; i++) {
          const room = roomCategories[i];
          if (!room || !room.name || !room.maxGuestCapacity || !room.bathrooms || !room.beds ||
              !room.pricePer4Hours || !room.pricePer6Hours || !room.pricePer12Hours || !room.pricePer24Hours) {
            return false;
          }
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      let message = "";
      switch (currentStep) {
        case 1:
          message = "Please select a property type";
          break;
        case 2:
          message = "Please select a property category";
          break;
        case 3:
          message = "Please fill in all required fields";
          break;
        case 4:
          message = "Please complete all room category details";
          break;
        default:
          message = "Please complete the current step";
      }
      
      toast({
        title: "Validation Error",
        description: message,
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setFormData({ roomCategoriesCount: 1, amenities: [], roomCategories: [] });
    onClose();
  };

  const handleSubmit = () => {
    if (!validateStep(4)) {
      toast({
        title: "Validation Error",
        description: "Please complete all room category details",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    handleCancel(); // Reset form after submission
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PropertyTypeStep formData={formData} onUpdate={updateFormData} />;
      case 2:
        return <PropertyCategoryStep formData={formData} onUpdate={updateFormData} categories={categories} />;
      case 3:
        return <PropertyDetailsStep formData={formData} onUpdate={updateFormData} cities={cities} categories={categories} />;
      case 4:
        return <RoomCategoriesStep formData={formData} onUpdate={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="property-wizard-modal">
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-semibold">
              Add New Property - Step {currentStep} of {totalSteps}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" data-testid="wizard-progress" />
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel-bottom"
            >
              Cancel
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                data-testid="button-finish"
              >
                Finish & Create Property
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}