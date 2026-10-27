import React from 'react';
import { SafeAreaView, ScrollView, Pressable, Text, View } from 'react-native';
import { useApp } from '../app-context';
import { useI18n } from '../i18n/I18nContext';
import { styles } from './Screen.styles';
import { C } from '../theme';

export function Screen({ title, subtitle, children, scroll = true, back = true, right }: { title?: string; subtitle?: string; children: React.ReactNode; scroll?: boolean; back?: boolean; right?: React.ReactNode }) {
  const { goBack } = useApp();
  const { t } = useI18n();
  return <SafeAreaView style={styles.safe}>
    {title ? <View style={styles.header}>
      {back ? <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={goBack} style={styles.back}><Text style={styles.backGlyph}>‹</Text></Pressable> : <View style={styles.brandMark}><Text style={styles.brandMarkText}>✦</Text></View>}
      <View style={styles.headerInfo}><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}</View>{right || <View style={styles.rightSpacer} />}
    </View> : null}
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{children}</ScrollView> : <View style={styles.flex}>{children}</View>}
  </SafeAreaView>;
}
export function DemoBanner({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return <View style={[styles.demoBanner, compact && styles.demoBannerCompact]}><Text style={styles.demoText}>{t('demoBanner')}</Text></View>;
}
export function ScreenLabel({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={[styles.screenLabel, muted && { color: C.muted }]}>{children}</Text>;
}
