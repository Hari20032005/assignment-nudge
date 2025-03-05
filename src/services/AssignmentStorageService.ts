
import { Assignment } from "@/lib/types";

export class AssignmentStorageService {
  private static STORAGE_KEY_PREFIX = "assignments_";

  static getAssignments(userId: string): Assignment[] {
    try {
      const storageKey = this.getStorageKey(userId);
      const storedData = localStorage.getItem(storageKey);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error retrieving assignments:", error);
      return [];
    }
  }

  static saveAssignments(userId: string, assignments: Assignment[]): void {
    try {
      const storageKey = this.getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(assignments));
    } catch (error) {
      console.error("Error saving assignments:", error);
    }
  }

  static clearAssignments(userId: string): void {
    try {
      const storageKey = this.getStorageKey(userId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing assignments:", error);
    }
  }

  private static getStorageKey(userId: string): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }
}
