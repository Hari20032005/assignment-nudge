
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

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
  email: string;
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

// Client-side "database" of users
interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authStage, setAuthStage] = useState<AuthStage>(AuthStage.INITIAL);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load user session from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Generate a random confirmation code
  const generateConfirmationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Store confirmation codes (in localStorage for demo purposes)
  const [confirmationCodes, setConfirmationCodes] = useState<{[email: string]: string}>({});

  // Helper to get all users from localStorage
  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  // Helper to save users to localStorage
  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  // Sign up new user
  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const users = getUsers();
      if (users.some(user => user.email === email)) {
        toast.error('An account with this email already exists');
        return false;
      }
      
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

  // Confirm sign up
  const confirmSignUp = async (email: string, code: string): Promise<boolean> => {
    try {
      setLoading(true);
      const storedCode = confirmationCodes[email];
      
      if (!storedCode) {
        toast.error('No confirmation code was sent to this email');
        return false;
      }
      
      if (code === storedCode) {
        // Create new user
        const newUser: StoredUser = {
          id: `user_${Date.now()}`,
          email: email,
          password: 'temp-password', // Will be set when user signs in
          name: email.split('@')[0]
        };
        
        const users = getUsers();
        users.push(newUser);
        saveUsers(users);
        
        // Clean up the code
        setConfirmationCodes(prev => {
          const newCodes = {...prev};
          delete newCodes[email];
          return newCodes;
        });
        
        toast.success('Email confirmed successfully!');
        setAuthStage(AuthStage.SIGN_IN);
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

  // Sign in
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find user
      const users = getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        toast.error('No account found with this email');
        return false;
      }
      
      // For this client-side demo, we'll store the password on first login
      // In a real app, you'd verify the password against a hashed version
      if (!user.password || user.password === 'temp-password') {
        user.password = password;
        saveUsers(users);
      } else if (user.password !== password) {
        toast.error('Incorrect password');
        return false;
      }
      
      // Set user session
      const sessionUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      
      setUser(sessionUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      
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

  // Forgot password
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if user exists
      const users = getUsers();
      const userExists = users.some(u => u.email === email);
      
      if (!userExists) {
        toast.error('No account found with this email');
        return false;
      }
      
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

  // Confirm forgot password
  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const storedCode = confirmationCodes[email];
      
      if (!storedCode) {
        toast.error('No reset code was sent to this email');
        return false;
      }
      
      if (code === storedCode) {
        // Update user password
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          saveUsers(users);
          
          // Clean up the code
          setConfirmationCodes(prev => {
            const newCodes = {...prev};
            delete newCodes[email];
            return newCodes;
          });
          
          toast.success('Password reset successfully!');
          setAuthStage(AuthStage.SIGN_IN);
          return true;
        } else {
          toast.error('User not found');
          return false;
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
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    toast.info('You have been logged out');
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
