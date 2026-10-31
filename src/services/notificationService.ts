import { Platform } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  setBackgroundMessageHandler,
  isDeviceRegisteredForRemoteMessages,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  type Notification,
} from '@notifee/react-native';
import type { TeacherNotice } from '../types';
import type { TeacherNotificationApi } from './notificationApi.contract';
import { normalizeRemoteNotification } from './notificationPayload';
import {
  clearPendingPushToken,
  getPendingPushToken,
  savePendingNotificationOpen,
  storePendingPushToken,
  upsertStoredPushNotification,
} from './notificationStore';

export const TEACHER_NOTIFICATION_CHANNEL_ID = 'teacher_updates';
const notificationSound = 'teacher_notification';

export function isFirebaseMessagingConfigured(): boolean {
  return getApps().length > 0;
}

export async function createTeacherNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: TEACHER_NOTIFICATION_CHANNEL_ID,
    name: 'School updates',
    description: 'Attendance, results, schedules, and school announcements',
    importance: AndroidImportance.HIGH,
    sound: notificationSound,
    vibration: true,
    lights: true,
    lightColor: '#1E5AA8',
    badge: true,
  });
}

export async function requestPushPermission(): Promise<{
  granted: boolean;
  remoteConfigured: boolean;
  tokenAvailable: boolean;
}> {
  await createTeacherNotificationChannel();
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
  if (!granted) {
    return { granted: false, remoteConfigured: isFirebaseMessagingConfigured(), tokenAvailable: false };
  }

  if (!isFirebaseMessagingConfigured()) {
    return { granted: true, remoteConfigured: false, tokenAvailable: false };
  }

  const messaging = getMessaging();
  if (Platform.OS === 'ios' && !isDeviceRegisteredForRemoteMessages(messaging)) {
    await registerDeviceForRemoteMessages(messaging);
  }
  const token = await getToken(messaging);
  await storePendingPushToken(token);
  return { granted: true, remoteConfigured: true, tokenAvailable: true };
}

export async function displayTeacherNotification(
  notification: TeacherNotice,
): Promise<void> {
  await createTeacherNotificationChannel();
  const data: Record<string, string> = {
    eventId: notification.id,
    subject: notification.title,
    message: notification.message,
    type: notification.type,
    source: notification.source ?? 'push',
    route: notification.route ?? 'Notifications',
  };
  if (notification.routeParams) {
    data.routeParams = JSON.stringify(notification.routeParams);
  }

  const nativeNotification: Notification = {
    id: notification.id,
    title: notification.title,
    body: notification.message,
    data,
    android: {
      channelId: TEACHER_NOTIFICATION_CHANNEL_ID,
      smallIcon: 'ic_stat_notification',
      color: '#1E5AA8',
      pressAction: { id: 'default' },
    },
    ios: { sound: `${notificationSound}.wav` },
  };
  await notifee.displayNotification(nativeNotification);
}

function notificationFromData(data: Record<string, unknown> | undefined): TeacherNotice | null {
  if (!data) return null;
  const notification = normalizeRemoteNotification({ data });
  return data.source === 'local' ? { ...notification, source: 'local' } : notification;
}

async function saveBackgroundMessage(message: RemoteMessage): Promise<void> {
  const notification = normalizeRemoteNotification(message);
  await upsertStoredPushNotification(notification);
  if (!message.notification) {
    await displayTeacherNotification(notification);
  }
}

export function registerNotificationBackgroundHandlers(): void {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== EventType.PRESS) return;
    const notification = notificationFromData(detail.notification?.data);
    if (!notification) return;
    const readNotification = { ...notification, read: true };
    await upsertStoredPushNotification(readNotification);
    await savePendingNotificationOpen(readNotification);
  });

  if (isFirebaseMessagingConfigured()) {
    setBackgroundMessageHandler(getMessaging(), saveBackgroundMessage);
  }
}

export function subscribeToNotificationEvents(handlers: {
  onNotification: (notification: TeacherNotice) => void | Promise<void>;
  onOpen: (notification: TeacherNotice) => void | Promise<void>;
}): () => void {
  const unsubscribers: Array<() => void> = [];
  const openedIds = new Set<string>();
  const openOnce = (notification: TeacherNotice) => {
    if (openedIds.has(notification.id)) return;
    openedIds.add(notification.id);
    if (openedIds.size > 100) openedIds.delete(openedIds.values().next().value as string);
    Promise.resolve(handlers.onOpen(notification)).catch(error => {
      console.error('Unable to handle a notification interaction.', error);
    });
  };

  unsubscribers.push(
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS) return;
      const notification = notificationFromData(detail.notification?.data);
      if (notification) openOnce(notification);
    }),
  );

  if (isFirebaseMessagingConfigured()) {
    const messaging = getMessaging();
    unsubscribers.push(
      onMessage(messaging, async message => {
        const notification = normalizeRemoteNotification(message);
        try {
          await handlers.onNotification(notification);
          await displayTeacherNotification(notification);
        } catch (error) {
          console.error('Unable to handle a foreground push notification.', error);
        }
      }),
      onNotificationOpenedApp(messaging, message => {
        openOnce(normalizeRemoteNotification(message));
      }),
      onTokenRefresh(messaging, token => {
        void storePendingPushToken(token).catch(error => {
          console.error('Unable to save the refreshed FCM token.', error);
        });
      }),
    );

    void getInitialNotification(messaging)
      .then(message => {
        if (message) openOnce(normalizeRemoteNotification(message));
      })
      .catch(error => console.error('Unable to read the initial FCM notification.', error));
  }

  void notifee
    .getInitialNotification()
    .then(initial => {
      if (!initial) return;
      const notification = notificationFromData(initial.notification.data);
      if (notification) openOnce(notification);
    })
    .catch(error => console.error('Unable to read the initial local notification.', error));

  return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

export async function registerPendingDeviceToken(
  api: TeacherNotificationApi,
): Promise<boolean> {
  const token = await getPendingPushToken();
  if (!token) return false;
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error(`Push token registration is unsupported on ${Platform.OS}.`);
  }
  await api.registerNotificationDevice({
    token,
    platform: Platform.OS,
  });
  await clearPendingPushToken();
  return true;
}

export async function unregisterDeviceToken(
  api: TeacherNotificationApi,
  token: string,
): Promise<void> {
  if (!token.trim()) throw new Error('Cannot unregister an empty push token.');
  await api.unregisterNotificationDevice(token);
  if ((await getPendingPushToken()) === token) {
    await clearPendingPushToken();
  }
}
