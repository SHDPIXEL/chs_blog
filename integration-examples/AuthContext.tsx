/**
 * Authentication Context for React TypeScript Website
 * 
 * This context provider handles authentication with the blog system,
 * including login, logout, and token management.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginToBlogSystem } from './api-utils';

// Define User type
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'author' | 'guest';
  canPublish: boolean;
}

// Define Auth context value type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved token in localStorage on initial load
  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('blog_auth_token');
      const savedUser = localStorage.getItem('blog_auth_user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          // Invalid user JSON, clear storage
          localStorage.removeItem('blog_auth_token');
          localStorage.removeItem('blog_auth_user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginToBlogSystem(email, password);
      
      if (response.token && response.user) {
        // Save token and user to state
        setToken(response.token);
        setUser(response.user);
        
        // Save to localStorage for persistence
        localStorage.setItem('blog_auth_token', response.token);
        localStorage.setItem('blog_auth_user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('blog_auth_token');
    localStorage.removeItem('blog_auth_user');
  };

  // Provide auth context to children components
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Example usage:
// 
// import { AuthProvider, useAuth } from './AuthContext';
// 
// // In your main app component:
// const App = () => {
//   return (
//     <AuthProvider>
//       <YourAppComponents />
//     </AuthProvider>
//   );
// };
// 
// // In a component that needs auth:
// const LoginForm = () => {
//   const { login, isLoading, error } = useAuth();
//   
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await login(email, password);
//   };
//   
//   return (
//     <form onSubmit={handleSubmit}>...
//   );
// };
