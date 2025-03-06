
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordRecovery } from './PasswordRecovery';
import { OTPVerification } from './OTPVerification';
import { LogIn, Mail, User, LockKeyhole } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AuthForm() {
  const { loginWithEmail, isVerifying } = useAuth();
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email) return;
    
    setIsLoggingIn(true);
    await loginWithEmail(email, password);
    setIsLoggingIn(false);
  };
  
  if (isVerifying) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <OTPVerification onCancel={() => setShowPasswordRecovery(false)} />
      </Card>
    );
  }
  
  if (showPasswordRecovery) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <PasswordRecovery onCancel={() => setShowPasswordRecovery(false)} />
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <LogIn className="h-5 w-5" />
          <span>Sign in to VIT Assignment Reminder</span>
        </CardTitle>
        <CardDescription>
          Use your email to track your assignments and deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Password (optional for OTP login)"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={isLoggingIn || !email}
            className="w-full py-6"
          >
            {isLoggingIn ? 'Sending OTP...' : 'Continue with Email'}
          </Button>
          
          <div className="flex items-center justify-center">
            <Button
              variant="link"
              className="text-sm"
              onClick={() => setShowPasswordRecovery(true)}
            >
              Forgot password?
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="mt-1 text-xs">
              Demo note: For testing, the OTP will be displayed in the browser console.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
