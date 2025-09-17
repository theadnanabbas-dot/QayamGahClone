import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, TrendingUp, DollarSign } from "lucide-react";

function TransactionsContent() {
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

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Transaction History Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View detailed payment history, track earnings by property, and download financial reports for tax purposes.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" data-testid="button-download-placeholder">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" data-testid="button-earnings-placeholder">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Earnings
              </Button>
            </div>
          </div>
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