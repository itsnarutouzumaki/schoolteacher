import { C } from '../../theme';
import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card,Pill,SelectField} from '../../components/UI';
import {Screen,DemoBanner} from '../../components/Screen';
import {formatDate} from '../../services/teacherService';
import {styles} from './PreviousResultsScreen.styles';
export default function PreviousResultsScreen(){
 const {savedResults,navigate}=useApp(); const {t,language}=useI18n(); const [classFilter,setClassFilter]=useState('__all__'); const [subjectFilter,setSubjectFilter]=useState('__all__');
 const classes=['__all__',...Array.from(new Set(savedResults.map(item=>item.className)))]; const subjects=['__all__',...Array.from(new Set(savedResults.map(item=>item.subject)))];
 const filtered=useMemo(()=>savedResults.filter(item=>(classFilter==='__all__'||item.className===classFilter)&&(subjectFilter==='__all__'||item.subject===subjectFilter)).sort((a,b)=>b.date.localeCompare(a.date)),[savedResults,classFilter,subjectFilter]);
 return <Screen title={t('previousResultsTitle')} subtitle={`${savedResults.length} ${t('resultCount')}`}><DemoBanner/>
  <Card style={styles.filters}><SelectField label={t('filterClass')} value={classFilter==='__all__'?t('allResults'):classFilter} options={[t('allResults'),...classes.slice(1)]} onChange={value=>setClassFilter(value===t('allResults')?'__all__':value)}/><SelectField label={t('filterSubject')} value={subjectFilter==='__all__'?t('allResults'):subjectFilter} options={[t('allResults'),...subjects.slice(1)]} onChange={value=>setSubjectFilter(value===t('allResults')?'__all__':value)}/></Card>
  {filtered.length?filtered.map(item=><Pressable key={item.id} onPress={()=>navigate('ResultDashboard',{resultId:item.id})}><Card style={styles.resultCard}><View style={styles.resultIcon}><AppText color={C.purple} size={23}>▤</AppText></View><View style={styles.resultText}><AppText size={13} weight="bold">{item.testName}</AppText><AppText size={11} color="#708099">{item.className} · {item.section} · {item.subject}</AppText><AppText size={10} color="#8A96A9">{formatDate(item.date,language)} · {item.totalStudents} {t('studentCount').toLowerCase()}</AppText></View><View style={styles.rightMeta}><Pill label={item.isDemoSeed?t('seededResult'):t('demoResult')} tone="orange"/><AppText color={C.primary} size={22}>›</AppText></View></Card></Pressable>):<Card style={styles.empty}><AppText weight="semibold">{t('noResultSets')}</AppText></Card>}
 </Screen>;
}
