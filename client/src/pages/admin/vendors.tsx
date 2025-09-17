import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Store,
  Building2,
  MapPin,
  DollarSign,
  Star,
  Eye,
  Edit,
  Plus,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  pricePerHour: string;
  ownerId: string;
  isFeature: boolean;
  isActive: boolean;
  rating: string;
  createdAt: string;
}

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

import AdminLayout from "./layout";

function VendorsContent() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  // Filter property owners (vendors)
  const vendors = users.filter(user => user.role === "property_owner");

  // Get properties by vendor
  const getVendorProperties = (vendorId: string) => {
    return properties.filter(property => property.ownerId === vendorId);
  };

  const getVendorStats = (vendorId: string) => {
    const vendorProperties = getVendorProperties(vendorId);
    const totalProperties = vendorProperties.length;
    const activeProperties = vendorProperties.filter(p => p.isActive).length;
    const featuredProperties = vendorProperties.filter(p => p.isFeature).length;
    const totalRevenue = vendorProperties.reduce((sum, property) => 
      sum + parseFloat(property.pricePerHour), 0
    );

    return {
      totalProperties,
      activeProperties,
      featuredProperties,
      avgPrice: totalProperties > 0 ? totalRevenue / totalProperties : 0
    };
  };

  if (usersLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-vendors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vendors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage property owners and their listings.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Vendors:</span>
            <Badge variant="secondary">{vendors.length}</Badge>
          </div>
          <Button data-testid="button-add-vendor">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.length > 0 ? vendors.map((vendor) => {
          const stats = getVendorStats(vendor.id);
          const vendorProperties = getVendorProperties(vendor.id);
          
          return (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow" data-testid={`vendor-card-${vendor.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {vendor.fullName || vendor.username}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      @{vendor.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {vendor.email}
                    </p>
                  </div>
                  <Badge 
                    variant={vendor.isActive ? "default" : "secondary"}
                    className={vendor.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {vendor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalProperties}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Properties
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.activeProperties}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Active
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Featured Properties:</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.featuredProperties}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Price/Hour:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Rs. {stats.avgPrice.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {format(new Date(vendor.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                </div>

                {/* Recent Properties Preview */}
                {vendorProperties.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Recent Properties:
                    </h4>
                    <div className="space-y-2">
                      {vendorProperties.slice(0, 2).map((property) => (
                        <div key={property.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                            {property.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${property.isActive ? 'border-green-500 text-green-600' : 'border-gray-500 text-gray-600'}`}
                          >
                            {property.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                      {vendorProperties.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{vendorProperties.length - 2} more properties
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-${vendor.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-edit-${vendor.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Vendors Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No property owners have registered yet.
                </p>
                <Button data-testid="button-add-first-vendor">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vendor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {vendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {vendors.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Vendors
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vendors.filter(v => v.isActive).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Active Vendors
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {properties.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total Properties
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {properties.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Active Properties
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminVendors() {
  return (
    <AdminLayout>
      <VendorsContent />
    </AdminLayout>
  );
}