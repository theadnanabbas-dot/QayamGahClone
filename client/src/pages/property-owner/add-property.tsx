import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";

function AddPropertyContent() {
  return (
    <div className="space-y-6" data-testid="add-property-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Add New Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          List a new rental property to start earning.
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Property Listing Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Plus className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Property Listing Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The property listing form will be available here. You'll be able to add photos, descriptions, pricing, and more.
            </p>
            <Button data-testid="button-add-property-placeholder">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddProperty() {
  return (
    <PropertyOwnerLayout>
      <AddPropertyContent />
    </PropertyOwnerLayout>
  );
}