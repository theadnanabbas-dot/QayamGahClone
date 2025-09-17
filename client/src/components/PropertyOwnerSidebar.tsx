import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Plus,
  Building2,
  Calendar, 
  CreditCard,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyOwnerSidebarProps {
  user: any;
  onLogout: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/property-owner",
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: "Add New Property",
    href: "/property-owner/add-property",
    icon: Plus,
    exact: false
  },
  {
    name: "All Properties",
    href: "/property-owner/properties",
    icon: Building2,
    exact: false
  },
  {
    name: "Bookings",
    href: "/property-owner/bookings",
    icon: Calendar,
    exact: false
  },
  {
    name: "Transactions",
    href: "/property-owner/transactions",
    icon: CreditCard,
    exact: false
  },
  {
    name: "Edit Profile",
    href: "/property-owner/profile",
    icon: User,
    exact: false
  }
];

export default function PropertyOwnerSidebar({ user, onLogout }: PropertyOwnerSidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return location === item.href;
    }
    return location.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/property-owner" data-testid="link-property-owner-home">
          <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
            Qayamgah Owner
          </h1>
        </Link>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="button-close-mobile-menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu on navigation
            >
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4",
                  active 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-r-2 border-green-600 dark:border-green-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                data-testid={`nav-button-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className={cn(
                  "h-5 w-5 mr-3",
                  active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                )} />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Property Owner
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.fullName || user?.email || "Property Owner"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link href="/" data-testid="link-public-site">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              View Public Site
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            size="sm"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 shadow-md"
        onClick={() => setIsMobileMenuOpen(true)}
        data-testid="button-mobile-menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="mobile-menu-overlay"
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}