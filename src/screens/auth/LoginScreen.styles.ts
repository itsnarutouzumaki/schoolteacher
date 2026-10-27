import { StyleSheet } from 'react-native';
import { C } from '../../theme';
export const styles = StyleSheet.create({
  hero:{ backgroundColor:C.primaryDark, borderRadius:22, minHeight:236, alignItems:'center', justifyContent:'center', padding:22, gap:7, overflow:'hidden' },
  logo:{ width:88,height:88,borderRadius:22,marginBottom:2 }, portalLabel:{ marginTop:10, letterSpacing:0.5 },
  loginCard:{ marginTop:2,gap:8 }, fields:{ marginTop:8 }, passwordToggle:{ alignSelf:'flex-end', minHeight:28,paddingVertical:4 },
  dividerRow:{ flexDirection:'row',alignItems:'center',gap:10,marginVertical:3 }, divider:{ flex:1,height:1,backgroundColor:C.border },
});
