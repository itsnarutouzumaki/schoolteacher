import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from './src/i18n/I18nContext';
import { AppProvider, useApp } from './src/app-context';
import type { Route, ScreenName } from './src/types';
import { C } from './src/theme';
import { BottomTabs, ConfirmDialog, ToastHost, AppText, Button } from './src/components/UI';
import { useI18n } from './src/i18n/I18nContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import SchoolDetailsScreen from './src/screens/home/SchoolDetailsScreen';
import AttendanceSetupScreen from './src/screens/attendance/AttendanceSetupScreen';
import AttendanceCaptureScreen from './src/screens/attendance/AttendanceCaptureScreen';
import AttendanceReviewScreen from './src/screens/attendance/AttendanceReviewScreen';
import SuccessScreen from './src/screens/results/SuccessScreen';
import ResultSetupScreen from './src/screens/results/ResultSetupScreen';
import ResultEntryScreen from './src/screens/results/ResultEntryScreen';
import ScannerScreen from './src/screens/results/ScannerScreen';
import CapturedPagesReviewScreen from './src/screens/results/CapturedPagesReviewScreen';
import PdfPreviewScreen from './src/screens/results/PdfPreviewScreen';
import ResultReviewScreen from './src/screens/results/ResultReviewScreen';
import PreviousResultsScreen from './src/screens/results/PreviousResultsScreen';
import ResultDashboardScreen from './src/screens/results/ResultDashboardScreen';
import StudentResultDetailScreen from './src/screens/results/StudentResultDetailScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';
import MyProfileScreen from './src/screens/profile/MyProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/profile/ChangePasswordScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';
import LegalScreen from './src/screens/profile/LegalScreen';
import TeachersScreen from './src/screens/school/TeachersScreen';
import TeacherDetailScreen from './src/screens/school/TeacherDetailScreen';
import { styles } from './App.styles';
import type { TeacherNotice } from './src/types';
import {
  createTeacherNotificationChannel,
  subscribeToNotificationEvents,
} from './src/services/notificationService';
import {
  consumePendingNotificationOpen,
  upsertStoredPushNotification,
} from './src/services/notificationStore';
import { notificationRoute, upsertNotificationRecord } from './src/services/notificationPayload';

function TeacherShell() {
  const { stack, currentRoute, isDemoOpen, setIsDemoOpen, resetTo, logoutDialogOpen, setLogoutDialogOpen, teacher, notifications, setNotifications } = useApp();
  const { t } = useI18n();
  const pendingNotification = useRef<TeacherNotice | null>(null);
  const handledNotificationIds = useRef(new Set<string>());
  const receiveNotification = useCallback(async (notification: TeacherNotice) => {
    await upsertStoredPushNotification(notification);
    setNotifications(previous => upsertNotificationRecord(previous, notification));
  }, [setNotifications]);
  const openNotification = useCallback(async (notification: TeacherNotice) => {
    if (handledNotificationIds.current.has(notification.id)) return;
    handledNotificationIds.current.add(notification.id);
    if (handledNotificationIds.current.size > 100) {
      const oldest = handledNotificationIds.current.values().next().value;
      if (oldest) handledNotificationIds.current.delete(oldest);
    }
    const readNotification = { ...notification, read: true };
    await upsertStoredPushNotification(readNotification);
    setNotifications(previous => upsertNotificationRecord(previous, readNotification));
    if (!isDemoOpen) {
      pendingNotification.current = readNotification;
      return;
    }
    const route = notificationRoute(readNotification);
    resetTo(route.name, route.params);
  }, [isDemoOpen, resetTo, setNotifications]);
  useEffect(() => {
    createTeacherNotificationChannel().catch(error => {
      console.error('Unable to configure the teacher notification channel.', error);
    });
    const unsubscribe = subscribeToNotificationEvents({
      onNotification: receiveNotification,
      onOpen: openNotification,
    });
    let active = true;
    consumePendingNotificationOpen()
      .then(notification => {
        if (active && notification) void openNotification(notification);
      })
      .catch(error => console.error('Unable to restore the pending notification action.', error));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [openNotification, receiveNotification]);
  useEffect(() => {
    if (!isDemoOpen || !pendingNotification.current) return;
    const route = notificationRoute(pendingNotification.current);
    pendingNotification.current = null;
    resetTo(route.name, route.params);
  }, [isDemoOpen, resetTo]);
  const renderScreen = () => {
    switch (currentRoute.name) {
      case 'Login': return <LoginScreen />;
      case 'ForgotPassword': return <ForgotPasswordScreen />;
      case 'Home': return <HomeScreen />;
      case 'SchoolDetails': return <SchoolDetailsScreen />;
      case 'AttendanceSetup': return <AttendanceSetupScreen />;
      case 'AttendanceCapture': return <AttendanceCaptureScreen />;
      case 'AttendanceReview': return <AttendanceReviewScreen />;
      case 'AttendanceSuccess': case 'ResultSuccess': return <SuccessScreen />;
      case 'ResultSetup': return <ResultSetupScreen />;
      case 'ResultEntry': return <ResultEntryScreen />;
      case 'Scanner': return <ScannerScreen />;
      case 'CapturedPagesReview': return <CapturedPagesReviewScreen />;
      case 'PdfPreview': return <PdfPreviewScreen />;
      case 'ResultReview': return <ResultReviewScreen />;
      case 'PreviousResults': return <PreviousResultsScreen />;
      case 'ResultDashboard': return <ResultDashboardScreen />;
      case 'StudentResultDetail': return <StudentResultDetailScreen />;
      case 'Notifications': return <NotificationsScreen />;
      case 'MyProfile': return <MyProfileScreen />;
      case 'EditProfile': return <EditProfileScreen />;
      case 'ChangePassword': return <ChangePasswordScreen />;
      case 'HelpSupport': return <HelpSupportScreen />;
      case 'Terms': return <LegalScreen kind="terms" />;
      case 'Privacy': return <LegalScreen kind="privacy" />;
      case 'Teachers': return <TeachersScreen />;
      case 'TeacherDetail': return <TeacherDetailScreen />;
      default: return <HomeScreen />;
    }
  };
  const hideTabs = ['Login','ForgotPassword','Scanner','CapturedPagesReview','PdfPreview'].includes(currentRoute.name);
  const showTabs = isDemoOpen && !hideTabs;
  const activeTab: 'Home'|'Notifications'|'Profile' = currentRoute.name === 'Notifications' ? 'Notifications' : ['MyProfile','EditProfile','ChangePassword','HelpSupport','Terms','Privacy'].includes(currentRoute.name) ? 'Profile' : 'Home';
  const onTabPress = (tab:'Home'|'Notifications'|'Profile') => { if(tab==='Home')resetTo('Home'); if(tab==='Notifications')resetTo('Notifications'); if(tab==='Profile')resetTo('MyProfile'); };
  return <View style={styles.shell}>
    <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} translucent={false}/>
    <View style={styles.screen}>{renderScreen()}</View>
    {showTabs?<BottomTabs active={activeTab} onPress={onTabPress} profileName={teacher.name} profilePhotoUrl={teacher.photoUrl} hasUnreadNotifications={notifications.some(notification=>!notification.read)}/>:null}
    <ToastHost/>
    <ConfirmDialog visible={logoutDialogOpen} title={t('logout')} message={`${t('logoutConfirm')} ${t('logoutInfo')}`} cancelTitle={t('cancel')} confirmTitle={t('confirmLogout')} danger onCancel={()=>setLogoutDialogOpen(false)} onConfirm={()=>{setLogoutDialogOpen(false);setIsDemoOpen(false);resetTo('Login');}}/>
  </View>;
}
export default function App() {
  const [stack, setStack] = useState<Route[]>([{ name:'Login' }]);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const currentRoute = stack[stack.length-1] || { name:'Login' as ScreenName };
  const navigate = useCallback((name:ScreenName,params?:Record<string,unknown>)=>setStack(previous=>[...previous,{name,params}]),[]);
  const replace = useCallback((name:ScreenName,params?:Record<string,unknown>)=>setStack(previous=>[...previous.slice(0,-1),{name,params}]),[]);
  const resetTo = useCallback((name:ScreenName,params?:Record<string,unknown>)=>setStack([{name,params}]),[]);
  const goBack = useCallback(()=>setStack(previous=>previous.length>1?previous.slice(0,-1):previous[0]?.name==='Home'?previous:[{name:'Home'}]),[]);
  const popTo = useCallback((name:ScreenName)=>setStack(previous=>{const index=previous.map(route=>route.name).lastIndexOf(name);return index>=0?previous.slice(0,index+1):[{name}];}),[]);
  useEffect(()=>{
    const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{
      if(stack.length>1){setStack(previous=>previous.slice(0,-1));return true;}
      if(stack[0]?.name==='Home') return false;
      if(isDemoOpen){setStack([{name:'Home'}]);return true;}
      return true;
    });
    return ()=>subscription.remove();
  },[stack,isDemoOpen]);
  const navigation=useMemo(()=>({stack,currentRoute,navigate,replace,goBack,resetTo,popTo,isDemoOpen,setIsDemoOpen}),[stack,currentRoute,navigate,replace,goBack,resetTo,popTo,isDemoOpen]);
  return <SafeAreaProvider><I18nProvider><AppProvider navigation={navigation}><TeacherShell/></AppProvider></I18nProvider></SafeAreaProvider>;
}
