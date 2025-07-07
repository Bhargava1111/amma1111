import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Phone, MessageSquare, Shield, Clock, RefreshCw } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const { login, register, loginWithPhone, registerWithPhone, sendOTP, forgotPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter your phone number',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setOtpSent(true);
        setOtpTimer(60); // 60 seconds timer
        setOtpCode(''); // Clear any previous OTP
        toast({
          title: 'OTP Sent Successfully! 📱',
          description: 'Please check your phone for the 6-digit verification code. For demo purposes, check the browser console.'
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send OTP',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtpCode(value);
    // Auto-submit when OTP is complete
    if (value.length === 6 && !otpVerifying) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otp?: string) => {
    const codeToVerify = otp || otpCode;
    
    if (!codeToVerify || codeToVerify.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter the complete 6-digit OTP code',
        variant: 'destructive'
      });
      return;
    }

    setOtpVerifying(true);
    try {
      if (isLogin) {
        const result = await loginWithPhone(phoneNumber, codeToVerify);
        if (result.success) {
          toast({
            title: 'Success! 🎉',
            description: 'Logged in successfully!'
          });
          navigate(from, { replace: true });
        } else {
          toast({
            title: 'Verification Failed',
            description: result.error || 'Invalid OTP code',
            variant: 'destructive'
          });
          setOtpCode(''); // Clear invalid OTP
        }
      } else {
        const result = await registerWithPhone(phoneNumber, name);
        if (result.success) {
          toast({
            title: 'Account Created! 🎉',
            description: 'Your account has been created successfully. You can now login with your phone number.'
          });
          setIsLogin(true);
          setOtpSent(false);
          setOtpCode('');
        } else {
          toast({
            title: 'Registration Failed',
            description: result.error || 'Registration failed',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Verification failed',
        variant: 'destructive'
      });
      setOtpCode(''); // Clear OTP on error
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Logged in successfully!'
          });
          navigate(from, { replace: true });
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Login failed',
            variant: 'destructive'
          });
        }
      } else {
        const result = await register(email, password, name);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Account created successfully! Please check your email for verification.'
          });
          setIsLogin(true);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Registration failed',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Authentication failed',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    await handleVerifyOTP();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await forgotPassword(forgotPasswordEmail);
        if (result.success) {
          toast({
          title: 'Email Sent! 📧',
          description: 'If an account with that email exists, we have sent a password reset link.'
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        } else {
          toast({
            title: 'Error',
          description: result.error || 'Failed to send reset email',
            variant: 'destructive'
          });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
    setOtpTimer(0);
    setShowPassword(false);
    setOtpVerifying(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
  };

  const switchAuthMode = (newIsLogin: boolean) => {
    setIsLogin(newIsLogin);
    resetForm();
  };

  const switchAuthMethod = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    resetForm();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ?
            'Sign in to your account to continue' :
            'Sign up to start shopping with us'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={authMethod} onValueChange={(value) => switchAuthMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4 mt-4">
              {!showForgotPassword ? (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin &&
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin} />

                  </div>
                }
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />

                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required />

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
                  
                  {isLogin && (
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                  )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Reset Your Password</h3>
                    <p className="text-sm text-gray-600">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || !forgotPasswordEmail}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4 mt-4">
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {!isLogin &&
                <div className="space-y-2">
                    <Label htmlFor="phone-name">Full Name</Label>
                    <Input
                    id="phone-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin} />

                  </div>
                }
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={otpSent && otpTimer > 0} />

                </div>
                
                {otpSent &&
                <div className="space-y-4">
                <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Verification Code
                      </Label>
                      
                      <div className="flex justify-center">
                        <InputOTP 
                          maxLength={6} 
                    value={otpCode}
                          onChange={handleOTPChange}
                          disabled={otpVerifying}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      
                      <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                          Code sent to {formatPhoneNumber(phoneNumber)}
                        </p>
                        
                        {otpTimer > 0 ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            Resend in {formatTime(otpTimer)}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Resend Code
                          </Button>
                        )}
                      </div>
                      
                      {otpVerifying && (
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Verifying...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                }
                
                <div className="flex gap-2">
                  {!otpSent ? (
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Send OTP
                        </div>
                      )}
                  </Button>
                  ) : (
                  <Button
                      type="submit"
                      className="flex-1"
                      disabled={otpVerifying || otpCode.length !== 6}>
                      {otpVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {isLogin ? 'Verify & Sign In' : 'Verify & Sign Up'}
                        </div>
                      )}
                    </Button>
                  )}
                </div>
                
                {otpSent && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setOtpTimer(0);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Change Phone Number
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => switchAuthMode(!isLogin)}>

              {isLogin ? 'Sign up' : 'Sign in'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>);

}
