import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card} from '../../components/UI';
import {Screen} from '../../components/Screen';
import {styles} from './NotificationsScreen.styles';
export default function NotificationsScreen(){
 const {notifications,setNotifications}=useApp();const {t,language}=useI18n();const [filter,setFilter]=useState('all');
 const filters=[{id:'all',label:t('all')},{id:'attendance',label:t('attendance')},{id:'results',label:t('results')},{id:'general',label:t('general')}];
 const filtered=useMemo(()=>notifications.filter(item=>filter==='all'||(filter==='general'&&['general','schedule'].includes(item.type))||item.type===filter),[notifications,filter]);
 const icon=(type:string)=>type==='attendance'?'✓':type==='results'?'▤':type==='schedule'?'◷':'i';
 const displayTitle=(item:typeof notifications[number])=>item.titleKey?t(item.titleKey as any,item.messageVars):(language==='hi'?(item.titleHi||item.title):item.title);
 const displayMessage=(item:typeof notifications[number])=>item.messageKey?t(item.messageKey as any,item.messageVars):(language==='hi'?(item.messageHi||item.message):item.message);
 const displayDate=(item:typeof notifications[number])=>item.dateKey?t(item.dateKey as any):(language==='hi'?(item.dateLabelHi||item.dateLabel):item.dateLabel);
 return <Screen title={t('notificationsTitle')} right={<Pressable onPress={()=>setNotifications(previous=>previous.map(item=>({...item,read:true})))}><AppText color="#FFFFFF" size={10} weight="bold">{t('markAllRead')}</AppText></Pressable>}>
  <View style={styles.filters}>{filters.map(item=><Pressable key={item.id} onPress={()=>setFilter(item.id)} style={[styles.filter,filter===item.id&&styles.filterSelected]}><AppText size={11} color={filter===item.id?'#FFFFFF':'#6E7D94'} weight="semibold">{item.label}</AppText></Pressable>)}</View>
  {filtered.length?filtered.map(item=><Pressable key={item.id} onPress={()=>setNotifications(previous=>previous.map(n=>n.id===item.id?{...n,read:true}:n))}><Card style={[styles.item,!item.read&&styles.unread]} padding={12}><View style={[styles.iconBox,item.type==='attendance'?styles.green:item.type==='results'?styles.purple:item.type==='schedule'?styles.orange:styles.blue]}><AppText size={17} color={item.type==='attendance'?'#168754':item.type==='results'?'#7051D4':item.type==='schedule'?'#C87520':'#075DCE'} weight="bold">{icon(item.type)}</AppText></View><View style={styles.copy}><View style={styles.titleRow}><AppText size={12} weight="bold" style={styles.title}>{displayTitle(item)}</AppText>{!item.read?<View style={styles.unreadDot}/>:null}</View><AppText size={11} color="#6E7D94">{displayMessage(item)}</AppText><AppText size={10} color="#95A0B1">{displayDate(item)}</AppText></View></Card></Pressable>):<Card style={styles.empty}><AppText>{t('noNotifications')}</AppText></Card>}
  <AppText size={10} color="#8491A5" align="center">{t('actualUploadUnavailable')}</AppText>
 </Screen>;
}
