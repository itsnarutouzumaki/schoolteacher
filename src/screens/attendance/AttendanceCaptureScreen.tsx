import React, { useMemo, useRef } from 'react';
import { Image, PanResponder, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Pill } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { C } from '../../theme';
import { styles } from './AttendanceCaptureScreen.styles';
import type { AttendanceStatus } from '../../types';

export default function AttendanceCaptureScreen() {
  const { attendanceDraft, setAttendanceDraft, navigate, showToast, goBack } = useApp();
  const { t } = useI18n();
  const draft = attendanceDraft;
  const currentRef = useRef(draft);
  currentRef.current = draft;
  const move = (delta: number) => {
    const value = currentRef.current;
    if (!value) return;
    const nextIndex = Math.min(value.students.length - 1, Math.max(0, value.currentIndex + delta));
    if (nextIndex !== value.currentIndex) setAttendanceDraft(previous => previous ? { ...previous, currentIndex: nextIndex } : previous);
  };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 24 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onPanResponderRelease: (_, gesture) => { if (gesture.dx < -48) move(1); else if (gesture.dx > 48) move(-1); },
  }), []);
  if (!draft || !draft.students.length) return <Screen title={t('attendanceSetup')}><Card><AppText>{t('noData')}</AppText><Button title={t('backToHome')} onPress={() => navigate('AttendanceSetup')} /></Card></Screen>;
  const student = draft.students[draft.currentIndex];
  const status = draft.statuses[student.id];
  const marked = Object.values(draft.statuses).filter(value => value !== 'unmarked').length;
  const setStatus = (value: Exclude<AttendanceStatus,'unmarked'>) => {
    const nextStatuses = { ...draft.statuses, [student.id]: value };
    if (draft.currentIndex === draft.students.length - 1) {
      setAttendanceDraft({ ...draft, statuses: nextStatuses });
      navigate('AttendanceReview');
      return;
    }
    setAttendanceDraft({ ...draft, statuses: nextStatuses, currentIndex: draft.currentIndex + 1 });
  };
  const percent = Math.round(((draft.currentIndex + 1) / draft.students.length) * 100);
  return <Screen title={`${draft.className} · ${draft.section}`} subtitle={t('studentNumber',{ current:draft.currentIndex+1,total:draft.students.length })}>
    <View {...panResponder.panHandlers} style={styles.captureArea}>
      <View style={styles.progressHeader}><Pill label={`${marked} / ${draft.students.length} ${t('studentCount')}`} tone="blue"/><AppText size={11} color="#71809A">{percent}%</AppText></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${percent}%`}]}/></View>
      <Card style={styles.studentCard}>
        <View style={styles.photoFrame}><Image source={{uri:student.photoUrl}} style={styles.studentPhoto}/></View>
        <View style={styles.studentInfo}>
          <View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('rollNo')}</AppText><AppText size={14} weight="bold">{String(student.rollNumber).padStart(2,'0')}</AppText></View>
          <View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('studentName')}</AppText><AppText size={16} weight="bold">{student.fullName}</AppText></View>
          <View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('fatherName')}</AppText><AppText size={13} weight="semibold">{student.fatherName}</AppText></View>
          <View style={styles.idBlock}><AppText color="#71809A" size={10}>{t('uniqueId')}</AppText><AppText size={12} weight="bold" color={C.primary}>{student.studentId}</AppText></View>
        </View>
      </Card>
      {status !== 'unmarked' ? <View style={styles.statusNotice}><Pill label={status === 'present' ? t('presentStatus') : t('absentStatus')} tone={status === 'present' ? 'green' : 'red'}/><AppText size={11} color="#687892">{t('status')}</AppText></View> : null}
      <View style={styles.buttons}><Button title={t('present')} icon="✓" variant="success" onPress={() => setStatus('present')} style={styles.markButton}/><Button title={t('absent')} icon="×" variant="danger" onPress={() => setStatus('absent')} style={styles.markButton}/></View>
      <AppText size={10} color="#9AA5B7" align="center">{t('swipeInstruction')}</AppText>
      <Button title={t('attendanceReview')} variant="outline" onPress={() => navigate('AttendanceReview')} />
    </View>
  </Screen>;
}
