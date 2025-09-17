import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Banknote,
  Building
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startAt: string;
  endAt: string;
  totalPrice: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

import AdminLayout from "./layout";

function BookingsContent() {
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
      case "bank_transfer": return <Building className="h-4 w-4" />;
      case "jazzcash":
      case "easypaisa": return <CreditCard className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "card": return "Credit/Debit Card";
      case "cash": return "Cash";
      case "bank_transfer": return "Bank Transfer";
      case "jazzcash": return "JazzCash";
      case "easypaisa": return "EasyPaisa";
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    toast({
      title: "Booking Details",
      description: `Viewing details for booking ${booking.id.slice(0, 8)}...`
    });
  };

  const handleEditBooking = (booking: Booking) => {
    toast({
      title: "Edit Booking",
      description: `Editing booking ${booking.id.slice(0, 8)}...`
    });
  };

  const handleDeleteBooking = (booking: Booking) => {
    toast({
      title: "Delete Booking",
      description: `Delete booking ${booking.id.slice(0, 8)}...`,
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-bookings">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all property bookings and reservations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total Bookings:</span>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            All Bookings
          </CardTitle>
        </CardHeader>
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
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? bookings.map((booking) => (
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
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(booking.paymentMethod || 'cash')}
                        <span className="text-sm">
                          {formatPaymentMethod(booking.paymentMethod || 'cash')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`actions-${booking.id}`}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(booking)} data-testid={`action-details-${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBooking(booking)} data-testid={`action-edit-${booking.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteBooking(booking)} 
                            className="text-red-600"
                            data-testid={`action-delete-${booking.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminBookings() {
  return (
    <AdminLayout>
      <BookingsContent />
    </AdminLayout>
  );
}