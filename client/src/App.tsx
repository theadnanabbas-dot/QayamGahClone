import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Homepage from "@/pages/homepage";
import PropertyListing from "@/pages/property-listing";
import PropertyDetails from "@/pages/property-details";
import HotelsListing from "@/pages/hotels-listing";
import ListingsCatalog from "@/pages/listings-catalog";
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/admin-login";
import PropertyOwnerLogin from "@/pages/property-owner-login";
import PropertyOwnerDashboard from "@/pages/property-owner-dashboard";
import CustomerLogin from "@/pages/customer-login";
import CustomerDashboard from "@/pages/customer-dashboard";
import AddProperty from "@/pages/add-property";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBookings from "@/pages/admin/bookings";
import AdminUsers from "@/pages/admin/users";
import AdminVendors from "@/pages/admin/vendors";
import AdminTransactions from "@/pages/admin/transactions";

// Property Owner Dashboard Pages
import PropertyOwnerDashboardNew from "@/pages/property-owner/dashboard";
import PropertyOwnerAddProperty from "@/pages/property-owner/add-property";
import PropertyOwnerProperties from "@/pages/property-owner/properties";
import PropertyOwnerBookings from "@/pages/property-owner/bookings";
import PropertyOwnerCalendar from "@/pages/property-owner/calendar";
import PropertyOwnerTransactions from "@/pages/property-owner/transactions";
import PropertyOwnerProfile from "@/pages/property-owner/profile";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/property" component={() => { window.location.replace('/listings'); return null; }} />
      <Route path="/listings" component={ListingsCatalog} />
      <Route path="/property-details/:slug" component={PropertyDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/hotels" component={HotelsListing} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/vendors" component={AdminVendors} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin" component={AdminPanel} />
      
      {/* Property Owner Routes */}
      <Route path="/property-owner/login" component={PropertyOwnerLogin} />
      <Route path="/property-owner/add-property" component={PropertyOwnerAddProperty} />
      <Route path="/property-owner/properties" component={PropertyOwnerProperties} />
      <Route path="/property-owner/bookings" component={PropertyOwnerBookings} />
      <Route path="/property-owner/calendar" component={PropertyOwnerCalendar} />
      <Route path="/property-owner/transactions" component={PropertyOwnerTransactions} />
      <Route path="/property-owner/profile" component={PropertyOwnerProfile} />
      <Route path="/property-owner" component={PropertyOwnerDashboardNew} />
      
      {/* Legacy routes - keeping for backward compatibility */}
      <Route path="/add-property" component={AddProperty} />
      <Route path="/property-owner-dashboard" component={PropertyOwnerDashboard} />
      <Route path="/customer/login" component={CustomerLogin} />
      <Route path="/customer" component={CustomerDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
