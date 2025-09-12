import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Clock, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { format, addHours, addDays, startOfDay, isAfter, isBefore } from "date-fns";

// Types
interface Property {
  id: string;
  title: string;
  pricePerHour: number;
  minHours: number;
  maxGuests: number;
}

interface Booking {
  id: string;
  propertyId: string;
  startAt: Date;
  endAt: Date;
  status: string;
}

interface PriceCalculation {
  totalPrice: number;
  hours: number;
}

interface CalendarBookingProps {
  property: Property;
  onBookingSuccess?: (booking: any) => void;
}

export default function CalendarBooking({ property, onBookingSuccess }: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(property.minHours.toString());
  const [guests, setGuests] = useState("1");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<PriceCalculation | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing bookings for this property
  const { data: existingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/properties/${property.id}/bookings`],
    enabled: !!property.id
  });

  // Price calculation mutation
  const priceCalculationMutation = useMutation({
    mutationFn: async (data: { startAt: Date; endAt: Date }) => {
      const response = await fetch(`/api/properties/${property.id}/calculate-price`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to calculate price');
      return response.json();
    },
    onSuccess: (data: PriceCalculation) => {
      setCalculatedPrice(data);
    },
    onError: () => {
      setCalculatedPrice(null);
    }
  });

  // Booking creation mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Created Successfully!",
        description: `Your booking for ${property.title} has been confirmed.`,
      });
      setShowBookingDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${property.id}/bookings`] });
      onBookingSuccess?.(booking);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Calculate price when date/time changes
  useEffect(() => {
    if (selectedDate && startTime && duration) {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = addHours(startDateTime, parseInt(duration));
      
      // Only calculate if the booking is in the future
      if (isAfter(startDateTime, new Date())) {
        priceCalculationMutation.mutate({
          startAt: startDateTime,
          endAt: endDateTime
        });
      }
    }
  }, [selectedDate, startTime, duration]);

  // Check if a date has any bookings
  const dateHasBookings = (date: Date) => {
    if (!existingBookings) return false;
    return existingBookings.some(booking => {
      const bookingDate = startOfDay(new Date(booking.startAt));
      const checkDate = startOfDay(date);
      return bookingDate.getTime() === checkDate.getTime() && booking.status !== 'CANCELLED';
    });
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !existingBookings) return [];
    
    const timeSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = addHours(slotStart, parseInt(duration));
      
      // Check if this time slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        if (booking.status === 'CANCELLED') return false;
        const bookingStart = new Date(booking.startAt);
        const bookingEnd = new Date(booking.endAt);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
      
      // Check if slot is in the future
      const isInFuture = isAfter(slotStart, new Date());
      
      if (!hasConflict && isInFuture) {
        timeSlots.push(timeString);
      }
    }
    
    return timeSlots;
  };

  const handleBooking = () => {
    if (!selectedDate || !startTime || !customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = addHours(startDateTime, parseInt(duration));

    // For demo purposes, we'll create a guest user booking
    // In a real app, this would use the authenticated user's ID
    const bookingData = {
      propertyId: property.id,
      userId: "guest-user-id", // In real app, get from auth context
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
      status: "PENDING"
    };

    createBookingMutation.mutate(bookingData);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <Card className="w-full" data-testid="calendar-booking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Your Stay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="text-center" data-testid="price-display">
          <div className="text-3xl font-bold text-primary">
            Rs. {property.pricePerHour}
          </div>
          <div className="text-gray-600 dark:text-gray-400">per hour</div>
          {calculatedPrice && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                Total: Rs. {calculatedPrice.totalPrice}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                for {calculatedPrice.hours} hours
              </div>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="space-y-2" data-testid="date-selection">
          <label className="text-sm font-medium">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid="date-picker-button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => 
                  isBefore(date, new Date()) || 
                  isAfter(date, addDays(new Date(), 60)) // Max 60 days in advance
                }
                modifiers={{
                  hasBookings: (date) => dateHasBookings(date)
                }}
                modifiersStyles={{
                  hasBookings: { backgroundColor: '#fef3cd' }
                }}
                data-testid="calendar"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-2" data-testid="time-selection">
            <label className="text-sm font-medium">Select Time</label>
            <Select value={startTime} onValueChange={setStartTime} data-testid="time-select">
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No available time slots
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Duration Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2" data-testid="duration-selection">
            <label className="text-sm font-medium">Duration (hours)</label>
            <Select value={duration} onValueChange={setDuration} data-testid="duration-select">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(12, 24 - property.minHours + 1) }, (_, i) => 
                  property.minHours + i
                ).map((hours) => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} hour{hours > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-testid="guests-selection">
            <label className="text-sm font-medium">Guests</label>
            <Select value={guests} onValueChange={setGuests} data-testid="guests-select">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} guest{count > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4" data-testid="customer-info">
          <label className="text-sm font-medium">Contact Information</label>
          <div className="grid grid-cols-1 gap-3">
            <Input
              placeholder="Full Name *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              data-testid="input-name"
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              data-testid="input-email"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              data-testid="input-phone"
            />
          </div>
        </div>

        {/* Booking Information */}
        {selectedDate && startTime && calculatedPrice && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2" data-testid="booking-summary">
            <div className="font-medium text-blue-800 dark:text-blue-200">Booking Summary</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{format(selectedDate, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{startTime} - {format(addHours(new Date(selectedDate).setHours(parseInt(startTime.split(':')[0])), parseInt(duration)), "HH:mm")}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{duration} hour{parseInt(duration) > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span>{guests}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>Rs. {calculatedPrice.totalPrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setShowBookingDialog(true)}
          disabled={
            !selectedDate || 
            !startTime || 
            !calculatedPrice || 
            availableTimeSlots.length === 0 ||
            createBookingMutation.isPending
          }
          data-testid="button-book-now"
        >
          {createBookingMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Booking...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Book Now
            </>
          )}
        </Button>

        {/* Booking Confirmation Dialog */}
        <AlertDialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <AlertDialogContent data-testid="booking-confirmation-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to book {property.title} for {duration} hour{parseInt(duration) > 1 ? 's' : ''} 
                on {selectedDate && format(selectedDate, "PPP")} at {startTime}?
                <br /><br />
                Total cost: Rs. {calculatedPrice?.totalPrice}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleBooking} disabled={createBookingMutation.isPending} data-testid="button-confirm">
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}