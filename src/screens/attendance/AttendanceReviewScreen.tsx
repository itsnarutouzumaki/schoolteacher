import React from 'react';
import { Pressable, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Pill } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { styles } from './AttendanceReviewScreen.styles';
export default function AttendanceReviewScreen(){
  const {attendanceDraft,setAttendanceDraft,setAttendanceSubmissions,setNotifications,navigate,resetTo,showToast}=useApp(); const {t}=useI18n(); const draft=attendanceDraft;
  if(!draft) return <Screen title={t('attendanceReview')}><Card><AppText>{t('noData')}</AppText><Button title={t('backToHome')} onPress={()=>navigate('Home')}/></Card></Screen>;
  const present=Object.values(draft.statuses).filter(v=>v==='present').length; const absent=Object.values(draft.statuses).filter(v=>v==='absent').length; const unmarked=draft.students.length-present-absent;
  const submit=()=>{ if(unmarked>0){const idx=draft.students.findIndex(s=>draft.statuses[s.id]==='unmarked');setAttendanceDraft({...draft,currentIndex:Math.max(0,idx)});showToast({title:t('error'),message:t('reviewMissingAttendance'),tone:'error'});navigate('AttendanceCapture');return;} setAttendanceSubmissions(previous=>[{id:`attendance-demo-${Date.now()}`,className:draft.className,section:draft.section,date:draft.date,statuses:{...draft.statuses},total:draft.students.length,present,absent,isDemo:true},...previous]);setNotifications(previous=>[{id:`attendance-notice-${Date.now()}`,type:'attendance',title:t('attendanceNoticeTitle'),message:t('attendanceNoticeMessage',{className:draft.className,section:draft.section,present,absent}),dateLabel:t('justNow'),titleKey:'attendanceNoticeTitle',messageKey:'attendanceNoticeMessage',messageVars:{className:draft.className,section:draft.section,present,absent},dateKey:'justNow',read:false},...previous]);resetTo('AttendanceSuccess'); };
  return <Screen title={t('attendanceReview')} subtitle={`${draft.className} · ${draft.section}`}>
    <DemoBanner/>
    <View style={styles.summaryRow}><Card style={styles.metric}><AppText color="#71809A" size={11}>{t('total')}</AppText><AppText size={23} weight="bold">{draft.students.length}</AppText></Card><Card style={styles.metric}><AppText color={undefined} size={11}>{t('present')}</AppText><AppText size={23} color="#15945D" weight="bold">{present}</AppText></Card><Card style={styles.metric}><AppText size={11}>{t('absent')}</AppText><AppText size={23} color="#D9414D" weight="bold">{absent}</AppText></Card></View>
    {unmarked>0?<Card style={styles.warning}><AppText size={12} weight="bold">{t('unmarkedStudents',{count:unmarked})}</AppText><AppText size={11} color="#855A19">{t('attendanceReviewHint')}</AppText></Card>:null}
    {draft.students.map(student=>{const status=draft.statuses[student.id];return <Pressable key={student.id} onPress={()=>{setAttendanceDraft({...draft,currentIndex:draft.students.findIndex(s=>s.id===student.id)});navigate('AttendanceCapture');}}><Card style={styles.studentRow} padding={11}><View style={styles.rollBox}><AppText size={12} weight="bold">{String(student.rollNumber).padStart(2,'0')}</AppText></View><View style={styles.studentCopy}><AppText size={12} weight="semibold">{student.fullName}</AppText><AppText size={10} color="#71809A">{student.fatherName}</AppText></View><Pill label={status==='present'?t('presentStatus'):status==='absent'?t('absentStatus'):t('unmarkedStatus')} tone={status==='present'?'green':status==='absent'?'red':'gray'}/></Card></Pressable>})}
    <Button title={t('submitAttendance')} onPress={submit}/>
    <AppText size={10} color="#8996A9" align="center">{t('demoLocalOnly')}</AppText>
  </Screen>;
}
