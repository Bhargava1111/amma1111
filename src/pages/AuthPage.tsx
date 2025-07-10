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
import { Eye, EyeOff, Mail, Phone, MessageSquare, Shield, Clock, RefreshCw, Sparkles, Star, Heart, UserPlus, LogIn } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10 animate-in fade-in duration-500">
        {/* Colorful Header */}
        <CardHeader className="space-y-4 text-center p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              {isLogin ? (
                <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            {isLogin ? 'Welcome Back! 👋' : 'Create Account ✨'}
          </CardTitle>
          <CardDescription className="text-indigo-100 text-base sm:text-lg">
            {isLogin ?
            'Sign in to your account to continue your journey' :
            'Join us and start your amazing shopping experience'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6 sm:p-8">
          <Tabs value={authMethod} onValueChange={(value) => switchAuthMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gradient-to-r from-gray-100 to-indigo-100 rounded-xl">
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
                <span className="sm:hidden">📧</span>
              </TabsTrigger>
              <TabsTrigger 
                value="phone" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Phone</span>
                <span className="sm:hidden">📱</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-6 mt-6">
              {!showForgotPassword ? (
              <form onSubmit={handleEmailAuth} className="space-y-6">
                {!isLogin && (
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Full Name
                    </Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="h-12 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 focus:border-green-400 rounded-xl transition-all duration-300 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ?
                      <EyeOff className="h-5 w-5" /> :
                      <Eye className="h-5 w-5" />
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
                        className="p-0 h-auto text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password? 🔄
                      </Button>
                    </div>
                  )}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                      {isLogin ? 'Sign In ✨' : 'Create Account 🚀'}
                    </div>
                  )}
                </Button>
              </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="text-center space-y-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Reset Your Password 🔐</h3>
                    <p className="text-sm text-gray-600">
                      Enter your email address and we'll send you a magical link to reset your password.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="forgot-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email Address
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      className="h-12 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-300"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading || !forgotPasswordEmail}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Magic Link ✨'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-6 mt-6">
              <form onSubmit={handlePhoneAuth} className="space-y-6">
                {!isLogin && (
                <div className="space-y-3">
                    <Label htmlFor="phone-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Full Name
                    </Label>
                    <Input
                    id="phone-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="h-12 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 focus:border-green-400 rounded-xl transition-all duration-300"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={otpSent && otpTimer > 0}
                    className="h-12 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 focus:border-green-400 rounded-xl transition-all duration-300 disabled:opacity-50"
                  />
                </div>
                
                {otpSent && (
                <div className="space-y-6">
                <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        Verification Code 🔐
                      </Label>
                      
                      <div className="flex justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <InputOTP 
                          maxLength={6} 
                          value={otpCode}
                          onChange={handleOTPChange}
                          disabled={otpVerifying}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                            <InputOTPSlot index={1} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                            <InputOTPSlot index={2} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                            <InputOTPSlot index={3} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                            <InputOTPSlot index={4} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                            <InputOTPSlot index={5} className="w-12 h-12 border-2 border-purple-300 bg-white text-lg font-bold text-center rounded-lg focus:border-purple-500 transition-all duration-300" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      
                      <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          Code sent to <span className="font-semibold text-green-600">{formatPhoneNumber(phoneNumber)}</span>
                        </p>
                        
                        {otpTimer > 0 ? (
                          <div className="flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg border border-orange-200">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-600 font-semibold">Resend in {formatTime(otpTimer)}</span>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            className="border-2 border-green-300 text-green-600 hover:bg-green-50 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resend Code 🔄
                          </Button>
                        )}
                      </div>
                      
                      {otpVerifying && (
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            Verifying your code... ✨
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  {!otpSent ? (
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Send OTP 📱
                        </div>
                      )}
                  </Button>
                  ) : (
                  <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={otpVerifying || otpCode.length !== 6}
                  >
                      {otpVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {isLogin ? 'Verify & Sign In ✨' : 'Verify & Sign Up 🚀'}
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
                      className="text-gray-500 hover:text-gray-700 font-semibold transition-all duration-300"
                    >
                      📞 Change Phone Number
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-6 p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-b-lg">
          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="text-center text-sm">
            <span className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              onClick={() => switchAuthMode(!isLogin)}
            >
              {isLogin ? (
                <span className="flex items-center gap-1">
                  Sign up now <Sparkles className="w-4 h-4 text-purple-500" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Sign in here <Heart className="w-4 h-4 text-pink-500" />
                </span>
              )}
            </Button>
          </div>
          
          {/* Demo credentials info */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-xs font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Demo Access 🎯
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-semibold">Email:</span> admin@example.com</p>
              <p><span className="font-semibold">Password:</span> admin123</p>
              <p><span className="font-semibold">Phone:</span> Any 6-digit OTP works!</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
