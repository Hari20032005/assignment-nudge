
import { useState, useEffect } from 'react';
import { Assignment } from '@/lib/types';
import { AssignmentCard } from './AssignmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentParser } from './AssignmentParser';
import { toast } from 'sonner';
import { NotificationService } from '@/services/NotificationService';
import { formatDate } from '@/utils/dateUtils';
import { 
  Calendar, 
  Download, 
  Filter, 
  SortAsc, 
  FileDown, 
  Plus, 
  RotateCcw, 
  Clock, 
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  SortDesc,
  Bell
} from 'lucide-react';
import { CalendarEvent } from '@/utils/googleCalendarApi';
import { generateMultipleIcsContent, downloadIcsFile } from '@/utils/icsUtils';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssignmentDashboardProps {
  assignments: Assignment[];
  onReset: () => void;
}

type SortOption = 'dueDate' | 'courseCode' | 'courseTitle' | 'daysLeft';
type SortDirection = 'asc' | 'desc';

export function AssignmentDashboard({ assignments: initialAssignments, onReset }: AssignmentDashboardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed' | 'no-deadline'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortedAssignments, setSortedAssignments] = useState<Assignment[]>([]);
  const [showAddMore, setShowAddMore] = useState(false);

  // Check for upcoming deadlines
  const urgentAssignments = assignments.filter(a => 
    !a.isCompleted && a.daysLeft !== null && a.daysLeft >= 0 && a.daysLeft <= 2
  );

  useEffect(() => {
    let sorted = [...assignments];
    
    // Sort based on selected option
    sorted.sort((a, b) => {
      if (sortOption === 'dueDate') {
        if (a.dueDate === null && b.dueDate === null) return 0;
        if (a.dueDate === null) return 1;
        if (b.dueDate === null) return -1;
        
        const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
        const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
        
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } 
      else if (sortOption === 'daysLeft') {
        if (a.daysLeft === null && b.daysLeft === null) return 0;
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        
        return sortDirection === 'asc' 
          ? a.daysLeft - b.daysLeft
          : b.daysLeft - a.daysLeft;
      }
      else if (sortOption === 'courseCode') {
        return sortDirection === 'asc'
          ? a.courseCode.localeCompare(b.courseCode)
          : b.courseCode.localeCompare(a.courseCode);
      }
      else if (sortOption === 'courseTitle') {
        return sortDirection === 'asc'
          ? a.courseTitle.localeCompare(b.courseTitle)
          : b.courseTitle.localeCompare(a.courseTitle);
      }
      
      return 0;
    });
    
    setSortedAssignments(sorted);
  }, [assignments, sortOption, sortDirection]);

  const filteredAssignments = sortedAssignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return !assignment.isCompleted && assignment.daysLeft !== null && assignment.daysLeft >= 0;
    if (filter === 'overdue') return !assignment.isCompleted && assignment.daysLeft !== null && assignment.daysLeft < 0;
    if (filter === 'completed') return assignment.isCompleted === true;
    if (filter === 'no-deadline') return assignment.dueDate === null;
    return true;
  });

  const upcomingCount = assignments.filter(a => !a.isCompleted && a.daysLeft !== null && a.daysLeft >= 0).length;
  const overdueCount = assignments.filter(a => !a.isCompleted && a.daysLeft !== null && a.daysLeft < 0).length;
  const completedCount = assignments.filter(a => a.isCompleted === true).length;
  const noDeadlineCount = assignments.filter(a => a.dueDate === null).length;

  const handleAddMore = (newAssignments: Assignment[]) => {
    // Add isCompleted: false to all new assignments
    const newAssignmentsWithStatus = newAssignments.map(a => ({
      ...a,
      isCompleted: false
    }));
    
    const updatedAssignments = [...assignments, ...newAssignmentsWithStatus];
    setAssignments(updatedAssignments);
    setShowAddMore(false);
    toast.success(`Added ${newAssignmentsWithStatus.length} new assignments`);
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    const updatedAssignments = assignments.map(assignment => 
      assignment.id === id ? { ...assignment, isCompleted } : assignment
    );
    setAssignments(updatedAssignments);
    
    if (isCompleted) {
      toast.success('Assignment marked as completed!');
    }
  };

  const addAllToCalendar = () => {
    const assignmentsWithDueDate = assignments.filter(a => a.dueDate !== null && !a.isCompleted);
    
    if (assignmentsWithDueDate.length === 0) {
      toast.error('No pending assignments with due dates to add to calendar');
      return;
    }
    
    const calendarEvents: CalendarEvent[] = assignmentsWithDueDate.map(assignment => {
      const startDate = new Date(assignment.dueDate instanceof Date ? assignment.dueDate : new Date(assignment.dueDate));
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const description = `Assignment Due: ${formatDate(assignment.dueDate)}
Course: ${assignment.courseCode} - ${assignment.courseTitle}
Faculty: ${assignment.facultyName || 'Not specified'}`;

      return {
        title: `Assignment Reminder: ${assignment.courseTitle}`,
        description,
        startDate,
        endDate,
        colorId: '9'
      };
    });
    
    const success = NotificationService.addMultipleEventsToCalendar(calendarEvents);
    
    if (success) {
      toast.success(`Adding ${calendarEvents.length} assignments to Google Calendar`, {
        description: "Follow the instructions in the new tab. If no tab opened, please allow popups and try again."
      });
    } else {
      toast.error('Failed to create calendar events', {
        description: "Please check your browser's popup settings and try again. Look for popup blocked notification in your browser's address bar."
      });
    }
  };

  const exportAssignmentsAsCSV = () => {
    if (assignments.length === 0) {
      toast.error('No assignments to export');
      return;
    }

    let csv = 'Course Code,Course Title,Due Date,Days Left,Faculty Name,Status\n';
    
    assignments.forEach(assignment => {
      const dueDate = assignment.dueDate ? formatDate(assignment.dueDate) : 'No deadline';
      const daysLeft = assignment.daysLeft !== null ? assignment.daysLeft : 'N/A';
      const status = assignment.isCompleted ? 'Completed' : 
                    (assignment.daysLeft !== null && assignment.daysLeft < 0 ? 'Overdue' : 
                    (assignment.daysLeft !== null ? 'Upcoming' : 'No deadline'));
      
      csv += `"${assignment.courseCode}","${assignment.courseTitle}","${dueDate}","${daysLeft}","${assignment.facultyName}","${status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'vit_assignments.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Assignments exported successfully');
  };

  const downloadIcsCalendar = () => {
    const assignmentsWithDueDate = assignments.filter(a => a.dueDate !== null && !a.isCompleted);
    
    if (assignmentsWithDueDate.length === 0) {
      toast.error('No pending assignments with due dates to download');
      return;
    }
    
    const icsContent = generateMultipleIcsContent(assignmentsWithDueDate);
    downloadIcsFile(icsContent, 'vit_assignments.ics');
    
    toast.success(`Downloaded ${assignmentsWithDueDate.length} assignments as ICS file`, {
      description: "Import this file into your calendar application (Google Calendar, Outlook, Apple Calendar, etc.)"
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="w-full max-w-5xl mx-auto transition-all duration-300 animate-fade-in">
      {urgentAssignments.length > 0 && !showAddMore && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Urgent Assignments</h3>
            <p className="text-amber-700 text-sm">
              You have {urgentAssignments.length} {urgentAssignments.length === 1 ? 'assignment' : 'assignments'} due in the next 48 hours!
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
            onClick={() => {
              setFilter('upcoming');
              setSortOption('daysLeft');
              setSortDirection('asc');
            }}
          >
            <Clock className="h-4 w-4 mr-1" />
            View Urgent
          </Button>
        </div>
      )}
      
      {showAddMore ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Add More Assignments</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddMore(false)}>
              Cancel
            </Button>
          </div>
          <AssignmentParser onAssignmentsParsed={handleAddMore} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Your Assignments</h2>
            <p className="text-muted-foreground mt-1">Manage your upcoming due dates</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAddMore(true)}
              className="focus-ring gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className="focus-ring gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium mb-2">Choose export method</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addAllToCalendar}
                    className="justify-start gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Google Calendar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadIcsCalendar}
                    className="justify-start gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Download ICS File
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    ICS files can be imported into any calendar app including Google Calendar, Outlook, and Apple Calendar.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline"
              onClick={exportAssignmentsAsCSV}
              className="focus-ring gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              variant="ghost" 
              onClick={onReset}
              className="focus-ring gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
      
      {!showAddMore && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-100 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-1.5">
                  <Bell className="h-4 w-4" /> Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{upcomingCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-100 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{overdueCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-100 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{completedCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-gray-100 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> No Deadline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{noDeadlineCount}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
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
                variant={filter === 'completed' ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter('completed')}
                className="focus-ring text-green-700"
              >
                Completed ({completedCount})
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
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <SortAsc className="h-4 w-4" /> 
                    Sort by
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setSortOption('dueDate')}
                    className={sortOption === 'dueDate' ? 'bg-muted' : ''}
                  >
                    Due Date
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption('daysLeft')}
                    className={sortOption === 'daysLeft' ? 'bg-muted' : ''}
                  >
                    Days Left
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption('courseCode')}
                    className={sortOption === 'courseCode' ? 'bg-muted' : ''}
                  >
                    Course Code
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption('courseTitle')}
                    className={sortOption === 'courseTitle' ? 'bg-muted' : ''}
                  >
                    Course Title
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-9 h-9 p-0" 
                onClick={toggleSortDirection}
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
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
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
