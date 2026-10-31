const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const brand = JSON.parse(fs.readFileSync(path.join(root, 'src/data/app-config.json'), 'utf8'));
const appJsonPath = path.join(root, 'app.json');
const androidBuildPath = path.join(root, 'android/app/build.gradle');
const androidStringsPath = path.join(root, 'android/app/src/main/res/values/strings.xml');
const iosProjectPath = path.join(root, 'ios/GreenwoodTeacher.xcodeproj/project.pbxproj');
const iosPlistPath = path.join(root, 'ios/GreenwoodTeacher/Info.plist');
const androidJavaRoot = path.join(root, 'android/app/src/main/java');

if (!brand.appName || !brand.androidPackage || !brand.iosBundleIdentifier) {
  throw new Error('app-config.json must define appName, androidPackage and iosBundleIdentifier.');
}
if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(brand.androidPackage) ||
    !/^[A-Za-z0-9.-]+$/.test(brand.iosBundleIdentifier)) {
  throw new Error('app-config.json must contain valid Android package and iOS bundle identifiers.');
}

const updateFile = (filePath, transform) => {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, transform(content));
};
const xmlEscape = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}[character]));

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.displayName = brand.appName;
fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

updateFile(androidBuildPath, content => content
  .replace(/namespace\s+"[^"]+"/, `namespace "${brand.androidPackage}"`)
  .replace(/applicationId\s+"[^"]+"/, `applicationId "${brand.androidPackage}"`));
updateFile(androidStringsPath, content => content
  .replace(/(<string name="app_name">)[\s\S]*?(<\/string>)/, (_, before, after) => `${before}${xmlEscape(brand.appName)}${after}`));
updateFile(iosProjectPath, content => content
  .replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${brand.iosBundleIdentifier};`));
updateFile(iosPlistPath, content => content
  .replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[\s\S]*?(<\/string>)/, (_, before, after) => `${before}${xmlEscape(brand.appName)}${after}`));

const updateKotlinPackages = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) updateKotlinPackages(entryPath);
    else if (entry.isFile() && entry.name.endsWith('.kt')) {
      updateFile(entryPath, content => content.replace(/^package\s+[\w$.]+/m, `package ${brand.androidPackage}`));
    }
  }
};
updateKotlinPackages(androidJavaRoot);

console.log(`Updated native app names and identifiers from ${path.relative(root, path.join(root, 'src/data/app-config.json'))}.`);
