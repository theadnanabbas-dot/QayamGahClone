import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  MapPin
} from "lucide-react";

// Types
interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  recentUsers: any[];
}

import AdminLayout from "./layout";

function DashboardContent() {
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"]
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"]
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"]
  });

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalProperties: properties.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice || "0"), 0),
    recentBookings: bookings.slice(0, 5),
    recentUsers: users.slice(0, 5)
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Total Properties",
      value: stats.totalProperties.toLocaleString(),
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  ];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Welcome to the Qayamgah Admin Dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                        Property: {booking.propertyId.slice(0, 8)}...
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

        {/* Recent Users */}
        <Card data-testid="recent-users-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          user.role === "admin" ? "border-purple-500 text-purple-600" :
                          user.role === "property_owner" ? "border-blue-500 text-blue-600" :
                          "border-gray-500 text-gray-600"
                        }
                      >
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent users</p>
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
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Manage Properties
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View and manage all properties
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Review Bookings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage pending bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    User Management
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage user accounts and roles
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

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}