
import { Assignment, AssignmentStatus } from '@/lib/types';
import { formatDate, getRelativeTimeString, getAssignmentStatus } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment;
  className?: string;
}

export function AssignmentCard({ assignment, className }: AssignmentCardProps) {
  const status: AssignmentStatus = assignment.daysLeft !== null 
    ? getAssignmentStatus(assignment.daysLeft) 
    : 'none';
  
  const statusColors = {
    upcoming: assignment.daysLeft !== null && assignment.daysLeft <= 3 
      ? 'bg-amber-50 border-amber-200 text-amber-700' 
      : 'bg-blue-50 border-blue-200 text-blue-700',
    overdue: 'bg-red-50 border-red-200 text-red-700',
    completed: 'bg-green-50 border-green-200 text-green-700',
    none: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  
  return (
    <div 
      className={cn(
        'glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up',
        className
      )}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">{assignment.courseCode}</span>
            <h3 className="font-medium text-lg leading-tight">{assignment.courseTitle}</h3>
          </div>
          
          {assignment.dueDate && (
            <div 
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                statusColors[status]
              )}
            >
              {getRelativeTimeString(assignment.daysLeft)}
            </div>
          )}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mt-2 mb-3">
          <span>{assignment.facultyName}</span>
          <span className="mx-2">•</span>
          <span>{assignment.courseType}</span>
        </div>
        
        {assignment.dueDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm">
              <span className="text-gray-500">Due:</span> 
              <span className="ml-1 font-medium">{formatDate(assignment.dueDate)}</span>
            </div>
            
            <span className="text-xs px-2 py-1 rounded-md bg-gray-100">
              #{assignment.classNbr}
            </span>
          </div>
        )}
        
        {!assignment.dueDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              No due date specified
            </div>
            
            <span className="text-xs px-2 py-1 rounded-md bg-gray-100">
              #{assignment.classNbr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
