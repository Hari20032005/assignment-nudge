
import { useState } from 'react';
import { Assignment } from '@/lib/types';
import { Header } from '@/components/Header';
import { AssignmentParser } from '@/components/AssignmentParser';
import { AssignmentDashboard } from '@/components/AssignmentDashboard';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showParser, setShowParser] = useState<boolean>(true);

  const handleAssignmentsParsed = (parsedAssignments: Assignment[]) => {
    setAssignments(parsedAssignments);
    setShowParser(false);
  };

  const handleReset = () => {
    setAssignments([]);
    setShowParser(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {showParser ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="max-w-lg text-center mb-10">
              <h1 className="text-3xl font-bold mb-4 tracking-tight">Never Miss a Deadline</h1>
              <p className="text-muted-foreground">
                Paste your assignment data below and we'll help you stay on top of your deadlines.
              </p>
            </div>
            
            <AssignmentParser onAssignmentsParsed={handleAssignmentsParsed} />
            
            <div className="mt-8 text-sm text-muted-foreground max-w-md text-center">
              <p>
                Simply paste your assignment table and we'll automatically organize and track your due dates.
              </p>
            </div>
          </div>
        ) : (
          <AssignmentDashboard 
            assignments={assignments} 
            onReset={handleReset} 
          />
        )}
      </main>
      
      <footer className="py-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Assignment Reminder &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
