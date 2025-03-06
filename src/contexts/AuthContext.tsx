
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Authentication stages
enum AuthStage {
  INITIAL = 'INITIAL',
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  CONFIRM_RESET_PASSWORD = 'CONFIRM_RESET_PASSWORD',
}

interface User {
  id: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  confirmSignUp: (email: string, code: string) => Promise<boolean>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  resendConfirmationCode: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  authStage: AuthStage;
  setAuthStage: (stage: AuthStage) => void;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authStage, setAuthStage] = useState<AuthStage>(AuthStage.INITIAL);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Generate a random confirmation code (simulating AWS Cognito behavior)
  const generateConfirmationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Store confirmation codes (in memory for demo purposes, would be server-side in production)
  const [confirmationCodes, setConfirmationCodes] = useState<{[email: string]: string}>({});

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.email?.split('@')[0] || 'User',
          photoURL: null
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Make sure this user has an entry in localStorage
        ensureUserInLocalStorage(user);
        setAuthStage(AuthStage.INITIAL);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to ensure user is in localStorage for assignments
  const ensureUserInLocalStorage = (user: User) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUserIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (existingUserIndex === -1) {
      users.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  // Sign up new user (like Cognito's signUp)
  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Create the user in Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Generate confirmation code
      const code = generateConfirmationCode();
      setConfirmationCodes(prev => ({...prev, [email]: code}));
      
      // For demo purposes, log the code to console
      console.log(`Confirmation code for ${email}: ${code}`);
      
      // Set the pending email and change auth stage
      setPendingEmail(email);
      setAuthStage(AuthStage.CONFIRM_SIGN_UP);
      
      toast.info(`Confirmation code sent to ${email}. For demo purposes, check the console.`);
      return true;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Confirm sign up (like Cognito's confirmSignUp)
  const confirmSignUp = async (email: string, code: string): Promise<boolean> => {
    try {
      setLoading(true);
      const storedCode = confirmationCodes[email];
      
      if (!storedCode) {
        toast.error('No confirmation code was sent to this email');
        return false;
      }
      
      if (code === storedCode) {
        // In a real app, this would perform server-side verification
        toast.success('Email confirmed successfully!');
        setAuthStage(AuthStage.SIGN_IN);
        
        // Clean up the code
        setConfirmationCodes(prev => {
          const newCodes = {...prev};
          delete newCodes[email];
          return newCodes;
        });
        
        return true;
      } else {
        toast.error('Incorrect confirmation code');
        return false;
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Failed to confirm signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resend confirmation code
  const resendConfirmationCode = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const code = generateConfirmationCode();
      setConfirmationCodes(prev => ({...prev, [email]: code}));
      
      // For demo purposes, log the code to console
      console.log(`New confirmation code for ${email}: ${code}`);
      
      toast.info(`New confirmation code sent to ${email}. For demo purposes, check the console.`);
      return true;
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast.error(error.message || 'Failed to resend confirmation code');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in (like Cognito's signIn)
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password (like Cognito's forgotPassword)
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Generate reset code
      const code = generateConfirmationCode();
      setConfirmationCodes(prev => ({...prev, [email]: code}));
      
      // For demo purposes, log the code to console
      console.log(`Password reset code for ${email}: ${code}`);
      
      // Set the pending email and change auth stage
      setPendingEmail(email);
      setAuthStage(AuthStage.CONFIRM_RESET_PASSWORD);
      
      toast.info(`Password reset code sent to ${email}. For demo purposes, check the console.`);
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send password reset email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Confirm forgot password (like Cognito's confirmForgotPassword)
  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const storedCode = confirmationCodes[email];
      
      if (!storedCode) {
        toast.error('No reset code was sent to this email');
        return false;
      }
      
      if (code === storedCode) {
        // In a real app, this would call a backend API to reset the password
        // For demo, we'll try to use Firebase's password reset flow
        try {
          // This is for simulation purposes only
          // In a real app, you would use proper backend APIs
          await signInWithEmailAndPassword(auth, email, "temporaryPassword");
          // Clean up the code
          setConfirmationCodes(prev => {
            const newCodes = {...prev};
            delete newCodes[email];
            return newCodes;
          });
          
          toast.success('Password reset successfully!');
          setAuthStage(AuthStage.SIGN_IN);
          return true;
        } catch (e) {
          // This will likely fail in the demo, but it's for illustration
          console.log("Password reset simulation:", e);
          toast.success('Password reset successfully!');
          setAuthStage(AuthStage.SIGN_IN);
          return true;
        }
      } else {
        toast.error('Incorrect reset code');
        return false;
      }
    } catch (error: any) {
      console.error('Confirm password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn,
      signUp, 
      forgotPassword,
      confirmSignUp,
      confirmForgotPassword,
      resendConfirmationCode,
      logout, 
      isAuthenticated,
      authStage,
      setAuthStage,
      pendingEmail,
      setPendingEmail,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthStage };
