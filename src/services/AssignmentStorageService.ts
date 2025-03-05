
import { Assignment } from '@/lib/types';

const PREFIX = 'assignments-';

export const AssignmentStorageService = {
  // Save assignments for a specific user
  saveAssignments: (userId: string, assignments: Assignment[]): void => {
    try {
      localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  },

  // Get assignments for a specific user
  getAssignments: (userId: string): Assignment[] => {
    try {
      const storedData = localStorage.getItem(`${PREFIX}${userId}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error retrieving assignments:', error);
    }
    return [];
  },

  // Clear assignments for a specific user
  clearAssignments: (userId: string): void => {
    try {
      localStorage.removeItem(`${PREFIX}${userId}`);
    } catch (error) {
      console.error('Error clearing assignments:', error);
    }
  }
};
