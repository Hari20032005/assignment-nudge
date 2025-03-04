import { useState, useEffect } from 'react';
import { Assignment } from '@/lib/types';
import { AssignmentCard } from './AssignmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AssignmentDashboardProps {
  assignments: Assignment[];
  onReset: () => void;
}

export function AssignmentDashboard({ assignments, onReset }: AssignmentDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'no-deadline'>('all');
  const [sortedAssignments, setSortedAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // First sort by due date (null dates at the end)
    const sorted = [...assignments].sort((a, b) => {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
    
    setSortedAssignments(sorted);
  }, [assignments]);

  const filteredAssignments = sortedAssignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return assignment.daysLeft !== null && assignment.daysLeft >= 0;
    if (filter === 'overdue') return assignment.daysLeft !== null && assignment.daysLeft < 0;
    if (filter === 'no-deadline') return assignment.dueDate === null;
    return true;
  });

  const upcomingCount = assignments.filter(a => a.daysLeft !== null && a.daysLeft >= 0).length;
  const overdueCount = assignments.filter(a => a.daysLeft !== null && a.daysLeft < 0).length;
  const noDeadlineCount = assignments.filter(a => a.dueDate === null).length;

  const setReminders = () => {
    // This is a placeholder for setting actual reminders
    // In a real app, this would integrate with the browser's Notification API
    // or store reminders in localStorage/database
    
    let permissionGranted = false;
    
    // Check if browser supports notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        permissionGranted = true;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            permissionGranted = true;
          }
        });
      }
    }
    
    if (permissionGranted) {
      const upcomingAssignments = assignments.filter(a => a.daysLeft !== null && a.daysLeft >= 0 && a.daysLeft <= 7);
      
      toast.success(`Reminders set for ${upcomingAssignments.length} upcoming assignments`);
      
      // Simulate a notification for demonstration purposes
      setTimeout(() => {
        if (upcomingAssignments.length > 0) {
          const firstAssignment = upcomingAssignments[0];
          new Notification('Assignment Reminder', {
            body: `${firstAssignment.courseTitle} is due in ${firstAssignment.daysLeft} day(s)`,
            icon: '/favicon.ico'
          });
        }
      }, 3000);
    } else {
      toast.error('Notification permission required for reminders');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto transition-all duration-300 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your Assignments</h2>
          <p className="text-muted-foreground mt-1">Manage your upcoming due dates</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={setReminders}
            className="focus-ring"
          >
            Set Reminders
          </Button>
          <Button 
            variant="ghost" 
            onClick={onReset}
            className="focus-ring"
          >
            Reset
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{upcomingCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{overdueCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50 border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">No Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{noDeadlineCount}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Button 
          variant={filter === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('all')}
          className="focus-ring"
        >
          All ({assignments.length})
        </Button>
        <Button 
          variant={filter === 'upcoming' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('upcoming')}
          className="focus-ring text-blue-700"
        >
          Upcoming ({upcomingCount})
        </Button>
        <Button 
          variant={filter === 'overdue' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('overdue')}
          className="focus-ring text-red-700"
        >
          Overdue ({overdueCount})
        </Button>
        <Button 
          variant={filter === 'no-deadline' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('no-deadline')}
          className="focus-ring text-gray-700"
        >
          No Deadline ({noDeadlineCount})
        </Button>
      </div>
      
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No assignments match your filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment, index) => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              className="opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
