
import { Assignment } from "@/lib/types";
import { format } from "date-fns";

/**
 * Generates ICS content for a single assignment
 */
export function generateIcsContent(assignment: Assignment): string {
  if (!assignment.dueDate) return "";
  
  // Format dates according to iCalendar format (UTC)
  const dueDate = new Date(assignment.dueDate);
  const startDate = new Date(dueDate);
  
  // Set reminder for 9AM on the due date
  startDate.setHours(9, 0, 0, 0);
  
  // Add 1 hour for the event duration
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);
  
  // Format dates in iCalendar format
  const formatIcsDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  };
  
  // Create unique identifier for the event
  const uid = `${assignment.id}-${Date.now()}@vit-assignment-reminder`;
  
  // Create event description
  const description = `Course: ${assignment.courseCode} - ${assignment.courseTitle}\nFaculty: ${assignment.facultyName || 'Not specified'}`;
  
  // Build the ICS content
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:Assignment Due: ${assignment.courseTitle}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Assignment Due Reminder",
    "TRIGGER:-PT24H", // 24 hours before
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

/**
 * Generates ICS content for multiple assignments
 */
export function generateMultipleIcsContent(assignments: Assignment[]): string {
  const validAssignments = assignments.filter(a => a.dueDate !== null);
  
  if (validAssignments.length === 0) {
    return "";
  }
  
  // Start the calendar
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ].join("\r\n");
  
  // Add each event
  for (const assignment of validAssignments) {
    if (!assignment.dueDate) continue;
    
    // Format dates according to iCalendar format (UTC)
    const dueDate = new Date(assignment.dueDate);
    const startDate = new Date(dueDate);
    
    // Set reminder for 9AM on the due date
    startDate.setHours(9, 0, 0, 0);
    
    // Add 1 hour for the event duration
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    // Format dates in iCalendar format
    const formatIcsDate = (date: Date) => {
      return format(date, "yyyyMMdd'T'HHmmss'Z'");
    };
    
    // Create unique identifier for the event
    const uid = `${assignment.id}-${Date.now()}@vit-assignment-reminder`;
    
    // Create event description
    const description = `Course: ${assignment.courseCode} - ${assignment.courseTitle}\nFaculty: ${assignment.facultyName || 'Not specified'}`;
    
    // Add the event
    icsContent += "\r\n" + [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `SUMMARY:Assignment Due: ${assignment.courseTitle}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Assignment Due Reminder",
      "TRIGGER:-PT24H", // 24 hours before
      "END:VALARM",
      "END:VEVENT"
    ].join("\r\n");
  }
  
  // Close the calendar
  icsContent += "\r\nEND:VCALENDAR";
  
  return icsContent;
}

/**
 * Downloads an ICS file with the given content
 */
export function downloadIcsFile(content: string, filename: string = "assignments.ics"): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

