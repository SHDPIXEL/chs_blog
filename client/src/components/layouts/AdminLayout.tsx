import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Tag,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: location === "/admin/dashboard",
    },
    {
      name: "Author Management",
      href: "/admin/authors",
      icon: Users,
      current: location === "/admin/authors",
    },
    {
      name: "Blog Management",
      href: "/admin/blogs",
      icon: FileText,
      current: location === "/admin/blogs",
    },
    {
      name: "Admin Blogs",
      href: "/admin/my-blogs",
      icon: FileText,
      current: location === "/admin/my-blogs",
    },
    {
      name: "Blog Approvals",
      href: "/admin/blog-approvals",
      icon: ChevronRight,
      current: location === "/admin/blog-approvals",
    },
    // {
    //   name: 'Categories',
    //   href: '/admin/categories',
    //   icon: Tag,
    //   current: location === '/admin/categories',
    // },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: Users,
      current: location === "/admin/profile",
    },
    // {
    //   name: 'Settings',
    //   href: '/admin/settings',
    //   icon: Settings,
    //   current: location === '/admin/settings',
    // },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

  // Create local state for logout pending
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // Call the logout function from auth context
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Set logging out status to false after a short delay
      setTimeout(() => setIsLoggingOut(false), 500);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
              </div>
              <Separator className="my-4" />
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-base font-medium rounded-md
                      ${
                        item.current
                          ? "bg-muted text-primary"
                          : "text-foreground hover:bg-muted hover:text-primary"
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${item.current ? "text-primary" : "text-muted-foreground"}
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t p-4">
              <div className="flex items-center">
                <div>
                  <Avatar>
                    <AvatarImage
                      src={user?.avatarUrl || ""}
                      alt={user?.name || "Admin"}
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="flex h-full flex-col overflow-y-auto bg-background pb-4">
            <div className="flex flex-shrink-0 items-center px-4 pt-5">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Separator className="my-4" />
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${
                      item.current
                        ? "bg-muted text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${item.current ? "text-primary" : "text-muted-foreground"}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-shrink-0 border-t p-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage
                      src={user?.avatarUrl || ""}
                      alt={user?.name || "Admin"}
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Content area */}
      <div className="flex flex-1 flex-col w-0 overflow-hidden">
        <div className="relative z-10 flex h-16 flex-shrink-0 border-b bg-background">
          <div className="flex items-center flex-1 px-4 justify-between lg:justify-end">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {/* Header Title - shows on mobile */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>

            {/* Right side of navbar */}
            <div className="flex items-center ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatarUrl || ""}
                        alt={user?.name || "Admin"}
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto bg-muted/30 focus:outline-none ">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
