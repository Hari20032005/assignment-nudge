
import { format, addDays, isValid, parse, differenceInCalendarDays } from 'date-fns';
import { AssignmentStatus } from '@/lib/types';

/**
 * Parses a date string in various formats
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Trim any extra whitespace
  dateString = dateString.trim();
  
  // Try various date formats
  const formats = [
    'dd-MMM-yyyy',
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MMM dd, yyyy',
    'dd MMM yyyy',
  ];
  
  for (const formatStr of formats) {
    const parsedDate = parse(dateString, formatStr, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  
  // Try extracting date with regex for more flexible parsing
  const dateRegex = /(\d{1,2})[-\/](\w{3,})[-\/](\d{4})/;
  const match = dateString.match(dateRegex);
  
  if (match) {
    const [_, day, month, year] = match;
    const monthMap: {[key: string]: number} = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    const monthLower = month.toLowerCase();
    if (monthMap[monthLower] !== undefined) {
      const parsedDate = new Date(
        parseInt(year),
        monthMap[monthLower],
        parseInt(day)
      );
      
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  }
  
  console.warn(`Could not parse date: ${dateString}`);
  return null;
}

/**
 * Calculates the days left until the due date
 */
export function calculateDaysLeft(dueDate: Date | null): number | null {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateCopy = new Date(dueDate);
  dueDateCopy.setHours(0, 0, 0, 0);
  
  return differenceInCalendarDays(dueDateCopy, today);
}

/**
 * Formats a date as a string
 */
export function formatDate(date: Date | null): string {
  if (!date) return 'No date';
  return format(date, 'dd MMM yyyy');
}

/**
 * Gets a human-readable string for the time remaining
 */
export function getRelativeTimeString(daysLeft: number | null): string {
  if (daysLeft === null) return 'No deadline';
  
  if (daysLeft < 0) {
    const abs = Math.abs(daysLeft);
    return abs === 1 ? 'Overdue by 1 day' : `Overdue by ${abs} days`;
  }
  
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  if (daysLeft < 7) return `Due in ${daysLeft} days`;
  if (daysLeft < 14) return 'Due in 1 week';
  if (daysLeft < 30) return `Due in ${Math.floor(daysLeft / 7)} weeks`;
  
  return `Due in ${Math.floor(daysLeft / 30)} months`;
}

/**
 * Determines the assignment status based on days left
 */
export function getAssignmentStatus(daysLeft: number): AssignmentStatus {
  if (daysLeft < 0) return 'overdue';
  return 'upcoming';
}

/**
 * Gets the next N days as formatted date strings
 */
export function getNextNDays(n: number): string[] {
  const dates: string[] = [];
  let currentDate = new Date();
  
  for (let i = 0; i < n; i++) {
    dates.push(format(currentDate, 'dd MMM yyyy'));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

/**
 * Sorts assignments by due date
 */
export function sortByDueDate(assignments: any[], ascending: boolean = true): any[] {
  return [...assignments].sort((a, b) => {
    if (a.dueDate === null && b.dueDate === null) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    
    const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
    const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
    
    return ascending 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
}
