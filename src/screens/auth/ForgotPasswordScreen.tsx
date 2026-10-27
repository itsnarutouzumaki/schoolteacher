import React, { useState } from 'react';
import { useApp } from '../../app-context';
import { Screen } from '../../components/Screen';
import { AppText, Button, Card, Field } from '../../components/UI';
import { useI18n } from '../../i18n/I18nContext';
import { styles } from './ForgotPasswordScreen.styles';
export default function ForgotPasswordScreen() {
  const [mobile, setMobile] = useState('');
  const { showToast } = useApp();
  const { t } = useI18n();
  return <Screen title={t('forgotPasswordTitle')}><Card style={styles.card}>
    <AppText color="#66758D">{t('forgotPasswordBody')}</AppText>
    <Field label={t('mobileNumber')} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" required />
    <Button title={t('sendRequest')} onPress={() => showToast({ title:t('noBackend'), message:t('forgotPasswordBody'), tone:'info' })} />
  </Card></Screen>;
}
