const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); }
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (loadedModule, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, resolveJsonModule: true, esModuleInterop: true } }).outputText;
  loadedModule._compile(compiled, filename);
};
const scanner = require(path.join(root, 'src/services/documentScannerService.ts'));
assert.equal(scanner.normalizeScannerUri('/data/user/0/app/cache/scan.jpg'), 'file:///data/user/0/app/cache/scan.jpg');
assert.equal(scanner.normalizeScannerUri('file:///tmp/scan.jpg'), 'file:///tmp/scan.jpg');
assert.equal(scanner.normalizeScannerUri('content://media/document/1'), 'content://media/document/1');
assert.equal(scanner.normalizeScannerUri('scan.jpg'), 'file:///scan.jpg');
assert.equal(scanner.hasScannedImages(4), true, 'keep captured pages if a platform returns them with a cancellation status');
assert.equal(scanner.hasScannedImages(0), false);
assert.equal(scanner.MAX_SCAN_WIDTH, 1800);
assert(scanner.SCANNED_IMAGE_QUALITY >= 0.7 && scanner.SCANNED_IMAGE_QUALITY <= 1);
const src = fs.readFileSync(path.join(root, 'src/services/documentScannerService.ts'), 'utf8');
assert(src.includes("import('react-native-document-scanner-plugin')"), 'native scanner must be dynamically loaded for Expo Go fallback');
assert(!src.includes('maxNumDocuments:'), 'scanner must not impose a fixed page limit');
const screen = fs.readFileSync(path.join(root, 'src/screens/results/ScannerScreen.tsx'), 'utf8');
assert(screen.includes('requestPermission()'), 'camera permission must be requested before opening native scanner');
assert(screen.includes('captureDocumentPages()'), 'scanner screen must call the native scanner service');
assert(screen.includes('setManualMode(true)'), 'scanner screen must provide a camera fallback');
console.log('Scanner checks passed: URI normalization, cancellation, optimized output bounds, multi-page no-cap, permission request and Expo Go fallback.');
