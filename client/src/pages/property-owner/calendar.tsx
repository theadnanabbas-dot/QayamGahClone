import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  CalendarDays as CalendarDaysIcon,
  Plus,
  Trash2,
  RefreshCw,
  Edit,
  Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PropertyOwnerLayout from "./layout";

interface Booking {
  id: string;
  roomCategoryId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  guests: number;
  stayType: string;
  startAt: Date;
  endAt: Date;
  totalPrice: string;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: Date;
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

interface ImportedCalendar {
  id: string;
  userId: string;
  name: string;
  sourceUrl: string;
  platform: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string;
  syncErrorMessage: string | null;
  createdAt: Date;
}

interface ImportedEvent {
  id: string;
  importedCalendarId: string;
  externalId?: string;
  summary: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  location?: string;
  organizer?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Import calendar state
  const [importUrl, setImportUrl] = useState('');
  const [importName, setImportName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch imported calendars
  const { data: importedCalendars = [], isLoading: calendarsLoading } = useQuery<ImportedCalendar[]>({
    queryKey: ["/api/imported-calendars"],
    enabled: !!user
  });

  // Fetch imported events
  const { data: importedEvents = [] } = useQuery<ImportedEvent[]>({
    queryKey: ["/api/imported-events"],
    enabled: !!user
  });

  // Mutations for imported calendars
  const createCalendarMutation = useMutation({
    mutationFn: async (data: { name: string; sourceUrl: string; platform?: string }) => {
      return apiRequest('POST', '/api/imported-calendars', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/imported-calendars"] });
      setImportUrl('');
      setImportName('');
      setIsImporting(false);
      toast({
        title: "Success",
        description: "Calendar imported successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import calendar",
        variant: "destructive"
      });
    }
  });

  const updateCalendarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      return apiRequest('PATCH', `/api/imported-calendars/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/imported-calendars"] });
      setEditingCalendar(null);
      setEditName('');
      toast({
        title: "Success",
        description: "Calendar updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update calendar",
        variant: "destructive"
      });
    }
  });

  const deleteCalendarMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/imported-calendars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/imported-calendars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/imported-events"] });
      toast({
        title: "Success",
        description: "Calendar deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete calendar",
        variant: "destructive"
      });
    }
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/imported-calendars/${id}/sync`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/imported-calendars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/imported-events"] });
      toast({
        title: "Success",
        description: data.message || "Calendar synced successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Error",
        description: error.details || error.message || "Failed to sync calendar",
        variant: "destructive"
      });
    }
  });

  // Filter bookings for the current property owner via room categories
  const myRoomCategories = roomCategories.filter(rc => 
    properties.some(property => property.id === rc.propertyId)
  );

  const myBookings = bookings.filter(booking => 
    myRoomCategories.some(rc => rc.id === booking.roomCategoryId)
  );

  // Apply filters
  const filteredBookings = myBookings.filter(booking => {
    const roomCategory = myRoomCategories.find(rc => rc.id === booking.roomCategoryId);
    const propertyId = roomCategory?.propertyId;
    const propertyMatch = selectedProperty === 'all' || propertyId === selectedProperty;
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
  
  // Get bookings for a specific date (check if booking overlaps with the day)
  const getBookingsForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return filteredBookings.filter(booking => {
      const bookingStart = new Date(booking.startAt);
      const bookingEnd = new Date(booking.endAt);
      // Check if booking overlaps with this day
      return bookingStart < endOfDay && bookingEnd > startOfDay;
    });
  };

  // Get imported events for a specific date (filtered by user's calendars)
  const getImportedEventsForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Only show events from user's own active calendars
    const userCalendarIds = importedCalendars
      .filter(cal => cal.userId === user?.id && cal.isActive)
      .map(cal => cal.id);
    
    return importedEvents.filter(event => {
      const eventStart = new Date(event.startAt);
      const eventEnd = new Date(event.endAt);
      // Check if event overlaps with this day AND belongs to user's calendar
      return eventStart < endOfDay && eventEnd > startOfDay && 
             userCalendarIds.includes(event.importedCalendarId);
    });
  };

  // Combined function to get all events (bookings + imported) for a date
  const getAllEventsForDate = (date: Date) => {
    const localBookings = getBookingsForDate(date).map(booking => ({
      ...booking,
      type: 'local' as const,
      source: 'Qayamgah'
    }));
    
    const externalEvents = getImportedEventsForDate(date).map(event => ({
      ...event,
      type: 'imported' as const,
      source: importedCalendars.find(cal => cal.id === event.importedCalendarId)?.name || 'External'
    }));
    
    return [...localBookings, ...externalEvents];
  };

  // Get property name via room category
  const getPropertyName = (roomCategoryId: string) => {
    const roomCategory = roomCategories.find(rc => rc.id === roomCategoryId);
    if (!roomCategory) return 'Unknown Property';
    const property = properties.find(p => p.id === roomCategory.propertyId);
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

  const formatTimeSlot = (startAt: Date, endAt: Date, stayType: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (stayType === '24h') {
      return '24hr stay';
    }
    return `${stayType} ${startTime}-${endTime}`;
  };

  // Format time for imported events (no stayType)
  const formatImportedEventTime = (startAt: Date, endAt: Date, isAllDay: boolean) => {
    if (isAllDay) {
      return 'All Day';
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime}-${endTime}`;
  };

  // Import calendar handlers
  const handleAddCalendar = () => {
    if (!importUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a calendar URL",
        variant: "destructive"
      });
      return;
    }

    if (!importName.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a calendar name",
        variant: "destructive"
      });
      return;
    }

    createCalendarMutation.mutate({
      name: importName.trim(),
      sourceUrl: importUrl.trim(),
      platform: "external"
    });
  };

  const handleEditCalendar = (calendar: ImportedCalendar) => {
    setEditingCalendar(calendar.id);
    setEditName(calendar.name);
  };

  const handleSaveEdit = () => {
    if (!editingCalendar || !editName.trim()) return;
    
    updateCalendarMutation.mutate({
      id: editingCalendar,
      data: { name: editName.trim() }
    });
  };

  const handleCancelEdit = () => {
    setEditingCalendar(null);
    setEditName('');
  };

  const handleDeleteCalendar = (id: string) => {
    if (confirm('Are you sure you want to delete this imported calendar? All associated events will be removed.')) {
      deleteCalendarMutation.mutate(id);
    }
  };

  const handleSyncCalendar = (id: string) => {
    syncCalendarMutation.mutate(id);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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

      {/* Import Calendars Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            Import Calendars
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Import external calendar feeds from Booking.com, Airbnb, and other platforms
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Calendar Form */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="import-url">Calendar URL (ICS/iCal)</Label>
                  <Input
                    id="import-url"
                    placeholder="https://example.com/calendar.ics"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    data-testid="input-import-url"
                  />
                </div>
                <div>
                  <Label htmlFor="import-name">Calendar Name</Label>
                  <Input
                    id="import-name"
                    placeholder="Booking.com Calendar"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    data-testid="input-import-name"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddCalendar}
                disabled={createCalendarMutation.isPending || !importUrl.trim() || !importName.trim()}
                className="w-full md:w-auto"
                data-testid="button-add-calendar"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createCalendarMutation.isPending ? 'Adding...' : 'Add Calendar Link'}
              </Button>
            </div>
          </div>

          {/* Imported Calendars List */}
          {calendarsLoading ? (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">Loading calendars...</div>
            </div>
          ) : importedCalendars.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Imported Calendars ({importedCalendars.length})
              </h3>
              {importedCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="border rounded-lg p-4 bg-white dark:bg-gray-900"
                  data-testid={`calendar-item-${calendar.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingCalendar === calendar.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1"
                            data-testid={`input-edit-name-${calendar.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateCalendarMutation.isPending}
                            data-testid={`button-save-edit-${calendar.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            data-testid={`button-cancel-edit-${calendar.id}`}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {calendar.name}
                            </h4>
                            <Badge
                              className={`text-xs ${getSyncStatusColor(calendar.lastSyncStatus)}`}
                              data-testid={`badge-sync-status-${calendar.id}`}
                            >
                              {calendar.lastSyncStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {calendar.sourceUrl}
                          </p>
                          {calendar.lastSyncAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Last synced: {new Date(calendar.lastSyncAt).toLocaleString()}
                            </p>
                          )}
                          {calendar.syncErrorMessage && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {calendar.syncErrorMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingCalendar !== calendar.id && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCalendar(calendar)}
                          data-testid={`button-edit-calendar-${calendar.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncCalendar(calendar.id)}
                          disabled={syncCalendarMutation.isPending}
                          data-testid={`button-refresh-calendar-${calendar.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncCalendarMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCalendar(calendar.id)}
                          disabled={deleteCalendarMutation.isPending}
                          data-testid={`button-delete-calendar-${calendar.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No imported calendars
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first external calendar to sync events from other platforms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  const dayEvents = getAllEventsForDate(date);
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
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${event.type === 'local' ? getStatusColor(event.status) : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                            title={event.type === 'local' 
                              ? `${getPropertyName(event.roomCategoryId)} - ${getRoomCategoryName(event.roomCategoryId)} - ${event.customerName}` 
                              : `${event.summary} - ${event.source}`
                            }
                          >
                            <div className="font-medium truncate">
                              {event.type === 'local' 
                                ? getPropertyName(event.roomCategoryId)
                                : event.summary
                              }
                            </div>
                            <div className="truncate">
                              {event.type === 'local' 
                                ? getRoomCategoryName(event.roomCategoryId)
                                : event.source
                              }
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {event.type === 'local'
                                  ? formatTimeSlot(event.startAt, event.endAt, event.stayType)
                                  : formatImportedEventTime(event.startAt, event.endAt, event.isAllDay)
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{dayEvents.length - 2} more
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