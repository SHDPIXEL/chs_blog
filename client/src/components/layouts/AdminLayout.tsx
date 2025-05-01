import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  FileText, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  UserCog, 
  Image,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to access this area.</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { href: '/admin/authors', label: 'Author Management', icon: <Users className="h-5 w-5 mr-2" /> },
    { href: '/admin/blogs', label: 'Blog Management', icon: <FileText className="h-5 w-5 mr-2" /> },
    { href: '/admin/assets', label: 'Asset Management', icon: <Image className="h-5 w-5 mr-2" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-2" /> },
    { href: '/admin/profile', label: 'My Profile', icon: <UserCog className="h-5 w-5 mr-2" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderNavigation = () => (
    <div className="space-y-1">
      {navigationItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive ? "bg-muted" : ""
            }`}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              {item.label}
            </Link>
          </Button>
        );
      })}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="border-b bg-card h-16 flex items-center px-4 sticky top-0 z-30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                  <div className="px-2 py-6">
                    <div className="flex items-center mb-6">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user?.avatarUrl || ''} />
                        <AvatarFallback>
                          {user?.name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">Admin</div>
                      </div>
                    </div>
                    <Separator className="mb-6" />
                    <SheetClose asChild>
                      <div onClick={() => setOpen(false)}>
                        {renderNavigation()}
                      </div>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="font-semibold text-lg ml-2">Admin Panel</div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
          </div>
        </header>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside className="w-64 border-r bg-card hidden md:block overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user?.avatarUrl || ''} />
                  <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-sm text-muted-foreground">Admin</div>
                </div>
              </div>
              <Separator className="mb-6" />
              {renderNavigation()}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;