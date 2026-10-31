import { getSchoolConfiguration } from '../config/schoolConfig';
import mock from '../data/teacher-mock-data.json';
import type { ClassSection, SavedResult, Student, TeacherNotice, TeacherProfile } from '../types';

type TimetableItem = { time: string; className: string; section: string; subject: string; room: string };
type MockData = {
  teacher: TeacherProfile;
  teachers: TeacherProfile[];
  classes: ClassSection[];
  studentsByClass: Record<string, Student[]>;
  subjectsByClass: Record<string, string[]>;
  timetable: TimetableItem[];
  notifications: TeacherNotice[];
  previousResults: SavedResult[];
  helpTopics: Array<{ id: string; q: string; a: string }>;
  termsSections: Array<{ title: string; body: string }>;
  privacySections: Array<{ title: string; body: string }>;
};

const data = mock as unknown as MockData;
const schoolConfig = getSchoolConfiguration();
const classKey = (className: string, section: string) => `${className}|${section}`;

/** Read-only demo adapter. Replace this adapter with a real repository when backend APIs exist. */
export const mockTeacherRepository = {
  school: {
    ...schoolConfig.school,
    heroPhotoUrl: schoolConfig.media.coverImages[0],
  },
  teacher: data.teacher,
  teachers: data.teachers,
  classes: data.classes,
  studentsByClass: data.studentsByClass,
  subjectsByClass: data.subjectsByClass,
  timetable: data.timetable,
  notifications: data.notifications,
  previousResults: data.previousResults,
  helpTopics: data.helpTopics,
  termsSections: data.termsSections,
  privacySections: data.privacySections,
  getStudents(className: string, section: string): Student[] {
    return (data.studentsByClass[classKey(className, section)] || []).map(student => ({ ...student }));
  },
  getClassSections(className?: string): ClassSection[] {
    return data.classes.filter(item => !className || item.className === className);
  },
  getSubjects(className: string): string[] {
    return data.subjectsByClass[className] || [];
  },
};

export type { TimetableItem };
