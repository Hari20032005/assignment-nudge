
import { useState, useEffect } from 'react';
import { Assignment } from '@/lib/types';
import { Header } from '@/components/Header';
import { AssignmentParser } from '@/components/AssignmentParser';
import { AssignmentDashboard } from '@/components/AssignmentDashboard';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { AssignmentStorageService } from '@/services/AssignmentStorageService';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Info } from 'lucide-react';

const Index = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showParser, setShowParser] = useState<boolean>(true);

  // Load user's assignments when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedAssignments = AssignmentStorageService.getAssignments(user.id);
      if (savedAssignments.length > 0) {
        setAssignments(savedAssignments);
        setShowParser(false);
      }
    }
  }, [isAuthenticated, user]);

  // Save assignments whenever they change
  useEffect(() => {
    if (isAuthenticated && user && assignments.length > 0) {
      AssignmentStorageService.saveAssignments(user.id, assignments);
    }
  }, [assignments, isAuthenticated, user]);

  const handleAssignmentsParsed = (parsedAssignments: Assignment[]) => {
    setAssignments(parsedAssignments);
    setShowParser(false);
    
    // Save to storage if user is authenticated
    if (isAuthenticated && user) {
      AssignmentStorageService.saveAssignments(user.id, parsedAssignments);
    }
  };

  const handleReset = () => {
    setAssignments([]);
    setShowParser(true);
    
    // Clear from storage if user is authenticated
    if (isAuthenticated && user) {
      AssignmentStorageService.clearAssignments(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-10 max-w-3xl mx-auto">
          <Card className="overflow-hidden bg-white shadow-md border-0">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src="/lovable-uploads/4e30b59d-6e9f-4ac1-afcf-34621c03c8d3.png" 
                  alt="Assignment Reference" 
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-4 text-white w-full">
                    <h3 className="text-lg font-semibold mb-1 flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Assignment Table Reference
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border-t border-blue-100">
                <div className="flex items-start text-sm text-blue-800">
                  <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Copy the content like in the screenshot and paste it here in the webpage to track your assignments and deadlines.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="max-w-lg text-center mb-10">
              <h1 className="text-3xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Track Your VIT Assignments</h1>
              <p className="text-muted-foreground">
                Log in or register to keep track of your assignments and due dates with Google Calendar integration.
              </p>
            </div>
            
            <AuthForm />
            
            <div className="mt-8 text-sm text-muted-foreground max-w-md text-center">
              <p>
                Create an account to save your assignments and access them from anywhere.
                Each assignment with a due date can be added directly to your Google Calendar.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div>
                <h2 className="text-xl font-medium">Welcome, {user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
            
            {showParser ? (
              <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                <div className="max-w-lg text-center mb-10">
                  <h1 className="text-3xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Track Your VIT Assignments</h1>
                  <p className="text-muted-foreground">
                    Paste your assignment data below and we'll help you stay on top of your deadlines with Google Calendar integration.
                  </p>
                </div>
                
                <AssignmentParser onAssignmentsParsed={handleAssignmentsParsed} />
                
                <div className="mt-8 text-sm text-muted-foreground max-w-md text-center">
                  <p>
                    Simply paste your assignment table and we'll automatically organize and track your due dates.
                    Each assignment with a due date can be added directly to your Google Calendar.
                  </p>
                </div>
              </div>
            ) : (
              <AssignmentDashboard 
                assignments={assignments} 
                onReset={handleReset} 
              />
            )}
          </>
        )}
      </main>
      
      <footer className="py-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>VIT Assignment Reminder &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
