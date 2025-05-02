import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  LoginFormData, 
  RegisterFormData, 
  AuthContextType 
} from '@/types/auth';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  isAuthenticated as checkIsAuthenticated 
} from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Define types for handling database response where fields might be in snake_case
interface ApiUserResponse extends Omit<User, 'canPublish'> {
  can_publish?: boolean;
  canPublish?: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Function to refresh user data from the API
  const refreshUserData = async (): Promise<User | null> => {
    if (!isAuthenticated || !user) return null;
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blogcms_token')}`
        }
      });
      
      if (response.ok) {
        // Cast the response to ApiUserResponse to handle both field naming conventions
        const apiUserData = await response.json() as ApiUserResponse;
        
        // Process user data to ensure correct field naming
        const userData: User = {
          ...apiUserData,
          // Convert can_publish from database to canPublish for frontend
          canPublish: apiUserData.can_publish !== undefined 
            ? apiUserData.can_publish 
            : apiUserData.canPublish
        };
        
        // Remove the snake_case version if it exists to avoid duplication
        if ('can_publish' in userData) {
          delete (userData as any).can_publish;
        }
        
        setUser(userData);
        // Update localStorage with fresh user data
        localStorage.setItem('blogcms_user', JSON.stringify(userData));
        
        return userData;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
    
    return null;
  };

  // Initialize auth state and fetch current user from API if token exists
  useEffect(() => {
    const initAuth = async () => {
      const currentUser = getCurrentUser();
      const authenticated = checkIsAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      
      // If we have a token but no user data in localStorage, try to fetch from API
      if (authenticated && !currentUser) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('blogcms_token')}`
            }
          });
          
          if (response.ok) {
            // Cast the response to ApiUserResponse to handle both field naming conventions
            const apiUserData = await response.json() as ApiUserResponse;
            
            // Process user data to ensure correct field naming
            const userData: User = {
              ...apiUserData,
              // Convert can_publish from database to canPublish for frontend
              canPublish: apiUserData.can_publish !== undefined 
                ? apiUserData.can_publish 
                : apiUserData.canPublish
            };
            
            // Remove the snake_case version if it exists to avoid duplication
            if ('can_publish' in userData) {
              delete (userData as any).can_publish;
            }
            
            setUser(userData);
            // Update localStorage with fresh user data
            localStorage.setItem('blogcms_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Login handler
  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(data);
      
      // Cast response.user to ApiUserResponse type to handle both field naming conventions
      const apiUser = response.user as ApiUserResponse;
      
      // Ensure canPublish is properly set from can_publish field
      const userData: User = {
        ...apiUser,
        // Convert can_publish from database to canPublish for frontend
        canPublish: apiUser.can_publish !== undefined 
          ? apiUser.can_publish 
          : apiUser.canPublish
      };
      
      // Remove the snake_case version if it exists to avoid duplication
      if ('can_publish' in userData) {
        delete (userData as any).can_publish;
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await registerUser(data);
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      setError(message);
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    refreshUserData, // Expose the refresh function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
