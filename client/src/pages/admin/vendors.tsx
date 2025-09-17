import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  EyeOff,
  X,
  CheckCircle
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

// Edit Vendor Schema
const editVendorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNo1: z.string().min(10, "Phone number must be at least 10 digits"),
  phoneNo2: z.string().optional(),
  cnic: z.string().min(13, "CNIC must be at least 13 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  status: z.enum(["pending", "approved", "rejected"])
});

type EditVendorFormData = z.infer<typeof editVendorSchema>;

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
      // Store signup data locally and proceed to next step
      return { success: true, user: { email: data.email, role: "property_owner" } };
    },
    onSuccess: (data) => {
      setSignupData(data);
      setStep(2);
      toast({
        title: "Account details saved!",
        description: "Please complete your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const personalDetailsMutation = useMutation({
    mutationFn: async (data: PersonalDetailsFormData) => {
      // Get signup data from step 1
      const signupFormData = signupForm.getValues();
      
      // Combine signup and personal details for registration
      const registrationData = {
        email: signupFormData.email,
        password: signupFormData.password,
        ...data,
      };

      const response = await apiRequest("POST", "/api/vendor/register", registrationData);
      return await response.json();
    },
    onSuccess: () => {
      setStep(3);
      toast({
        title: "Success!",
        description: "Vendor account created successfully. Pending approval.",
      });
      // Invalidate queries to refresh vendor data
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
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

// View Vendor Details Modal Component
function ViewVendorModal({ 
  isOpen, 
  onClose, 
  vendor, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  vendor: Vendor | null;
  user: User | null;
}) {
  if (!vendor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-view-vendor">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Vendor Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-view-vendor"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" data-testid="vendor-details">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-first-name">
                {vendor.firstName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-last-name">
                {vendor.lastName}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-email">
              {user?.email || "No email"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone No. 1</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-phone-1">
                {vendor.phoneNo1}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone No. 2</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-phone-2">
                {vendor.phoneNo2 || "Not provided"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CNIC / National ID</label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-cnic">
              {vendor.cnic}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-address">
              {vendor.address}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-city">
                {vendor.city}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1" data-testid="view-country">
                {vendor.country}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <div className="mt-1">
              <Badge 
                variant={vendor.status === "approved" ? "default" : vendor.status === "pending" ? "secondary" : "destructive"}
                className={
                  vendor.status === "approved" 
                    ? "bg-green-500 hover:bg-green-600" 
                    : vendor.status === "pending"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-red-500 hover:bg-red-600"
                }
                data-testid="view-status"
              >
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Vendor Details Modal Component
function EditVendorModal({ 
  isOpen, 
  onClose, 
  vendor, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  vendor: Vendor | null;
  user: User | null;
}) {
  const { toast } = useToast();

  const editForm = useForm<EditVendorFormData>({
    resolver: zodResolver(editVendorSchema),
    defaultValues: {
      firstName: vendor?.firstName || "",
      lastName: vendor?.lastName || "",
      phoneNo1: vendor?.phoneNo1 || "",
      phoneNo2: vendor?.phoneNo2 || "",
      cnic: vendor?.cnic || "",
      address: vendor?.address || "",
      city: vendor?.city || "",
      country: vendor?.country || "",
      status: (vendor?.status as "pending" | "approved" | "rejected") || "pending"
    },
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async (data: EditVendorFormData) => {
      if (!vendor) throw new Error("No vendor selected");
      const response = await apiRequest("PATCH", `/api/vendors/${vendor.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Vendor details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor details.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EditVendorFormData) => {
    updateVendorMutation.mutate(data);
  };

  const handleDiscard = () => {
    editForm.reset();
    onClose();
  };

  if (!vendor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDiscard}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-edit-vendor">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Vendor Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              data-testid="button-close-edit-vendor"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" data-testid="edit-vendor-form">
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First Name"
                          data-testid="input-edit-first-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Last Name"
                          data-testid="input-edit-last-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded" data-testid="edit-email-readonly">
                  {user?.email || "No email"} (Read-only)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phoneNo1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone No. 1 *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Primary phone number"
                          data-testid="input-edit-phone-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phoneNo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone No. 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Secondary phone number"
                          data-testid="input-edit-phone-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="cnic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC / National Identity No. *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XXXXX-XXXXXXX-X"
                        data-testid="input-edit-cnic"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Complete address"
                        data-testid="input-edit-address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City"
                          data-testid="input-edit-city"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Country"
                          data-testid="input-edit-country"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending" data-testid="status-option-pending">Pending</SelectItem>
                        <SelectItem value="approved" data-testid="status-option-approved">Approved</SelectItem>
                        <SelectItem value="rejected" data-testid="status-option-rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleDiscard}
                  className="flex-1"
                  disabled={updateVendorMutation.isPending}
                  data-testid="button-discard-vendor"
                >
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={updateVendorMutation.isPending}
                  data-testid="button-save-vendor"
                >
                  {updateVendorMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Vendor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNo1: string;
  phoneNo2: string | null;
  cnic: string;
  address: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  approvedAt: string | null;
}

function VendorsContent() {
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"]
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  const { toast } = useToast();

  // Modal management functions
  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowViewModal(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowEditModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedVendor(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedVendor(null);
  };

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/vendors/${vendorId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Vendor status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor status.",
        variant: "destructive",
      });
    },
  });

  // Get user info for vendor
  const getUserForVendor = (userId: string) => {
    return users.find(user => user.id === userId);
  };

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
          const stats = getVendorStats(vendor.userId);
          const vendorProperties = getVendorProperties(vendor.userId);
          const user = getUserForVendor(vendor.userId);
          
          return (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow" data-testid={`vendor-card-${vendor.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {`${vendor.firstName} ${vendor.lastName}`}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {vendor.phoneNo1}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {user?.email || "No email"}
                    </p>
                  </div>
                  <Badge 
                    variant={vendor.status === "approved" ? "default" : vendor.status === "pending" ? "secondary" : "destructive"}
                    className={
                      vendor.status === "approved" 
                        ? "bg-green-500 hover:bg-green-600" 
                        : vendor.status === "pending"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
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
                <div className="mt-4 pt-3 border-t">
                  {/* Status Actions */}
                  <div className="flex items-center space-x-2 mb-2">
                    {vendor.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => statusUpdateMutation.mutate({ vendorId: vendor.id, status: "approved" })}
                          disabled={statusUpdateMutation.isPending}
                          data-testid={`button-approve-${vendor.id}`}
                        >
                          {statusUpdateMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {statusUpdateMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => statusUpdateMutation.mutate({ vendorId: vendor.id, status: "rejected" })}
                          disabled={statusUpdateMutation.isPending}
                          data-testid={`button-reject-${vendor.id}`}
                        >
                          {statusUpdateMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          {statusUpdateMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}
                    
                    {vendor.status === "approved" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => statusUpdateMutation.mutate({ vendorId: vendor.id, status: "rejected" })}
                        disabled={statusUpdateMutation.isPending}
                        data-testid={`button-deactivate-${vendor.id}`}
                      >
                        {statusUpdateMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {statusUpdateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                      </Button>
                    )}
                    
                    {vendor.status === "rejected" && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => statusUpdateMutation.mutate({ vendorId: vendor.id, status: "approved" })}
                        disabled={statusUpdateMutation.isPending}
                        data-testid={`button-reactivate-${vendor.id}`}
                      >
                        {statusUpdateMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {statusUpdateMutation.isPending ? 'Reactivating...' : 'Reactivate'}
                      </Button>
                    )}
                  </div>
                  
                  {/* View/Edit Actions */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleViewVendor(vendor)}
                      data-testid={`button-view-${vendor.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleEditVendor(vendor)}
                      data-testid={`button-edit-${vendor.id}`}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
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
                  {vendors.filter(v => v.status === "approved").length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Approved Vendors
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

      {/* View Vendor Modal */}
      <ViewVendorModal 
        isOpen={showViewModal}
        onClose={closeViewModal}
        vendor={selectedVendor}
        user={selectedVendor ? getUserForVendor(selectedVendor.userId) : null}
      />

      {/* Edit Vendor Modal */}
      <EditVendorModal 
        isOpen={showEditModal}
        onClose={closeEditModal}
        vendor={selectedVendor}
        user={selectedVendor ? getUserForVendor(selectedVendor.userId) : null}
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