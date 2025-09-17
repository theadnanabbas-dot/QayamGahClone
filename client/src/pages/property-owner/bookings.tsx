import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Eye, User, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  startAt: string;
  endAt: string;
  totalPrice: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  mainImage: string;
  ownerId: string;
}

function BookingsContent() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Get current user from localStorage
  const userString = localStorage.getItem("property_owner_user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.id;

  const { data: allBookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"]
  });

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  // Filter properties owned by current user
  const myProperties = allProperties.filter(property => property.ownerId === userId);
  const myPropertyIds = myProperties.map(p => p.id);

  // Filter bookings for my properties
  const myBookings = allBookings.filter(booking => myPropertyIds.includes(booking.propertyId));

  const getProperty = (propertyId: string) => {
    return myProperties.find(p => p.id === propertyId);
  };

  const handleView = (booking: Booking) => {
    const property = getProperty(booking.propertyId);
    setSelectedBooking(booking);
    setSelectedProperty(property || null);
    setViewModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatus = (status: string) => {
    // For demo purposes, assume confirmed and completed are paid
    return (status === "CONFIRMED" || status === "COMPLETED") ? "Paid" : "Unpaid";
  };

  const getPaymentStatusColor = (status: string) => {
    return (status === "CONFIRMED" || status === "COMPLETED") ? "bg-green-500" : "bg-red-500";
  };

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

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Property Bookings ({myBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myBookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any bookings yet. Once guests book your properties, they'll appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Check-in/Check-out</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBookings.map((booking) => {
                  const property = getProperty(booking.propertyId);
                  const paymentStatus = getPaymentStatus(booking.status);
                  
                  return (
                    <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          #{booking.id.slice(0, 8)}...
                        </span>
                      </TableCell>
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
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {property?.title || "Unknown Property"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property?.address?.slice(0, 30)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {format(new Date(booking.startAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-gray-500">
                            to {format(new Date(booking.endAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(booking.startAt), "HH:mm")} - {format(new Date(booking.endAt), "HH:mm")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getPaymentStatusColor(booking.status)}>
                            {paymentStatus}
                          </Badge>
                          <p className="text-sm font-semibold">Rs. {booking.totalPrice}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(booking)}
                          data-testid={`button-view-booking-${booking.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Booking Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="view-booking-modal">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking reservation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && selectedProperty && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Booking ID:</span>
                      <span className="font-mono">#{selectedBooking.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Price:</span>
                      <span className="font-semibold">Rs. {selectedBooking.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Status:</span>
                      <Badge className={getPaymentStatusColor(selectedBooking.status)}>
                        {getPaymentStatus(selectedBooking.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Guest Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span>{selectedBooking.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedBooking.guestEmail}</span>
                    </div>
                    {selectedBooking.guestPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span>{selectedBooking.guestPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div>
                <h4 className="font-semibold mb-3">Property Information</h4>
                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <img 
                    src={selectedProperty.mainImage} 
                    alt={selectedProperty.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h5 className="font-medium">{selectedProperty.title}</h5>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedProperty.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="font-semibold mb-3">Booking Dates & Times</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-green-600 mb-2">Check-in</h5>
                    <p className="text-sm">{format(new Date(selectedBooking.startAt), "EEEE, MMMM dd, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(new Date(selectedBooking.startAt), "HH:mm")}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-red-600 mb-2">Check-out</h5>
                    <p className="text-sm">{format(new Date(selectedBooking.endAt), "EEEE, MMMM dd, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(new Date(selectedBooking.endAt), "HH:mm")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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