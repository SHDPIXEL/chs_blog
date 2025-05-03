import React from "react";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  role?: "admin" | "author" | "any" | undefined;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component,
  role,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {user ? (
        // If role is specified, check if user has that role
        role ? (
          role === "any" || user?.role === role ? (
            <Component />
          ) : (
            // If user doesn't have the required role, redirect to appropriate dashboard
            <Redirect to={user?.role === "admin" ? "/admin/dashboard" : "/author/dashboard"} />
          )
        ) : (
          // If no specific role is required but user is authenticated
          <Component />
        )
      ) : (
        // If not authenticated, redirect to login
        <Redirect to="/auth/login" />
      )}
    </Route>
  );
};