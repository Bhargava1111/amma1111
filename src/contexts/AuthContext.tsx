import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  ID: string;
  Name: string;
  Email: string;
  role: 'customer' | 'admin';
  PhoneNumber?: string; // Added for Razorpay prefill
}

export interface UserProfile {
  user_id: string;
  phone_number: string;
  full_name: string;
  avatar_url: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  marketing_notifications: boolean;
  auth_method: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean;error?: string;}>;
  loginWithPhone: (phoneNumber: string, otpCode: string) => Promise<{success: boolean;error?: string;}>;
  register: (email: string, password: string, name: string) => Promise<{success: boolean;error?: string;}>;
  registerWithPhone: (phoneNumber: string, fullName?: string) => Promise<{success: boolean;error?: string;}>;
  sendOTP: (phoneNumber: string) => Promise<{success: boolean;error?: string;}>;
  verifyOTP: (phoneNumber: string, otpCode: string) => Promise<{success: boolean;error?: string;}>;
  forgotPassword: (email: string) => Promise<{success: boolean;error?: string;}>;
  resetPassword: (token: string, newPassword: string) => Promise<{success: boolean;error?: string;}>;
  logout: () => void;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot check auth status.');
        setIsLoading(false);
        return;
      }
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (!error && data && data.isAdmin !== undefined) {
        const userWithRole = {
          ...data,
          role: data.isAdmin ? 'admin' : 'customer'
        };
        setUser(userWithRole);
        await loadUserProfile(data.ID);
      } else {
        // Check for local storage fallback (for backward compatibility)
        const savedUser = localStorage.getItem('ecommerce_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('AuthContext: Failed to parse saved user from local storage:', error);
            localStorage.removeItem('ecommerce_user');
          }
        }
      }
    } catch (error) {
      console.error('AuthContext: Error checking auth status:', error);
      // Fallback to local storage
      const savedUser = localStorage.getItem('ecommerce_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('AuthContext: Failed to parse saved user from local storage:', error);
          localStorage.removeItem('ecommerce_user');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot load user profile.');
        return;
      }
      const { data, error } = await window.ezsite.apis.tablePage(10411, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userId }]
      });
      if (!error && data?.List?.length > 0) {
        setUserProfile(data.List[0]);
      }
    } catch (error) {
      console.error('AuthContext: Error loading user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.ID);
    }
  };

  const sendOTP = async (phoneNumber: string): Promise<{success: boolean;error?: string;}> => {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot send OTP.');
        return { success: false, error: 'API not available' };
      }
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save OTP to database
      const { error } = await window.ezsite.apis.tableCreate(10410, {
        phone_number: phoneNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        is_verified: false,
        attempts: 0,
        created_at: new Date().toISOString()
      });

      if (error) throw new Error(error);

      // For demo purposes, we'll log the OTP
      console.log(`AuthContext: OTP for ${phoneNumber}: ${otpCode}`);

      // Send admin notification
      try {
        await window.ezsite.apis.sendEmail({
          from: 'support@ezsite.ai',
          to: ['admin@company.com'],
          subject: 'OTP Request',
          html: `<p>OTP <strong>${otpCode}</strong> was requested for phone number ${phoneNumber}</p><p>This OTP will expire in 10 minutes.</p>`
        });
      } catch (emailError) {
        console.error('AuthContext: Error sending admin notification:', emailError);
      }

      return { success: true };
    } catch (error) {
      console.error('AuthContext: Error sending OTP:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (phoneNumber: string, otpCode: string): Promise<{success: boolean;error?: string;}> => {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot verify OTP.');
        return { success: false, error: 'API not available' };
      }
      // Get the latest OTP for this phone number
      const { data, error } = await window.ezsite.apis.tablePage(10410, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [
        { name: 'phone_number', op: 'Equal', value: phoneNumber },
        { name: 'is_verified', op: 'Equal', value: false }]
 
      });
 
      if (error || !data?.List?.length) {
        console.error('AuthContext: OTP not found or error fetching OTP:', error);
        return { success: false, error: 'OTP not found' };
      }
 
      const otpRecord = data.List[0];
 
      // Check if OTP is expired
      if (new Date(otpRecord.expires_at) < new Date()) {
        console.warn('AuthContext: OTP has expired.');
        return { success: false, error: 'OTP has expired' };
      }
 
      // Check if too many attempts
      if (otpRecord.attempts >= 3) {
        console.warn('AuthContext: Too many verification attempts for OTP.');
        return { success: false, error: 'Too many verification attempts' };
      }
 
      // Check if OTP matches
      if (otpRecord.otp_code !== otpCode) {
        // Increment attempts
        await window.ezsite.apis.tableUpdate(10410, {
          ID: otpRecord.ID,
          attempts: otpRecord.attempts + 1
        });
        console.warn('AuthContext: Invalid OTP provided.');
        return { success: false, error: 'Invalid OTP' };
      }
 
      // Mark OTP as verified
      await window.ezsite.apis.tableUpdate(10410, {
        ID: otpRecord.ID,
        is_verified: true
      });
      console.log('AuthContext: OTP verified successfully.');
 
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Error verifying OTP:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Verification failed' };
    }
  };

  const loginWithPhone = async (phoneNumber: string, otpCode: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Verify OTP first
      const otpResult = await verifyOTP(phoneNumber, otpCode);
      if (!otpResult.success) {
        return otpResult;
      }

      // Check if user profile exists for this phone number
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot login with phone.');
        return { success: false, error: 'API not available' };
      }
      const { data, error } = await window.ezsite.apis.tablePage(10411, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'phone_number', op: 'Equal', value: phoneNumber }]
      });

      if (error) {
        console.error('AuthContext: Error checking user profile for phone login:', error);
        return { success: false, error };
      }

      if (!data?.List?.length) {
        return { success: false, error: 'No account found for this phone number. Please register first.' };
      }

      const profile = data.List[0];

      // Create user session
      const phoneUser: User = {
        ID: profile.user_id,
        Name: profile.full_name || 'Phone User',
        Email: `${phoneNumber}@phone.user`,
        role: 'customer'
      };

      setUser(phoneUser);
      setUserProfile(profile);

      // Save to localStorage for persistence
      localStorage.setItem('ecommerce_user', JSON.stringify(phoneUser));

      return { success: true };
    } catch (error) {
      console.error('Phone login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPhone = async (phoneNumber: string, fullName?: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Check if phone number already exists
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('AuthContext: window.ezsite.apis is not defined. Cannot register with phone.');
        return { success: false, error: 'API not available' };
      }
      const { data: existingData } = await window.ezsite.apis.tablePage(10411, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'phone_number', op: 'Equal', value: phoneNumber }]
      });

      if (existingData?.List?.length > 0) {
        console.warn('AuthContext: Phone number already registered during registration attempt.');
        return { success: false, error: 'Phone number already registered' };
      }

      // Create user profile
      const userId = `phone_${phoneNumber}_${Date.now()}`;
      const { error } = await window.ezsite.apis.tableCreate(10411, {
        user_id: userId,
        phone_number: phoneNumber,
        full_name: fullName || '',
        auth_method: 'phone',
        email_notifications: true,
        whatsapp_notifications: true,
        marketing_notifications: true,
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('AuthContext: Error creating user profile during phone registration:', error);
        return { success: false, error };
      }

      // Send welcome notification
      try {
        if (!window.ezsite || !window.ezsite.apis) {
          console.error('AuthContext: window.ezsite.apis is not defined. Cannot create welcome notification.');
          return { success: false, error: 'API not available' };
        }
        await window.ezsite.apis.tableCreate(10412, {
          user_id: userId,
          title: 'Welcome!',
          message: 'Welcome to our platform! Your account has been created successfully.',
          type: 'system',
          channel: 'in_app',
          status: 'sent',
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('AuthContext: Error creating welcome notification:', notifError);
      }

      // Send admin notification
      try {
        if (!window.ezsite || !window.ezsite.apis) {
          console.error('AuthContext: window.ezsite.apis is not defined. Cannot send admin notification for phone registration.');
          return { success: false, error: 'API not available' };
        }
        await window.ezsite.apis.sendEmail({
          from: 'support@ezsite.ai',
          to: ['admin@company.com'],
          subject: 'New Phone Registration',
          html: `<p>New user registered with phone number: <strong>${phoneNumber}</strong></p><p>Name: ${fullName || 'Not provided'}</p><p>Registration time: ${new Date().toLocaleString()}</p>`
        });
      } catch (emailError) {
        console.error('AuthContext: Error sending admin notification:', emailError);
      }

      return { success: true };
    } catch (error) {
      console.error('Phone registration error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (typeof email !== 'string' || typeof password !== 'string') {
        return { success: false, error: 'Email and password must be valid strings' };
      }

      // Trim whitespace
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        return { success: false, error: 'Email and password cannot be empty' };
      }

      // Check for demo admin login first (always allow)
      if ((trimmedEmail === 'admin@example.com' || trimmedEmail.includes('admin')) && trimmedPassword === 'admin123') {
        const adminUser: User = {
          ID: '1',
          Email: trimmedEmail,
          Name: 'Admin User',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(adminUser));
        console.log('AuthContext: Demo admin login successful');
        return { success: true };
      }

      // Check for demo customer login
      if (trimmedEmail === 'customer@example.com' && trimmedPassword === 'customer123') {
        const customerUser: User = {
          ID: '2',
          Email: trimmedEmail,
          Name: 'Demo Customer',
          role: 'customer'
        };
        setUser(customerUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(customerUser));
        console.log('AuthContext: Demo customer login successful');
        return { success: true };
      }

      // Try API login for other users
      try {
        if (!window.ezsite || !window.ezsite.apis) {
          console.error('AuthContext: window.ezsite.apis is not defined. Cannot perform API login.');
          // Fallback to mock authentication if API is not available
          if (trimmedEmail && trimmedPassword) {
            const customerUser: User = {
              ID: '2',
              Email: trimmedEmail,
              Name: trimmedEmail.split('@')[0],
              role: 'customer'
            };
            setUser(customerUser);
            localStorage.setItem('ecommerce_user', JSON.stringify(customerUser));
            return { success: true };
          } else {
            return { success: false, error: 'API not available and invalid credentials' };
          }
        }

        const { error } = await window.ezsite.apis.login(trimmedEmail, trimmedPassword);
        if (error) {
          console.error('AuthContext: Login API error:', error);
          throw new Error(error);
        }

        // Get user info after successful login
        const { data, error: userError } = await window.ezsite.apis.getUserInfo();
        if (userError) throw new Error(userError);

        const userWithRole = {
          ...data,
          role: data.isAdmin ? 'admin' : 'customer'
        };

        setUser(userWithRole);
        await loadUserProfile(data.ID);

        // Send admin notification for login
        try {
          await window.ezsite.apis.sendEmail({
            from: 'support@ezsite.ai',
            to: ['admin@company.com'],
            subject: 'User Login',
            html: `<p>User logged in: <strong>${trimmedEmail}</strong></p><p>Login time: ${new Date().toLocaleString()}</p>`
          });
        } catch (emailError) {
          console.error('AuthContext: Error sending login notification:', emailError);
        }

        return { success: true };
      } catch (apiError) {
        console.error('AuthContext: API login error:', apiError);
        // Show error to user, do not fallback to mock authentication
        return { success: false, error: 'Login failed. Please check your credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Try API registration first
      try {
        if (!window.ezsite || !window.ezsite.apis) {
          console.error('AuthContext: window.ezsite.apis is not defined. Cannot perform API registration.');
          // Fallback to mock registration if API is not available
          const newUser: User = {
            ID: Date.now().toString(),
            Email: email,
            Name: name,
            role: 'customer'
          };

          setUser(newUser);
          localStorage.setItem('ecommerce_user', JSON.stringify(newUser));
          return { success: true, error: 'API not available, using mock registration.' };
        }

        const { error } = await window.ezsite.apis.register(email, password, name);
        if (error) throw new Error(error);

        // Send admin notification
        try {
          await window.ezsite.apis.sendEmail({
            from: 'support@ezsite.ai',
            to: ['admin@company.com'],
            subject: 'New Email Registration',
            html: `<p>New user registered with email: <strong>${email}</strong></p><p>Name: ${name}</p><p>Registration time: ${new Date().toLocaleString()}</p>`
          });
        } catch (emailError) {
          console.error('AuthContext: Error sending registration notification:', emailError);
        }

        return { success: true };
      } catch (apiError) {
        console.error('AuthContext: API registration error, falling back to mock registration:', apiError);
        // Fallback to mock registration
        const newUser: User = {
          ID: Date.now().toString(),
          Email: email,
          Name: name,
          role: 'customer'
        };

        setUser(newUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(newUser));
        return { success: true, error: 'API registration failed, using mock registration.' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Validate email
      if (!email || typeof email !== 'string') {
        return { success: false, error: 'Valid email is required' };
      }

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return { success: false, error: 'Email cannot be empty' };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Try API call first
      try {
        if (!window.ezsite || !window.ezsite.apis) {
          console.error('AuthContext: window.ezsite.apis is not defined. Cannot send forgot password request.');
          return { success: false, error: 'Service not available' };
        }

        const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: trimmedEmail }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send reset email');
        }

        return { success: true };
      } catch (apiError) {
        console.error('AuthContext: Forgot password API error:', apiError);
        return { success: false, error: apiError instanceof Error ? apiError.message : 'Failed to send reset email' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{success: boolean;error?: string;}> => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!token || !newPassword) {
        return { success: false, error: 'Token and new password are required' };
      }

      if (typeof token !== 'string' || typeof newPassword !== 'string') {
        return { success: false, error: 'Invalid token or password format' };
      }

      const trimmedPassword = newPassword.trim();
      if (!trimmedPassword) {
        return { success: false, error: 'Password cannot be empty' };
      }

      if (trimmedPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Try API call
      try {
        const response = await fetch('http://localhost:3001/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, newPassword: trimmedPassword }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to reset password');
        }

        return { success: true };
      } catch (apiError) {
        console.error('AuthContext: Reset password API error:', apiError);
        return { success: false, error: apiError instanceof Error ? apiError.message : 'Failed to reset password' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.warn('AuthContext: window.ezsite.apis is not defined. Cannot perform API logout.');
      } else {
        window.ezsite.apis.logout();
      }
    } catch (error) {
      console.error('AuthContext: API logout error:', error);
    }
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('ecommerce_cart');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isLoading,
      login,
      loginWithPhone,
      register,
      registerWithPhone,
      sendOTP,
      verifyOTP,
      forgotPassword,
      resetPassword,
      logout,
      isAdmin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

