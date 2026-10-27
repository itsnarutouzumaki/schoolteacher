import type { TeacherProfile, ResultEntry } from '../types';
import { validateResultEntry } from '../services/teacherService';
export function validateLogin(mobile: string, password: string) {
  const digits = mobile.replace(/\D/g, '');
  if (!/^[0-9]{10,13}$/.test(digits)) return 'invalidMobile';
  if (!password.trim()) return 'emptyRequired';
  return null;
}
export function validateTeacherProfile(profile: TeacherProfile) {
  if (!profile.name.trim()) return 'nameRequired';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) return 'invalidEmail';
  if (!profile.highestDegree.trim()) return 'degreeRequired';
  const mobile = profile.phone.replace(/\D/g, '');
  if (mobile.length < 10 || mobile.length > 13) return 'invalidMobile';
  if (!Number.isInteger(Number(profile.experienceYears)) || Number(profile.experienceYears) < 0) return 'emptyRequired';
  return null;
}
export function validatePasswordChange(current: string, next: string, confirm: string) {
  if (!current || !next || !confirm) return 'emptyRequired';
  if (next.length < 8) return 'minPassword';
  if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) return 'minPassword';
  if (next !== confirm) return 'passwordMismatch';
  return null;
}
export function validateMarks(entry: ResultEntry) { return validateResultEntry(entry); }
