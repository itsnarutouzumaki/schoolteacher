const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = [];
const missing = [];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.png', '.jpg', '.jpeg', '.webp'];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.expo', '.git'].includes(entry.name)) walk(full);
    else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
  }
}
function resolves(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return true;
  if (extensions.some(extension => fs.existsSync(base + extension))) return true;
  return ['index.ts', 'index.tsx', 'index.js', 'index.json'].some(name => fs.existsSync(path.join(base, name)));
}
walk(root);
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const specs = [...source.matchAll(/(?:from\s*|import\s*\(|require\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g)].map(match => match[2]);
  for (const spec of specs) {
    const absolute = path.resolve(path.dirname(file), spec);
    if (!resolves(absolute)) missing.push(`${path.relative(root, file)} -> ${spec}`);
  }
}
if (missing.length) {
  console.error(`Unresolved local imports (${missing.length}):\n${missing.join('\n')}`);
  process.exit(1);
}
console.log(`Local import check passed: ${files.length} source/config files scanned.`);
