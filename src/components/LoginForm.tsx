
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email);
      toast({
        title: "Welcome!",
        description: "Successfully logged in to MobileFixer Pro"
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "User not found or not authorized. Please contact your administrator.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'owner@mobileshop.com', role: 'Owner', description: 'Full access to all stores and features' },
    { email: 'staff@mobileshop.com', role: 'Staff', description: 'Access to Downtown store' },
    { email: 'staff2@mobileshop.com', role: 'Staff', description: 'Access to Mall store' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MobileFixer Pro</h1>
          <p className="text-gray-600 mt-2">Mobile Repair Shop Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">
              Click to use demo credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((account, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEmail(account.email)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{account.role}</p>
                    <p className="text-xs text-gray-600">{account.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{account.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
