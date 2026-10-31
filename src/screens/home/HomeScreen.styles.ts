import { StyleSheet } from 'react-native';
import { C } from '../../theme';
export const styles = StyleSheet.create({
  schoolCard:{ padding:0,overflow:'hidden' }, heroPhoto:{ height:156,justifyContent:'flex-end' }, heroImage:{ borderTopLeftRadius:16,borderTopRightRadius:16 }, heroOverlay:{ backgroundColor:'rgba(8,34,72,0.64)',padding:14,gap:3 }, schoolInfo:{ flexDirection:'row',alignItems:'center',paddingHorizontal:13,paddingTop:12,gap:10 }, schoolMark:{ width:46,height:46,borderRadius:12,backgroundColor:C.blueSoft,alignItems:'center',justifyContent:'center' }, schoolCopy:{ flex:1,gap:2 }, schoolButton:{ padding:12,paddingTop:10 },
  teacherWelcome:{ flexDirection:'row',alignItems:'center',gap:12 }, teacherPhoto:{ width:64,height:64,borderRadius:18,backgroundColor:C.blueSoft }, teacherCopy:{ flex:1,gap:2 },tagRow:{ flexDirection:'row',gap:5,marginTop:4,flexWrap:'wrap' },
  actionGrid:{ flexDirection:'row',gap:8 }, actionCard:{ flex:1,minHeight:142,borderRadius:16,padding:10,alignItems:'center',justifyContent:'center',gap:7,borderWidth:1 }, actionGreen:{ backgroundColor:'#EBFAF1',borderColor:'#D6F4E2' }, actionPurple:{ backgroundColor:'#F3EEFF',borderColor:'#E6DFFF' }, actionOrange:{ backgroundColor:'#FFF3E9',borderColor:'#FFE4CF' }, actionIcon:{ width:38,height:38,borderRadius:12,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center' },
});
