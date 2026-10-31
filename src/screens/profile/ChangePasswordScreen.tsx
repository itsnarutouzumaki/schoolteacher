import { C } from '../../theme';
import React,{useState} from 'react';
import { View } from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Button,Card,Field} from '../../components/UI';
import {Screen,DemoBanner} from '../../components/Screen';
import {validatePasswordChange} from '../../validation/forms';
import {styles} from './ChangePasswordScreen.styles';
export default function ChangePasswordScreen(){
 const {showToast}=useApp();const {t}=useI18n();const [current,setCurrent]=useState('');const [next,setNext]=useState('');const [confirm,setConfirm]=useState('');
 const update=()=>{const error=validatePasswordChange(current,next,confirm);if(error){showToast({title:t('error'),message:t(error as any),tone:'error'});return;}showToast({title:t('noBackend'),message:t('passwordNotChanged'),tone:'info'});};
 return <Screen title={t('changePassword')}><DemoBanner/><Card style={styles.card}><Field label={t('currentPassword')} value={current} onChangeText={setCurrent} secureTextEntry required/><Field label={t('newPassword')} value={next} onChangeText={setNext} secureTextEntry required/><Field label={t('confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry required/><View style={styles.rule}><AppText color={C.primary} size={16}>ⓘ</AppText><AppText size={11} color="#61728B">{t('passwordRule')}</AppText></View><Button title={t('updatePassword')} onPress={update}/></Card><AppText size={10} color="#8794A7" align="center">{t('passwordNotChanged')}</AppText></Screen>;
}
