
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OTPVerificationProps {
  onCancel: () => void;
}

export function OTPVerification({ onCancel }: OTPVerificationProps) {
  const { pendingEmail, verifyOTP, sendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleResendOTP = async () => {
    if (pendingEmail) {
      await sendOTP(pendingEmail);
    }
  };
  
  const handleVerify = async () => {
    if (!pendingEmail || !otp) return;
    
    setIsSubmitting(true);
    try {
      await verifyOTP(pendingEmail, otp);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2">
          <KeyRound className="h-5 w-5" />
          <span>Verify Your Email</span>
        </CardTitle>
        <CardDescription className="text-center">
          We've sent an OTP to {pendingEmail}. Please enter the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            For this demo, the OTP is displayed in the browser console
          </p>
        </div>
        <Button 
          onClick={handleVerify} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
        </Button>
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={handleResendOTP}
          >
            Didn't receive the code? Resend OTP
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </CardFooter>
    </>
  );
}
