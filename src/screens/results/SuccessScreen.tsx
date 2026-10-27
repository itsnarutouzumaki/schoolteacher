import React from 'react';
import { View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Pill } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { styles } from './SuccessScreen.styles';
export default function SuccessScreen(){
 const {currentRoute,attendanceDraft,savedResults,resetTo,navigate}=useApp(); const {t}=useI18n();
 const isAttendance=currentRoute.name==='AttendanceSuccess';
 const resultId=typeof currentRoute.params?.resultId==='string'?currentRoute.params.resultId:'';
 const result=savedResults.find(item=>item.id===resultId)||savedResults[0];
 const present=attendanceDraft?Object.values(attendanceDraft.statuses).filter(v=>v==='present').length:0;
 const absent=attendanceDraft?Object.values(attendanceDraft.statuses).filter(v=>v==='absent').length:0;
 return <Screen title={isAttendance?t('attendanceReady'):t('resultPrepared')} back={false}>
  <View style={styles.content}><View style={styles.check}><AppText size={35} color="#FFFFFF" weight="bold">✓</AppText></View><AppText size={21} weight="bold" align="center">{isAttendance?t('attendanceReady'):t('resultPrepared')}</AppText><Pill label={t('demoOnly')} tone="orange"/><AppText size={12} color="#6D7B92" align="center">{isAttendance?t('demoLocalOnly'):t('localDemoSaved')}</AppText>
  <Card style={styles.details}>{isAttendance&&attendanceDraft?<><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('class')}</AppText><AppText weight="bold">{attendanceDraft.className} · {attendanceDraft.section}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('date')}</AppText><AppText weight="bold">{attendanceDraft.date}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('studentCount')}</AppText><AppText weight="bold">{attendanceDraft.students.length}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('present')}</AppText><AppText color="#15945D" weight="bold">{present}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('absent')}</AppText><AppText color="#D9414D" weight="bold">{absent}</AppText></View></>:result?<><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('class')}</AppText><AppText weight="bold">{result.className} · {result.section}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('subject')}</AppText><AppText weight="bold">{result.subject}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('testName')}</AppText><AppText weight="bold">{result.testName}</AppText></View><View style={styles.detailRow}><AppText color="#71809A" size={11}>{t('studentCount')}</AppText><AppText weight="bold">{result.totalStudents}</AppText></View></>:null}</Card>
  <Button title={t('backToHome')} onPress={()=>resetTo('Home')}/>{!isAttendance?<Button title={t('previousResults')} variant="outline" onPress={()=>navigate('PreviousResults')}/>:null}</View>
 </Screen>;
}
