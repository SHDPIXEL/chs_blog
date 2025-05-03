import React, { useState } from 'react';
import { useLocation } from 'wouter';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SquarePen } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [_, setLocation] = useLocation();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 flex items-center justify-center">
          <SquarePen className="h-8 w-8 text-primary mr-2" />
          CHC
        </h1>
        <h2 className="mt-2 text-center text-sm text-gray-600">
          Professional blog platform for authors and administrators
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSuccess={() => setActiveTab('login')} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
