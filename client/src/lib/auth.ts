import { apiRequest } from "./queryClient";
import { LoginFormData, RegisterFormData, AuthResponse } from "@/types/auth";
import { jwtDecode } from "jwt-decode";

// Local storage keys
const TOKEN_KEY = "blogcms_token";
const USER_KEY = "blogcms_user";

// Login user
export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await apiRequest("POST", "/api/auth/login", data);
  const authData = await response.json();
  
  // Store in localStorage
  localStorage.setItem(TOKEN_KEY, authData.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  
  return authData;
};

// Register user
export const registerUser = async (data: RegisterFormData): Promise<any> => {
  const { confirmPassword, ...registerData } = data;
  const response = await apiRequest("POST", "/api/auth/register", registerData);
  return response.json();
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

// Get user role
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Check if user has admin role
export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

// Check if user has author role
export const isAuthor = (): boolean => {
  return getUserRole() === 'author';
};
