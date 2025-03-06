
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, KeyRound, LockKeyhole } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordResetProps {
  onCancel: () => void;
}

export function PasswordReset({ onCancel }: PasswordResetProps) {
  const { confirmForgotPassword, pendingEmail, resendConfirmationCode, loading } = useAuth();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleReset = async () => {
    if (!pendingEmail || !code || !newPassword) return;
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    await confirmForgotPassword(pendingEmail, code, newPassword);
  };
  
  const handleResendCode = async () => {
    if (pendingEmail) {
      await resendConfirmationCode(pendingEmail);
    }
  };
  
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2">
          <KeyRound className="h-5 w-5" />
          <span>Reset Your Password</span>
        </CardTitle>
        <CardDescription className="text-center">
          We've sent a reset code to {pendingEmail}. Please enter the code and your new password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <Input
            type="text"
            placeholder="Enter reset code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center tracking-widest"
            maxLength={6}
          />
          
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="password" 
              placeholder="New password"
              className="pl-9"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="password" 
              placeholder="Confirm new password"
              className="pl-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            For this demo, the reset code is displayed in the browser console
          </p>
        </div>
        <Button 
          onClick={handleReset} 
          className="w-full"
          disabled={loading || !code || !newPassword || !confirmPassword}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={handleResendCode}
            disabled={loading}
          >
            Didn't receive the code? Resend
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </CardFooter>
    </>
  );
}
