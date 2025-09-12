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
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/admin-login";
import PropertyOwnerLogin from "@/pages/property-owner-login";
import PropertyOwnerDashboard from "@/pages/property-owner-dashboard";
import CustomerLogin from "@/pages/customer-login";
import CustomerDashboard from "@/pages/customer-dashboard";
import AddProperty from "@/pages/add-property";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/property" component={PropertyListing} />
      <Route path="/property-details/:slug" component={PropertyDetails} />
      <Route path="/hotels" component={HotelsListing} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/property-owner/login" component={PropertyOwnerLogin} />
      <Route path="/property-owner/add-property" component={AddProperty} />
      <Route path="/property-owner" component={PropertyOwnerDashboard} />
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
