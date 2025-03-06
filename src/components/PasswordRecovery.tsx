
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordRecoveryProps {
  onCancel: () => void;
}

export function PasswordRecovery({ onCancel }: PasswordRecoveryProps) {
  const { sendOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRecovery = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await sendOTP(email);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Password Recovery</span>
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you an OTP to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleRecovery} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send OTP'}
        </Button>
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
