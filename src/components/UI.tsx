import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { useI18n } from '../i18n/I18nContext';
import { useApp } from '../app-context';
import { uiStyles } from './UI.styles';

export function AppText({ children, size = 14, color = C.text, weight = 'normal', align, style, numberOfLines }: { children: React.ReactNode; size?: number; color?: string; weight?: 'normal'|'medium'|'semibold'|'bold'; align?: 'left'|'center'|'right'; style?: any; numberOfLines?: number }) {
  const fontWeight = weight === 'medium' ? '500' : weight === 'semibold' ? '600' : weight === 'bold' ? '700' : '400';
  return <Text numberOfLines={numberOfLines} style={[uiStyles.text, { fontSize: size, color, fontWeight, textAlign: align }, style]}>{children}</Text>;
}
export function Card({ children, onPress, style, padding = 14 }: { children: React.ReactNode; onPress?: () => void; style?: any; padding?: number }) {
  const content = <View style={[uiStyles.card, { padding }, style]}>{children}</View>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && uiStyles.pressed]}>{content}</Pressable> : content;
}
export function Button({ title, onPress, variant = 'primary', disabled = false, icon, compact = false, style, accessibilityLabel }: { title: string; onPress: () => void; variant?: 'primary'|'secondary'|'outline'|'danger'|'success'|'ghost'; disabled?: boolean; icon?: string; compact?: boolean; style?: any; accessibilityLabel?: string }) {
  const bg = variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : variant === 'success' ? C.success : variant === 'secondary' ? C.blueSoft : variant === 'ghost' ? 'transparent' : C.surface;
  const color = ['primary','danger','success'].includes(variant) ? '#FFFFFF' : variant === 'secondary' ? C.primary : C.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || title} disabled={disabled} onPress={onPress} style={({ pressed }) => [uiStyles.button, compact && uiStyles.buttonCompact, { backgroundColor: bg, borderColor: variant === 'outline' ? C.border : bg, opacity: disabled ? 0.45 : pressed ? 0.84 : 1 }, style]}>
    {icon ? <Text style={[uiStyles.buttonIcon, { color }]}>{icon}</Text> : null}<Text style={[uiStyles.buttonText, { color }]}>{title}</Text>
  </Pressable>;
}
export function Field({ label, value, onChangeText, placeholder, required, multiline, keyboardType, secureTextEntry, editable = true, error, maxLength, onBlur }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; required?: boolean; multiline?: boolean; keyboardType?: 'default'|'number-pad'|'email-address'|'phone-pad'; secureTextEntry?: boolean; editable?: boolean; error?: string; maxLength?: number; onBlur?: () => void }) {
  return <View style={uiStyles.fieldGroup}>
    <AppText size={12} weight="semibold">{label}{required ? <AppText size={12} color={C.danger}> *</AppText> : null}</AppText>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} onBlur={onBlur} placeholder={placeholder} placeholderTextColor="#9AA7B8" editable={editable} multiline={multiline} keyboardType={keyboardType || 'default'} secureTextEntry={secureTextEntry} maxLength={maxLength} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} style={[uiStyles.input, multiline && uiStyles.multiline, !editable && uiStyles.readOnly, error && uiStyles.inputError]} />
    {error ? <AppText size={11} color={C.danger}>{error}</AppText> : null}
  </View>;
}
export function Avatar({ uri, name, size = 48 }: { uri?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return <View style={[uiStyles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>{uri && !failed ? <Image source={{ uri }} onError={() => setFailed(true)} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Text style={[uiStyles.avatarText, { fontSize: size * 0.31 }]}>{initials || 'T'}</Text>}</View>;
}
export function Pill({ label, tone = 'blue' }: { label: string; tone?: 'blue'|'green'|'red'|'orange'|'purple'|'gray' }) {
  const colors = { blue: [C.blueSoft,C.primary], green: [C.successSoft,C.success], red: [C.dangerSoft,C.danger], orange: [C.warningSoft,C.warning], purple: [C.purpleSoft,C.purple], gray: ['#EEF2F6',C.muted] } as const;
  const [backgroundColor, color] = colors[tone];
  return <View style={[uiStyles.pill, { backgroundColor }]}><AppText size={10} color={color} weight="semibold">{label}</AppText></View>;
}
export function SelectField({ label, value, options, onChange, placeholder, required }: { label: string; value: string; options: string[]; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return <View style={uiStyles.fieldGroup}>
    <AppText size={12} weight="semibold">{label}{required ? <AppText size={12} color={C.danger}> *</AppText> : null}</AppText>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label} selector`} onPress={() => setVisible(true)} style={uiStyles.selectInput}><AppText color={value ? C.text : '#9AA7B8'}>{value || placeholder || t('required')}</AppText><AppText color={C.primary} weight="bold">⌄</AppText></Pressable>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={uiStyles.modalBackdrop}><Pressable style={uiStyles.backdropTouch} onPress={() => setVisible(false)} /><View style={uiStyles.optionSheet}><AppText size={16} weight="bold">{label}</AppText><ScrollView style={uiStyles.optionList}>{options.map(option => <Pressable key={option} onPress={() => { onChange(option); setVisible(false); }} style={uiStyles.option}><AppText color={option === value ? C.primary : C.text} weight={option === value ? 'bold' : 'normal'}>{option}</AppText>{option === value ? <AppText color={C.primary}>✓</AppText> : null}</Pressable>)}</ScrollView><Button title={t('cancel')} variant="outline" onPress={() => setVisible(false)} /></View></View>
    </Modal>
  </View>;
}
export function ToastHost() {
  const { toast, setToast } = useApp();
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast((v) => v?.id === toast.id ? null : v), 3000); return () => clearTimeout(id); }, [toast, setToast]);
  if (!toast) return null;
  const bg = toast.tone === 'error' ? C.danger : toast.tone === 'success' ? C.success : toast.tone === 'warning' ? '#8A5A13' : C.primaryDark;
  return <Pressable onPress={() => setToast(null)} style={[uiStyles.toast, { backgroundColor: bg }]} accessibilityLabel={toast.title}><AppText color="#FFFFFF" weight="bold" size={13}>{toast.title}</AppText>{toast.message ? <AppText color="#EAF3FF" size={11}>{toast.message}</AppText> : null}</Pressable>;
}
export function ConfirmDialog({ visible, title, message, cancelTitle, confirmTitle, onCancel, onConfirm, danger = false }: { visible: boolean; title: string; message: string; cancelTitle: string; confirmTitle: string; onCancel: () => void; onConfirm: () => void; danger?: boolean }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={uiStyles.modalBackdrop}><Pressable style={uiStyles.backdropTouch} onPress={onCancel} /><View style={uiStyles.dialog}><AppText size={18} weight="bold">{title}</AppText><AppText color={C.muted} style={uiStyles.dialogBody}>{message}</AppText><View style={uiStyles.dialogActions}><Button title={cancelTitle} variant="outline" onPress={onCancel} style={uiStyles.dialogButton}/><Button title={confirmTitle} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} style={uiStyles.dialogButton}/></View></View></View></Modal>;
}
export function BottomTabs({ active, onPress }: { active: 'Home'|'Notifications'|'Profile'; onPress: (key: 'Home'|'Notifications'|'Profile') => void }) {
  const { t } = useI18n();
  const tabs: Array<{ key: 'Home'|'Notifications'|'Profile'; icon: string; label: string }> = [{ key:'Home', icon:'⌂', label:t('home') }, { key:'Notifications', icon:'♧', label:t('notifications') }, { key:'Profile', icon:'◉', label:t('profile') }];
  return <View style={uiStyles.tabs}>{tabs.map(tab => <Pressable key={tab.key} onPress={() => onPress(tab.key)} accessibilityRole="button" accessibilityLabel={tab.label} style={uiStyles.tab}>{<Text style={[uiStyles.tabIcon, { color: active === tab.key ? C.primary : C.muted }]}>{tab.icon}</Text>}<Text style={[uiStyles.tabLabel,{color:active === tab.key?C.primary:C.muted,fontWeight:active===tab.key?'700':'500'}]}>{tab.label}</Text></Pressable>)}</View>;
}
export function LoadingButton({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) { return <Button title={title} onPress={onPress} disabled={loading} icon={loading ? undefined : undefined} />; }
