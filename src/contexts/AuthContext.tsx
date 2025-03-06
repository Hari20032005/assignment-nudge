
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isVerifying: boolean;
  pendingEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpMap, setOtpMap] = useState<{[email: string]: string}>({});

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
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
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
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

  // Generate a random 6-digit OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll just generate an OTP and store it
      // In a real app, this would send an email with the OTP
      const otp = generateOTP();
      
      // Store the OTP for verification
      setOtpMap(prev => ({...prev, [email]: otp}));
      setPendingEmail(email);
      setIsVerifying(true);
      
      // Log the OTP to console for demo purposes
      console.log(`OTP for ${email}: ${otp}`);
      
      toast.info(`OTP sent to ${email}. For demo purposes, check the console.`);
      return true;
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to send OTP');
      return false;
    }
  };

  const verifyOTP = async (email: string, enteredOTP: string): Promise<boolean> => {
    try {
      // Check if the entered OTP matches the one we stored
      const correctOTP = otpMap[email];
      
      if (!correctOTP) {
        toast.error('No OTP was sent to this email');
        return false;
      }
      
      if (enteredOTP === correctOTP) {
        // In a real app, this would call a backend API to verify the user
        // Here we'll simulate successful verification
        
        // Create a user account if it doesn't exist
        try {
          await createUserWithEmailAndPassword(auth, email, 'Temp123!');
        } catch (e) {
          // User might already exist, try to sign in
          await signInWithEmailAndPassword(auth, email, 'Temp123!');
        }
        
        // Clear verification state
        setIsVerifying(false);
        setPendingEmail(null);
        setOtpMap(prev => {
          const newMap = {...prev};
          delete newMap[email];
          return newMap;
        });
        
        toast.success('Email verified successfully');
        return true;
      } else {
        toast.error('Incorrect OTP. Please try again.');
        return false;
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Failed to verify OTP');
      return false;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      await sendOTP(email);
      return true;
    } catch (error: any) {
      console.error('Email login error:', error);
      toast.error(error.message || 'Failed to sign in with email');
      return false;
    }
  };
  
  const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      await sendOTP(email);
      return true;
    } catch (error: any) {
      console.error('Email registration error:', error);
      toast.error(error.message || 'Failed to register with email');
      return false;
    }
  };

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
      loginWithEmail, 
      registerWithEmail,
      sendOTP,
      verifyOTP,
      logout, 
      isAuthenticated,
      isVerifying,
      pendingEmail
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
