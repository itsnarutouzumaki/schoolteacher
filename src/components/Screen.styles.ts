import { StyleSheet } from 'react-native';
import { C } from '../theme';
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, flex: { flex: 1 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: C.primary, gap: 10 },
  back: { width: 30, height: 36, alignItems: 'center', justifyContent: 'center' }, backGlyph: { color: '#FFFFFF', fontSize: 32, lineHeight: 35, marginTop: -4 },
  brandMark: { width: 31, height: 31, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' }, brandMarkText: { fontSize: 18, color: '#FFFFFF' },
  headerInfo: { flex: 1 }, headerTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' }, headerSubtitle: { color: '#D9E8FF', fontSize: 10, marginTop: 2 }, rightSpacer: { width: 18 },
  scrollContent: { padding: 16, paddingBottom: 28, gap: 13 }, demoBanner: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.warningSoft, borderWidth: 1, borderColor: '#F4D5A3' }, demoBannerCompact: { paddingVertical: 5 }, demoText: { color: '#8A5A13', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  screenLabel: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 6 },
});
