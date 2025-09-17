import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Eye, Edit, Trash2 } from "lucide-react";

function PropertiesContent() {
  return (
    <div className="space-y-6" data-testid="all-properties-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          All Properties
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all your rental properties in one place.
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Property Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Property Management Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Here you'll be able to view, edit, and manage all your properties. Features will include property status updates, pricing changes, and more.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" data-testid="button-view-placeholder">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" data-testid="button-edit-placeholder">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" data-testid="button-delete-placeholder">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AllProperties() {
  return (
    <PropertyOwnerLayout>
      <PropertiesContent />
    </PropertyOwnerLayout>
  );
}