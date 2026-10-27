import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type ScanPageForPdf = { id: string; uri: string; width?: number; height?: number };

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char] || char));
const safeFileName = (value: string) => value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Answer_Copy';

export async function cleanupLocalFiles(uris: string[]) {
  await Promise.all(uris.filter(uri => uri && /^(file|content):\/\//i.test(uri)).map(async uri => {
    try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { /* cache cleanup is best-effort */ }
  }));
}

export async function createAnswerCopyPdf(pages: ScanPageForPdf[], title: string) {
  if (!pages.length) throw new Error('Capture at least one page before generating a PDF.');
  if (!FileSystem.documentDirectory) throw new Error('This device did not provide local document storage.');
  const base64Pages: string[] = [];
  for (const page of pages) {
    if (!page.uri) throw new Error('One captured page is missing its local file.');
    const base64 = await FileSystem.readAsStringAsync(page.uri, { encoding: FileSystem.EncodingType.Base64 });
    const mime = page.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    base64Pages.push(`<section><img src="data:${mime};base64,${base64}" alt="Scanned answer sheet page" /></section>`);
  }
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>
  @page { size: A4; margin: 12mm; } body { margin:0; color:#16233A; font-family:Arial,sans-serif; }
  h1 {font-size:15px; text-align:center; margin:0 0 10px;} section { page-break-after: always; break-after: page; height: 255mm; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  section:last-child { page-break-after:auto; break-after:auto; } img { width:100%; height:100%; object-fit:contain; }
  </style></head><body><h1>${escapeHtml(title)}</h1>${base64Pages.join('')}</body></html>`;
  const result = await Print.printToFileAsync({ html, base64: false, margins: { top: 24, bottom: 24, left: 24, right: 24 } });
  if (!result.uri) throw new Error('PDF generation did not return a local file.');
  const name = `${safeFileName(title)}_${Date.now()}.pdf`;
  const permanentUri = `${FileSystem.documentDirectory}${name}`;
  await FileSystem.copyAsync({ from: result.uri, to: permanentUri });
  await cleanupLocalFiles([result.uri]);
  return permanentUri;
}

export async function sharePdf(uri: string, title: string) {
  if (!uri) throw new Error('No local PDF file is available.');
  if (!(await Sharing.isAvailableAsync())) throw new Error('The system share sheet is unavailable on this device.');
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title, UTI: 'com.adobe.pdf' });
}
