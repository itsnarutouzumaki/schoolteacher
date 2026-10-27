import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { Button, Card, Field, AppText } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { validateLogin } from '../../validation/forms';
import config from '../../data/school-config.json';
import { styles } from './LoginScreen.styles';

export default function LoginScreen() {
  const { navigate, resetTo, setIsDemoOpen, showToast } = useApp();
  const { t } = useI18n();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const messageKey = validateLogin(mobile, password);
  const tryLogin = () => {
    if (messageKey) { showToast({ title: t('error'), message: t(messageKey as any), tone: 'error' }); return; }
    showToast({ title: t('noBackend'), message: t('actualUploadUnavailable'), tone: 'info' });
  };
  return <Screen scroll={true} back={false}>
    <View style={styles.hero}>
      <Image source={require('../../../assets/icon.png')} style={styles.logo} />
      <AppText size={23} color="#FFFFFF" weight="bold" align="center">{config.school.name}</AppText>
      <AppText color="#DCEBFF" align="center" size={12}>{config.school.tagline}</AppText>
      <AppText color="#FFFFFF" weight="semibold" align="center" size={16} style={styles.portalLabel}>{t('teacherPortal')}</AppText>
    </View>
    <Card style={styles.loginCard}>
      <AppText size={22} weight="bold">{t('login')}</AppText>
      <AppText color="#71809A" size={12}>{t('loginSubtitle')}</AppText>
      <View style={styles.fields}>
        <Field label={t('mobileNumber')} value={mobile} onChangeText={setMobile} placeholder={t('mobilePlaceholder')} keyboardType="phone-pad" required />
        <Field label={t('password')} value={password} onChangeText={setPassword} placeholder={t('passwordPlaceholder')} secureTextEntry={!showPassword} required />
        <Button title={showPassword ? t('hidePassword') : t('showPassword')} variant="ghost" compact onPress={() => setShowPassword(value => !value)} style={styles.passwordToggle} />
      </View>
      <Button title={t('loginButton')} onPress={tryLogin} />
      <Button title={t('forgotPassword')} variant="ghost" onPress={() => navigate('ForgotPassword')} />
      <View style={styles.dividerRow}><View style={styles.divider} /><AppText color="#8591A5" size={11}>{t('uiPreview')}</AppText><View style={styles.divider} /></View>
      <Button title={t('demoEntry')} variant="secondary" onPress={() => { setIsDemoOpen(true); resetTo('Home'); }} />
      <AppText color="#738199" size={11} align="center">{t('noSignup')}</AppText>
      <AppText color="#9A6C21" size={10} align="center">{t('demoBanner')}</AppText>
    </Card>
  </Screen>;
}
