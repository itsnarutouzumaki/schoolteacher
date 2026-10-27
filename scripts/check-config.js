const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const errors=[];if(app.orientation!=='portrait')errors.push('Teacher app must be portrait locked.');
for(const key of ['icon','splash'])if(!fs.existsSync(path.resolve(root,app[key]?.image||app[key]||'')))errors.push(`Missing Expo asset for ${key}: ${app[key]?.image||app[key]}`);
const fg=app.android?.adaptiveIcon?.foregroundImage;if(!fg||!fs.existsSync(path.resolve(root,fg)))errors.push('Android adaptive icon foreground image is missing.');
const ni=app.notification?.icon;if(!ni||!fs.existsSync(path.resolve(root,ni)))errors.push('Notification icon asset is missing.');
for(const plugin of app.plugins||[]){const name=Array.isArray(plugin)?plugin[0]:plugin;if(name==='expo-camera'&&!pkg.dependencies['expo-camera'])errors.push('Camera plugin exists without expo-camera dependency.');if(name==='expo-image-picker'&&!pkg.dependencies['expo-image-picker'])errors.push('Image picker plugin exists without dependency.');if(name==='react-native-document-scanner-plugin'&&!pkg.dependencies['react-native-document-scanner-plugin'])errors.push('Document scanner config plugin exists without its dependency.');}
const docScanner=(app.plugins||[]).some(plugin=>(Array.isArray(plugin)?plugin[0]:plugin)==='react-native-document-scanner-plugin');if(!docScanner)errors.push('On-device document scanner config plugin is missing.');
if(app.name!==JSON.parse(fs.readFileSync(path.join(root,'src/data/school-config.json'),'utf8')).app.appName)errors.push('App name in app.json is out of sync with school-config.json; run npm run config:apply.');
if(!pkg.dependencies.expo?.startsWith('~57.')||!pkg.dependencies['react-native']?.startsWith('0.86.'))errors.push('Dependency set does not match pinned Expo SDK 57 / RN 0.86 baseline.');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`Expo config assets and SDK family checks passed (${app.orientation}; ${pkg.dependencies.expo}; React Native ${pkg.dependencies['react-native']}).`);
