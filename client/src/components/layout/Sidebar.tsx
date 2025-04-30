import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  SquarePen, 
  LayoutDashboard, 
  UserCog, 
  FileText, 
  Settings, 
  BarChart2,
  FileEdit,
  FileSpreadsheet,
  MessageSquare,
  User,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'author';
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Define navigation items based on role
  const adminNavItems: NavItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: <UserCog className="h-5 w-5" />, label: 'User Management', href: '/admin/users' },
    { icon: <FileText className="h-5 w-5" />, label: 'Content Library', href: '/admin/content' },
    { icon: <Settings className="h-5 w-5" />, label: 'Site Settings', href: '/admin/settings' },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Analytics', href: '/admin/analytics' },
  ];

  const authorNavItems: NavItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', href: '/author/dashboard' },
    { icon: <FileText className="h-5 w-5" />, label: 'My Blogs', href: '/author/blogs' },
    { icon: <FileEdit className="h-5 w-5" />, label: 'Add Blog', href: '/author/blogs/new' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', href: '/author/profile' },
  ];

  const navItems = role === 'admin' ? adminNavItems : authorNavItems;
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center p-4 border-b">
        <SquarePen className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-xl font-bold">
          BlogCMS {role === 'admin' ? 'Admin' : 'Author'}
        </h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
          >
            <a className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md",
              location === item.href 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}>
              <span className={cn(
                "mr-3",
                location === item.href
                  ? "text-gray-500"
                  : "text-gray-400 group-hover:text-gray-500"
              )}>
                {item.icon}
              </span>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
              {role === 'admin' 
                ? <UserCog className="h-5 w-5 text-gray-700" />
                : <User className="h-5 w-5 text-gray-700" />
              }
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs font-medium text-primary"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
