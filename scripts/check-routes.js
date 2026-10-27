const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const typeFile=fs.readFileSync(path.join(root,'src/types/index.ts'),'utf8');
const appFile=fs.readFileSync(path.join(root,'App.tsx'),'utf8');
const block=typeFile.match(/export type ScreenName\s*=([\s\S]*?);/);
if(!block) throw new Error('ScreenName union not found.');
const routes=[...block[1].matchAll(/'([A-Za-z0-9]+)'/g)].map(m=>m[1]);
const cases=new Set([...appFile.matchAll(/case\s+'([A-Za-z0-9]+)'/g)].map(m=>m[1]));
const grouped=new Set(['AttendanceSuccess','ResultSuccess']);
const missing=routes.filter(route=>!cases.has(route)&&!grouped.has(route));
const screenFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.tsx'))screenFiles.push(full);}}
walk(path.join(root,'src/screens'));
const badStyles=[];
for(const file of screenFiles){const rel=path.relative(root,file);if(/Screen\.tsx$/.test(file)||/Screen\.tsx/.test(file)){const companion=file.replace(/\.tsx$/,'.styles.ts');if(!fs.existsSync(companion))badStyles.push(path.relative(root,file));}}
if(missing.length||badStyles.length){if(missing.length)console.error('Routes not registered in App.tsx:',missing.join(', '));if(badStyles.length)console.error('Screens missing companion styles:',badStyles.join(', '));process.exit(1);}
console.log(`Route check passed: ${routes.length} routes registered; ${screenFiles.length} screens have companion styles.`);
