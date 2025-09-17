import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import PropertyOwnerSidebar from "@/components/PropertyOwnerSidebar";
import { Loader2 } from "lucide-react";

interface PropertyOwnerLayoutProps {
  children: React.ReactNode;
}

export default function PropertyOwnerLayout({ children }: PropertyOwnerLayoutProps) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("property_owner_token");
      const userData = localStorage.getItem("property_owner_user");
      
      if (!token || !userData) {
        setLocation("/property-owner/login");
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "property_owner") {
          localStorage.removeItem("property_owner_token");
          localStorage.removeItem("property_owner_user");
          setLocation("/property-owner/login");
          return;
        }
        
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("property_owner_token");
        localStorage.removeItem("property_owner_user");
        setLocation("/property-owner/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("property_owner_token");
    localStorage.removeItem("property_owner_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    setLocation("/property-owner/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <PropertyOwnerSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}