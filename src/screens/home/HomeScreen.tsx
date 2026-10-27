import React from 'react';
import { ImageBackground, Image, Pressable, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, Pill } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const { school, teacher, timetable, navigate, notifications } = useApp();
  const { t, language } = useI18n();
  const actions = [
    { title:t('takeAttendance'), subtitle:t('takeAttendanceSubtitle'), icon:'✓', tone:'green' as const, target:'AttendanceSetup' as const },
    { title:t('enterResults'), subtitle:t('enterResultsSubtitle'), icon:'▤', tone:'purple' as const, target:'ResultSetup' as const },
    { title:t('previousResults'), subtitle:t('previousResultsSubtitle'), icon:'▥', tone:'orange' as const, target:'PreviousResults' as const },
  ];
  const date = new Date().toLocaleDateString(language==='hi'?'hi-IN':'en-IN', { day:'2-digit', month:'short', year:'numeric' });
  return <Screen title={school.name} back={false} right={<Pressable accessibilityRole="button" accessibilityLabel={t('notifications')} onPress={() => navigate('Notifications')} style={styles.bell}><AppText size={19} color="#FFFFFF">♧</AppText>{notifications.some(n=>!n.read)?<View style={styles.dot}/>:null}</Pressable>}>
    <DemoBanner />
    <Card padding={0} style={styles.schoolCard}>
      <ImageBackground source={{ uri:school.heroPhotoUrl }} style={styles.heroPhoto} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay}><AppText size={20} color="#FFFFFF" weight="bold">{school.name}</AppText><AppText size={12} color="#E5F1FF">{language==='hi'?(school.taglineHi||school.tagline):school.tagline}</AppText></View>
      </ImageBackground>
      <View style={styles.schoolInfo}><View style={styles.schoolMark}><AppText color={school.theme.primary} size={25}>✦</AppText></View><View style={styles.schoolCopy}><AppText size={13} weight="bold">{school.name}</AppText><AppText size={11} color="#75839B">{language==='hi'?(school.shortLocationHi||school.shortLocation):school.shortLocation}</AppText></View></View>
      <View style={styles.schoolButton}><Button title={t('schoolDetails')} variant="secondary" onPress={() => navigate('SchoolDetails')} /></View>
    </Card>
    <Card style={styles.teacherWelcome}>
      <Image source={{ uri:teacher.photoUrl }} style={styles.teacherPhoto}/>
      <View style={styles.teacherCopy}><AppText size={11} color="#71809A">{t('welcome')},</AppText><AppText size={16} weight="bold">{teacher.name}</AppText><AppText size={11} color="#71809A">{language==='hi'?(teacher.designationHi||teacher.designation):teacher.designation}</AppText><View style={styles.tagRow}><Pill label={teacher.highestDegree} tone="blue"/><Pill label={`${teacher.experienceYears}+ ${t('years')}`} tone="green"/></View></View>
    </Card>
    <AppText size={16} weight="bold">{t('quickActions')}</AppText>
    <View style={styles.actionGrid}>{actions.map(action => <Pressable key={action.target} onPress={() => navigate(action.target)} style={[styles.actionCard, action.tone==='green'?styles.actionGreen:action.tone==='purple'?styles.actionPurple:styles.actionOrange]}><View style={styles.actionIcon}><AppText size={21} color={action.tone==='green'?'#128C59':action.tone==='purple'?'#7051D4':'#CC721C'}>{action.icon}</AppText></View><AppText size={13} weight="bold" align="center">{action.title}</AppText><AppText size={10} color="#67768E" align="center">{action.subtitle}</AppText></Pressable>)}</View>
    <View style={styles.sectionHeading}><AppText size={16} weight="bold">{t('todayClasses')}</AppText><Pill label={date} tone="gray"/></View>
    {timetable.map((item: (typeof timetable)[number], index: number)=><Card key={`${item.time}-${item.className}`} style={styles.classRow} padding={11}><View style={styles.timeBlock}><AppText size={12} color={school.theme.primary} weight="bold">{item.time}</AppText></View><View style={styles.classCopy}><AppText size={12} weight="bold">{item.className} · {item.section}</AppText><AppText size={11} color="#71809A">{item.subject} · {item.room}</AppText></View><Pressable onPress={() => { if(index===0) navigate('AttendanceSetup'); else navigate('AttendanceSetup',{className:item.className,section:item.section}); }} accessibilityLabel={`${t('takeAttendance')} ${item.className}`}><AppText color={school.theme.primary} size={20}>›</AppText></Pressable></Card>)}
    <AppText color="#7C8AA0" size={10} align="center">{t('backBehavior')}</AppText>
  </Screen>;
}
