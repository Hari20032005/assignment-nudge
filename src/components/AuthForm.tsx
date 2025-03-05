
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordRecovery } from './PasswordRecovery';
import { LockKeyhole, User, Mail } from 'lucide-react';

export function AuthForm() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await login(loginEmail, loginPassword);
    setIsLoggingIn(false);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    await register(registerName, registerEmail, registerPassword);
    setIsRegistering(false);
  };
  
  if (showPasswordRecovery) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <PasswordRecovery onCancel={() => setShowPasswordRecovery(false)} />
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <LockKeyhole className="h-5 w-5" />
                <span>Login</span>
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-1">
                  <LockKeyhole className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm p-0 h-auto"
                  onClick={() => setShowPasswordRecovery(true)}
                >
                  Forgot password?
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5" />
                <span>Create Account</span>
              </CardTitle>
              <CardDescription className="text-center">
                Register to track your assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Name</span>
                </Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-1">
                  <LockKeyhole className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Creating Account...' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
