import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';

interface UserPermissions {
  canPublish: boolean;
  isAdmin: boolean;
  role: string;
}

export function usePermissions() {
  const { isAuthenticated, user } = useAuth();
  
  // Use react-query to fetch and cache permissions
  const { data, isLoading, error, refetch } = useQuery<UserPermissions>({
    queryKey: ['/api/auth/permissions'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return {
          canPublish: false,
          isAdmin: false,
          role: ''
        };
      }
      
      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blogcms_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }
      
      return response.json();
    },
    // Don't fetch if not authenticated
    enabled: isAuthenticated,
    // Cache for 5 minutes, but refetch on window focus
    staleTime: 1000 * 60 * 5,
    // Fallback to computed permissions from user object if request fails
    placeholderData: user ? {
      canPublish: user.canPublish || user.role === 'admin',
      isAdmin: user.role === 'admin',
      role: user.role
    } : undefined
  });
  
  // Return permissions and utility functions
  return {
    // Main permissions from API (or fallback)
    permissions: data,
    
    // Individual permission flags for easy access
    canPublish: data?.canPublish || false,
    isAdmin: data?.isAdmin || false,
    role: data?.role || '',
    
    // Status flags
    isLoading,
    error,
    
    // Function to refresh permissions
    refreshPermissions: refetch
  };
}