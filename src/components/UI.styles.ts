import { StyleSheet } from 'react-native';
import { C } from '../theme';
export const uiStyles = StyleSheet.create({
  text:{ lineHeight:20 }, pressed:{ opacity:0.88 }, card:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:16, shadowColor:C.shadow, shadowOpacity:0.04, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:1 },
  button:{ minHeight:44, borderRadius:12, borderWidth:1, justifyContent:'center', alignItems:'center', flexDirection:'row', paddingHorizontal:14, paddingVertical:11, gap:7 }, buttonCompact:{ minHeight:34, paddingVertical:7, paddingHorizontal:10 }, buttonText:{ fontSize:13, fontWeight:'700', textAlign:'center' }, buttonIcon:{ fontSize:16, fontWeight:'700' },
  fieldGroup:{ gap:6, marginBottom:12 }, input:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:11, paddingHorizontal:12, paddingVertical:11, color:C.text, fontSize:13, minHeight:44 }, multiline:{ minHeight:88, textAlignVertical:'top' }, readOnly:{ backgroundColor:'#F0F3F8', color:C.muted }, inputError:{ borderColor:C.danger }, selectInput:{ minHeight:44, borderRadius:11, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, paddingHorizontal:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  avatar:{ backgroundColor:C.blueSoft, alignItems:'center', justifyContent:'center', overflow:'hidden' }, avatarText:{ color:C.primary, fontWeight:'800' }, pill:{ alignSelf:'flex-start', borderRadius:999, paddingHorizontal:9, paddingVertical:4 },
  modalBackdrop:{ flex:1, backgroundColor:'rgba(15,30,54,0.48)', justifyContent:'center', padding:24 }, backdropTouch: StyleSheet.absoluteFill, optionSheet:{ backgroundColor:C.surface, borderRadius:20, padding:18, maxHeight:'78%', gap:13 }, optionList:{ flexGrow:0 }, option:{ minHeight:48, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:6, borderBottomWidth:1, borderBottomColor:C.border },
  toast:{ position:'absolute', left:16, right:16, bottom:76, padding:14, borderRadius:13, zIndex:100, elevation:10, gap:2 }, dialog:{ backgroundColor:C.surface, borderRadius:20, padding:20, gap:8 }, dialogBody:{ lineHeight:21 }, dialogActions:{ flexDirection:'row', gap:9, marginTop:12 }, dialogButton:{ flex:1 },
  bellIcon:{ width:22,height:22 },
  bellTop:{ position:'absolute',top:1,left:9,width:4,height:4,borderWidth:1.6,borderBottomWidth:0,borderTopLeftRadius:3,borderTopRightRadius:3,backgroundColor:'transparent' },
  bellBody:{ position:'absolute',top:4,left:5,width:12,height:13,borderWidth:1.7,borderBottomWidth:0,borderTopLeftRadius:7,borderTopRightRadius:7,backgroundColor:'transparent' },
  bellRim:{ position:'absolute',top:16,left:2,width:18,height:1.7,borderRadius:1 },
  bellClapper:{ position:'absolute',top:18,left:9,width:4,height:3,borderBottomLeftRadius:2,borderBottomRightRadius:2 },
  notificationIndicator:{ position:'absolute',top:0,right:-1,width:7,height:7,borderRadius:4,backgroundColor:C.danger,borderWidth:1,borderColor:C.surface },
  tabs:{ minHeight:62, backgroundColor:C.surface, borderTopWidth:1, borderTopColor:C.border, flexDirection:'row', alignItems:'center', justifyContent:'space-around', paddingBottom:4 }, tab:{ flex:1, alignItems:'center', justifyContent:'center', gap:1 }, tabIcon:{ fontSize:22, lineHeight:25 }, tabLabel:{ fontSize:10 },
});
