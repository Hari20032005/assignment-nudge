
import { Assignment, AssignmentStatus } from '@/lib/types';
import { formatDate, getRelativeTimeString, getAssignmentStatus } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationService } from '@/services/NotificationService';
import { toast } from 'sonner';
import { Calendar, Check, Clock, Bookmark, CheckCircle2 } from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  className?: string;
  style?: React.CSSProperties;
  onToggleComplete?: (id: string, isCompleted: boolean) => void;
}

export function AssignmentCard({ assignment, className, style, onToggleComplete }: AssignmentCardProps) {
  const status: AssignmentStatus = assignment.isCompleted 
    ? 'completed' 
    : (assignment.daysLeft !== null 
      ? getAssignmentStatus(assignment.daysLeft) 
      : 'none');
  
  const statusColors = {
    upcoming: assignment.daysLeft !== null && assignment.daysLeft <= 3 
      ? 'bg-amber-50 border-amber-200 text-amber-700' 
      : 'bg-blue-50 border-blue-200 text-blue-700',
    overdue: 'bg-red-50 border-red-200 text-red-700',
    completed: 'bg-green-50 border-green-200 text-green-700',
    none: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const cardBorderColors = {
    upcoming: assignment.daysLeft !== null && assignment.daysLeft <= 3 
      ? 'border-amber-200' 
      : 'border-blue-200',
    overdue: 'border-red-200',
    completed: 'border-green-200',
    none: 'border-gray-200',
  };
  
  const addToCalendar = () => {
    if (!assignment.dueDate) {
      toast.error('No due date specified for this assignment');
      return;
    }
    
    // Set start time to 1 day before due date at 9 AM
    const startDate = new Date(assignment.dueDate);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(9, 0, 0, 0);
    
    // Set end time 1 hour after start
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    // Create description with assignment details
    const description = `Assignment Due: ${formatDate(assignment.dueDate)}
Course: ${assignment.courseCode} - ${assignment.courseTitle}
Faculty: ${assignment.facultyName || 'Not specified'}`;
    
    // Add directly to Google Calendar
    const success = NotificationService.addEventToGoogleCalendar(
      `Assignment Reminder: ${assignment.courseTitle}`,
      description,
      startDate,
      endDate
    );
    
    if (success) {
      toast.success(`Adding ${assignment.courseTitle} to Google Calendar`, {
        description: "A new browser tab has opened to add this to your calendar"
      });
    } else {
      toast.error('Failed to add reminder to calendar');
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(assignment.id, !assignment.isCompleted);
    }
  };
  
  return (
    <div 
      className={cn(
        'glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up',
        cardBorderColors[status],
        className,
        assignment.isCompleted ? 'opacity-80' : 'opacity-100'
      )}
      style={style}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{assignment.courseCode}</span>
              {assignment.isCompleted && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>
            <h3 className="font-medium text-lg leading-tight mt-2">{assignment.courseTitle}</h3>
          </div>
          
          {assignment.dueDate && !assignment.isCompleted && (
            <div 
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                statusColors[status]
              )}
            >
              <Clock className="h-3 w-3" />
              {getRelativeTimeString(assignment.daysLeft)}
            </div>
          )}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mt-2 mb-3">
          <span className="line-clamp-1">{assignment.facultyName}</span>
          {assignment.courseType && (
            <>
              <span className="mx-2">•</span>
              <span>{assignment.courseType}</span>
            </>
          )}
        </div>
        
        {assignment.dueDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{formatDate(assignment.dueDate)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs px-2 py-1 rounded-md bg-gray-100">
                #{assignment.classNbr}
              </span>
            </div>
          </div>
        )}
        
        {!assignment.dueDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500 italic">
              No due date specified
            </div>
            
            <div className="flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs px-2 py-1 rounded-md bg-gray-100">
                #{assignment.classNbr}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "w-full",
              assignment.isCompleted && "border-green-200 text-green-700 bg-green-50"
            )}
            onClick={handleToggleComplete}
          >
            {assignment.isCompleted ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Completed
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            disabled={!assignment.dueDate}
            onClick={addToCalendar}
          >
            <Calendar className="h-4 w-4 mr-1" /> Add to Calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
