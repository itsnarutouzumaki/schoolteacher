import React from 'react';
import { View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Pill } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { draftToSavedResult, validateResultEntry } from '../../services/teacherService';
import { styles } from './ResultReviewScreen.styles';
export default function ResultReviewScreen(){
  const {resultDraft,setResultDraft,setSavedResults,setNotifications,navigate,resetTo,popTo,showToast}=useApp(); const {t}=useI18n(); const draft=resultDraft;
  if(!draft)return <Screen title={t('resultReview')}><Card><AppText>{t('noData')}</AppText><Button title={t('backToHome')} onPress={()=>navigate('Home')}/></Card></Screen>;
  const scored=draft.students.filter(s=>draft.entries[s.id].totalMarks.trim()!==''&&draft.entries[s.id].obtainedMarks.trim()!=='').length;
  const maxMarkValues=draft.students.map(s=>Number(draft.entries[s.id].totalMarks)||0).filter(value=>value>0);
  const marksTotal=maxMarkValues.length?Math.max(...maxMarkValues):0;
  const submit=()=>{
    const missing=draft.students.findIndex(s=>!validateResultEntry(draft.entries[s.id]).valid);
    if(missing>=0){setResultDraft({...draft,currentIndex:missing});showToast({title:t('error'),message:t('resultValidation'),tone:'error'});popTo('ResultEntry');return;}
    const saved=draftToSavedResult(draft);
    setSavedResults(previous=>[saved,...previous]);
    setNotifications(previous=>[{id:`n-demo-${Date.now()}`,type:'results',title:t('resultNoticeTitle'),message:t('resultNoticeMessage',{testName:draft.testName,className:draft.className,section:draft.section}),dateLabel:t('justNow'),titleKey:'resultNoticeTitle',messageKey:'resultNoticeMessage',messageVars:{testName:draft.testName,className:draft.className,section:draft.section},dateKey:'justNow',read:false},...previous]);
    resetTo('ResultSuccess',{resultId:saved.id});
  };
  return <Screen title={t('resultReview')} subtitle={`${draft.testName} · ${draft.className} ${draft.section}`}>
    <DemoBanner/>
    <View style={styles.metricRow}><Card style={styles.metric}><AppText size={10} color="#71809A">{t('studentCount')}</AppText><AppText size={22} weight="bold">{draft.students.length}</AppText></Card><Card style={styles.metric}><AppText size={10} color="#71809A">{t('results')}</AppText><AppText size={22} weight="bold">{scored}</AppText></Card><Card style={styles.metric}><AppText size={10} color="#71809A">{t('maxMarks')}</AppText><AppText size={22} weight="bold">{marksTotal}</AppText></Card></View>
    {draft.students.map(student=>{const entry=draft.entries[student.id];const complete=entry.totalMarks!==''&&entry.obtainedMarks!==''&&validateResultEntry(entry).valid;return <Card key={student.id} style={styles.row} padding={11}><View style={styles.roll}><AppText size={12} weight="bold">{String(student.rollNumber).padStart(2,'0')}</AppText></View><View style={styles.copy}><AppText size={12} weight="semibold">{student.fullName}</AppText><AppText size={10} color="#71809A">{entry.obtainedMarks||'—'} / {entry.totalMarks||'—'} · {entry.answerCopyPageCount} {t('attachedPages')}</AppText></View><Pill label={complete?t('copied'):t('required')} tone={complete?'green':'orange'}/></Card>})}
    <Button title={t('submitResults')} onPress={submit}/>
    <AppText size={10} color="#8794A7" align="center">{t('localDemoSaved')}</AppText>
  </Screen>;
}
