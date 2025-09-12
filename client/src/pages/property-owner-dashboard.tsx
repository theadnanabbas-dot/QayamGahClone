import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  Loader2,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

// Types
interface Property {
  id: string;
  title: string;
  slug: string;
  pricePerHour: string;
  address: string;
  maxGuests: number;
  rating: string;
  isActive: boolean;
  mainImage: string;
  cityId: string;
  categoryId: string;
  ownerId: string;
}

interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startAt: string;
  endAt: string;
  totalPrice: string;
  status: string;
  createdAt: string;
}

// Header Component
function PropertyOwnerHeader({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/property-owner" data-testid="link-dashboard-home">
              <h1 className="text-2xl font-bold text-blue-600">Property Owner Dashboard</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Property Owner
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.fullName || user?.email || "Property Owner"}
              </span>
            </div>
            <Link href="/" data-testid="link-public-site">
              <Button variant="outline">View Public Site</Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Properties Management Tab
function PropertiesManagement({ ownerId }: { ownerId: string }) {
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    select: (data) => data.filter((property) => property.ownerId === ownerId) // Filter by owner
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="properties-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-property">
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden" data-testid={`property-card-${property.id}`}>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700">
              <img 
                src={property.mainImage} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                  <Badge className={property.isActive ? "bg-green-500" : "bg-red-500"}>
                    {property.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {property.address}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">PKR {property.pricePerHour}/hour</span>
                  <span className="text-gray-500">{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline" data-testid={`button-view-${property.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" data-testid={`button-edit-${property.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Properties Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by adding your first property to begin receiving bookings.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-first-property">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </Card>
      )}
    </div>
  );
}

// Bookings Management Tab
function BookingsManagement({ ownerId }: { ownerId: string }) {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    select: (data) => {
      // Filter bookings for properties owned by this owner
      // Note: This would need property data to properly filter
      return data; // For now, show all bookings
    }
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getPropertyTitle = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.title || "Unknown Property";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6" data-testid="bookings-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Bookings</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total Bookings:</span>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                    <TableCell>
                      <div className="font-medium">
                        {getPropertyTitle(booking.propertyId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Guest #{booking.userId.slice(-6)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(booking.startAt), "MMM dd, yyyy")}</div>
                        <div className="text-gray-500">
                          {format(new Date(booking.startAt), "HH:mm")} - {format(new Date(booking.endAt), "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Math.round((new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) / (1000 * 60 * 60))} hours
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">PKR {booking.totalPrice}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" data-testid={`button-view-booking-${booking.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {bookings.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bookings for your properties will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}

// Dashboard Overview
function DashboardOverview({ ownerId }: { ownerId: string }) {
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    select: (data) => data.filter((property) => property.ownerId === ownerId)
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"]
  });

  const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0);
  const activeProperties = properties.filter(p => p.isActive).length;
  const totalBookings = bookings.length;

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Properties</p>
                <p className="text-2xl font-bold">{activeProperties}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">PKR {totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Welcome to your Property Owner Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your properties, track bookings, and monitor your revenue all in one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PropertyOwnerDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("property_owner_token");
      const userData = localStorage.getItem("property_owner_user");
      
      if (!token || !userData) {
        setLocation("/property-owner/login");
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "property_owner") {
          localStorage.removeItem("property_owner_token");
          localStorage.removeItem("property_owner_user");
          setLocation("/property-owner/login");
          return;
        }
        
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("property_owner_token");
        localStorage.removeItem("property_owner_user");
        setLocation("/property-owner/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("property_owner_token");
    localStorage.removeItem("property_owner_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    setLocation("/property-owner/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PropertyOwnerHeader user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Property Owner Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your properties and track your business performance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" data-testid="property-owner-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2" data-testid="tab-properties">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2" data-testid="tab-bookings">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview ownerId={user.id} />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesManagement ownerId={user.id} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManagement ownerId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}