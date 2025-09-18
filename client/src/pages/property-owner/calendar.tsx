import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Building2,
  Filter,
  Copy,
  Check,
  Eye,
  CalendarDays as CalendarDaysIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PropertyOwnerLayout from "./layout";

interface Booking {
  id: string;
  propertyId: string;
  roomCategoryId: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  selectedDate: string;
  stayType: string;
  totalPrice: string;
  status: string;
}

interface Property {
  id: string;
  title: string;
  ownerId: string;
}

interface RoomCategory {
  id: string;
  propertyId: string;
  name: string;
}

function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  // Get current user from localStorage
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("property_owner_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch data
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"]
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    select: (data) => data.filter((property) => property.ownerId === user?.id)
  });

  const { data: roomCategories = [] } = useQuery<RoomCategory[]>({
    queryKey: ["/api/room-categories"]
  });

  // Filter bookings for the current property owner
  const myBookings = bookings.filter(booking => 
    properties.some(property => property.id === booking.propertyId)
  );

  // Apply filters
  const filteredBookings = myBookings.filter(booking => {
    const propertyMatch = selectedProperty === 'all' || booking.propertyId === selectedProperty;
    const statusMatch = selectedStatus === 'all' || booking.status.toLowerCase() === selectedStatus.toLowerCase();
    return propertyMatch && statusMatch;
  });

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredBookings.filter(booking => 
      booking.selectedDate === dateString
    );
  };

  // Get property name
  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.title || 'Unknown Property';
  };

  // Get room category name
  const getRoomCategoryName = (roomCategoryId: string) => {
    const category = roomCategories.find(c => c.id === roomCategoryId);
    return category?.name || 'Unknown Room';
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // ICS sync link
  const syncLink = user ? `${window.location.origin}/calendar-sync/vendor/${user.id}/ical.ics` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(syncLink);
      setCopiedLink(true);
      toast({
        title: "Link Copied!",
        description: "Calendar sync link copied to clipboard"
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeSlot = (stayType: string, startTime: string) => {
    if (stayType === '24h') {
      return '24hr stay';
    }
    const time = new Date(`2000-01-01T${startTime}`);
    return `${stayType} from ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Availability & Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your property bookings in calendar format.
          </p>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
            data-testid="button-month-view"
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
            data-testid="button-week-view"
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
            data-testid="button-day-view"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-48" data-testid="select-property-filter">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-36" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ICS Sync Link */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Calendar Sync</p>
                <p className="text-xs text-gray-500">Share with booking platforms</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="ml-auto"
                data-testid="button-copy-sync-link"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode !== 'month' && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {viewMode === 'week' ? 'Week View' : 'Day View'}
                </span>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                data-testid="button-prev-period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                data-testid="button-next-period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Month View */}
          {viewMode === 'month' && (
            <div className="space-y-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  const dayBookings = getBookingsForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border rounded-lg ${
                        isCurrentMonth 
                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      data-testid={`calendar-day-${date.toISOString().split('T')[0]}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map(booking => (
                          <div
                            key={booking.id}
                            className={`text-xs p-1 rounded border ${getStatusColor(booking.status)}`}
                            title={`${getPropertyName(booking.propertyId)} - ${getRoomCategoryName(booking.roomCategoryId)} - ${booking.customerName}`}
                          >
                            <div className="font-medium truncate">
                              {getPropertyName(booking.propertyId)}
                            </div>
                            <div className="truncate">
                              {getRoomCategoryName(booking.roomCategoryId)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeSlot(booking.stayType, booking.startTime)}</span>
                            </div>
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week and Day views placeholder */}
          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="text-center py-16">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {viewMode === 'week' ? 'Week View' : 'Day View'} Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This view will be available in a future update. For now, use the month view above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{filteredBookings.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredBookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredBookings.filter(b => b.status.toLowerCase() === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Calendar() {
  return (
    <PropertyOwnerLayout>
      <CalendarContent />
    </PropertyOwnerLayout>
  );
}