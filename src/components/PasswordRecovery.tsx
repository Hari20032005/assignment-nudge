
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

interface PasswordRecoveryProps {
  onCancel: () => void;
}

export function PasswordRecovery({ onCancel }: PasswordRecoveryProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if email exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find((u: any) => u.email === email);
      
      if (!userExists) {
        toast.error('No account found with this email address');
        setIsSubmitting(false);
        return;
      }
      
      // In a real application, we would send a password reset email
      // For this demo, we'll just reset the password to a random string
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update the user's password
      userExists.password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast.success('Password has been reset. New password: ' + newPassword);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Password recovery error:', error);
      toast.error('An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      <div className="text-center mb-6">
        <Mail className="mx-auto h-12 w-12 text-primary mb-2" />
        <h2 className="text-2xl font-semibold">Forgot Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll help you reset your password
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recovery-email">Email Address</Label>
          <Input
            id="recovery-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
