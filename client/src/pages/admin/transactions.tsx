import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
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

export default function AdminTransactions() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"]
  });

  // Calculate transaction stats
  const completedBookings = bookings.filter(booking => booking.status === "COMPLETED");
  const pendingBookings = bookings.filter(booking => booking.status === "PENDING");
  const cancelledBookings = bookings.filter(booking => booking.status === "CANCELLED");
  
  const totalRevenue = completedBookings.reduce((sum, booking) => 
    sum + parseFloat(booking.totalPrice), 0
  );
  
  const pendingRevenue = pendingBookings.reduce((sum, booking) => 
    sum + parseFloat(booking.totalPrice), 0
  );

  const averageTransaction = completedBookings.length > 0 
    ? totalRevenue / completedBookings.length 
    : 0;

  // Mock additional transaction data
  const transactionStats = [
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+12.5%"
    },
    {
      title: "Pending Revenue",
      value: `Rs. ${pendingRevenue.toLocaleString()}`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      trend: "+5.2%"
    },
    {
      title: "Completed Transactions",
      value: completedBookings.length.toLocaleString(),
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+8.1%"
    },
    {
      title: "Average Transaction",
      value: `Rs. ${averageTransaction.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      trend: "+3.7%"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500";
      case "PENDING": return "bg-yellow-500";
      case "CONFIRMED": return "bg-blue-500";
      case "CANCELLED": return "bg-red-500";
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
    <div className="space-y-6" data-testid="admin-transactions">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor revenue, payments, and financial activity.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total Transactions:</span>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {transactionStats.map((stat, index) => {
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
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        {stat.trend}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? bookings.slice(0, 10).map((booking) => (
                  <TableRow key={booking.id} data-testid={`transaction-row-${booking.id}`}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">Property</div>
                        <div className="text-gray-500 text-xs">
                          {booking.propertyId.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">Customer</div>
                        <div className="text-gray-500 text-xs">
                          {booking.userId.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                        <span className="font-semibold">Rs. {booking.totalPrice}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      <div className="text-sm">
                        <div>{format(new Date(booking.createdAt), "MMM dd, yyyy")}</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(booking.createdAt), "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {booking.status === "COMPLETED" ? "Payment" : "Booking"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Revenue Chart
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Revenue analytics and trends will be displayed here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add missing Clock import
import { Clock } from "lucide-react";