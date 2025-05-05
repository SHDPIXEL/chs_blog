import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, 
  Search, 
  Bell,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthorLayoutProps {
  children: React.ReactNode;
}

const AuthorLayout: React.FC<AuthorLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if not authenticated as author
  React.useEffect(() => {
    if (!user) {
      setLocation('/auth/login');
    } else if (user && user.role !== 'author') {
      setLocation('/admin/dashboard');
    }
  }, [user, setLocation]);

  // If not authenticated or not author, don't render the layout
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== 'author') {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#ffedd2]/10">
      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 flex z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-[#333a3d]/60" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button 
              variant="ghost" 
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <Sidebar role="author" />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar role="author" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <Button 
            variant="ghost" 
            className="md:hidden px-4 border-r border-[#ffedd2] text-[#333a3d] focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>
          
        
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthorLayout;
