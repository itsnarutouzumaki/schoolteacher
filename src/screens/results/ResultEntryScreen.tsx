import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Field, Pill } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { validateMarks } from '../../validation/forms';
import { styles } from './ResultEntryScreen.styles';
import { cleanupLocalFiles } from '../../services/pdfService';
import type { ResultEntry as ResultEntryType } from '../../types';

export default function ResultEntryScreen() {
  const { resultDraft, setResultDraft, scanPages, pendingPdfUri, setScanPages, setPendingPdfUri, navigate, showToast } = useApp();
  const { t } = useI18n();
  const draft = resultDraft;
  const student = draft?.students[draft.currentIndex];
  const entry = student && draft ? draft.entries[student.id] : null;
  const [obtained, setObtained] = useState(entry?.obtainedMarks || '');
  const [total, setTotal] = useState(entry?.totalMarks || '');
  const [remarks, setRemarks] = useState(entry?.remarks || '');
  useEffect(() => { setObtained(entry?.obtainedMarks || ''); setTotal(entry?.totalMarks || ''); setRemarks(entry?.remarks || ''); }, [student?.id, entry?.obtainedMarks, entry?.totalMarks, entry?.remarks]);
  if (!draft || !student || !entry) return <Screen title={t('resultEntry')}><Card><AppText>{t('noData')}</AppText><Button title={t('backToHome')} onPress={()=>navigate('Home')}/></Card></Screen>;
  const updateEntry = (updates: Partial<ResultEntryType>) => setResultDraft(previous => previous ? { ...previous, entries: { ...previous.entries, [student.id]: { ...previous.entries[student.id], ...updates } } } : previous);
  const saveCurrent = (next: boolean) => {
    const updated = { ...entry, obtainedMarks: obtained, totalMarks: total, remarks: remarks.trim() };
    const validation = validateMarks(updated);
    if (!validation.valid) { showToast({ title:t('error'), message:t(validation.reason as any), tone:'error' }); return; }
    const entries = { ...draft.entries, [student.id]: updated };
    if (next && draft.currentIndex < draft.students.length - 1) {
      setResultDraft({ ...draft, entries, currentIndex: draft.currentIndex + 1 });
      showToast({ title:t('testSaved'), tone:'info' });
    } else {
      setResultDraft({ ...draft, entries });
      navigate('ResultReview');
    }
  };
  const openScanner = () => { void cleanupLocalFiles([...scanPages.map(page=>page.uri),...(pendingPdfUri?[pendingPdfUri]:[])]); setScanPages([]); setPendingPdfUri(null); setResultDraft(previous => previous ? { ...previous, entries: { ...previous.entries, [student.id]: { ...previous.entries[student.id], obtainedMarks: obtained, totalMarks: total, remarks } } } : previous); navigate('Scanner',{studentId:student.id}); };
  return <Screen title={`${draft.className} · ${draft.section}`} subtitle={`${draft.subject} · ${draft.testName}`}>
    <DemoBanner compact />
    <View style={styles.studentHeader}><Image source={{uri:student.photoUrl}} style={styles.photo}/><View style={styles.studentInfo}><AppText size={14} weight="bold">{student.fullName}</AppText><AppText size={11} color="#6F7E95">{t('rollNo')}: {String(student.rollNumber).padStart(2,'0')}</AppText><AppText size={11} color="#6F7E95">{t('fatherName')}: {student.fatherName}</AppText><AppText size={10} color="#6F7E95">{t('uniqueId')}: {student.studentId}</AppText></View><Pill label={`${draft.currentIndex+1}/${draft.students.length}`} tone="blue"/></View>
    <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${((draft.currentIndex+1)/draft.students.length)*100}%`}]}/></View>
    <Card style={styles.card}>
      <View style={styles.scanHeader}><AppText size={14} weight="bold">{t('answerCopyOptional')}</AppText><Pill label={t('optional')} tone="gray"/></View>
      {entry.answerCopyUri ? <View style={styles.attachedBox}><View style={styles.fileBadge}><AppText color="#FFFFFF" size={15}>▤</AppText></View><View style={styles.fileCopy}><AppText weight="semibold" size={12}>Answer_Copy_{String(student.rollNumber).padStart(2,'0')}.pdf</AppText><AppText size={10} color="#6F7E95">{entry.answerCopyPageCount} {t('attachedPages')} · local demo file</AppText></View><Button title={t('replaceScan')} variant="outline" compact onPress={openScanner}/></View> : <Button title={t('takeScan')} icon="▣" variant="secondary" onPress={openScanner} />}
      <View style={styles.marksRow}><View style={styles.markField}><Field label={t('totalMarks')} value={total} onChangeText={value=>{setTotal(value);updateEntry({totalMarks:value});}} keyboardType="number-pad" required placeholder="20"/></View><View style={styles.markField}><Field label={t('obtainedMarks')} value={obtained} onChangeText={value=>{setObtained(value);updateEntry({obtainedMarks:value});}} keyboardType="number-pad" required placeholder="18"/></View></View>
      <Field label={t('remarks')} value={remarks} onChangeText={value=>{setRemarks(value);updateEntry({remarks:value});}} placeholder={t('remarksPlaceholder')} multiline maxLength={200}/>
      <AppText size={10} color="#7D8BA0">{t('remarksMax')}</AppText>
    </Card>
    <View style={styles.actionRow}>{draft.currentIndex>0?<Button title={t('previousStudent')} variant="outline" onPress={()=>{setResultDraft({...draft,currentIndex:draft.currentIndex-1});}} style={styles.actionButton}/>:null}<Button title={draft.currentIndex===draft.students.length-1?t('reviewResults'):t('saveNextStudent')} onPress={()=>saveCurrent(true)} style={styles.actionButton}/></View>
    <AppText size={10} color="#8794A7" align="center">{t('localDemoSaved')}</AppText>
  </Screen>;
}
