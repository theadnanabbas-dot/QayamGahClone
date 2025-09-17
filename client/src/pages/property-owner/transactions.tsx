import { useQuery } from "@tanstack/react-query";
import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, TrendingUp, DollarSign, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  amount: string;
  paymentDate: string;
  status: "Paid" | "Pending" | "Failed";
  bookingId: string;
  guestName: string;
}

interface Property {
  id: string;
  title: string;
  ownerId: string;
}

interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  totalPrice: string;
  status: string;
  createdAt: string;
}

function TransactionsContent() {
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

  // Create transactions from bookings (mock transaction data)
  const transactions: Transaction[] = myBookings
    .filter(booking => booking.status === "CONFIRMED" || booking.status === "COMPLETED")
    .map((booking) => {
      const property = myProperties.find(p => p.id === booking.propertyId);
      return {
        id: `TXN-${booking.id.slice(0, 8)}`,
        propertyId: booking.propertyId,
        propertyTitle: property?.title || "Unknown Property",
        amount: booking.totalPrice,
        paymentDate: booking.createdAt,
        status: booking.status === "COMPLETED" ? "Paid" as const : "Pending" as const,
        bookingId: booking.id,
        guestName: booking.guestName,
      };
    })
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const totalEarnings = transactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  const paidTransactions = transactions.filter(txn => txn.status === "Paid");
  const pendingTransactions = transactions.filter(txn => txn.status === "Pending");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500";
      case "Pending":
        return "bg-yellow-500";
      case "Failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDownloadReport = () => {
    // Create a simple CSV download
    const csvContent = [
      ["Transaction ID", "Property Name", "Amount", "Payment Date", "Status", "Guest Name"].join(","),
      ...transactions.map(txn => [
        txn.id,
        txn.propertyTitle,
        txn.amount,
        format(new Date(txn.paymentDate), "yyyy-MM-dd"),
        txn.status,
        txn.guestName
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="transactions-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Transactions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your earnings and payment history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Rs. {totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {paidTransactions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pendingTransactions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Transaction History ({transactions.length})
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              data-testid="button-download-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any transactions yet. Once guests book and pay for your properties, transactions will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {transaction.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {transaction.propertyTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            Guest: {transaction.guestName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        Rs. {parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(transaction.paymentDate), "MMM dd, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Transactions() {
  return (
    <PropertyOwnerLayout>
      <TransactionsContent />
    </PropertyOwnerLayout>
  );
}