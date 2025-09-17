import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

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

export default function AdminBookings() {
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
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
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