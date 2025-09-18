import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { format, addHours, addDays, startOfDay, isAfter, isBefore } from "date-fns";
import { useLocation } from "wouter";

// Types
interface Property {
  id: string;
  title: string;
  maxGuests: number;
}

interface RoomCategory {
  id: string;
  propertyId: string;
  name: string;
  maxGuestCapacity: number;
  pricePer4Hours: string;
  pricePer6Hours: string;
  pricePer12Hours: string;
  pricePer24Hours: string;
  beds: number;
  bathrooms: number;
  areaSqFt?: number;
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
  stayType: string;
}

interface CalendarBookingProps {
  property: Property;
  roomCategories: RoomCategory[];
  onBookingSuccess?: (booking: any) => void;
}

export default function CalendarBooking({ property, roomCategories, onBookingSuccess }: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [stayType, setStayType] = useState<string>("4h");
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string>(roomCategories[0]?.id || "");
  const [guests, setGuests] = useState("1");
  const [calculatedPrice, setCalculatedPrice] = useState<PriceCalculation | null>(null);
  
  const [, setLocation] = useLocation();

  // Get existing bookings for this property
  const { data: existingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/properties/${property.id}/bookings`],
    enabled: !!property.id
  });

  // Price calculation mutation
  const priceCalculationMutation = useMutation({
    mutationFn: async (data: { roomCategoryId: string; stayType: string; startAt: Date; endAt: Date }) => {
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


  // Auto-set start time for 24h bookings
  useEffect(() => {
    if (stayType === '24h') {
      setStartTime('14:00'); // Auto-set check-in time for 24h bookings
    } else if (stayType !== '24h' && startTime === '14:00') {
      setStartTime('09:00'); // Reset to default for micro-stays
    }
  }, [stayType]);

  // Calculate price when date/time/stayType changes (only if date is selected)
  useEffect(() => {
    const effectiveStartTime = stayType === '24h' && !startTime ? '14:00' : startTime;
    
    if (selectedDate && effectiveStartTime && stayType && selectedRoomCategory) {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = effectiveStartTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on stay type
      let endDateTime: Date;
      switch (stayType) {
        case '4h':
          endDateTime = addHours(startDateTime, 4);
          break;
        case '6h':
          endDateTime = addHours(startDateTime, 6);
          break;
        case '12h':
          endDateTime = addHours(startDateTime, 12);
          break;
        case '24h':
          endDateTime = addDays(startDateTime, 1); // Next day, same time
          break;
        default:
          return;
      }
      
      // Only calculate if the booking is in the future
      if (isAfter(startDateTime, new Date())) {
        priceCalculationMutation.mutate({
          roomCategoryId: selectedRoomCategory,
          stayType: stayType,
          startAt: startDateTime,
          endAt: endDateTime
        });
      }
    } else {
      // Clear calculated price if date/time not selected
      setCalculatedPrice(null);
    }
  }, [selectedDate, startTime, stayType, selectedRoomCategory]);

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
    
    // For 24h bookings, use fixed check-in time (hotel style)
    if (stayType === '24h') {
      const checkInTime = '14:00'; // Standard hotel check-in time
      const slotStart = new Date(selectedDate);
      slotStart.setHours(14, 0, 0, 0);
      const slotEnd = addDays(slotStart, 1); // 24h later
      
      // Check if this conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        if (booking.status === 'CANCELLED') return false;
        const bookingStart = new Date(booking.startAt);
        const bookingEnd = new Date(booking.endAt);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
      
      const isInFuture = isAfter(slotStart, new Date());
      return (!hasConflict && isInFuture) ? [checkInTime] : [];
    }
    
    // For micro-stays (4h, 6h, 12h), generate hourly slots
    const timeSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      let slotEnd: Date;
      switch (stayType) {
        case '4h':
          slotEnd = addHours(slotStart, 4);
          break;
        case '6h':
          slotEnd = addHours(slotStart, 6);
          break;
        case '12h':
          slotEnd = addHours(slotStart, 12);
          break;
        default:
          slotEnd = addHours(slotStart, 4);
      }
      
      // Stop if slot would exceed the day (for micro-stays)
      if (slotEnd.getDate() !== slotStart.getDate()) continue;
      
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
    // For 24h bookings, auto-set start time if not selected
    const effectiveStartTime = stayType === '24h' && !startTime ? '14:00' : startTime;
    
    if (!selectedDate || !effectiveStartTime || !customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = effectiveStartTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    let endDateTime: Date;
    switch (stayType) {
      case '4h':
        endDateTime = addHours(startDateTime, 4);
        break;
      case '6h':
        endDateTime = addHours(startDateTime, 6);
        break;
      case '12h':
        endDateTime = addHours(startDateTime, 12);
        break;
      case '24h':
        endDateTime = addDays(startDateTime, 1);
        break;
      default:
        endDateTime = addHours(startDateTime, 4);
    }

    // Include all required booking fields
    const bookingData = {
      propertyId: property.id,
      roomCategoryId: selectedRoomCategory,
      stayType: stayType,
      userId: "guest-user-id", // In real app, get from auth context
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      guests: parseInt(guests),
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
        {/* Room Category Selection */}
        <div className="space-y-2" data-testid="room-category-selection">
          <label className="text-sm font-medium">Select Room Category</label>
          <Select value={selectedRoomCategory} onValueChange={setSelectedRoomCategory} data-testid="room-category-select">
            <SelectTrigger>
              <SelectValue placeholder="Choose a room category" />
            </SelectTrigger>
            <SelectContent>
              {roomCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} - Max {category.maxGuestCapacity} guests
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        <div className="text-center" data-testid="price-display">
          {(() => {
            const currentRoom = roomCategories.find(r => r.id === selectedRoomCategory);
            if (!currentRoom) return null;
            
            let price = "0";
            switch (stayType) {
              case '4h': price = currentRoom.pricePer4Hours; break;
              case '6h': price = currentRoom.pricePer6Hours; break;
              case '12h': price = currentRoom.pricePer12Hours; break;
              case '24h': price = currentRoom.pricePer24Hours; break;
            }
            
            return (
              <>
                <div className="text-3xl font-bold text-primary">
                  Rs. {parseFloat(price).toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  for {stayType === '4h' ? '4 hours' : stayType === '6h' ? '6 hours' : stayType === '12h' ? '12 hours' : '24 hours'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {currentRoom.name} • Max {currentRoom.maxGuestCapacity} guests
                </div>
              </>
            );
          })()}
          
          {calculatedPrice && selectedDate && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                Total: Rs. {calculatedPrice.totalPrice}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                for {stayType === '4h' ? '4 hours' : stayType === '6h' ? '6 hours' : stayType === '12h' ? '12 hours' : '24 hours'}
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

        {/* Stay Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2" data-testid="stay-type-selection">
            <label className="text-sm font-medium">Stay Duration</label>
            <Select value={stayType} onValueChange={setStayType} data-testid="stay-type-select">
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4h">4 hours</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="12h">12 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
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
                <span>{startTime} - {(() => {
                  const start = new Date(selectedDate!);
                  const [hours, minutes] = startTime.split(':').map(Number);
                  start.setHours(hours, minutes, 0, 0);
                  let end: Date;
                  switch (stayType) {
                    case '4h': end = addHours(start, 4); break;
                    case '6h': end = addHours(start, 6); break;
                    case '12h': end = addHours(start, 12); break;
                    case '24h': end = addDays(start, 1); break;
                    default: end = addHours(start, 4);
                  }
                  return format(end, "HH:mm");
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{stayType === '4h' ? '4 hours' : stayType === '6h' ? '6 hours' : stayType === '12h' ? '12 hours' : '24 hours'}</span>
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
          onClick={() => {
            // Navigate to checkout with booking data in URL params
            const bookingData = {
              propertyId: property.id,
              propertyTitle: property.title,
              roomCategoryId: selectedRoomCategory,
              roomCategoryName: roomCategories.find(rc => rc.id === selectedRoomCategory)?.name || '',
              stayType: stayType,
              selectedDate: selectedDate?.toISOString(),
              startTime: startTime,
              guests: guests,
              totalPrice: calculatedPrice?.totalPrice || 0
            };
            console.log('Booking data for checkout:', bookingData);
            const params = new URLSearchParams(Object.entries(bookingData).filter(([, value]) => value !== '' && value !== null && value !== undefined));
            const checkoutUrl = `/checkout?${params.toString()}`;
            console.log('Navigating to:', checkoutUrl);
            setLocation(checkoutUrl);
          }}
          disabled={
            !selectedDate || 
            (stayType !== '24h' && !startTime) ||
            (stayType !== '24h' && availableTimeSlots.length === 0)
          }
          data-testid="button-book-now"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Book Now
        </Button>

      </CardContent>
    </Card>
  );
}