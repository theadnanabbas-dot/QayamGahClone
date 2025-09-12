import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  User, 
  Clock, 
  MapPin,
  Star,
  Edit, 
  Eye, 
  Loader2,
  LogOut,
  Heart,
  CreditCard,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

// Types
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

interface Property {
  id: string;
  title: string;
  slug: string;
  pricePerHour: string;
  address: string;
  maxGuests: number;
  rating: string;
  mainImage: string;
  cityId: string;
  categoryId: string;
}

// Header Component
function CustomerHeader({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/customer" data-testid="link-dashboard-home">
              <h1 className="text-2xl font-bold text-green-600">Customer Dashboard</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Customer
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.fullName || user?.email || "Customer"}
              </span>
            </div>
            <Link href="/" data-testid="link-public-site">
              <Button variant="outline">Browse Properties</Button>
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

// Bookings History Tab
function BookingsHistory({ userId }: { userId: string }) {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    select: (data) => data.filter((booking) => booking.userId === userId)
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

  const getPropertyDetails = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
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

  const upcomingBookings = bookings.filter(b => new Date(b.startAt) > new Date());
  const pastBookings = bookings.filter(b => new Date(b.startAt) <= new Date());

  return (
    <div className="space-y-6" data-testid="bookings-history">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total Bookings:</span>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-600">Upcoming Bookings</h3>
        {upcomingBookings.length > 0 ? (
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => {
              const property = getPropertyDetails(booking.propertyId);
              return (
                <Card key={booking.id} className="border-green-200" data-testid={`upcoming-booking-${booking.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {property && (
                        <img 
                          src={property.mainImage} 
                          alt={property.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{property?.title || "Unknown Property"}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property?.address}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div className="font-medium">{format(new Date(booking.startAt), "MMM dd, yyyy")}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <div className="font-medium">
                              {format(new Date(booking.startAt), "HH:mm")} - {format(new Date(booking.endAt), "HH:mm")}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <div className="font-medium">PKR {booking.totalPrice}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-view-${booking.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {booking.status === "PENDING" && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No upcoming bookings</p>
          </Card>
        )}
      </div>

      {/* Past Bookings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-600">Booking History</h3>
        {pastBookings.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastBookings.map((booking) => {
                      const property = getPropertyDetails(booking.propertyId);
                      return (
                        <TableRow key={booking.id} data-testid={`past-booking-${booking.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {property && (
                                <img 
                                  src={property.mainImage} 
                                  alt={property.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{property?.title || "Unknown Property"}</div>
                                <div className="text-sm text-gray-500">{property?.address}</div>
                              </div>
                            </div>
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
                            <Button size="sm" variant="outline" data-testid={`button-view-booking-${booking.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No booking history</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// Profile Management Tab
function ProfileManagement({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const { toast } = useToast();

  const handleSave = () => {
    // Here you would make an API call to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully."
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" data-testid="profile-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          data-testid="button-edit-profile"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user?.fullName || user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <Badge className="bg-green-100 text-green-700 mt-2">Customer</Badge>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-fullname"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ""}
                  disabled
                  className="bg-gray-50"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="+92 300 1234567"
                  data-testid="input-phone"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center space-x-2">
                <Button onClick={handleSave} data-testid="button-save-profile">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Overview
function DashboardOverview({ userId }: { userId: string }) {
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    select: (data) => data.filter((booking) => booking.userId === userId)
  });

  const totalSpent = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0);
  const upcomingBookings = bookings.filter(b => new Date(b.startAt) > new Date()).length;
  const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingBookings}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold">PKR {totalSpent.toFixed(0)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Welcome to your Customer Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your bookings, view your booking history, and update your profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("customer_token");
      const userData = localStorage.getItem("customer_user");
      
      if (!token || !userData) {
        setLocation("/customer/login");
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "customer") {
          localStorage.removeItem("customer_token");
          localStorage.removeItem("customer_user");
          setLocation("/customer/login");
          return;
        }
        
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        setLocation("/customer/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    setLocation("/customer/login");
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
      <CustomerHeader user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your bookings and profile
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" data-testid="customer-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2" data-testid="tab-bookings">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <Edit className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview userId={user.id} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}