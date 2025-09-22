import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Store, 
  CreditCard,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
    exact: false
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    exact: false
  },
  {
    name: "Vendors",
    href: "/admin/vendors",
    icon: Store,
    exact: false
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    exact: false
  }
];

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
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
        <Link href="/admin" data-testid="link-admin-home">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Qayamgah Admin
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
              data-testid={`nav-${item.name.toLowerCase()}`}
              onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu on navigation
            >
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4 min-h-[44px]",
                  active 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                data-testid={`nav-button-${item.name.toLowerCase()}`}
              >
                <Icon className={cn(
                  "h-5 w-5 mr-3",
                  active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
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
                {user?.role || "Admin"}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.fullName || user?.email || "Administrator"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link href="/" data-testid="link-public-site">
            <Button variant="outline" className="w-full justify-start min-h-[44px]" size="sm">
              View Public Site
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full justify-start min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            size="sm"
            onClick={onLogout}
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
      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg border min-h-[44px] min-w-[44px]"
          onClick={() => setIsMobileMenuOpen(true)}
          data-testid="button-open-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarContent />
      </div>

      {/* Mobile Overlay and Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="mobile-menu-overlay"
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}