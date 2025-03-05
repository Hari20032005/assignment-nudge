
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Mock login function (in a real app, this would validate against a backend)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simple validation
      if (!email || !password) {
        toast.error('Please enter both email and password');
        return false;
      }

      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email);

      if (!foundUser) {
        toast.error('User not found. Please register first.');
        return false;
      }

      if (foundUser.password !== password) {
        toast.error('Incorrect password');
        return false;
      }

      // Create user object without password
      const authenticatedUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name
      };

      // Store in state and localStorage
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      toast.success(`Welcome back, ${authenticatedUser.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simple validation
      if (!name || !email || !password) {
        toast.error('Please fill in all fields');
        return false;
      }

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        toast.error('User with this email already exists');
        return false;
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password // In a real app, this would be hashed
      };

      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Create user object without password for state
      const authenticatedUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      };

      // Store in state and localStorage
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      toast.success(`Welcome, ${authenticatedUser.name}!`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
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
