import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { format, addHours, addDays } from "date-fns";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  alternatePhone: string;
  arrivalTime: string;
  message: string;
  // Additional fields for booking details
  selectedDate?: Date | null;
  stayType?: string;
  guests?: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse URL parameters for booking data
  const params = new URLSearchParams(window.location.search);
  console.log('Checkout - URL search params:', window.location.search);
  console.log('Checkout - All params:', Object.fromEntries(params.entries()));
  
  const bookingData = {
    propertyId: params.get('propertyId') || '',
    propertyTitle: params.get('propertyTitle') || '',
    roomCategoryId: params.get('roomCategoryId') || '',
    roomCategoryName: params.get('roomCategoryName') || '',
    stayType: params.get('stayType') || '4h',
    selectedDate: params.get('selectedDate') ? new Date(params.get('selectedDate')!) : null,
    startTime: params.get('startTime') || '',
    guests: params.get('guests') || '1',
    totalPrice: Number(params.get('totalPrice')) || 0
  };

  console.log('Checkout - Parsed booking data:', bookingData);

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    alternatePhone: '',
    arrivalTime: bookingData.startTime,
    message: '',
    selectedDate: bookingData.selectedDate,
    stayType: bookingData.stayType,
    guests: bookingData.guests
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if no booking data
  useEffect(() => {
    console.log('Checkout - Validation check:', {
      propertyId: bookingData.propertyId,
      selectedDate: bookingData.selectedDate,
      hasPropertyId: !!bookingData.propertyId,
      hasSelectedDate: !!bookingData.selectedDate
    });
    
    // Only redirect if there's no property data at all
    if (!bookingData.propertyId) {
      console.log('Checkout - Redirecting due to missing property data');
      toast({
        title: "No booking data found",
        description: "Please select a property first.",
        variant: "destructive"
      });
      setLocation('/listings');
    }
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Emails do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.arrivalTime) newErrors.arrivalTime = 'Arrival time is required';
    
    // Validate booking details
    if (!formData.selectedDate) newErrors.selectedDate = 'Check-in date is required' as any;
    if (!formData.stayType) newErrors.stayType = 'Stay duration is required' as any;
    if (!formData.guests) newErrors.guests = 'Number of guests is required' as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate pricing
  const netPrice = bookingData.totalPrice;
  const sstTax = Math.round(netPrice * 0.15); // 15% SST
  const platformFee = 0; // Configurable field for later
  const grandTotal = netPrice + sstTax + platformFee;

  // Booking creation mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Confirmed!",
        description: `Your booking #${booking.id} has been successfully created.`,
      });
      // Navigate to success page or back to property listing
      setLocation(`/customer?booking=${booking.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleConfirmBooking = () => {
    if (!validateForm() || !agreedToTerms) {
      if (!agreedToTerms) {
        toast({
          title: "Terms & Conditions",
          description: "Please agree to the Terms & Conditions to proceed.",
          variant: "destructive"
        });
      }
      return;
    }

    // Calculate end time
    const startDate = new Date(bookingData.selectedDate!);
    const [hours, minutes] = bookingData.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    
    let endDate: Date;
    switch (bookingData.stayType) {
      case '4h': endDate = addHours(startDate, 4); break;
      case '6h': endDate = addHours(startDate, 6); break;
      case '12h': endDate = addHours(startDate, 12); break;
      case '24h': endDate = addDays(startDate, 1); break;
      default: endDate = addHours(startDate, 4);
    }

    const bookingPayload = {
      propertyId: bookingData.propertyId,
      roomCategoryId: bookingData.roomCategoryId,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      guests: parseInt(bookingData.guests),
      stayType: bookingData.stayType,
      totalPrice: grandTotal,
      status: 'Pending',
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        arrivalTime: formData.arrivalTime,
        message: formData.message
      }
    };

    createBookingMutation.mutate(bookingPayload);
  };

  const getDurationText = (stayType: string) => {
    switch (stayType) {
      case '4h': return '4 hours';
      case '6h': return '6 hours';
      case '12h': return '12 hours';
      case '24h': return '24 hours';
      default: return stayType;
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Only prevent rendering if there's no property data at all
  if (!bookingData.propertyId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Complete your booking details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
          {/* Left Panel - Primary Guest Form (65%) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Primary Guest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    data-testid="input-first-name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    data-testid="input-last-name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    data-testid="input-email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Email *</label>
                  <Input
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                    placeholder="Confirm email address"
                    data-testid="input-confirm-email"
                    className={errors.confirmEmail ? 'border-red-500' : ''}
                  />
                  {errors.confirmEmail && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone No. *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    data-testid="input-phone"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alternate Phone No.</label>
                  <Input
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    placeholder="Enter alternate phone"
                    data-testid="input-alternate-phone"
                  />
                </div>
              </div>

              {/* Arrival Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Time of Arrival *</label>
                <Select value={formData.arrivalTime} onValueChange={(value) => handleInputChange('arrivalTime', value)} data-testid="select-arrival-time">
                  <SelectTrigger className={errors.arrivalTime ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select arrival time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return [
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{hour}:00</SelectItem>,
                        <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{hour}:30</SelectItem>
                      ];
                    }).flat()}
                  </SelectContent>
                </Select>
                {errors.arrivalTime && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.arrivalTime}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Any message for hotel (optional)</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter any special requests or messages"
                  rows={3}
                  data-testid="textarea-message"
                />
              </div>

              {/* Login Link */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setLocation('/customer/login')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    data-testid="link-login"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Verify & Confirm (35%) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verify & Confirm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{bookingData.propertyTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bookingData.roomCategoryName}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>{bookingData.selectedDate && format(bookingData.selectedDate, "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{bookingData.startTime} ({getDurationText(bookingData.stayType)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{bookingData.guests} guest{parseInt(bookingData.guests) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-3">
                <h4 className="font-semibold">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Net price</span>
                    <span>Rs. {netPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SST / tax (15%)</span>
                    <span>Rs. {sstTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>Rs. {platformFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Grand Total</span>
                    <span>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms & Conditions */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    data-testid="checkbox-terms"
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to{' '}
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Qayamgah Terms & Conditions
                    </button>
                  </label>
                </div>

                {/* Confirm Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={createBookingMutation.isPending || !agreedToTerms}
                  data-testid="button-confirm-now"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}