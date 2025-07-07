import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

export default function OnAuthSuccessPage() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/auth');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-800">
            Email Verified Successfully!
          </CardTitle>
          <CardDescription className="text-center">
            Your email has been verified and your account is now active.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Email Verification Complete</span>
            </div>
            <p className="text-sm text-gray-600">
              You can now login to your account and start using our platform.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Redirecting to login page in {countdown} seconds...
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(5 - countdown) / 5 * 100}%` }}>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-blue-600 hover:text-blue-800 font-medium underline">

              Go to login page now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>);

}
