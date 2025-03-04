
import { format, parse, addDays, differenceInDays } from 'date-fns';

// Parse a date string in the format DD-MMM-YYYY
export function parseDate(dateString: string): Date | null {
  if (!dateString || dateString === '-' || dateString.includes('Nothing Left')) {
    return null;
  }
  
  try {
    // Extract just the date part if there's additional text
    const dateMatch = dateString.match(/(\d{2}-[A-Za-z]{3}-\d{4})/);
    if (!dateMatch) return null;
    
    const cleanDate = dateMatch[1];
    return parse(cleanDate, 'dd-MMM-yyyy', new Date());
  } catch (e) {
    console.error('Error parsing date:', e);
    return null;
  }
}

// Calculate days left until due date
export function calculateDaysLeft(dueDate: Date | null): number | null {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return differenceInDays(dueDate, today);
}

// Format date for display
export function formatDate(date: Date | null): string {
  if (!date) return 'No due date';
  return format(date, 'dd MMM yyyy');
}

// Get a nice relative time string
export function getRelativeTimeString(daysLeft: number | null): string {
  if (daysLeft === null) return 'No deadline';
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  return `${daysLeft} days left`;
}

// Determine status based on days left
export function getAssignmentStatus(daysLeft: number | null): 'upcoming' | 'overdue' | 'completed' | 'none' {
  if (daysLeft === null) return 'none';
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 7) return 'upcoming';
  return 'upcoming';
}
