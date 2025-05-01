import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

/**
 * Auth Debug Component - Add this to any page to debug authentication issues
 */
export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showToken, setShowToken] = React.useState(false);
  const token = localStorage.getItem('blogcms_token') || 'No token found';
  
  const refreshToken = () => {
    window.location.reload();
  };
  
  return (
    <Card className="max-w-xl mx-auto my-4 shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Auth Debug</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshToken}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>Use this component to debug authentication issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Authentication Status</h3>
            {isAuthenticated ? (
              <Badge className="bg-green-600">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="destructive">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Not Authenticated
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Loading State</h3>
            <Badge variant={isLoading ? "default" : "outline"}>
              {isLoading ? 'Loading...' : 'Ready'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">User Info</h3>
          {user ? (
            <div className="bg-gray-100 p-3 rounded text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Role:</strong> {user.role}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No user data available</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">JWT Token</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? 'Hide' : 'Show'} Token
            </Button>
          </div>
          {showToken ? (
            <div className="bg-gray-100 p-3 rounded overflow-x-auto">
              <pre className="text-xs text-slate-700">{token}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Token hidden for security</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};