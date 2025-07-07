import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The password reset link is invalid or has expired.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);

      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password');
      }

      toast({
        title: 'Success! 🎉',
        description: 'Your password has been reset successfully! You can now login with your new password.'
      });

      navigate('/auth');
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10" />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>

                  {showPassword ?
                  <EyeOff className="h-4 w-4" /> :

                  <Eye className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10" />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>

                  {showConfirmPassword ?
                  <EyeOff className="h-4 w-4" /> :

                  <Eye className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Password requirements:</p>
              <ul className="text-xs space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Must match the confirmation password</li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ?
              <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Resetting Password...
                </div> :

              'Reset Password'
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-blue-600 hover:text-blue-800 underline">

              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>);

}
