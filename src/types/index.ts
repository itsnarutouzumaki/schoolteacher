export type ScreenName =
  | 'Login' | 'ForgotPassword' | 'Home' | 'SchoolDetails'
  | 'AttendanceSetup' | 'AttendanceCapture' | 'AttendanceReview' | 'AttendanceSuccess'
  | 'ResultSetup' | 'ResultEntry' | 'Scanner' | 'CapturedPagesReview' | 'PdfPreview' | 'ResultReview' | 'ResultSuccess'
  | 'PreviousResults' | 'ResultDashboard' | 'StudentResultDetail'
  | 'Notifications' | 'MyProfile' | 'EditProfile' | 'ChangePassword'
  | 'HelpSupport' | 'Terms' | 'Privacy' | 'Teachers' | 'TeacherDetail';

export type Route = { name: ScreenName; params?: Record<string, unknown> };
export type ToastTone = 'success' | 'error' | 'info' | 'warning';
export type ToastMessage = { id: number; title: string; message?: string; tone: ToastTone };
export type Language = 'en' | 'hi';
export type ScanPage = { id: string; uri: string; width?: number; height?: number; optimizationFailed?: boolean };
export type AttendanceStatus = 'present' | 'absent' | 'unmarked';

export type Student = {
  id: string;
  rollNumber: number;
  fullName: string;
  fatherName: string;
  studentId: string;
  className: string;
  section: string;
  photoUrl: string;
  gender: 'Male' | 'Female';
};
export type TeacherProfile = {
  id: string;
  name: string;
  photoUrl: string;
  designation: string;
  designationHi?: string;
  aboutHi?: string;
  specializationHi?: string;
  subjects: string[];
  highestDegree: string;
  qualifications: Array<{ degree: string; institution: string; year: string }>;
  experienceYears: number;
  specialization: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  classes: string[];
  languages: string[];
  awards: string[];
  officeHours: string;
};
export type ClassSection = { className: string; section: string; label: string };
export type AttendanceDraft = {
  className: string;
  section: string;
  date: string;
  students: Student[];
  statuses: Record<string, AttendanceStatus>;
  currentIndex: number;
};
export type ExamType = 'yearly' | 'halfYearly' | 'preBoard' | 'test';
export type ResultEntry = {
  studentId: string;
  rollNumber: number;
  studentName: string;
  fatherName: string;
  uniqueId: string;
  obtainedMarks: string;
  totalMarks: string;
  remarks: string;
  answerCopyUri: string | null;
  answerCopyPageCount: number;
};
export type ResultDraft = {
  id: string;
  className: string;
  section: string;
  subject: string;
  examType: ExamType;
  testName: string;
  date: string;
  academicYear: string;
  students: Student[];
  entries: Record<string, ResultEntry>;
  currentIndex: number;
};
export type SavedResult = {
  id: string;
  className: string;
  section: string;
  subject: string;
  examType?: ExamType;
  testName: string;
  date: string;
  academicYear: string;
  teacherId: string;
  totalStudents: number;
  maxMarks: number;
  entries: Array<{
    studentId: string;
    rollNumber: number;
    studentName: string;
    fatherName: string;
    uniqueId: string;
    obtainedMarks: number;
    totalMarks: number;
    remarks: string;
    answerCopyUri: string | null;
    answerCopyPageCount: number;
  }>;
  submittedAt: string;
  isDemoSeed: boolean;
};
export type TeacherNotice = { id: string; type: string; title: string; message: string; dateLabel: string; titleHi?: string; messageHi?: string; dateLabelHi?: string; titleKey?: string; messageKey?: string; messageVars?: Record<string, string | number>; dateKey?: string; read: boolean; source?: 'push' | 'local'; route?: ScreenName; routeParams?: Record<string, unknown> };
export type HelpTopic = { id: string; q: string; a: string };
