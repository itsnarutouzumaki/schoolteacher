import type { ScanPage } from '../types';

export type DocumentScanResult = { status: 'success' | 'cancel'; pages: ScanPage[]; optimizationFailures: number };

export const MAX_SCAN_WIDTH = 1800;
export const SCANNED_IMAGE_QUALITY = 0.82;
let scanSequence = 0;

export function createScanPageId(source: 'camera' | 'document'): string {
  scanSequence += 1;
  return `${source}-${Date.now()}-${scanSequence}`;
}

export function normalizeScannerUri(uri: string): string {
  if (/^(file|content|https?):\/\//i.test(uri) || uri.startsWith('data:')) return uri;
  return uri.startsWith('/') ? `file://${uri}` : `file:///${uri.replace(/^\/+/, '')}`;
}

export function hasScannedImages(imageCount: number): boolean {
  return imageCount > 0;
}

export function appendScanPages(existing: ScanPage[], incoming: ScanPage[]): ScanPage[] {
  const ids = new Set(existing.map(page => page.id));
  return [...existing, ...incoming.filter(page => {
    if (ids.has(page.id)) return false;
    ids.add(page.id);
    return true;
  })];
}

export function removeScanPage(pages: ScanPage[], id: string): ScanPage[] {
  return pages.filter(page => page.id !== id);
}

async function optimizeImage(uri: string, id: string): Promise<ScanPage> {
  const sourceUri = normalizeScannerUri(uri);
  const imageResizer = await import('react-native-image-resizer');
  const fileSystem = await import('react-native-fs');
  const nativeImage = await import('react-native');
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    nativeImage.Image.getSize(sourceUri, (width, height) => resolve({ width, height }), reject);
  });
  if (dimensions.width <= 0 || dimensions.height <= 0) throw new Error('Captured image has invalid dimensions.');
  const width = Math.min(dimensions.width, MAX_SCAN_WIDTH);
  const height = Math.round(dimensions.height * width / dimensions.width);
  const output = await imageResizer.default.createResizedImage(
    sourceUri,
    width,
    height,
    'JPEG',
    Math.round(SCANNED_IMAGE_QUALITY * 100),
    0,
  );
  if (sourceUri.startsWith('file://') && sourceUri !== output.uri) {
    try { await fileSystem.default.unlink(sourceUri.replace(/^file:\/\//, '')); } catch { /* Native scanner cache cleanup is best effort. */ }
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
  if (!hasScannedImages(imagePaths.length)) return { status: 'cancel', pages: [], optimizationFailures: 0 };

  const pages: ScanPage[] = [];
  let optimizationFailures = 0;
  for (let index = 0; index < imagePaths.length; index += 1) {
    const imagePath = imagePaths[index];
    if (typeof imagePath !== 'string' || imagePath.trim() === '') continue;
    const id = createScanPageId('document');
    const page = await optimizeCapturedPhoto(imagePath, id);
    if (page.optimizationFailed) optimizationFailures += 1;
    pages.push(page);
  }
  return { status: pages.length ? 'success' : 'cancel', pages, optimizationFailures };
}

export async function optimizeCapturedPhoto(uri: string, id: string): Promise<ScanPage> {
  try {
    return await optimizeImage(uri, id);
  } catch {
    return { id, uri: normalizeScannerUri(uri), optimizationFailed: true };
  }
}
