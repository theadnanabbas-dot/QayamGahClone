import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Store,
  Building2,
  MapPin,
  DollarSign,
  Star,
  Eye,
  Edit,
  Plus,
  Loader2,
  EyeOff
} from "lucide-react";
import { format } from "date-fns";
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

interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  pricePerHour: string;
  ownerId: string;
  isFeature: boolean;
  isActive: boolean;
  rating: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

import AdminLayout from "./layout";

// Vendor Registration Modal Component
function VendorRegistrationModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  const { toast } = useToast();

  // Step 1: Signup Form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Step 2: Personal Details Form
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
      agreeToTerms: false,
    },
  });

  // Mutations
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      // For now, simulate account creation - will be implemented with proper backend endpoint
      return { success: true, user: { email: data.email, role: "property_owner" } };
    },
    onSuccess: (data) => {
      setSignupData(data);
      setStep(2);
      toast({
        title: "Account created!",
        description: "Please complete your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const personalDetailsMutation = useMutation({
    mutationFn: async (data: PersonalDetailsFormData) => {
      // For now, simulate profile creation - will be implemented with proper backend endpoint
      // In a real implementation, this would invalidate the users query to refresh the vendor list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      return { success: true };
    },
    onSuccess: () => {
      setStep(3);
      toast({
        title: "Success!",
        description: "Vendor account created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignupSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const handlePersonalDetailsSubmit = (data: PersonalDetailsFormData) => {
    personalDetailsMutation.mutate(data);
  };

  const handleClose = () => {
    setStep(1);
    setSignupData(null);
    signupForm.reset();
    personalForm.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-vendor-registration-admin">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Create Vendor Account"}
            {step === 2 && "Add Personal Details"}
            {step === 3 && "Success"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Signup */}
        {step === 1 && (
          <div className="space-y-4" data-testid="step-signup-admin">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email"
                          data-testid="input-email-admin"
                          {...field}
                        />
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
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            data-testid="input-password-admin"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password-admin"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending}
                  data-testid="button-signup-submit-admin"
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-google-oauth-admin"
              onClick={() => toast({
                title: "Coming Soon",
                description: "Google OAuth integration will be available soon.",
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Log in
              </a>
            </p>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-4" data-testid="step-personal-details-admin">
            <Form {...personalForm}>
              <form onSubmit={personalForm.handleSubmit(handlePersonalDetailsSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First Name"
                            data-testid="input-first-name-admin"
                            {...field}
                          />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Last Name"
                            data-testid="input-last-name-admin"
                            {...field}
                          />
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
                      <FormLabel>Phone No. 1 *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Primary phone number"
                          data-testid="input-phone-1-admin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="phoneNo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone No. 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Secondary phone number"
                          data-testid="input-phone-2-admin"
                          {...field}
                        />
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
                      <FormLabel>CNIC / National Identity No. *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXXXX-XXXXXXX-X"
                          data-testid="input-cnic-admin"
                          {...field}
                        />
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
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Complete address"
                          data-testid="input-address-admin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City"
                            data-testid="input-city-admin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Country"
                            data-testid="input-country-admin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={personalForm.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms-admin"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Terms & Conditions *
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={personalDetailsMutation.isPending}
                  data-testid="button-personal-details-submit-admin"
                >
                  {personalDetailsMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-4" data-testid="step-success-admin">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Vendor Account Created Successfully!</h3>
            <p className="text-gray-600">
              Your vendor account has been created and is pending approval. You will receive an email notification once your account is approved.
            </p>
            <Button onClick={handleClose} className="w-full" data-testid="button-success-close-admin">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function VendorsContent() {
  const [showVendorModal, setShowVendorModal] = useState(false);
  
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  // Filter property owners (vendors)
  const vendors = users.filter(user => user.role === "property_owner");

  // Get properties by vendor
  const getVendorProperties = (vendorId: string) => {
    return properties.filter(property => property.ownerId === vendorId);
  };

  const getVendorStats = (vendorId: string) => {
    const vendorProperties = getVendorProperties(vendorId);
    const totalProperties = vendorProperties.length;
    const activeProperties = vendorProperties.filter(p => p.isActive).length;
    const featuredProperties = vendorProperties.filter(p => p.isFeature).length;
    const totalRevenue = vendorProperties.reduce((sum, property) => 
      sum + parseFloat(property.pricePerHour), 0
    );

    return {
      totalProperties,
      activeProperties,
      featuredProperties,
      avgPrice: totalProperties > 0 ? totalRevenue / totalProperties : 0
    };
  };

  if (usersLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-vendors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vendors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage property owners and their listings.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Vendors:</span>
            <Badge variant="secondary">{vendors.length}</Badge>
          </div>
          <Button 
            onClick={() => setShowVendorModal(true)}
            data-testid="button-add-vendor"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.length > 0 ? vendors.map((vendor) => {
          const stats = getVendorStats(vendor.id);
          const vendorProperties = getVendorProperties(vendor.id);
          
          return (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow" data-testid={`vendor-card-${vendor.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {vendor.fullName || vendor.username}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      @{vendor.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {vendor.email}
                    </p>
                  </div>
                  <Badge 
                    variant={vendor.isActive ? "default" : "secondary"}
                    className={vendor.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {vendor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalProperties}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Properties
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.activeProperties}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Active
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Featured Properties:</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.featuredProperties}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Price/Hour:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Rs. {stats.avgPrice.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {format(new Date(vendor.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                </div>

                {/* Recent Properties Preview */}
                {vendorProperties.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Recent Properties:
                    </h4>
                    <div className="space-y-2">
                      {vendorProperties.slice(0, 2).map((property) => (
                        <div key={property.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                            {property.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${property.isActive ? 'border-green-500 text-green-600' : 'border-gray-500 text-gray-600'}`}
                          >
                            {property.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                      {vendorProperties.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{vendorProperties.length - 2} more properties
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-${vendor.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-edit-${vendor.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Vendors Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No property owners have registered yet.
                </p>
                <Button data-testid="button-add-first-vendor">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vendor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {vendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {vendors.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Vendors
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vendors.filter(v => v.isActive).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Active Vendors
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {properties.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total Properties
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {properties.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Active Properties
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Vendor Registration Modal */}
      <VendorRegistrationModal 
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
      />
    </div>
  );
}

export default function AdminVendors() {
  return (
    <AdminLayout>
      <VendorsContent />
    </AdminLayout>
  );
}