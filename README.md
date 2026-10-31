# Greenwood Teacher App

React Native CLI teacher-facing prototype for Greenwood International School. The app uses local JSON seed data. It does **not** connect to a backend, authenticate real teachers, or permanently save records.

## Requirements

- Node.js **22.11 or newer**.
- npm.
- Android Studio, Android SDK, and JDK 17 for Android builds.
- macOS and Xcode for iOS builds and CocoaPods installation.

## Install and run

```bash
npm install
npm run verify
npm start
```

In another terminal, run `npm run android` or, on macOS, `npm run ios`. Native modules are auto-linked by the React Native CLI. For iOS, run `cd ios && pod install` after installing dependencies and whenever native dependencies change.

This is a bare React Native CLI project; Expo and Expo Go are not used. Native Android and iOS projects live in `android/` and `ios/`.

The on-device document scanner uses `react-native-document-scanner-plugin` for multi-page edge detection and cropping. If the scanner is unavailable, the manual fallback opens the native camera capture UI. Captured images are compressed to JPEG and downscaled to at most 1800px wide before local PDF generation. The app uses native image crop/picker, file access, PDF generation, and share-sheet modules.

Windows supports Android development. iOS builds and CocoaPods require macOS with Xcode.

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
- `../shared/school-config.json`: shared school identity, theme, academic defaults, media metadata and supported languages.
- `src/config/schoolConfig.ts`: typed access to the shared JSON; Metro is configured to watch the repository-level `shared/` directory.
- `src/data/app-config.json`: teacher-app-specific display name, version and native identifiers.
- `src/data/teacher-mock-data.json`: teacher, class lists, 74 fictional students, schedules, notifications and previous result sets.
- `src/services/mockTeacherRepository.ts`: read-only mock-data adapter.
- `src/services/teacherService.ts`: local business rules and validations.
- `src/services/teacherApi.contract.ts`: typed future backend boundary; there is deliberately no fake API implementation.
- `src/services/pdfService.ts`: local PDF creation, temporary-file cleanup, and OS share/save flow.
- `scripts/**`: syntax, import, route/style, translation, data, logic and native project checks.

## School branding

Edit `../shared/school-config.json` for school-wide static settings. Edit `src/data/app-config.json` only for teacher-app identity and native identifiers. Then run:

```bash
npm run config:apply
npm run config:check
```

This synchronizes the app-specific display name and Android/iOS identifiers in the native projects. The supplied logo is bundled directly in the UI and in the committed native launcher assets for both apps.

## Verification

```bash
npm run verify
```

This runs static syntax checks, local-import checks, registered-route and style-companion checks, EN/HI translation-key checks, mock-data checks, logic smoke tests, native project and package checks, and TypeScript type checking. Native/device checks should also be completed on a real phone because camera/scanner behavior cannot be proven by static checks.

## Demo limitations (important)

- Login form validates its input format but never authenticates. Use **Explore UI demo** to open the home screen.
- Attendance submissions, result sets, profile changes and notifications exist only in in-memory demo state and are lost when the app process is restarted.
- The password form validates input but does not change a password.
- The native scanner's image capture, edge detection/cropping and generated PDF use the device locally. The app keeps any returned pages, including partial scans when the native module reports cancellation. Attaching a PDF adds its local file URI to the current demo draft; it does not upload it or persist the draft across restarts. The temporary generated file remains in app documents storage until the app replaces or retries the scan, or the user clears app data.
- Names, student IDs, scores, photos, school information and historical results are sample data. Do not capture real student documents into this prototype.
