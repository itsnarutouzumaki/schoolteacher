import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TeacherNotice } from '../types';
import { mergeNotificationRecords, upsertNotificationRecord } from './notificationPayload';

const notificationStorageKey = 'greenwood-teacher.push-notifications.v1';
const pendingNotificationOpenKey = 'greenwood-teacher.pending-notification-open.v1';
const pendingPushTokenKey = 'greenwood-teacher.pending-push-token.v1';
const maxStoredNotifications = 100;

function isTeacherNotice(value: unknown): value is TeacherNotice {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.message === 'string' &&
    typeof record.dateLabel === 'string' &&
    typeof record.read === 'boolean' &&
    (record.source === 'push' || record.source === 'local')
  );
}

async function readStoredNotifications(): Promise<TeacherNotice[]> {
  const value = await AsyncStorage.getItem(notificationStorageKey);
  if (value === null) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isTeacherNotice)) {
    throw new Error('Stored push notification data is invalid.');
  }
  return parsed;
}

export async function loadPushNotifications(): Promise<TeacherNotice[]> {
  return readStoredNotifications();
}

export async function savePushNotifications(notifications: TeacherNotice[]): Promise<void> {
  const pushRecords = notifications
    .filter(notification => notification.source === 'push' || notification.source === 'local')
    .slice(0, maxStoredNotifications);
  await AsyncStorage.setItem(notificationStorageKey, JSON.stringify(pushRecords));
}

export async function upsertStoredPushNotification(
  notification: TeacherNotice,
): Promise<void> {
  const stored = await readStoredNotifications();
  const updated = upsertNotificationRecord(stored, notification).slice(0, maxStoredNotifications);
  await AsyncStorage.setItem(notificationStorageKey, JSON.stringify(updated));
}

export async function savePendingNotificationOpen(
  notification: TeacherNotice,
): Promise<void> {
  await AsyncStorage.setItem(pendingNotificationOpenKey, JSON.stringify(notification));
}

export async function consumePendingNotificationOpen(): Promise<TeacherNotice | null> {
  const value = await AsyncStorage.getItem(pendingNotificationOpenKey);
  if (value === null) return null;
  const parsed: unknown = JSON.parse(value);
  if (!isTeacherNotice(parsed)) {
    throw new Error('Stored notification interaction is invalid.');
  }
  await AsyncStorage.removeItem(pendingNotificationOpenKey);
  return parsed;
}

export async function storePendingPushToken(token: string): Promise<void> {
  if (!token.trim()) throw new Error('Cannot store an empty push token.');
  await AsyncStorage.setItem(pendingPushTokenKey, token);
}

export async function getPendingPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(pendingPushTokenKey);
}

export async function clearPendingPushToken(): Promise<void> {
  await AsyncStorage.removeItem(pendingPushTokenKey);
}

export function mergeLoadedNotifications(
  current: TeacherNotice[],
  stored: TeacherNotice[],
): TeacherNotice[] {
  return mergeNotificationRecords(current, stored);
}
