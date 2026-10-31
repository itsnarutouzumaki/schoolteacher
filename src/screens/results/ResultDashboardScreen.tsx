import { C } from '../../theme';
import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card,SelectField,Pill} from '../../components/UI';
import {Screen,DemoBanner} from '../../components/Screen';
import {formatDate,resultStatistics,sortResultEntries} from '../../services/teacherService';
import {styles} from './ResultDashboardScreen.styles';
export default function ResultDashboardScreen(){
 const {savedResults,currentRoute,navigate}=useApp(); const {t,language}=useI18n(); const resultId=typeof currentRoute.params?.resultId==='string'?currentRoute.params.resultId:''; const result=savedResults.find(item=>item.id===resultId);
 const [sortMode,setSortMode]=useState<'roll'|'marks'>('roll'); const stats=useMemo(()=>result?resultStatistics(result):null,[result]);
 if(!result||!stats)return <Screen title={t('resultDashboard')}><Card><AppText>{t('noData')}</AppText></Card></Screen>;
 const sorted=sortResultEntries(result,sortMode); const largest=Math.max(1,...stats.distribution.map(item=>item.count));
 return <Screen title={t('resultDashboard')} subtitle={`${result.className} · ${result.section} · ${result.subject}`}>
  <DemoBanner/>
  <Card style={styles.testHeader}><View style={styles.icon}><AppText color="#FFFFFF" size={22}>▤</AppText></View><View style={styles.testInfo}><AppText size={15} weight="bold">{result.testName}</AppText><AppText size={11} color="#6F7E95">{formatDate(result.date,language)} · {result.academicYear}</AppText></View><Pill label={result.isDemoSeed?t('seededResult'):t('demoResult')} tone="orange"/></Card>
  <View style={styles.metricGrid}><Card style={styles.metric}><AppText size={10} color="#71809A">{t('studentCount')}</AppText><AppText size={23} weight="bold">{stats.totalStudents}</AppText></Card><Card style={styles.metric}><AppText size={10} color="#71809A">{t('maxMarks')}</AppText><AppText size={23} weight="bold">{stats.maxMarks}</AppText></Card><Card style={styles.metric}><AppText size={10} color="#71809A">{t('averageMarks')}</AppText><AppText size={23} weight="bold" color={C.primary}>{stats.average.toFixed(1)}</AppText></Card></View>
  <View style={styles.metricGrid}><Card style={[styles.metric,styles.high]}><AppText size={10} color="#71809A">{t('highestMarks')}</AppText><AppText size={21} weight="bold" color="#15895A">{stats.highest}</AppText></Card><Card style={[styles.metric,styles.low]}><AppText size={10} color="#71809A">{t('lowestMarks')}</AppText><AppText size={21} weight="bold" color="#D84854">{stats.lowest}</AppText></Card></View>
  <Card style={styles.chartCard}><AppText size={15} weight="bold">{t('marksDistribution')}</AppText>{stats.distribution.map((item,index)=><View key={item.label} style={styles.barRow}><AppText size={10} color="#71809A" style={styles.bucket}>{item.label}</AppText><View style={styles.barTrack}><View style={[styles.bar,{width:`${(item.count/largest)*100}%`,backgroundColor:['#F07D86','#F2B451','#438CE7','#20A76D'][index]}]}/></View><AppText size={11} weight="bold" style={styles.barCount}>{item.count}</AppText></View>)}</Card>
  <View style={styles.listHeader}><AppText size={15} weight="bold">{t('studentResults')}</AppText><Pill label={`${sorted.length}`} tone="blue"/></View>
  <SelectField label={t('sortBy')} value={sortMode==='roll'?t('rollAscending'):t('marksDescending')} options={[t('rollAscending'),t('marksDescending')]} onChange={value=>setSortMode(value===t('marksDescending')?'marks':'roll')}/>
  {sorted.map(entry=><Pressable key={entry.studentId} onPress={()=>navigate('StudentResultDetail',{resultId:result.id,studentId:entry.studentId})}><Card style={styles.studentRow} padding={11}><View style={styles.roll}><AppText size={12} weight="bold">{String(entry.rollNumber).padStart(2,'0')}</AppText></View><View style={styles.studentCopy}><AppText size={12} weight="semibold">{entry.studentName}</AppText><AppText size={10} color="#71809A">{entry.fatherName}</AppText></View><View style={styles.score}><AppText size={14} weight="bold">{entry.obtainedMarks}/{entry.totalMarks}</AppText><AppText size={10} color="#71809A">{entry.totalMarks?Math.round(entry.obtainedMarks/entry.totalMarks*100):0}%</AppText></View><AppText size={20} color={C.primary}>›</AppText></Card></Pressable>)}
 </Screen>;
}
