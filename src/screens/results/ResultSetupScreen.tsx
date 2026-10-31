import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Field, SelectField } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { defaultAcademicYear, getClassSections, getSubjects, makeResultDraft } from '../../services/teacherService';
import type { ExamType } from '../../types';
import { styles } from './ResultSetupScreen.styles';

export default function ResultSetupScreen() {
  const { classSections, currentRoute, setResultDraft, navigate, showToast } = useApp();
  const { t, language } = useI18n();
  const params = currentRoute.params || {};
  const [className, setClassName] = useState(typeof params.className === 'string' ? params.className : '');
  const [section, setSection] = useState(typeof params.section === 'string' ? params.section : '');
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState<ExamType | ''>('');
  const [testName, setTestName] = useState('');
  useEffect(() => { if (className && section && !getClassSections(className).some(item => item.section === section)) setSection(''); }, [className, section]);
  const classes = Array.from(new Set(classSections.map(item => item.className)));
  const sections = getClassSections(className).map(item => item.section);
  const subjects = getSubjects(className);
  const examTypes: Array<{ value: ExamType; label: string }> = [
    { value:'yearly', label:t('yearlyExam') },
    { value:'halfYearly', label:t('halfYearlyExam') },
    { value:'preBoard', label:t('preBoardExam') },
    { value:'test', label:t('examTest') },
  ];
  const start = () => {
    if (!className || !section || !subject || !examType || (examType === 'test' && !testName.trim())) { showToast({ title:t('error'), message:t('selectResultCriteria'), tone:'error' }); return; }
    const selectedExam = examTypes.find(option => option.value === examType);
    if (!selectedExam) { showToast({ title:t('error'), message:t('selectResultCriteria'), tone:'error' }); return; }
    const resultName = examType === 'test' ? `${selectedExam.label} · ${testName.trim()}` : selectedExam.label;
    const draft = makeResultDraft(className, section, subject, resultName, examType);
    setResultDraft(draft);
    navigate('ResultEntry');
  };
  const today = new Date().toLocaleDateString(language==='hi'?'hi-IN':'en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return <Screen title={t('testSetup')} subtitle={t('enterResultsSubtitle')}>
    <DemoBanner />
    <Card style={styles.card}>
      <AppText size={18} weight="bold">{t('testSetup')}</AppText>
      <AppText color="#71809A" size={12}>{t('selectResultCriteria')}</AppText>
      <SelectField label={t('class')} value={className} options={classes} placeholder={t('selectClass')} onChange={value=>{setClassName(value);setSection('');setSubject('');}} required />
      <SelectField label={t('section')} value={section} options={sections} placeholder={t('selectSection')} onChange={setSection} required />
      <SelectField label={t('subject')} value={subject} options={subjects} placeholder={t('selectSubject')} onChange={setSubject} required />
      <SelectField label={t('examType')} value={examTypes.find(option=>option.value===examType)?.label||''} options={examTypes.map(option=>option.label)} placeholder={t('selectExamType')} onChange={value=>{const selected=examTypes.find(option=>option.label===value);if(selected){setExamType(selected.value);if(selected.value!=='test')setTestName('');}}} required />
      {examType==='test'?<Field label={t('testName')} value={testName} onChangeText={setTestName} placeholder={t('testNamePlaceholder')} required maxLength={80} />:null}
      <View style={styles.datePanel}><View style={styles.dateIcon}><AppText size={21} color="#FFFFFF">▦</AppText></View><View style={styles.dateCopy}><AppText size={11} color="#71809A">{t('date')}</AppText><AppText weight="bold">{today}</AppText><AppText size={10} color="#71809A">{t('academicYear')}: {defaultAcademicYear.replace('-', '–')}</AppText></View></View>
      <Button title={t('startResultEntry')} onPress={start} />
    </Card>
    <Card style={styles.info}><AppText size={12} weight="bold">{t('demoOnly')}</AppText><AppText color="#71809A" size={11}>{t('actualUploadUnavailable')}</AppText></Card>
  </Screen>;
}
