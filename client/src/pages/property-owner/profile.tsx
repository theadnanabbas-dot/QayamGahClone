import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Mail, Phone, MapPin, CreditCard, Loader2 } from "lucide-react";

interface Vendor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNo1: string;
  phoneNo2?: string;
  cnic: string;
  address: string;
  city: string;
  country: string;
  status: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

function ProfileContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo1: "",
    phoneNo2: "",
    cnic: "",
    address: "",
    city: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [vendorData, setVendorData] = useState<Vendor | null>(null);

  const { toast } = useToast();

  // Get current user from localStorage (memoize to prevent re-renders)
  const [user] = useState(() => {
    const userString = localStorage.getItem("property_owner_user");
    return userString ? JSON.parse(userString) : null;
  });
  const userId = user?.id;

  const { data: vendor } = useQuery<Vendor>({
    queryKey: ["/api/property-owner/vendor"],
    enabled: !!userId, // Only run query if userId exists
    refetchOnWindowFocus: false, // Prevent automatic refetch on focus
    refetchOnMount: false, // Prevent refetch when component mounts again
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Load vendor profile data (only when vendor data changes)
  useEffect(() => {
    if (vendor && !vendorData) { // Only set once to prevent infinite loops
      setVendorData(vendor);
      setFormData({
        firstName: vendor.firstName || "",
        lastName: vendor.lastName || "",
        email: user?.email || "",
        phoneNo1: vendor.phoneNo1 || "",
        phoneNo2: vendor.phoneNo2 || "",
        cnic: vendor.cnic || "",
        address: vendor.address || "",
        city: vendor.city || "",
        country: vendor.country || "",
      });
    }
  }, [vendor, user?.email, vendorData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    // Explicit validation flag to prevent any API calls
    let validationPassed = true;
    
    // Validate mandatory fields
    if (!formData.firstName?.trim()) {
      validationPassed = false;
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
    }

    if (!formData.phoneNo1?.trim()) {
      validationPassed = false;
      toast({
        title: "Validation Error", 
        description: "Primary phone number is required",
        variant: "destructive",
      });
    }

    if (!formData.cnic?.trim()) {
      validationPassed = false;
      toast({
        title: "Validation Error",
        description: "CNIC/National ID is required", 
        variant: "destructive",
      });
    }

    if (!formData.address?.trim()) {
      validationPassed = false;
      toast({
        title: "Validation Error",
        description: "Address is required",
        variant: "destructive",
      });
    }

    if (!formData.city?.trim()) {
      validationPassed = false;
      toast({
        title: "Validation Error",
        description: "City is required",
        variant: "destructive",
      });
    }

    // Early return if validation failed
    if (!validationPassed) {
      return;
    }

    if (!vendorData) {
      toast({
        title: "Error",
        description: "Vendor profile not found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the property owner token for authentication
      const token = localStorage.getItem("property_owner_token");
      
      const response = await fetch(`/api/property-owner/vendor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName?.trim(),
          lastName: formData.lastName?.trim(),
          phoneNo1: formData.phoneNo1?.trim(),
          phoneNo2: formData.phoneNo2?.trim() || null,
          cnic: formData.cnic?.trim(),
          address: formData.address?.trim(),
          city: formData.city?.trim(),
          country: formData.country?.trim() || "Pakistan",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
      
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (vendorData) {
      setFormData({
        firstName: vendorData.firstName || "",
        lastName: vendorData.lastName || "",
        email: user?.email || "",
        phoneNo1: vendorData.phoneNo1 || "",
        phoneNo2: vendorData.phoneNo2 || "",
        cnic: vendorData.cnic || "",
        address: vendorData.address || "",
        city: vendorData.city || "",
        country: vendorData.country || "",
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information and account settings.
        </p>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                data-testid="input-last-name"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
              data-testid="input-email"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email address cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNo1" className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Phone No. 1 (Primary)
              </Label>
              <Input
                id="phoneNo1"
                value={formData.phoneNo1}
                onChange={(e) => handleInputChange("phoneNo1", e.target.value)}
                placeholder="Enter primary phone number"
                data-testid="input-phone1"
              />
            </div>
            <div>
              <Label htmlFor="phoneNo2" className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Phone No. 2 (Optional)
              </Label>
              <Input
                id="phoneNo2"
                value={formData.phoneNo2}
                onChange={(e) => handleInputChange("phoneNo2", e.target.value)}
                placeholder="Enter secondary phone number"
                data-testid="input-phone2"
              />
            </div>
          </div>

          {/* Identification */}
          <div>
            <Label htmlFor="cnic" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              CNIC / National ID
            </Label>
            <Input
              id="cnic"
              value={formData.cnic}
              onChange={(e) => handleInputChange("cnic", e.target.value)}
              placeholder="Enter CNIC or National ID"
              data-testid="input-cnic"
            />
          </div>

          {/* Address Information */}
          <div>
            <Label htmlFor="address" className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your full address"
              data-testid="input-address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                data-testid="input-city"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter country"
                data-testid="input-country"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isLoading}
              data-testid="button-discard"
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isLoading}
              data-testid="button-save-changes"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
              <span className="font-semibold">Property Owner</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Verification Status:</span>
              <span className="font-semibold text-green-600">
                {vendorData?.status === "approved" ? "Verified" : "Pending Verification"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
              <span className="font-semibold">
                {user?.id ? "2024" : "Unknown"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Profile() {
  return (
    <PropertyOwnerLayout>
      <ProfileContent />
    </PropertyOwnerLayout>
  );
}