import type { AttendanceStatus, ClassSection, SavedResult, Student } from '../types';

export type AttendanceSubmissionPayload = {
  className: string;
  section: string;
  date: string;
  statuses: Record<string, Exclude<AttendanceStatus, 'unmarked'>>;
};

export type ResultSubmissionPayload = Omit<SavedResult, 'id' | 'teacherId' | 'submittedAt' | 'isDemoSeed'>;

/**
 * Typed boundary for future real backend integration. No implementation is provided here:
 * the current prototype intentionally performs local demo state updates only.
 */
export interface TeacherApiContract {
  getClassSections(): Promise<ClassSection[]>;
  getStudents(className: string, section: string): Promise<Student[]>;
  submitAttendance(payload: AttendanceSubmissionPayload): Promise<{ submissionId: string }>;
  submitResults(payload: ResultSubmissionPayload): Promise<{ resultId: string }>;
}
