
export interface Assignment {
  id: string;
  slNo: number;
  classNbr: string;
  courseCode: string;
  courseTitle: string;
  upcomingDues: string;
  dueDate: Date | null;
  daysLeft: number | null;
  courseType: string;
  facultyName: string;
  dashboard?: string;
}

export type AssignmentStatus = 'upcoming' | 'overdue' | 'completed' | 'none';
