import React from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { Button, Card, AppText } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { styles } from './SchoolDetailsScreen.styles';
export default function SchoolDetailsScreen(){
  const {school}=useApp(); const {t,language}=useI18n();
  return <Screen title={t('schoolInfo')}><Card padding={0} style={styles.hero}><Image source={{uri:school.heroPhotoUrl}} style={styles.heroImage}/><View style={styles.heroText}><AppText size={18} weight="bold">{school.name}</AppText><AppText color="#71809A" size={12}>{language==='hi'?(school.taglineHi||school.tagline):school.tagline}</AppText></View></Card>
    <Card><AppText size={16} weight="bold">{t('aboutSchool')}</AppText><AppText color="#63728A">{language==='hi'?(school.aboutHi||school.about):school.about}</AppText><AppText size={12} color="#63728A">{language==='hi'?(school.missionHi||school.mission):school.mission}</AppText></Card>
    <Card><View style={styles.row}><AppText color="#71809A">{t('established')}</AppText><AppText weight="bold">{school.established}</AppText></View><View style={styles.row}><AppText color="#71809A">{t('grades')}</AppText><AppText weight="bold">{language==='hi'?(school.gradesHi||school.grades):school.grades}</AppText></View><View style={styles.row}><AppText color="#71809A">{t('schoolPhone')}</AppText><AppText weight="semibold">{school.phone}</AppText></View><View style={styles.row}><AppText color="#71809A">{t('schoolEmail')}</AppText><AppText weight="semibold">{school.email}</AppText></View></Card>
    <Card><AppText size={16} weight="bold">{t('facilities')}</AppText>{(language==='hi'?(school.facilitiesHi||school.facilities):school.facilities).map((item:string)=><AppText key={item} color="#63728A">• {item}</AppText>)}</Card>
  </Screen>;
}
