import { StyleSheet } from 'react-native';
import { C } from '../../theme';

export const styles = StyleSheet.create({
  pageCard: { padding: 10, gap: 8 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageNumber: { flex: 1 },
  pageImage: { width: '100%', height: 380, backgroundColor: '#F4F1E9', borderRadius: 6 },
  emptyPages: { padding: 20, alignItems: 'center' },
  actions: { gap: 9 },
  deleteButton: { minWidth: 88 },
});
