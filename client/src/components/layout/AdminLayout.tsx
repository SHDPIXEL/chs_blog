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

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect if not authenticated as admin
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    } else if (user && user.role !== 'admin') {
      setLocation('/author/dashboard');
    }
  }, [isLoading, user, setLocation]);

  // If not authenticated or not admin, don't render the layout
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
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
            <Sidebar role="admin" />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar role="admin" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <Button 
            variant="ghost" 
            className="md:hidden px-4 border-r border-gray-200 text-[#333a3d] focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <label htmlFor="search-field" className="sr-only">Search</label>
                <div className="relative w-full text-[#333a3d]/60 focus-within:text-[#333a3d]">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    id="search-field"
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-[#333a3d] placeholder-[#333a3d]/50 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                className="p-1 rounded-full text-[#333a3d]/70 hover:text-[#333a3d]"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
