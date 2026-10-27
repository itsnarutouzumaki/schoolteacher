const fs=require('fs'),path=require('path');
const file=fs.readFileSync(path.resolve(__dirname,'../src/i18n/translations.ts'),'utf8');
const enBlock=file.match(/export const en = \{([\s\S]*?)\} as const;/)?.[1];
const hiBlock=file.match(/export const hi: Record<TranslationKey, string> = \{([\s\S]*?)\n\};/)?.[1];
if(!enBlock||!hiBlock)throw new Error('Could not parse language dictionaries.');
const keys=block=>new Set([...block.matchAll(/(?:^|,)\s*([A-Za-z][A-Za-z0-9]*):\s*'/gm)].map(m=>m[1]));
const en=keys(enBlock),hi=keys(hiBlock);const missingHi=[...en].filter(k=>!hi.has(k)),extraHi=[...hi].filter(k=>!en.has(k));
const calls=fs.readdirSync(path.resolve(__dirname,'../src'),{withFileTypes:true});
if(missingHi.length||extraHi.length){console.error('Missing Hindi keys:',missingHi,'Extra Hindi keys:',extraHi);process.exit(1);}
const srcRoot=path.resolve(__dirname,'../src');const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(e.name)&&!e.name.endsWith('translations.ts'))files.push(p);}}walk(srcRoot);
const missing=[];for(const p of files){const s=fs.readFileSync(p,'utf8');for(const m of s.matchAll(/\bt\(['"]([A-Za-z0-9]+)['"]/g)){if(!en.has(m[1]))missing.push(`${path.relative(srcRoot,p)} uses missing key ${m[1]}`);}}
if(missing.length){console.error(missing.join('\n'));process.exit(1);}
console.log(`Localization keys match: ${en.size} English and Hindi keys; scanned ${files.length} source files for missing t() keys.`);
