import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SquarePen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Home: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (user) {
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/author/dashboard';
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  const handleGetStarted = () => {
    setLocation('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Helmet>
        <title>CHC - Centre for Human Sciences | Rishihood University</title>
        <meta name="description" content="Professional blog platform for authors and administrators at Centre for Human Sciences, Rishihood University" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <SquarePen className="h-16 w-16 text-primary" />
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Welcome to CHC
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Professional blog platform for authors and administrators
        </p>
      </div>
      
      <div className="max-w-lg w-full">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                To get started, please login or create a new account
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGetStarted} 
                  className="flex-1"
                >
                  Get Started
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://github.com/your-username/blog-cms', '_blank')}
                  className="flex-1"
                >
                  View on GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
