const fs = require('fs');
const path = require('path');
let ts;
try { ts = require('typescript'); }
catch { try { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); } catch { throw new Error('Install project dependencies before syntax checking (TypeScript is missing).'); } }
const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory() && !['node_modules','.git'].includes(entry.name)) walk(full); else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) files.push(full); } }
walk(root);
let errors = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } });
  const diagnostics = result.diagnostics || [];
  for (const item of diagnostics) {
    if (item.category !== ts.DiagnosticCategory.Error) continue;
    errors += 1;
    const msg = ts.flattenDiagnosticMessageText(item.messageText, '\n');
    const pos = item.file && item.start != null ? item.file.getLineAndCharacterOfPosition(item.start) : { line:0,character:0 };
    console.error(`${path.relative(root,file)}:${pos.line+1}:${pos.character+1} ${msg}`);
  }
}
console.log(`Parsed ${files.length} TypeScript/TSX files; ${errors} syntax diagnostics.`);
if (errors) process.exit(1);
