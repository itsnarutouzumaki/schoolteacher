import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { C } from '../theme';

export type ScanPageForPdf = { id: string; uri: string; width?: number; height?: number };

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char] || char));
const safeFileName = (value: string) => value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Answer_Copy';
const filePathFromUri = (uri: string) => decodeURIComponent(uri.replace(/^file:\/\//, ''));
const fileUriFromPath = (path: string) => path.startsWith('file://') ? path : `file://${path}`;

export async function cleanupLocalFiles(uris: string[]) {
  await Promise.all(uris.filter(uri => uri && /^(file|content):\/\//i.test(uri)).map(async uri => {
    try {
      const path = filePathFromUri(uri);
      if (await RNFS.exists(path)) await RNFS.unlink(path);
    } catch { /* cache cleanup is best-effort */ }
  }));
}

export async function createAnswerCopyPdf(pages: ScanPageForPdf[], title: string) {
  if (!pages.length) throw new Error('Capture at least one page before generating a PDF.');
  const base64Pages: string[] = [];
  for (const page of pages) {
    if (!page.uri) throw new Error('One captured page is missing its local file.');
    const base64 = await RNFS.readFile(filePathFromUri(page.uri), 'base64');
    const mime = page.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    base64Pages.push(`<section><img src="data:${mime};base64,${base64}" alt="Scanned answer sheet page" /></section>`);
  }
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>
  @page { size: A4; margin: 12mm; } body { margin:0; color:${C.text}; font-family:Arial,sans-serif; }
  h1 {font-size:15px; text-align:center; margin:0 0 10px;} section { page-break-after: always; break-after: page; height: 255mm; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  section:last-child { page-break-after:auto; break-after:auto; } img { width:100%; height:100%; object-fit:contain; }
  </style></head><body><h1>${escapeHtml(title)}</h1>${base64Pages.join('')}</body></html>`;
  const result = await generatePDF({
    html,
    fileName: `${safeFileName(title)}_${Date.now()}`,
    directory: 'Documents',
    width: 595,
    height: 842,
    padding: 24,
  });
  if (!result.filePath) throw new Error('PDF generation did not return a local file.');
  return fileUriFromPath(result.filePath);
}

export async function sharePdf(uri: string, title: string) {
  if (!uri) throw new Error('No local PDF file is available.');
  await Share.open({
    url: fileUriFromPath(uri),
    type: 'application/pdf',
    title,
    failOnCancel: false,
  });
}
