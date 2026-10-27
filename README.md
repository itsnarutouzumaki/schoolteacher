# Greenwood Teacher App

React Native + Expo teacher-facing prototype for Greenwood International School. This repository is UI-first and uses local JSON seed data. It does **not** connect to a backend, authenticate real teachers, or permanently save records.

## Requirements

- Node.js **22.13 or newer** (Expo SDK 57 requirement).
- npm.
- For the native document scanner: Android Studio + Android SDK/JDK for Android, or macOS + Xcode for iOS.

## Install and run

```bash
npm install
npx expo install --fix
npm run verify
npm run android
```

`npm run android` builds and launches the native Android app. To use iOS, run `npm run ios` on macOS. For Metro only, run `npm start` after the native development app is installed.

The built-in document scanner uses `react-native-document-scanner-plugin` for on-device edge detection/cropping. It **does not run inside Expo Go**; use the `expo run:android` / `expo run:ios` development build path. Before invoking the native scanner, the app requests camera permission because `expo-camera` also declares the Android camera permission. The native scanner can return multiple pages in one session; no numeric page cap is configured. Captured images are compressed to JPEG and downscaled to at most 1800px wide for local PDF generation. Expo Go can be used to inspect most screens and the in-app camera fallback, but automatic edge detection/cropping requires the native build.

If dependency installation fails due to network/DNS restrictions, retry `npm install` from a machine that can access the npm registry. Do not remove or upgrade Expo/RN packages blindly; SDK 57 targets React Native 0.86, React 19.2.3 and Node 22.13+.

## Main flows

- Teacher login UI and forgot-password information (login intentionally does not authenticate real credentials).
- Home screen with school branding, teacher overview, today’s classes and three actions: Take Attendance, Enter Test Results, See Previous Results.
- Attendance: choose class/section, mark every student using portrait cards and left/right swipe, review statuses, and create a local demo record.
- Results: choose class, section, subject and type test name; enter each student’s marks and optional remarks; optionally scan an answer copy; review and add a local result set.
- On-device answer-copy scanning: native document scanner on Android/iOS, unlimited page capture (within device/platform resources), PDF generation and page-by-page preview, retry and local attach/share. No scan is uploaded to a server.
- Previous results: analytics, mark distribution, and roll-number or obtained-marks sorting.
- Notifications, bilingual profile, profile edit, password-change validation, school information, teacher directory, help, terms, privacy, and confirmed logout.

## Architecture

- `App.tsx`, `src/types`, and `src/navigation`: screen registry and typed navigation.
- `src/screens/**`: screen components, each with companion `.styles.ts`.
- `src/components/**`: shared UI, screen shell, bottom navigation, dialogs and toast host.
- `src/theme.ts`: shared theme tokens.
- `src/i18n`: centralized English/Hindi translations.
- `src/data/school-config.json`: school branding, about content, photos/videos and theme.
- `src/data/teacher-mock-data.json`: teacher, class lists, 74 fictional students, schedules, notifications and previous result sets.
- `src/services/mockTeacherRepository.ts`: read-only mock-data adapter.
- `src/services/teacherService.ts`: local business rules and validations.
- `src/services/teacherApi.contract.ts`: typed future backend boundary; there is deliberately no fake API implementation.
- `src/services/pdfService.ts`: local PDF creation, temporary-file cleanup, and OS share/save flow.
- `scripts/**`: syntax, import, route/style, translation, data, logic and Expo config checks.

## School branding

Edit `src/data/school-config.json`. Then run:

```bash
npm run config:apply
npm run config:check
```

This synchronizes the native app name, slug and Android/iOS identifiers. Replacing the included icon/adaptive-icon/splash/notification image files is a separate design step when white-labeling the app.

## Verification

```bash
npm run verify
```

This runs static syntax checks, local-import checks, registered-route and style-companion checks, EN/HI translation-key checks, mock-data checks, logic smoke tests, Expo asset/dependency checks, and TypeScript type checking. Type/device checks require a successful dependency installation and should also be completed on a real phone because camera/scanner behavior cannot be proven by static checks.

## Demo limitations (important)

- Login form validates its input format but never authenticates. Use **Explore UI demo** to open the home screen.
- Attendance submissions, result sets, profile changes and notifications exist only in in-memory demo state and are lost when the app process is restarted.
- The password form validates input but does not change a password.
- The native scanner's image capture, edge detection/cropping and generated PDF use the device locally. The app keeps any returned pages, including partial scans when the native module reports cancellation. Attaching a PDF adds its local file URI to the current demo draft; it does not upload it or persist the draft across restarts. The temporary generated file remains in app documents storage until the app replaces or retries the scan, or the user clears app data.
- Names, student IDs, scores, photos, school information and historical results are sample data. Do not capture real student documents into this prototype.
