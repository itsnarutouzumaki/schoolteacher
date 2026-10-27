const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'src/data/school-config.json');
const appJsonPath = path.join(root, 'app.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const brand = config.app || {};
const expo = appJson.expo;
if (!brand.appName || !brand.appSlug || !brand.androidPackage || !brand.iosBundleIdentifier) {
  throw new Error('school-config.json must define appName, appSlug, androidPackage and iosBundleIdentifier.');
}
expo.name = brand.appName;
expo.slug = brand.appSlug;
expo.android = { ...(expo.android || {}), package: brand.androidPackage };
expo.ios = { ...(expo.ios || {}), bundleIdentifier: brand.iosBundleIdentifier };
fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
console.log(`Updated Expo name/slug/bundle IDs from ${path.relative(root, configPath)}.`);
