import { C } from '../../theme';
import React from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText,Button,Card,Pill } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { sharePdf } from '../../services/pdfService';
import { formatDate } from '../../services/teacherService';
import { styles } from './StudentResultDetailScreen.styles';
export default function StudentResultDetailScreen(){
 const {savedResults,currentRoute,showToast}=useApp();const {t,language}=useI18n();const resultId=typeof currentRoute.params?.resultId==='string'?currentRoute.params.resultId:'';const studentId=typeof currentRoute.params?.studentId==='string'?currentRoute.params.studentId:'';const result=savedResults.find(item=>item.id===resultId);const entry=result?.entries.find(item=>item.studentId===studentId);
 if(!result||!entry)return <Screen title={t('studentDetail')}><Card><AppText>{t('noData')}</AppText></Card></Screen>;
 const openCopy=async()=>{if(!entry.answerCopyUri){showToast({title:t('noBackend'),message:t('noPdfBackend'),tone:'info'});return;}try{await sharePdf(entry.answerCopyUri,t('answerCopy'));}catch(error){showToast({title:t('error'),message:error instanceof Error?error.message:undefined,tone:'error'});}};
 const pct=entry.totalMarks?Math.round(entry.obtainedMarks/entry.totalMarks*100):0;
 return <Screen title={t('studentDetail')} subtitle={`${result.testName} · ${result.subject}`}><Card style={styles.profile}><View style={styles.avatar}><AppText size={25} color={C.primary}>{entry.studentName.split(' ').map(v=>v[0]).join('').slice(0,2)}</AppText></View><AppText size={17} weight="bold" align="center">{entry.studentName}</AppText><AppText color="#71809A" size={11} align="center">{entry.fatherName}</AppText><AppText color={C.primary} weight="semibold" size={11}>{t('uniqueId')}: {entry.uniqueId}</AppText></Card>
  <View style={styles.scoreGrid}><Card style={styles.scoreCard}><AppText size={11} color="#71809A">{t('score')}</AppText><AppText size={27} weight="bold">{entry.obtainedMarks}/{entry.totalMarks}</AppText></Card><Card style={styles.scoreCard}><AppText size={11} color="#71809A">{t('percentage')}</AppText><AppText size={27} weight="bold" color={pct>=40?'#15945D':'#D9414D'}>{pct}%</AppText></Card></View>
  <Card style={styles.detailCard}><View style={styles.row}><AppText size={11} color="#71809A">{t('class')}</AppText><AppText weight="semibold">{result.className} · {result.section}</AppText></View><View style={styles.row}><AppText size={11} color="#71809A">{t('subject')}</AppText><AppText weight="semibold">{result.subject}</AppText></View><View style={styles.row}><AppText size={11} color="#71809A">{t('testName')}</AppText><AppText weight="semibold">{result.testName}</AppText></View><View style={styles.row}><AppText size={11} color="#71809A">{t('date')}</AppText><AppText weight="semibold">{formatDate(result.date,language)}</AppText></View></Card>
  <Card style={styles.remarks}><AppText size={14} weight="bold">{t('remarks')}</AppText><AppText color="#65758C">{entry.remarks||'—'}</AppText></Card>
  <Button title={t('viewAnswerCopy')} variant="secondary" onPress={openCopy}/><AppText size={10} color="#8794A7" align="center">{t('actualUploadUnavailable')}</AppText>
 </Screen>;
}
