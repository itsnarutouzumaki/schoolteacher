import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockTeacherRepository } from './services/mockTeacherRepository';
import type { AttendanceDraft, ClassSection, ResultDraft, SavedResult, ScanPage, Student, TeacherNotice, TeacherProfile, ToastMessage } from './types';
import type { Route, ScreenName } from './types';
import { loadPushNotifications, mergeLoadedNotifications, savePushNotifications } from './services/notificationStore';

type AppValue = {
  school: typeof mockTeacherRepository.school;
  teacher: TeacherProfile;
  setTeacher: React.Dispatch<React.SetStateAction<TeacherProfile>>;
  classSections: ClassSection[];
  studentsByClass: Record<string, Student[]>;
  subjectsByClass: Record<string, string[]>;
  timetable: typeof seedData.timetable;
  teachers: TeacherProfile[];
  notifications: TeacherNotice[];
  setNotifications: React.Dispatch<React.SetStateAction<TeacherNotice[]>>;
  attendanceDraft: AttendanceDraft | null;
  setAttendanceDraft: React.Dispatch<React.SetStateAction<AttendanceDraft | null>>;
  resultDraft: ResultDraft | null;
  setResultDraft: React.Dispatch<React.SetStateAction<ResultDraft | null>>;
  savedResults: SavedResult[];
  setSavedResults: React.Dispatch<React.SetStateAction<SavedResult[]>>;
  scanPages: ScanPage[];
  setScanPages: React.Dispatch<React.SetStateAction<ScanPage[]>>;
  pendingPdfUri: string | null;
  setPendingPdfUri: React.Dispatch<React.SetStateAction<string | null>>;
  attendanceSubmissions: Array<{ id: string; className: string; section: string; date: string; statuses: Record<string, string>; total: number; present: number; absent: number; isDemo: true }>;
  setAttendanceSubmissions: React.Dispatch<React.SetStateAction<Array<{ id: string; className: string; section: string; date: string; statuses: Record<string, string>; total: number; present: number; absent: number; isDemo: true }>>>;
  currentRoute: Route;
  stack: Route[];
  navigate: (name: ScreenName, params?: Record<string, unknown>) => void;
  replace: (name: ScreenName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  resetTo: (name: ScreenName, params?: Record<string, unknown>) => void;
  popTo: (name: ScreenName) => void;
  isDemoOpen: boolean;
  setIsDemoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  toast: ToastMessage | null;
  setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
  logoutDialogOpen: boolean;
  setLogoutDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const Context = createContext<AppValue | null>(null);
const seedData = mockTeacherRepository;
export function AppProvider({ children, navigation }: { children: React.ReactNode; navigation: Omit<AppValue, 'school'|'teacher'|'setTeacher'|'classSections'|'studentsByClass'|'subjectsByClass'|'timetable'|'teachers'|'notifications'|'setNotifications'|'attendanceDraft'|'setAttendanceDraft'|'resultDraft'|'setResultDraft'|'savedResults'|'setSavedResults'|'scanPages'|'setScanPages'|'pendingPdfUri'|'setPendingPdfUri'|'attendanceSubmissions'|'setAttendanceSubmissions'|'showToast'|'toast'|'setToast'|'logoutDialogOpen'|'setLogoutDialogOpen'> }) {
  const [teacher, setTeacher] = useState<TeacherProfile>(() => ({ ...seedData.teacher }));
  const [notifications, setNotifications] = useState<TeacherNotice[]>(() => seedData.notifications.map((n: TeacherNotice) => ({ ...n })));
  const [notificationsHydrated, setNotificationsHydrated] = useState(false);
  const [attendanceDraft, setAttendanceDraft] = useState<AttendanceDraft | null>(null);
  const [resultDraft, setResultDraft] = useState<ResultDraft | null>(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>(() => seedData.previousResults.map((r: SavedResult) => ({ ...r })));
  const [scanPages, setScanPages] = useState<ScanPage[]>([]);
  const [pendingPdfUri, setPendingPdfUri] = useState<string | null>(null);
  const [attendanceSubmissions, setAttendanceSubmissions] = useState<Array<{ id: string; className: string; section: string; date: string; statuses: Record<string, string>; total: number; present: number; absent: number; isDemo: true }>>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const toastId = React.useRef(0);
  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    setToast({ ...message, id: ++toastId.current });
  }, []);
  React.useEffect(() => {
    let active = true;
    loadPushNotifications()
      .then(stored => {
        if (active) {
          setNotifications(current => mergeLoadedNotifications(current, stored));
          setNotificationsHydrated(true);
        }
      })
      .catch(error => {
        console.error('Unable to load stored push notifications.', error);
      });
    return () => { active = false; };
  }, []);
  React.useEffect(() => {
    if (!notificationsHydrated) return;
    savePushNotifications(notifications).catch(error => {
      console.error('Unable to save push notification records.', error);
    });
  }, [notifications, notificationsHydrated]);
  const value = useMemo<AppValue>(() => ({
    ...navigation,
    school: seedData.school,
    teacher, setTeacher,
    classSections: seedData.classes as ClassSection[],
    studentsByClass: seedData.studentsByClass as Record<string, Student[]>,
    subjectsByClass: seedData.subjectsByClass as Record<string, string[]>,
    timetable: seedData.timetable,
    teachers: seedData.teachers as TeacherProfile[],
    notifications, setNotifications,
    attendanceDraft, setAttendanceDraft,
    resultDraft, setResultDraft,
    savedResults, setSavedResults,
    scanPages, setScanPages,
    pendingPdfUri, setPendingPdfUri,
    attendanceSubmissions, setAttendanceSubmissions,
    showToast, toast, setToast, logoutDialogOpen, setLogoutDialogOpen,
  }), [navigation, teacher, notifications, attendanceDraft, resultDraft, savedResults, scanPages, pendingPdfUri, attendanceSubmissions, showToast, toast, logoutDialogOpen]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const context = useContext(Context); if (!context) throw new Error('useApp must be used inside AppProvider'); return context; }
export const teacherSeed = seedData.teacher as TeacherProfile;
