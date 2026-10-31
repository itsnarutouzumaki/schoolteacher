const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const app = JSON.parse(read('app.json'));
const packageJson = JSON.parse(read('package.json'));
const appConfig = JSON.parse(read('src/data/app-config.json'));
const shared = JSON.parse(fs.readFileSync(path.resolve(root, '..', 'shared/school-config.json'), 'utf8'));
const errors = [];
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

if (app.name !== 'GreenwoodTeacher') errors.push('app.json must retain the GreenwoodTeacher registration name.');
if (app.displayName !== appConfig.appName) errors.push('app.json displayName is out of sync with app-config.json; run npm run config:apply.');
if ('expo' in app) errors.push('Expo app configuration remains in app.json.');
if (packageJson.main !== 'index.js') errors.push('React Native CLI must use index.js as the app entry point.');
if (dependencies.expo || Object.keys(dependencies).some(name => name.startsWith('expo-'))) errors.push('Expo packages remain in package.json.');
for (const name of ['android', 'ios']) {
  if (!fs.existsSync(path.join(root, name))) errors.push(`The native ${name} project is missing.`);
}

const androidBuild = read('android/app/build.gradle');
const androidManifest = read('android/app/src/main/AndroidManifest.xml');
const androidStrings = read('android/app/src/main/res/values/strings.xml');
const iosProject = read('ios/GreenwoodTeacher.xcodeproj/project.pbxproj');
const iosPlist = read('ios/GreenwoodTeacher/Info.plist');
const index = read('index.js');
const iosIcons = JSON.parse(read('ios/GreenwoodTeacher/Images.xcassets/AppIcon.appiconset/Contents.json'));
const kotlinPackages = [];
const collectKotlinPackages = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectKotlinPackages(entryPath);
    else if (entry.isFile() && entry.name.endsWith('.kt')) {
      kotlinPackages.push(fs.readFileSync(entryPath, 'utf8').match(/^package\s+([\w$.]+)/m)?.[1]);
    }
  }
};
collectKotlinPackages(path.join(root, 'android/app/src/main/java'));
if (!androidBuild.includes(`applicationId "${appConfig.androidPackage}"`)) errors.push('Android applicationId is out of sync with app-config.json.');
if (!androidBuild.includes(`namespace "${appConfig.androidPackage}"`)) errors.push('Android namespace is out of sync with app-config.json.');
if (!kotlinPackages.length || kotlinPackages.some(packageName => packageName !== appConfig.androidPackage)) errors.push('Android source packages are out of sync with app-config.json.');
if (!androidManifest.includes('android.permission.CAMERA')) errors.push('Android camera permission is missing.');
if (!androidStrings.includes(`<string name="app_name">${appConfig.appName}</string>`)) errors.push('Android app label is out of sync with app-config.json.');
if (!iosProject.includes(`PRODUCT_BUNDLE_IDENTIFIER = ${appConfig.iosBundleIdentifier};`)) errors.push('iOS bundle identifier is out of sync with app-config.json.');
if (!iosPlist.includes(`<string>${appConfig.appName}</string>`)) errors.push('iOS display name is out of sync with app-config.json.');
if (!iosPlist.includes('NSCameraUsageDescription') || !iosPlist.includes('NSPhotoLibraryUsageDescription')) errors.push('iOS camera/photo permissions are missing.');
if (!index.includes('AppRegistry.registerComponent(appName, () => App)')) errors.push('React Native CLI app registration is missing.');
if (!shared.schoolId || !shared.school?.name || !shared.theme?.light) errors.push('The shared school configuration is incomplete.');
for (const icon of iosIcons.images) {
  if (icon.filename && !fs.existsSync(path.join(root, 'ios/GreenwoodTeacher/Images.xcassets/AppIcon.appiconset', icon.filename))) {
    errors.push(`Missing iOS app icon asset: ${icon.filename}`);
  }
}
for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
  const iconPath = `android/app/src/main/res/mipmap-${density}/ic_launcher.png`;
  if (!fs.existsSync(path.join(root, iconPath))) errors.push(`Missing Android launcher icon: ${iconPath}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`React Native CLI configuration checks passed (Android and iOS; React Native ${packageJson.dependencies['react-native']}).`);
