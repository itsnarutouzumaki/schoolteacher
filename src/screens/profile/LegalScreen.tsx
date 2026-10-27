import React from 'react';
import {View} from 'react-native';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card} from '../../components/UI';
import {Screen,DemoBanner} from '../../components/Screen';
import {styles} from './LegalScreen.styles';
const terms:[string,string][]=[['terms','termsUseBody'],['studentProfile','termsDataBody'],['subjects','termsAcceptableBody'],['demoOnly','termsDemoBody']];
const privacy:[string,string][]=[['privacy','privacyInfoBody'],['status','privacySecurityBody'],['answerCopy','privacyCameraBody'],['demoOnly','privacyDemoBody']];
export default function LegalScreen({kind}:{kind:'terms'|'privacy'}){
 const {t}=useI18n();const rows=kind==='terms'?terms:privacy;const title=kind==='terms'?t('terms'):t('privacy');
 return <Screen title={title}><DemoBanner/>{rows.map(([heading,body],index)=><Card key={body} style={styles.section}><View style={styles.number}><AppText color="#FFFFFF" weight="bold">{index+1}</AppText></View><View style={styles.copy}><AppText size={13} weight="bold">{t(heading as any)}</AppText><AppText size={12} color="#62718A">{t(body as any)}</AppText></View></Card>)}<AppText color="#8794A7" size={10} align="center">{t('actualUploadUnavailable')}</AppText></Screen>;
}
