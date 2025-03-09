
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
  dashboard: string;
  isCompleted?: boolean;
}

export type AssignmentStatus = 'upcoming' | 'overdue' | 'completed' | 'none';

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
