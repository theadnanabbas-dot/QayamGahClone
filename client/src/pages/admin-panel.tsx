import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Settings, 
  Users, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  DollarSign,
  Star,
  Loader2,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Store,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";

// Types
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
  description: string;
  address: string;
  city: string;
  pricePerHour: string;
  category: string;
  isFeature: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

// Header Component
function AdminHeader({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" data-testid="link-admin-home">
              <h1 className="text-2xl font-bold text-primary">Qayamgah Admin</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{user?.role || "Admin"}</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.fullName || user?.email || "Administrator"}
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

// Bookings Management Tab
function BookingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"]
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Booking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({ title: "Failed to update booking", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-500";
      case "PENDING": return "bg-yellow-500";
      case "CANCELLED": return "bg-red-500";
      case "COMPLETED": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="bookings-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Management</h2>
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
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{booking.propertyId.slice(0, 8)}...</TableCell>
                    <TableCell>{booking.userId.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(booking.startAt), "MMM dd, yyyy")}</div>
                        <div className="text-gray-500">
                          {format(new Date(booking.startAt), "HH:mm")} - {format(new Date(booking.endAt), "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rs. {booking.totalPrice}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingMutation.mutate({ 
                                bookingId: booking.id, 
                                status: "CONFIRMED" 
                              })}
                              disabled={updateBookingMutation.isPending}
                              data-testid={`button-confirm-${booking.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingMutation.mutate({ 
                                bookingId: booking.id, 
                                status: "CANCELLED" 
                              })}
                              disabled={updateBookingMutation.isPending}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingMutation.mutate({ 
                              bookingId: booking.id, 
                              status: "COMPLETED" 
                            })}
                            disabled={updateBookingMutation.isPending}
                            data-testid={`button-complete-${booking.id}`}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Property Management Tab
function PropertyManagement() {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    slug: "",
    description: "",
    address: "",
    pricePerHour: "",
    category: "",
    city: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  const { data: categories = [] } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData)
      });
      if (!response.ok) throw new Error("Failed to create property");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Property created successfully" });
      setIsAddingProperty(false);
      setPropertyForm({
        title: "",
        slug: "",
        description: "",
        address: "",
        pricePerHour: "",
        category: "",
        city: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: () => {
      toast({ title: "Failed to create property", variant: "destructive" });
    }
  });

  const handleCreateProperty = () => {
    if (!propertyForm.title || !propertyForm.pricePerHour) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const propertyData = {
      ...propertyForm,
      slug: propertyForm.slug || propertyForm.title.toLowerCase().replace(/\s+/g, '-'),
      pricePerHour: propertyForm.pricePerHour,
      minHours: 2,
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["Wi-Fi", "AC", "Parking"],
      images: ["/api/images/properties/default-property.jpg"],
      mainImage: "/api/images/properties/default-property.jpg",
      isFeature: false,
      isActive: true,
      rating: "4.5"
    };

    createPropertyMutation.mutate(propertyData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="property-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <Button onClick={() => setIsAddingProperty(true)} data-testid="button-add-property">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Add Property Dialog */}
      <Dialog open={isAddingProperty} onOpenChange={setIsAddingProperty}>
        <DialogContent className="max-w-2xl" data-testid="add-property-dialog">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Create a new property listing for booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                placeholder="Property title"
                data-testid="input-property-title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={propertyForm.slug}
                onChange={(e) => setPropertyForm({ ...propertyForm, slug: e.target.value })}
                placeholder="Auto-generated from title"
                data-testid="input-property-slug"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder="Property description"
                data-testid="input-property-description"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={propertyForm.address}
                onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                placeholder="Property address"
                data-testid="input-property-address"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price per Hour (Rs.) *</label>
              <Input
                type="number"
                value={propertyForm.pricePerHour}
                onChange={(e) => setPropertyForm({ ...propertyForm, pricePerHour: e.target.value })}
                placeholder="1000"
                data-testid="input-property-price"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={propertyForm.category} 
                onValueChange={(value) => setPropertyForm({ ...propertyForm, category: value })}
                data-testid="select-property-category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">City</label>
              <Select 
                value={propertyForm.city} 
                onValueChange={(value) => setPropertyForm({ ...propertyForm, city: value })}
                data-testid="select-property-city"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingProperty(false)} data-testid="button-cancel-property">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProperty} 
              disabled={createPropertyMutation.isPending}
              data-testid="button-save-property"
            >
              {createPropertyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Property"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price/Hour</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} data-testid={`property-row-${property.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {property.address || property.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        Rs. {property.pricePerHour}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{property.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={property.isActive ? "bg-green-500" : "bg-red-500"}>
                        {property.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {property.isFeature && (
                        <Badge className="ml-2 bg-blue-500">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/property-details/${property.slug}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-${property.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" data-testid={`button-edit-${property.id}`}>
                          <Edit className="h-4 w-4" />
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
    </div>
  );
}

// User Management Tab
function UserManagement() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error("Failed to update user role");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error("Failed to update user status");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    }
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = (newRole: string) => {
    if (editingUser) {
      updateRoleMutation.mutate({ userId: editingUser.id, role: newRole });
    }
  };

  const handleToggleStatus = (user: User) => {
    updateStatusMutation.mutate({ userId: user.id, isActive: !user.isActive });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500 hover:bg-purple-600";
      case "property_owner": return "bg-blue-500 hover:bg-blue-600";
      case "customer": return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "property_owner": return "Property Owner";
      case "admin": return "Admin";
      case "customer": return "Customer";
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-management">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Users:</span>
            <Badge variant="secondary">{users.length}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Admins:</span>
            <Badge className="bg-purple-500">{users.filter(u => u.role === "admin").length}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Property Owners:</span>
            <Badge className="bg-blue-500">{users.filter(u => u.role === "property_owner").length}</Badge>
          </div>
        </div>
      </div>

      {/* Edit User Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="edit-user-dialog">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.fullName || editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role:</label>
              <Badge className={getRoleColor(editingUser?.role || "")}>
                {getRoleDisplayName(editingUser?.role || "")}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role:</label>
              <Select 
                defaultValue={editingUser?.role} 
                onValueChange={handleUpdateRole}
                data-testid="select-user-role"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="property_owner">Property Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-role-edit"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName || user.username}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={user.isActive ? "bg-green-500" : "bg-red-500"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(user)}
                          disabled={updateStatusMutation.isPending}
                          className="h-6 w-6 p-0"
                          data-testid={`button-toggle-status-${user.id}`}
                        >
                          {user.isActive ? (
                            <XCircle className="h-3 w-3 text-red-500" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          disabled={updateRoleMutation.isPending}
                          data-testid={`button-edit-user-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
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
    </div>
  );
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      const userData = localStorage.getItem("admin_user");
      
      if (!token || !userData) {
        // No authentication, redirect to login
        setLocation("/admin/login");
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "admin") {
          // Not an admin, redirect to login
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          setLocation("/admin/login");
          return;
        }
        
        setUser(parsedUser);
      } catch (error) {
        // Invalid user data, redirect to login
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setLocation("/admin/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    setLocation("/admin/login");
  };

  // Show loading while checking authentication
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
      <AdminHeader user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage bookings, properties, and users
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6" data-testid="admin-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings" className="flex items-center gap-2" data-testid="tab-bookings">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2" data-testid="tab-properties">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="properties">
            <PropertyManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}