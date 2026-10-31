import React, { useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { cleanupLocalFiles, createAnswerCopyPdf } from '../../services/pdfService';
import { removeScanPage } from '../../services/documentScannerService';
import { styles } from './CapturedPagesReviewScreen.styles';

export default function CapturedPagesReviewScreen() {
  const { scanPages, setScanPages, setPendingPdfUri, resultDraft, currentRoute, goBack, navigate, showToast } = useApp();
  const { t } = useI18n();
  const [generating, setGenerating] = useState(false);
  const generationInFlight = useRef(false);
  const routeStudentId = typeof currentRoute.params?.studentId === 'string' ? currentRoute.params.studentId : undefined;
  const currentStudent = resultDraft?.students.find(student => student.id === routeStudentId) || resultDraft?.students[resultDraft.currentIndex];

  const deletePage = async (id: string) => {
    const page = scanPages.find(item => item.id === id);
    setScanPages(previous => removeScanPage(previous, id));
    if (page) await cleanupLocalFiles([page.uri]);
  };

  const proceed = async () => {
    if (!scanPages.length || generationInFlight.current) {
      if (!scanPages.length) showToast({ title: t('error'), message: t('noPages'), tone: 'error' });
      return;
    }
    generationInFlight.current = true;
    setGenerating(true);
    try {
      const title = `${resultDraft?.testName || 'Test'} - ${currentStudent?.fullName || 'Answer Copy'}`;
      const uri = await createAnswerCopyPdf(scanPages, title);
      setPendingPdfUri(uri);
      navigate('PdfPreview', { title, studentId: currentStudent?.id });
    } catch (error) {
      showToast({ title: t('error'), message: error instanceof Error ? error.message : t('scanFailed'), tone: 'error' });
    } finally {
      generationInFlight.current = false;
      setGenerating(false);
    }
  };

  return <Screen title={t('reviewCapturedPages')} subtitle={`${scanPages.length} ${t('pagesCaptured').toLowerCase()}`}>
    {scanPages.length ? scanPages.map((page, index) => (
      <Card key={page.id} style={styles.pageCard}>
        <View style={styles.pageHeader}>
          <AppText size={13} weight="bold" style={styles.pageNumber}>{t('page')} {index + 1}</AppText>
          <Button title={t('deletePage')} variant="danger" compact disabled={generating} onPress={() => { void deletePage(page.id); }} style={styles.deleteButton} />
        </View>
        <Image source={{ uri: page.uri }} resizeMode="contain" style={styles.pageImage} />
      </Card>
    )) : <Card style={styles.emptyPages}><AppText size={12} color="#71809A">{t('noPages')}</AppText></Card>}
    <View style={styles.actions}>
      <Button title={t('addMorePages')} variant="outline" disabled={generating} onPress={goBack} />
      <Button title={generating ? t('processingPdf') : t('proceedToPdf')} disabled={generating || !scanPages.length} onPress={() => { void proceed(); }} />
    </View>
  </Screen>;
}
