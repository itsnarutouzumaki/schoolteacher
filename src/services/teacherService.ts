import { mockTeacherRepository } from './mockTeacherRepository';
import { getSchoolConfiguration } from '../config/schoolConfig';
import type { AttendanceDraft, AttendanceStatus, ClassSection, ExamType, ResultDraft, ResultEntry, SavedResult, Student } from '../types';

export const school = mockTeacherRepository.school;
const academic = getSchoolConfiguration().academic;
export const teacherSeed = mockTeacherRepository.teacher;
export const classSections: ClassSection[] = mockTeacherRepository.classes;
export const studentsByClass: Record<string, Student[]> = mockTeacherRepository.studentsByClass;
export const subjectsByClass: Record<string, string[]> = mockTeacherRepository.subjectsByClass;
export const timetable = mockTeacherRepository.timetable;
export const seedNotifications = mockTeacherRepository.notifications;
export const seedPreviousResults: SavedResult[] = mockTeacherRepository.previousResults;
export const helpTopics = mockTeacherRepository.helpTopics;
export const termsSections = mockTeacherRepository.termsSections;
export const privacySections = mockTeacherRepository.privacySections;
export const defaultAcademicYear = academic.defaultAcademicYear;
export const availableAcademicYears: string[] = academic.availableAcademicYears;
export function getStudents(className: string, section: string): Student[] { return mockTeacherRepository.getStudents(className, section); }
export function getClassSections(className?: string) { return mockTeacherRepository.getClassSections(className); }
export function getSubjects(className: string) { return mockTeacherRepository.getSubjects(className); }
export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function makeAttendanceDraft(className: string, section: string): AttendanceDraft {
  const students = getStudents(className, section);
  const statuses: Record<string, AttendanceStatus> = {};
  students.forEach(student => { statuses[student.id] = 'unmarked'; });
  return { className, section, date: localIsoDate(), students, statuses, currentIndex: 0 };
}
export function makeResultDraft(className: string, section: string, subject: string, testName: string, examType: ExamType = 'test'): ResultDraft {
  const students = getStudents(className, section);
  const entries: Record<string, ResultEntry> = {};
  students.forEach(student => { entries[student.id] = { studentId: student.id, rollNumber: student.rollNumber, studentName: student.fullName, fatherName: student.fatherName, uniqueId: student.studentId, obtainedMarks: '', totalMarks: '', remarks: '', answerCopyUri: null, answerCopyPageCount: 0 }; });
  return { id: `demo-${Date.now()}`, className, section, subject, examType, testName: testName.trim(), date: localIsoDate(), academicYear: defaultAcademicYear, students, entries, currentIndex: 0 };
}
export function validateResultEntry(entry: ResultEntry): { valid: boolean; reason?: 'totalRequired'|'obtainedRequired'|'totalMustPositive'|'marksInvalid' } {
  if (entry.totalMarks.trim() === '') return { valid: false, reason: 'totalRequired' };
  if (entry.obtainedMarks.trim() === '') return { valid: false, reason: 'obtainedRequired' };
  const total = Number(entry.totalMarks);
  const obtained = Number(entry.obtainedMarks);
  if (!Number.isFinite(total) || total <= 0) return { valid: false, reason: 'totalMustPositive' };
  if (!Number.isFinite(obtained) || obtained < 0 || obtained > total) return { valid: false, reason: 'marksInvalid' };
  return { valid: true };
}
export function draftToSavedResult(draft: ResultDraft): SavedResult {
  const invalidStudent = draft.students.find(student => !validateResultEntry(draft.entries[student.id]).valid);
  if (invalidStudent) throw new Error(`Marks are incomplete or invalid for roll number ${invalidStudent.rollNumber}.`);
  const entries = draft.students.map(student => {
    const entry = draft.entries[student.id];
    return { ...entry, obtainedMarks: Number(entry.obtainedMarks), totalMarks: Number(entry.totalMarks) };
  });
  const maxMarks = entries.reduce((max, item) => Math.max(max, item.totalMarks), 0);
  return { id: draft.id, className: draft.className, section: draft.section, subject: draft.subject, examType: draft.examType, testName: draft.testName, date: draft.date, academicYear: draft.academicYear, teacherId: teacherSeed.id, totalStudents: entries.length, maxMarks, entries, submittedAt: new Date().toISOString(), isDemoSeed: false };
}
export function resultStatistics(result: SavedResult) {
  const scores = result.entries.map(item => item.obtainedMarks);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxMarks = Math.max(result.maxMarks || 0, ...result.entries.map(item => item.totalMarks || 0));
  const distribution = [
    { label: '0–25%', count: 0 }, { label: '26–50%', count: 0 }, { label: '51–75%', count: 0 }, { label: '76–100%', count: 0 },
  ];
  result.entries.forEach(entry => {
    const ratio = entry.totalMarks ? entry.obtainedMarks / entry.totalMarks : 0;
    if (ratio <= 0.25) distribution[0].count += 1;
    else if (ratio <= 0.5) distribution[1].count += 1;
    else if (ratio <= 0.75) distribution[2].count += 1;
    else distribution[3].count += 1;
  });
  return { average: scores.length ? totalScore / scores.length : 0, highest: scores.length ? Math.max(...scores) : 0, lowest: scores.length ? Math.min(...scores) : 0, maxMarks, totalStudents: scores.length, distribution };
}
export function sortResultEntries(result: SavedResult, sort: 'roll'|'marks') {
  const entries = [...result.entries];
  return sort === 'roll' ? entries.sort((a,b) => a.rollNumber - b.rollNumber) : entries.sort((a,b) => b.obtainedMarks - a.obtainedMarks || a.rollNumber - b.rollNumber);
}
export function formatDate(date: string, language: 'en'|'hi' = 'en') {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
