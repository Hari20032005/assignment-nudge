
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, AuthStage } from '@/contexts/AuthContext';
import { LogIn, Mail, LockKeyhole, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SignUpConfirmation } from './SignUpConfirmation';
import { PasswordReset } from './PasswordReset';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthForm() {
  const { signIn, signUp, forgotPassword, authStage, setAuthStage, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) return;
    await signIn(email, password);
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    await signUp(email, password);
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    await forgotPassword(email);
  };

  if (authStage === AuthStage.CONFIRM_SIGN_UP) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <SignUpConfirmation onCancel={() => setAuthStage(AuthStage.INITIAL)} />
      </Card>
    );
  }
  
  if (authStage === AuthStage.CONFIRM_RESET_PASSWORD) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <PasswordReset onCancel={() => setAuthStage(AuthStage.INITIAL)} />
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <LogIn className="h-5 w-5" />
          <span>VIT Assignment Reminder</span>
        </CardTitle>
        <CardDescription>
          Use your email to track your assignments and deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
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
                placeholder="Password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSignIn} 
              disabled={loading || !email || !password}
              className="w-full py-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="flex items-center justify-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={handleForgotPassword}
                disabled={!email}
              >
                Forgot password?
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
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
                placeholder="Password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSignUp} 
              disabled={loading || !email || !password}
              className="w-full py-6"
              variant="default"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="mt-1 text-xs">
            Demo note: For testing, confirmation codes will be displayed in the browser console.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
