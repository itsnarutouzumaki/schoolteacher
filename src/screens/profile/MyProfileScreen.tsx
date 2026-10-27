import React from 'react';
import {Image,Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Button,Card,Pill} from '../../components/UI';
import {Screen,DemoBanner} from '../../components/Screen';
import {styles} from './MyProfileScreen.styles';
export default function MyProfileScreen(){
 const {teacher,navigate,setLogoutDialogOpen}=useApp();const {t,language,setLanguage}=useI18n();
 const items=[{name:'EditProfile' as const,label:t('editProfile'),icon:'◩',color:'#075DCE',bg:'#EAF3FF'},{name:'ChangePassword' as const,label:t('changePassword'),icon:'▣',color:'#C47A15',bg:'#FFF4E4'},{name:'HelpSupport' as const,label:t('helpSupport'),icon:'?',color:'#168D62',bg:'#E9FAF1'},{name:'Terms' as const,label:t('terms'),icon:'§',color:'#075DCE',bg:'#EAF3FF'},{name:'Privacy' as const,label:t('privacy'),icon:'◈',color:'#7456D8',bg:'#F1ECFF'}];
 return <Screen title={t('myProfile')}>
  <DemoBanner/>
  <Card style={styles.profileCard}><Image source={{uri:teacher.photoUrl}} style={styles.avatar}/><AppText size={18} weight="bold" align="center">{teacher.name}</AppText><AppText size={12} color="#71809A" align="center">{language==='hi'?(teacher.designationHi||teacher.designation):teacher.designation}</AppText><AppText size={11} color="#71809A" align="center">{teacher.email}</AppText><Pill label={`${teacher.experienceYears}+ ${t('yearsExperience')}`} tone="blue"/></Card>
  <Card padding={7}>{items.map(item=><Pressable key={item.name} onPress={()=>navigate(item.name)} style={styles.menuRow}><View style={[styles.menuIcon,{backgroundColor:item.bg}]}><AppText color={item.color} size={17} weight="bold">{item.icon}</AppText></View><AppText size={13} weight="semibold" style={styles.menuLabel}>{item.label}</AppText><AppText color="#8C9AB0" size={21}>›</AppText></Pressable>)}<Pressable onPress={()=>setLogoutDialogOpen(true)} style={styles.menuRow}><View style={[styles.menuIcon,{backgroundColor:'#FFF0F0'}]}><AppText color="#D9414D" size={17} weight="bold">↪</AppText></View><AppText size={13} color="#D9414D" weight="semibold" style={styles.menuLabel}>{t('logout')}</AppText><AppText color="#8C9AB0" size={21}>›</AppText></Pressable></Card>
  <Card style={styles.languageCard}><AppText size={14} weight="bold">{t('language')}</AppText><View style={styles.languageRow}><Button title={t('english')} compact variant={language==='en'?'primary':'outline'} onPress={()=>setLanguage('en')} style={styles.langButton}/><Button title={t('hindi')} compact variant={language==='hi'?'primary':'outline'} onPress={()=>setLanguage('hi')} style={styles.langButton}/></View></Card>
  <AppText size={10} color="#8794A7" align="center">{t('actualUploadUnavailable')}</AppText>
 </Screen>;
}
