import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Pressable, View } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useApp } from '../../app-context';
import { useI18n } from '../../i18n/I18nContext';
import { AppText, Button, Card, ConfirmDialog } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { cleanupLocalFiles } from '../../services/pdfService';
import { C } from '../../theme';
import { appendScanPages, captureDocumentPages, createScanPageId, normalizeScannerUri, optimizeCapturedPhoto, removeScanPage } from '../../services/documentScannerService';
import { styles } from './ScannerScreen.styles';

type CaptureMode = 'normal' | 'documentScanner';

export default function ScannerScreen() {
  const { scanPages, setScanPages, pendingPdfUri, setPendingPdfUri, resultDraft, currentRoute, navigate, popTo, showToast } = useApp();
  const { t } = useI18n();
  const [mode, setMode] = useState<CaptureMode>('normal');
  const [capturing, setCapturing] = useState(false);
  const [nativeBusy, setNativeBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const cameraInFlight = useRef(false);
  const scannerInFlight = useRef(false);
  const routeStudentId = typeof currentRoute.params?.studentId === 'string' ? currentRoute.params.studentId : undefined;
  const currentStudent = resultDraft?.students.find(student => student.id === routeStudentId) || resultDraft?.students[resultDraft.currentIndex];
  const busy = capturing || nativeBusy;

  const continueToReview = () => {
    if (!scanPages.length || busy) return;
    navigate('CapturedPagesReview', { studentId: currentStudent?.id });
  };

  const cancelCapture = async () => {
    setCancelOpen(false);
    await cleanupLocalFiles([...scanPages.map(page => page.uri), ...(pendingPdfUri ? [pendingPdfUri] : [])]);
    setScanPages([]);
    setPendingPdfUri(null);
    popTo('ResultEntry');
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (busy) return true;
      setCancelOpen(true);
      return true;
    });
    return () => subscription.remove();
  }, [busy]);

  const captureNormalPhoto = async () => {
    if (cameraInFlight.current || scannerInFlight.current) return;
    cameraInFlight.current = true;
    setCapturing(true);
    try {
      const photo = await ImageCropPicker.openCamera({
        mediaType: 'photo',
        cropping: false,
        compressImageQuality: 0.94,
        forceJpg: true,
      });
      if (!photo.path) throw new Error('Camera did not return a file.');
      const photoUri = normalizeScannerUri(photo.path);
      const page = await optimizeCapturedPhoto(photoUri, createScanPageId('camera'));
      if (page.uri !== photoUri) await cleanupLocalFiles([photoUri]);
      setScanPages(previous => appendScanPages(previous, [page]));
      if (page.optimizationFailed) {
        showToast({ title: t('imageProcessingWarning'), message: t('capturedImageKept'), tone: 'warning' });
      } else {
        showToast({ title: t('scanComplete'), message: t('pagesAdded', { count: 1 }), tone: 'success' });
      }
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      if (code === 'E_PICKER_CANCELLED') return;
      const permissionDenied = code === 'E_NO_CAMERA_PERMISSION' || code === 'E_PERMISSION_MISSING';
      showToast({
        title: permissionDenied ? t('cameraPermission') : t('cameraError'),
        message: error instanceof Error ? error.message : undefined,
        tone: 'error',
      });
    } finally {
      cameraInFlight.current = false;
      setCapturing(false);
    }
  };

  const captureDocumentScan = async () => {
    if (scannerInFlight.current || cameraInFlight.current) return;
    scannerInFlight.current = true;
    setNativeBusy(true);
    try {
      const result = await captureDocumentPages();
      if (!result.pages.length) {
        showToast({ title: t('scanCancelled'), message: t('scanCancelledBody'), tone: 'info' });
        return;
      }
      setScanPages(previous => appendScanPages(previous, result.pages));
      if (result.optimizationFailures) {
        showToast({ title: t('imageProcessingWarning'), message: t('capturedImageKept'), tone: 'warning' });
      } else {
        showToast({ title: t('scanComplete'), message: t('pagesAdded', { count: result.pages.length }), tone: 'success' });
      }
    } catch (error) {
      if (error instanceof Error && /cancel/i.test(error.message)) {
        showToast({ title: t('scanCancelled'), message: t('scanCancelledBody'), tone: 'info' });
      } else {
        setMode('normal');
        showToast({
          title: t('nativeScannerUnavailable'),
          message: `${t('basicScannerFallback')}${error instanceof Error ? ` ${error.message}` : ''}`,
          tone: 'warning',
        });
      }
    } finally {
      scannerInFlight.current = false;
      setNativeBusy(false);
    }
  };

  const deletePage = async (id: string) => {
    const page = scanPages.find(item => item.id === id);
    setScanPages(previous => removeScanPage(previous, id));
    if (page) await cleanupLocalFiles([page.uri]);
  };

  return <Screen
    title={t('scannerTitle')}
    subtitle={currentStudent?.fullName || t('answerCopy')}
    onBack={() => { if (!busy) setCancelOpen(true); }}
    right={<Button title={t('continue')} compact disabled={!scanPages.length || busy} onPress={continueToReview} />}
  >
    <Card style={styles.notice}>
      <AppText size={12} weight="bold">{t('scannerHint')}</AppText>
      <AppText size={10} color="#6D7B92">{t('onDeviceScanNote')}</AppText>
    </Card>

    <View style={styles.modeRow}>
      {([
        { value: 'normal', label: t('normalMode') },
        { value: 'documentScanner', label: t('documentScannerMode') },
      ] as const).map(item => (
        <Pressable
          key={item.value}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === item.value }}
          onPress={() => setMode(item.value)}
          disabled={busy}
          style={[styles.modeButton, mode === item.value && styles.activeMode]}
        >
          <AppText size={12} color={mode === item.value ? '#FFFFFF' : undefined} weight="bold" align="center">{item.label}</AppText>
        </Pressable>
      ))}
    </View>

    <Card style={styles.permission}>
      <AppText size={28} color={C.primary}>▣</AppText>
      <AppText weight="bold">{mode === 'normal' ? t('normalMode') : t('documentScannerMode')}</AppText>
      <AppText size={11} color="#6D7B92" align="center">{mode === 'normal' ? t('alignPage') : t('documentScannerDescription')}</AppText>
      <Button
        title={capturing ? t('processingImage') : nativeBusy ? t('openingScanner') : mode === 'normal' ? t('capturePage') : t('openDocumentScanner')}
        onPress={() => void (mode === 'normal' ? captureNormalPhoto() : captureDocumentScan())}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={C.primary} /> : null}
    </Card>

    <View style={styles.pageHeader}>
      <AppText size={14} weight="bold">{t('pagesCaptured')} ({scanPages.length})</AppText>
      <AppText size={10} color="#77869D">{t('noPageLimit')}</AppText>
    </View>
    {scanPages.length ? <View style={styles.thumbRow}>{scanPages.map((page, index) => (
      <View key={page.id} style={styles.thumbWrap}>
        <Image source={{ uri: page.uri }} style={styles.thumbnail} />
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('deletePage')} ${index + 1}`} onPress={() => void deletePage(page.id)} style={styles.deleteThumb}>
          <AppText color="#FFFFFF" size={11} weight="bold">×</AppText>
        </Pressable>
        <AppText size={10} color="#71809A">{t('page')} {index + 1}</AppText>
      </View>
    ))}</View> : <Card style={styles.emptyPages}><AppText size={12} color="#71809A">{t('noPages')}</AppText></Card>}

    <ConfirmDialog
      visible={cancelOpen}
      title={t('discardCaptureTitle')}
      message={t('discardCaptureMessage')}
      cancelTitle={t('cancel')}
      confirmTitle={t('discardCapture')}
      danger
      onCancel={() => setCancelOpen(false)}
      onConfirm={() => { void cancelCapture(); }}
    />
  </Screen>;
}
