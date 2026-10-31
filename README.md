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

## Push notifications

The teacher app uses Firebase Cloud Messaging (FCM) for remote delivery, Notifee for Android channels/local display and notification interactions, and local storage to preserve received push records and pending device-token registration. The Notifications screen includes permission and local-test controls, so the notification bar, channel sound, tap routing, and in-app record flow can be exercised before Firebase or backend services are configured.

Remote delivery is intentionally disabled until the school Firebase project is configured:

- Android: place the project's `google-services.json` at `android/app/google-services.json`. The file is ignored by Git and the Google Services Gradle plugin is applied only when it exists.
- iOS: add the project's `GoogleService-Info.plist` to the `GreenwoodTeacher` target's Copy Bundle Resources. The file is ignored by Git. Configure the matching APNs key in Firebase and enable Push Notifications for the Apple App ID. The Xcode target includes the APNs entitlement and remote-notification background mode.
- After changing native dependencies or adding Firebase configuration, rebuild the native app. On macOS, run `cd ios && pod install` before an iOS build.
- Android creates the `teacher_updates` high-importance channel with the bundled `teacher_notification.wav` sound and the monochrome app icon. Android channel sound/importance are controlled by the user after channel creation; changing channel sound requires a new channel ID or resetting the app's channel data.
- Notification permission is requested from the Notifications screen rather than unexpectedly during login. Android 13+ uses `POST_NOTIFICATIONS`; iOS uses the system alert/badge/sound authorization.

### Backend registration contract

`src/services/teacherApi.contract.ts` defines `registerNotificationDevice({ token, platform })` and `unregisterNotificationDevice(token)`. The FCM token is kept locally as pending until an authenticated API adapter successfully registers it. Call `registerPendingDeviceToken(api)` after real teacher authentication and whenever the app resumes after authentication; the helper clears the pending token only after the backend confirms success. Token refreshes replace the locally pending token. The current app has demo-only login and no authenticated API adapter, so it does not send tokens or claim a server registration.

A suitable backend contract is:

- `POST /api/teacher/notification-devices`, authenticated, JSON body `{ "token": "<FCM token>", "platform": "android" | "ios" }`, returning success only after the device is associated with the authenticated teacher.
- `DELETE /api/teacher/notification-devices`, authenticated, JSON body `{ "token": "<FCM token>" }`, for logout/unregister.

Implement those methods in the real API adapter; never put Firebase service-account credentials in the mobile app. The backend must use FCM HTTP v1 with server-side credentials.

### FCM message payload

Send a visible `notification` title/body (the title is the subject) and matching string-valued `data` fields. `eventId` is the stable deduplication key. The frontend accepts `subject`/`message` as data-only fallbacks, and restricts navigation destinations to supported teacher screens. Optional `routeParams` must be a JSON-encoded object.

```json
{
  "message": {
    "token": "<registered-device-token>",
    "notification": {
      "title": "Class 5 attendance",
      "body": "Attendance is due by 9:00 AM."
    },
    "data": {
      "eventId": "attendance-2026-10-31-class-5-a",
      "type": "attendance",
      "subject": "Class 5 attendance",
      "message": "Attendance is due by 9:00 AM.",
      "route": "AttendanceSetup",
      "routeParams": "{}"
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "teacher_updates",
        "icon": "ic_stat_notification"
      }
    },
    "apns": {
      "payload": {
        "aps": {
          "sound": "teacher_notification.wav"
        }
      }
    }
  }
}
```

Background/quit-state Android notification messages are displayed by FCM using the pre-created channel; foreground messages are displayed by Notifee. Data-only background messages are also handled and displayed locally, subject to OS delivery limits. Taps from either path are deduplicated and routed to the requested supported screen (or Notifications by default), and push records are merged with the in-app notification list and persisted on-device. iOS delivery additionally depends on APNs configuration and device permission. OS force-stop/force-quit policies and user-disabled channels/permissions can prevent delivery or sound.

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
- `src/services/notificationService.ts`: permissions, FCM listeners/token handling, channel setup, local display and tap events.
- `src/services/notificationPayload.ts` and `src/services/notificationStore.ts`: payload validation, route allowlist, deduplication, and persisted push history/pending token/open action.
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

## Notification manual tests

1. Install a native build on a physical Android device and open Notifications. Use **Enable notifications** and verify the Android permission prompt/status. On iOS, use a physical device for APNs token verification.
2. Select **Send test notification**. Verify the OS notification title and body, the Greenwood chime, and the `School updates` channel in Android notification settings. Tap it and confirm the Notifications screen opens and the in-app record is marked read.
3. Background the app and repeat the local test. Tap the alert and verify navigation. Force-stop is not equivalent to a normal quit on Android; it can block pushes until the app is opened again.
4. With Firebase config and an authenticated backend, register the pending token through the API contract and send the documented FCM v1 payload while foregrounded, backgrounded, and after swiping the app away. Verify one alert per `eventId`, correct title/body, sound, tap route, unread count, and persisted history.
5. Test denied permission, disabled Android channel sound, duplicate `eventId`, missing/invalid `route`, and token refresh. A denied permission or a user-muted channel must not be reported as successfully alerting.

The local test verifies the phone's notification display and sound without backend access; it does not simulate FCM delivery, APNs, or server token registration. Those final end-to-end checks require Firebase app configuration, APNs credentials for iOS, and the authenticated backend API.

## Demo limitations (important)

- Login form validates its input format but never authenticates. Use **Explore UI demo** to open the home screen.
- Attendance submissions, result sets and profile changes exist only in in-memory demo state and are lost when the app process is restarted. Seeded notifications are demo content; received push records are persisted locally and are not yet synchronized to a server.
- The password form validates input but does not change a password.
- The native scanner's image capture, edge detection/cropping and generated PDF use the device locally. The app keeps any returned pages, including partial scans when the native module reports cancellation. Attaching a PDF adds its local file URI to the current demo draft; it does not upload it or persist the draft across restarts. The temporary generated file remains in app documents storage until the app replaces or retries the scan, or the user clears app data.
- Names, student IDs, scores, photos, school information and historical results are sample data. Do not capture real student documents into this prototype.
