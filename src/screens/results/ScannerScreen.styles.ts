import { StyleSheet } from 'react-native';
import { C } from '../../theme';

export const styles = StyleSheet.create({
  notice: { gap: 4, backgroundColor: C.blueSoft },
  modeRow: { flexDirection: 'row', gap: 9 },
  modeButton: { flex: 1, minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, justifyContent: 'center', paddingHorizontal: 8 },
  activeMode: { borderColor: C.primary, backgroundColor: C.primary },
  permission: { alignItems: 'center', gap: 12, padding: 22 },
  pageHeader: { gap: 2 },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 72, alignItems: 'center', gap: 3 },
  thumbnail: { width: 64, height: 82, borderRadius: 8, backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.border },
  deleteThumb: { position: 'absolute', right: 0, top: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  emptyPages: { padding: 18, alignItems: 'center' },
});
