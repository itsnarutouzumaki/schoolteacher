import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, ConfirmDialog, Pill } from '../../components/UI';
import { Screen, DemoBanner } from '../../components/Screen';
import { cleanupLocalFiles } from '../../services/pdfService';
import { styles } from './PdfPreviewScreen.styles';

export default function PdfPreviewScreen(){
  const {scanPages,pendingPdfUri,resultDraft,currentRoute,popTo,setScanPages,setPendingPdfUri,setResultDraft,showToast}=useApp();
  const {t}=useI18n(); const [retryOpen,setRetryOpen]=useState(false); const title=typeof currentRoute.params?.title==='string'?currentRoute.params.title:t('pdfPreview');
  const attach=()=>{
    if(!resultDraft||!pendingPdfUri){showToast({title:t('error'),message:t('noPdfBackend'),tone:'error'});return;}
    const studentId=typeof currentRoute.params?.studentId==='string'?currentRoute.params.studentId:resultDraft.students[resultDraft.currentIndex]?.id;
    if(studentId){setResultDraft(previous=>previous?{...previous,entries:{...previous.entries,[studentId]:{...previous.entries[studentId],answerCopyUri:pendingPdfUri,answerCopyPageCount:scanPages.length}}}:previous);}
    void cleanupLocalFiles(scanPages.map(page=>page.uri));setScanPages([]);setPendingPdfUri(null);popTo('ResultEntry');showToast({title:t('pdfAttached'),message:t('noPdfBackend'),tone:'success'});
  };
  return <Screen title={t('pdfPreview')} subtitle={title}>
    <DemoBanner/>
    <Card style={styles.fileHeader}><View style={styles.fileIcon}><AppText color="#FFFFFF" size={22}>▤</AppText></View><View style={styles.fileCopy}><AppText weight="bold">{title}</AppText><AppText size={11} color="#71809A">{scanPages.length} {t('pagesCaptured').toLowerCase()}</AppText><Pill label={pendingPdfUri?t('fileReady'):t('noData')} tone={pendingPdfUri?'green':'gray'}/></View></Card>
    <AppText size={12} color="#6D7B92">{t('pdfPreviewNote')}</AppText>
    {scanPages.map((page,index)=><Card key={page.id} style={styles.pageCard}><View style={styles.pageLabel}><AppText size={11} weight="bold">{t('page')} {index+1}</AppText><AppText size={10} color="#71809A">{page.width||'—'} × {page.height||'—'}</AppText></View><Image source={{uri:page.uri}} resizeMode="contain" style={styles.pageImage}/></Card>)}
    <View style={styles.actions}><Button title={t('retryScan')} variant="outline" onPress={()=>setRetryOpen(true)} style={styles.action}/><Button title={t('submitPdf')} onPress={attach} disabled={!pendingPdfUri} style={styles.action}/></View>
    <AppText size={10} color="#8794A7" align="center">{t('actualUploadUnavailable')}</AppText>
    <ConfirmDialog visible={retryOpen} title={t('retryScan')} message={t('retryFromStart')} cancelTitle={t('cancel')} confirmTitle={t('yesRetry')} danger onCancel={()=>setRetryOpen(false)} onConfirm={()=>{setRetryOpen(false);void cleanupLocalFiles([...scanPages.map(page=>page.uri),...(pendingPdfUri?[pendingPdfUri]:[])]);setScanPages([]);setPendingPdfUri(null);popTo('ResultEntry');showToast({title:t('retryScan'),tone:'info'});}}/>
  </Screen>;
}
