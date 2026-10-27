import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { createAnswerCopyPdf, cleanupLocalFiles } from '../../services/pdfService';
import { styles } from './ScannerScreen.styles';
import { captureDocumentPages, optimizeCapturedPhoto } from '../../services/documentScannerService';

export default function ScannerScreen() {
  const { scanPages, setScanPages, setPendingPdfUri, resultDraft, currentRoute, navigate, showToast } = useApp();
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const autoStartAttempted = useRef(false);
  const [manualMode, setManualMode] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nativeBusy, setNativeBusy] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const routeStudentId = typeof currentRoute.params?.studentId === 'string' ? currentRoute.params.studentId : undefined;
  const currentStudent = resultDraft?.students.find(student => student.id === routeStudentId) || resultDraft?.students[resultDraft.currentIndex];

  const launchDocumentScanner = async () => {
    if (nativeBusy || capturing || generating) return;
    setNativeBusy(true);
    try {
      // expo-camera declares CAMERA permission in AndroidManifest. Request it before
      // opening the native scanner, as required when both camera modules are installed.
      let cameraGranted = permission?.granted === true;
      if (!cameraGranted) cameraGranted = (await requestPermission()).granted;
      if (!cameraGranted) {
        setManualMode(true);
        showToast({ title: t('cameraPermission'), message: t('enableCameraSettings'), tone: 'warning' });
        return;
      }

      const result = await captureDocumentPages();
      if (result.status === 'cancel' || !result.pages.length) {
        showToast({ title: t('scanCancelled'), message: t('scanCancelledBody'), tone: 'info' });
        return;
      }
      setScanPages(previous => [...previous, ...result.pages]);
      setManualMode(false);
      showToast({ title: t('scanComplete'), message: t('pagesAdded', { count: result.pages.length }), tone: 'success' });
    } catch (error) {
      const wasCancelled = error instanceof Error && /cancel/i.test(error.message);
      if (wasCancelled) {
        showToast({ title: t('scanCancelled'), message: t('scanCancelledBody'), tone: 'info' });
      } else {
        // Expo Go does not bundle this native module; the in-app camera is a safe fallback.
        setManualMode(true);
        showToast({ title: t('nativeScannerUnavailable'), message: t('basicScannerFallback'), tone: 'warning' });
      }
    } finally {
      setNativeBusy(false);
    }
  };

  useEffect(() => {
    if (autoStartAttempted.current) return;
    autoStartAttempted.current = true;
    void launchDocumentScanner();
    // Start the on-device scanner once when this route opens; Retry remounts this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.94, skipProcessing: false });
      if (!photo?.uri) throw new Error('Camera did not return a file.');
      const optimized = await optimizeCapturedPhoto(photo.uri, `scan-${Date.now()}`);
      if (optimized.uri !== photo.uri) await cleanupLocalFiles([photo.uri]);
      setScanPages(previous => [...previous, optimized]);
      showToast({ title: t('scanComplete'), message: t('pagesAdded', { count: 1 }), tone: 'success' });
    } catch (error) {
      showToast({ title: t('scanFailed'), message: error instanceof Error ? error.message : undefined, tone: 'error' });
    } finally {
      setCapturing(false);
    }
  };

  const deletePage = async (id: string) => {
    const page = scanPages.find(item => item.id === id);
    setScanPages(previous => previous.filter(item => item.id !== id));
    if (page) await cleanupLocalFiles([page.uri]);
  };

  const finish = async () => {
    if (!scanPages.length) {
      showToast({ title: t('error'), message: t('noPages'), tone: 'error' });
      return;
    }
    try {
      setGenerating(true);
      const title = `${resultDraft?.testName || 'Test'} - ${currentStudent?.fullName || 'Answer Copy'}`;
      const uri = await createAnswerCopyPdf(scanPages, title);
      setPendingPdfUri(uri);
      navigate('PdfPreview', { title, studentId: currentStudent?.id });
    } catch (error) {
      showToast({ title: t('error'), message: error instanceof Error ? error.message : t('scanFailed'), tone: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  return <Screen title={t('scannerTitle')} subtitle={currentStudent?.fullName || t('answerCopy')}>
    <Card style={styles.notice}>
      <AppText size={12} weight="bold">{t('scannerHint')}</AppText>
      <AppText size={10} color="#6D7B92">{t('onDeviceScanNote')}</AppText>
    </Card>

    {!manualMode ? <Card style={styles.scannerLaunch}>
      <View style={styles.scannerSymbol}><AppText color="#FFFFFF" size={28}>▣</AppText></View>
      <AppText size={15} weight="bold" align="center">{nativeBusy ? t('openingScanner') : t('documentScannerTitle')}</AppText>
      <AppText size={11} color="#6D7B92" align="center">{t('documentScannerDescription')}</AppText>
      {nativeBusy ? <ActivityIndicator color="#075DCE" /> : <Button title={t('openDocumentScanner')} onPress={launchDocumentScanner} />}
      <Button title={t('useBasicCamera')} variant="outline" onPress={() => setManualMode(true)} disabled={nativeBusy} />
    </Card> : !permission ? <Card style={styles.permission}><ActivityIndicator color="#075DCE"/><AppText>{t('cameraPermission')}</AppText></Card> : !permission.granted ? <Card style={styles.permission}>
      <AppText size={28}>▣</AppText><AppText weight="bold">{t('cameraPermission')}</AppText>
      {!permission.canAskAgain ? <AppText size={11} color="#6D7B92">{t('enableCameraSettings')}</AppText> : null}
      <Button title={t('grantCamera')} onPress={() => requestPermission()} />
    </Card> : cameraError ? <Card style={styles.permission}><AppText>{t('cameraError')}</AppText><Button title={t('retry')} onPress={() => setCameraError(false)} /></Card> : <View style={styles.cameraWrap}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="picture" onMountError={() => setCameraError(true)}>
        <View pointerEvents="none" style={styles.documentFrame}><View style={styles.cornerTopLeft}/><View style={styles.cornerTopRight}/><View style={styles.cornerBottomLeft}/><View style={styles.cornerBottomRight}/><AppText color="#FFFFFF" size={10} align="center">{t('alignPage')}</AppText></View>
        <View style={styles.cameraControls}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('capturePage')} disabled={capturing} onPress={capture} style={styles.shutterOuter}><View style={styles.shutterInner}/></Pressable>
          <AppText color="#FFFFFF" size={11}>{capturing ? t('processingImage') : t('capturePage')}</AppText>
        </View>
      </CameraView>
    </View>}

    <View style={styles.pageHeader}><AppText size={14} weight="bold">{t('pagesCaptured')} ({scanPages.length})</AppText><AppText size={10} color="#77869D">{t('noPageLimit')}</AppText></View>
    {scanPages.length ? <View style={styles.thumbRow}>{scanPages.map((page, index) => <View key={page.id} style={styles.thumbWrap}>
      <Image source={{ uri: page.uri }} style={styles.thumbnail}/>
      <Pressable accessibilityRole="button" accessibilityLabel={t('deletePage')} onPress={() => void deletePage(page.id)} style={styles.deleteThumb}><AppText color="#FFFFFF" size={11} weight="bold">×</AppText></Pressable>
      <AppText size={10} color="#71809A">{t('page')} {index + 1}</AppText>
    </View>)}</View> : <Card style={styles.emptyPages}><AppText size={12} color="#71809A">{t('noPages')}</AppText></Card>}
    <Button title={generating ? t('processingPdf') : t('finishScan')} disabled={generating || capturing || nativeBusy || !scanPages.length} onPress={finish}/>
    {generating ? <ActivityIndicator color="#075DCE"/> : null}
  </Screen>;
}
