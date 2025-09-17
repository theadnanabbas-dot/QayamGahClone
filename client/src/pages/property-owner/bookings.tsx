import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X, Clock } from "lucide-react";

function BookingsContent() {
  return (
    <div className="space-y-6" data-testid="bookings-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bookings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage bookings and reservations for your properties.
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Booking Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Booking Management Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This section will show all your property bookings. You'll be able to approve, reject, and track reservation status.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600" data-testid="button-approve-placeholder">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600" data-testid="button-reject-placeholder">
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600" data-testid="button-pending-placeholder">
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Bookings() {
  return (
    <PropertyOwnerLayout>
      <BookingsContent />
    </PropertyOwnerLayout>
  );
}