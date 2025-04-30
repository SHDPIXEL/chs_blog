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

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const currentUser = getCurrentUser();
      const authenticated = checkIsAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
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
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${response.user.name}!`,
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
