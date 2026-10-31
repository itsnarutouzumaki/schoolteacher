import type { Route, ScreenName, TeacherNotice } from '../types';

export type RemoteNotificationMessage = {
  messageId?: string;
  sentTime?: number;
  notification?: { title?: string | null; body?: string | null } | null;
  data?: Record<string, unknown> | null;
};

const notificationRoutes = new Set<string>([
  'Home',
  'Notifications',
  'SchoolDetails',
  'AttendanceSetup',
  'PreviousResults',
  'Teachers',
]);

function isNotificationRoute(value: string | undefined): value is ScreenName {
  return value !== undefined && notificationRoutes.has(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseRouteParams(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'string') return isRecord(value) ? value : undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeRemoteNotification(
  message: RemoteNotificationMessage,
  now = Date.now(),
): TeacherNotice {
  const data = message.data ?? {};
  const sentTime =
    typeof message.sentTime === 'number' && Number.isFinite(message.sentTime)
      ? message.sentTime
      : now;
  const id =
    stringValue(data.eventId) ??
    stringValue(data.notificationId) ??
    stringValue(message.messageId) ??
    `push-${sentTime}`;
  const routeValue = stringValue(data.route) ?? stringValue(data.screen);
  const route = isNotificationRoute(routeValue) ? routeValue : undefined;

  return {
    id: id.slice(0, 200),
    type: stringValue(data.type) ?? 'general',
    title:
      stringValue(message.notification?.title) ??
      stringValue(data.subject) ??
      stringValue(data.title) ??
      'Greenwood Teacher',
    message:
      stringValue(message.notification?.body) ??
      stringValue(data.message) ??
      stringValue(data.body) ??
      'You have a new school update.',
    dateLabel: new Date(sentTime).toLocaleString(),
    titleHi: stringValue(data.subjectHi),
    messageHi: stringValue(data.messageHi),
    read: false,
    source: 'push',
    route,
    routeParams: parseRouteParams(data.routeParams),
  };
}

export function createLocalTestNotification(now = Date.now()): TeacherNotice {
  return {
    id: `local-test-${now}`,
    type: 'general',
    title: 'Push notification test',
    message: 'This is a test notification from Greenwood Teacher.',
    dateLabel: new Date(now).toLocaleString(),
    read: false,
    source: 'local',
    route: 'Notifications',
  };
}

export function upsertNotificationRecord(
  notifications: TeacherNotice[],
  incoming: TeacherNotice,
): TeacherNotice[] {
  return [incoming, ...notifications.filter(notification => notification.id !== incoming.id)];
}

export function mergeNotificationRecords(
  current: TeacherNotice[],
  stored: TeacherNotice[],
): TeacherNotice[] {
  const byId = new Map<string, TeacherNotice>();
  for (const notification of stored) byId.set(notification.id, notification);
  for (const notification of current) {
    if (!byId.has(notification.id)) byId.set(notification.id, notification);
  }
  return [...byId.values()];
}

export function notificationRoute(notification: TeacherNotice): Route {
  return {
    name: isNotificationRoute(notification.route)
      ? notification.route
      : 'Notifications',
    params: notification.routeParams,
  };
}
