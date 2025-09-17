import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  Star
} from "lucide-react";

// Types
interface PropertyOwnerStats {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  activeProperties: number;
  recentBookings: any[];
  myProperties: any[];
}

import PropertyOwnerLayout from "./layout";

function DashboardContent() {
  // Get current user from localStorage
  const userString = localStorage.getItem("property_owner_user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.id;

  const { data: allProperties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"]
  });

  const { data: allBookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"]
  });

  // Filter properties owned by current user
  const myProperties = allProperties.filter(property => property.ownerId === userId);
  
  // Filter bookings for my properties
  const myPropertyIds = myProperties.map(p => p.id);
  const myBookings = allBookings.filter(booking => myPropertyIds.includes(booking.propertyId));

  // Calculate stats
  const stats = {
    totalProperties: myProperties.length,
    totalBookings: myBookings.length,
    totalRevenue: myBookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice || "0"), 0),
    activeProperties: myProperties.filter(p => p.isActive).length,
    recentBookings: myBookings.slice(0, 5),
    myProperties: myProperties.slice(0, 5)
  };

  const statCards = [
    {
      title: "My Properties",
      value: stats.totalProperties.toLocaleString(),
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "Active Properties",
      value: stats.activeProperties.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="space-y-6" data-testid="property-owner-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.fullName || user?.email}! Here's an overview of your properties and bookings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card data-testid="recent-bookings-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking, index) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Booking #{booking.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Property: {myProperties.find(p => p.id === booking.propertyId)?.title?.slice(0, 30)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Guest: {booking.guestName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Rs. {booking.totalPrice}
                      </p>
                      <Badge 
                        className={
                          booking.status === "CONFIRMED" ? "bg-green-500" :
                          booking.status === "PENDING" ? "bg-yellow-500" :
                          booking.status === "CANCELLED" ? "bg-red-500" : "bg-gray-500"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent bookings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Properties */}
        <Card data-testid="my-properties-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              My Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.myProperties.length > 0 ? (
              <div className="space-y-4">
                {stats.myProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.address.slice(0, 40)}...
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {property.rating} rating
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Rs. {property.pricePerHour}/hr
                      </p>
                      <Badge 
                        variant={property.isActive ? "default" : "secondary"}
                        className={property.isActive ? "bg-green-500" : "bg-gray-500"}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No properties yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="quick-actions-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Add New Property
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    List a new rental property
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Manage Bookings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review pending bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    View Transactions
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track your earnings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PropertyOwnerDashboard() {
  return (
    <PropertyOwnerLayout>
      <DashboardContent />
    </PropertyOwnerLayout>
  );
}