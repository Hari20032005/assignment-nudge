
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SignUpConfirmationProps {
  onCancel: () => void;
}

export function SignUpConfirmation({ onCancel }: SignUpConfirmationProps) {
  const { confirmSignUp, pendingEmail, resendConfirmationCode, loading } = useAuth();
  const [code, setCode] = useState('');
  
  const handleConfirm = async () => {
    if (!pendingEmail || !code) return;
    await confirmSignUp(pendingEmail, code);
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
          <ShieldCheck className="h-5 w-5" />
          <span>Confirm Your Account</span>
        </CardTitle>
        <CardDescription className="text-center">
          We've sent a confirmation code to {pendingEmail}. Please enter the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            type="text"
            placeholder="Enter confirmation code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            For this demo, the confirmation code is displayed in the browser console
          </p>
        </div>
        <Button 
          onClick={handleConfirm} 
          className="w-full"
          disabled={loading || !code}
        >
          {loading ? 'Confirming...' : 'Confirm Account'}
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
