import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { Button, Card, SelectField, AppText } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { makeAttendanceDraft, getClassSections } from '../../services/teacherService';
import { styles } from './AttendanceSetupScreen.styles';

export default function AttendanceSetupScreen() {
  const { classSections, currentRoute, setAttendanceDraft, navigate, showToast } = useApp();
  const { t, language } = useI18n();
  const params = currentRoute.params || {};
  const [className, setClassName] = useState(typeof params.className === 'string' ? params.className : '');
  const [section, setSection] = useState(typeof params.section === 'string' ? params.section : '');
  useEffect(() => { if (className && section && !getClassSections(className).some(item => item.section === section)) setSection(''); }, [className, section]);
  const classes = Array.from(new Set(classSections.map(item => item.className)));
  const sections = getClassSections(className).map(item => item.section);
  const start = () => {
    if (!className || !section) { showToast({ title:t('error'), message:t('emptyRequired'), tone:'error' }); return; }
    const draft = makeAttendanceDraft(className, section);
    if (!draft.students.length) { showToast({ title:t('error'), message:t('noData'), tone:'error' }); return; }
    setAttendanceDraft(draft);
    navigate('AttendanceCapture');
  };
  const today = new Date().toLocaleDateString(language==='hi'?'hi-IN':'en-IN', { day:'2-digit', month:'long', year:'numeric' });
  return <Screen title={t('attendanceSetup')} subtitle={t('takeAttendanceSubtitle')}>
    <DemoBanner />
    <Card style={styles.card}>
      <AppText size={18} weight="bold">{t('takeAttendance')}</AppText>
      <AppText color="#6E7D94" size={12}>{t('noAcademicYearDate')}</AppText>
      <SelectField label={t('class')} value={className} options={classes} placeholder={t('selectClass')} onChange={value => { setClassName(value); setSection(''); }} required />
      <SelectField label={t('section')} value={section} options={sections} placeholder={t('selectSection')} onChange={setSection} required />
      <View style={styles.todayPanel}><View style={styles.calendarIcon}><AppText size={22} color="#FFFFFF">▦</AppText></View><View style={styles.todayText}><AppText size={11} color="#62718A">{t('currentDate')}</AppText><AppText weight="bold">{today}</AppText><AppText size={10} color="#62718A">{t('noAcademicYearDate')}</AppText></View></View>
      <Button title={t('startAttendance')} onPress={start} />
    </Card>
    <Card style={styles.note}><AppText weight="bold" size={12}>{t('demoOnly')}</AppText><AppText color="#687892" size={11}>{t('demoLocalOnly')}</AppText></Card>
  </Screen>;
}
