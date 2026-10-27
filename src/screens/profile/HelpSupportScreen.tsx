import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card,Field} from '../../components/UI';
import {Screen} from '../../components/Screen';
import {styles} from './HelpSupportScreen.styles';
const topics=[['helpAttendanceQ','helpAttendanceA'],['helpResultsQ','helpResultsA'],['helpScanQ','helpScanA'],['helpPreviousQ','helpPreviousA'],['helpProfileQ','helpProfileA'],['helpPasswordQ','helpPasswordA'],['helpNotWorkingQ','helpNotWorkingA']] as const;
export default function HelpSupportScreen(){
 const {school}=useApp();const {t}=useI18n();const [search,setSearch]=useState('');const [open,setOpen]=useState<string|null>(null);
 const filtered=useMemo(()=>topics.filter(([q,a])=>`${t(q)} ${t(a)}`.toLowerCase().includes(search.toLowerCase())),[search,t]);
 return <Screen title={t('helpSupport')}><Field label={t('helpSearch')} value={search} onChangeText={setSearch} placeholder={t('search')}/>
  {filtered.map(([q,a])=><Card key={q} padding={0}><Pressable onPress={()=>setOpen(open===q?null:q)} style={styles.question}><View style={styles.qIcon}><AppText color="#075DCE" weight="bold">?</AppText></View><AppText size={12} weight="semibold" style={styles.questionText}>{t(q)}</AppText><AppText color="#075DCE" size={20}>{open===q?'−':'+'}</AppText></Pressable>{open===q?<View style={styles.answer}><AppText size={12} color="#61718A">{t(a)}</AppText></View>:null}</Card>)}
  <Card style={styles.contact}><AppText size={14} weight="bold">{t('schoolInfo')}</AppText><AppText color="#71809A" size={12}>{school.phone}</AppText><AppText color="#71809A" size={12}>{school.email}</AppText><AppText color="#8794A7" size={10}>{t('actualUploadUnavailable')}</AppText></Card>
 </Screen>;
}
