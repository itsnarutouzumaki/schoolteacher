import { C } from '../../theme';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { styles } from './NotificationsScreen.styles';
import {
  createLocalTestNotification,
  notificationRoute,
  upsertNotificationRecord,
} from '../../services/notificationPayload';
import {
  displayTeacherNotification,
  requestPushPermission,
} from '../../services/notificationService';
import { upsertStoredPushNotification } from '../../services/notificationStore';

export default function NotificationsScreen() {
  const { notifications, setNotifications, resetTo, showToast } = useApp();
  const { t, language } = useI18n();
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'enabled' | 'denied'>('unknown');
  const [remoteConfigured, setRemoteConfigured] = useState(false);
  const filters = [
    { id: 'all', label: t('all') },
    { id: 'attendance', label: t('attendance') },
    { id: 'results', label: t('results') },
    { id: 'general', label: t('general') },
  ];
  const filtered = useMemo(
    () => notifications.filter(item =>
      filter === 'all' ||
      (filter === 'general' && ['general', 'schedule'].includes(item.type)) ||
      item.type === filter,
    ),
    [notifications, filter],
  );
  const icon = (type: string) =>
    type === 'attendance' ? '✓' : type === 'results' ? '▤' : type === 'schedule' ? '◷' : 'i';
  const displayTitle = (item: typeof notifications[number]) =>
    item.titleKey ? t(item.titleKey as any, item.messageVars) : language === 'hi' ? item.titleHi || item.title : item.title;
  const displayMessage = (item: typeof notifications[number]) =>
    item.messageKey ? t(item.messageKey as any, item.messageVars) : language === 'hi' ? item.messageHi || item.message : item.message;
  const displayDate = (item: typeof notifications[number]) =>
    item.dateKey ? t(item.dateKey as any) : language === 'hi' ? item.dateLabelHi || item.dateLabel : item.dateLabel;

  const enableNotifications = async () => {
    setBusy(true);
    try {
      const result = await requestPushPermission();
      setPermissionStatus(result.granted ? 'enabled' : 'denied');
      setRemoteConfigured(result.remoteConfigured);
      showToast({
        title: result.granted
          ? result.tokenAvailable ? t('pushTokenReady') : t('pushFirebaseMissing')
          : t('pushPermissionDenied'),
        tone: result.granted ? 'success' : 'warning',
      });
    } catch (error) {
      console.error('Unable to request push notification permission.', error);
      showToast({
        title: t('pushSetupError'),
        message: error instanceof Error ? error.message : String(error),
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const sendTestNotification = async () => {
    setBusy(true);
    try {
      const permission = await requestPushPermission();
      setPermissionStatus(permission.granted ? 'enabled' : 'denied');
      setRemoteConfigured(permission.remoteConfigured);
      if (!permission.granted) {
        showToast({ title: t('pushPermissionDenied'), tone: 'warning' });
        return;
      }
      const notification = createLocalTestNotification();
      await upsertStoredPushNotification(notification);
      setNotifications(previous => upsertNotificationRecord(previous, notification));
      await displayTeacherNotification(notification);
      showToast({ title: t('pushTestSent'), tone: 'success' });
    } catch (error) {
      console.error('Unable to send a local notification test.', error);
      showToast({
        title: t('pushSetupError'),
        message: error instanceof Error ? error.message : String(error),
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const markAllRead = () =>
    setNotifications(previous => previous.map(item => ({ ...item, read: true })));

  const statusText = permissionStatus === 'denied'
    ? t('pushPermissionDenied')
    : permissionStatus === 'enabled' && remoteConfigured
      ? t('pushTokenReady')
      : permissionStatus === 'enabled'
        ? t('pushFirebaseMissing')
        : t('pushSetupCopy');

  return (
    <Screen
      title={t('notificationsTitle')}
      right={
        <Pressable onPress={markAllRead}>
          <AppText color="#FFFFFF" size={10} weight="bold">{t('markAllRead')}</AppText>
        </Pressable>
      }
    >
      <Card padding={12}>
        <AppText size={12} weight="semibold">{statusText}</AppText>
        <AppText size={10} color="#6E7D94">{t('pushBackgroundNote')}</AppText>
        <View style={styles.actions}>
          <Button
            title={t('enableNotifications')}
            onPress={enableNotifications}
            variant="outline"
            disabled={busy}
            compact
            style={styles.actionButton}
          />
          <Button
            title={t('testNotification')}
            onPress={sendTestNotification}
            variant="secondary"
            disabled={busy}
            compact
            style={styles.actionButton}
          />
        </View>
      </Card>
      <View style={styles.filters}>
        {filters.map(item => (
          <Pressable
            key={item.id}
            onPress={() => setFilter(item.id)}
            style={[styles.filter, filter === item.id && styles.filterSelected]}
          >
            <AppText size={11} color={filter === item.id ? '#FFFFFF' : '#6E7D94'} weight="semibold">
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {filtered.length
        ? filtered.map(item => (
            <Pressable
              key={item.id}
              onPress={() => {
                setNotifications(previous =>
                  previous.map(notification =>
                    notification.id === item.id ? { ...notification, read: true } : notification,
                  ),
                );
                const route = notificationRoute(item);
                if (item.route) resetTo(route.name, route.params);
              }}
            >
              <Card style={[styles.item, !item.read && styles.unread]} padding={12}>
                <View
                  style={[
                    styles.iconBox,
                    item.type === 'attendance'
                      ? styles.green
                      : item.type === 'results'
                        ? styles.purple
                        : item.type === 'schedule'
                          ? styles.orange
                          : styles.blue,
                  ]}
                >
                  <AppText
                    size={17}
                    color={
                      item.type === 'attendance'
                        ? '#168754'
                        : item.type === 'results'
                          ? '#7051D4'
                          : item.type === 'schedule'
                            ? '#C87520'
                            : C.primary
                    }
                    weight="bold"
                  >
                    {icon(item.type)}
                  </AppText>
                </View>
                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <AppText size={12} weight="bold" style={styles.title}>{displayTitle(item)}</AppText>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <AppText size={11} color="#6E7D94">{displayMessage(item)}</AppText>
                  <AppText size={10} color="#95A0B1">{displayDate(item)}</AppText>
                </View>
              </Card>
            </Pressable>
          ))
        : <Card style={styles.empty}><AppText>{t('noNotifications')}</AppText></Card>}
      <AppText size={10} color="#8491A5" align="center">{t('actualUploadUnavailable')}</AppText>
    </Screen>
  );
}
