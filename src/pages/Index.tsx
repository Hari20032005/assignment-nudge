
import { useState, useEffect } from 'react';
import { Assignment } from '@/lib/types';
import { Header } from '@/components/Header';
import { AssignmentParser } from '@/components/AssignmentParser';
import { AssignmentDashboard } from '@/components/AssignmentDashboard';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Info, CalendarDays, BookOpen, Clock, Table } from 'lucide-react';

const STORAGE_KEY = 'vit_assignments';

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showParser, setShowParser] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedAssignments = localStorage.getItem(STORAGE_KEY);
      if (savedAssignments && JSON.parse(savedAssignments).length > 0) {
        const parsedAssignments = JSON.parse(savedAssignments, (key, value) => {
          if (typeof value === 'string' && 
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
            return new Date(value);
          }
          return value;
        });
        
        setAssignments(parsedAssignments);
        setShowParser(false);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    }
  }, [assignments]);

  const handleAssignmentsParsed = (parsedAssignments: Assignment[]) => {
    setAssignments(parsedAssignments);
    setShowParser(false);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedAssignments));
  };

  const handleReset = () => {
    setAssignments([]);
    setShowParser(true);
    
    localStorage.removeItem(STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {showParser ? (
          <>
            <div className="mb-10 max-w-3xl mx-auto">
              <Card className="overflow-hidden bg-white shadow-md border-0">
                <CardContent className="p-0">
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-start text-sm text-blue-800">
                      <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <p>Copy the assignment table from your VIT student portal and paste it below. The tool will automatically extract all deadlines and help you track them.</p>
                    </div>
                  </div>
                  <div className="p-6 text-sm">
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      <span>Expected table format:</span>
                    </div>
                    <ul className="space-y-1 pl-6 list-disc">
                      <li>Contains columns for Sl.No, Class Nbr, Course Code, Course Title, Upcoming Dues</li>
                      <li>Dates are in format DD-MMM-YYYY (like 15-MAR-2025)</li>
                      <li>May include days left in parentheses (like "15-MAR-2025 (10 days left)")</li>
                    </ul>
                    <p className="italic text-muted-foreground mt-3">Click "Show example format" in the form below to see a sample of the expected table format.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="max-w-lg text-center mb-10">
                <h1 className="text-3xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Track Your VIT Assignments</h1>
                <p className="text-muted-foreground">
                  Paste your assignment data below and we'll help you stay on top of your deadlines with Google Calendar integration.
                </p>
              </div>
              
              <AssignmentParser onAssignmentsParsed={handleAssignmentsParsed} />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <CalendarDays className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Google Calendar Integration</h3>
                  <p className="text-sm text-muted-foreground">Add all your assignments to Google Calendar with a single click</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Deadline Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor upcoming and overdue assignments at a glance</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Course Management</h3>
                  <p className="text-sm text-muted-foreground">Organize assignments by course and export data when needed</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <AssignmentDashboard 
            assignments={assignments} 
            onReset={handleReset} 
          />
        )}
      </main>
      
      <footer className="py-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>VIT Assignment Reminder &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Your assignments data is stored locally on your device.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
