import type { ScanPage } from '../types';

export type DocumentScanResult = { status: 'success' | 'cancel'; pages: ScanPage[] };

export const MAX_SCAN_WIDTH = 1800;
export const SCANNED_IMAGE_QUALITY = 0.82;

export function normalizeScannerUri(uri: string): string {
  if (/^(file|content|https?):\/\//i.test(uri) || uri.startsWith('data:')) return uri;
  return uri.startsWith('/') ? `file://${uri}` : `file:///${uri.replace(/^\/+/, '')}`;
}

export function hasScannedImages(imageCount: number): boolean {
  return imageCount > 0;
}

async function optimizeImage(uri: string, id: string): Promise<ScanPage> {
  const sourceUri = normalizeScannerUri(uri);
  const imageManipulator = await import('expo-image-manipulator');
  const nativeImage = await import('react-native');
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    nativeImage.Image.getSize(sourceUri, (width, height) => resolve({ width, height }), reject);
  });
  const actions = dimensions.width > MAX_SCAN_WIDTH ? [{ resize: { width: MAX_SCAN_WIDTH } }] : [];
  const output = await imageManipulator.manipulateAsync(sourceUri, actions, {
    compress: SCANNED_IMAGE_QUALITY,
    format: imageManipulator.SaveFormat.JPEG,
  });
  if (sourceUri.startsWith('file://') && sourceUri !== output.uri) {
    const fileSystem = await import('expo-file-system/legacy');
    try { await fileSystem.deleteAsync(sourceUri, { idempotent: true }); } catch { /* Native scanner cache cleanup is best effort. */ }
  }
  return { id, uri: output.uri, width: output.width, height: output.height };
}

export async function captureDocumentPages(): Promise<DocumentScanResult> {
  const scannerPackage = await import('react-native-document-scanner-plugin');
  const response = await scannerPackage.default.scanDocument({
    croppedImageQuality: 92,
    // maxNumDocuments is intentionally omitted. The native scanner can capture multiple pages;
    // its practical limit is device storage/memory rather than a hard-coded page count.
  });
  const imagePaths = Array.isArray(response.scannedImages) ? response.scannedImages : [];
  // Preserve partial scans if a platform reports cancellation after returning captured pages.
  if (!hasScannedImages(imagePaths.length)) return { status: 'cancel', pages: [] };

  const pages: ScanPage[] = [];
  for (let index = 0; index < imagePaths.length; index += 1) {
    const imagePath = imagePaths[index];
    if (typeof imagePath !== 'string' || imagePath.trim() === '') continue;
    pages.push(await optimizeCapturedPhoto(imagePath, `scan-${Date.now()}-${index}`));
  }
  return { status: pages.length ? 'success' : 'cancel', pages };
}

export async function optimizeCapturedPhoto(uri: string, id: string): Promise<ScanPage> {
  try {
    return await optimizeImage(uri, id);
  } catch {
    return { id, uri: normalizeScannerUri(uri) };
  }
}
