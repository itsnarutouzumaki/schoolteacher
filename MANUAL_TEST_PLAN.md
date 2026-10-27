# Teacher App Manual Test Plan

Use fictional sample data only. Current flows save locally in the running app and never call a backend.

## Start and navigation

1. Launch the app at Login. Confirm there is no sign-up page and login copy says demo mode/no account is authenticated.
2. Try a malformed mobile number and an empty password. Expect a toast; a valid-looking phone/password must still not authenticate.
3. Select **Explore UI demo** and confirm Home opens.
4. Open School Details, Teachers list, each teacher profile, Notifications, Profile, Edit Profile, Change Password, Help, Terms and Privacy. Confirm screen-back returns to the previous screen.
5. Open Profile > Logout. Cancel should retain the demo; confirm should return to Login. Android Back should pop nested screens, return from a non-Home demo root to Home, and not exit from Login.
6. Switch English/Hindi in Profile. Check screen labels, forms, validation, notifications and toast content. Seed notifications should display Hindi translations; newly created notice messages should re-render in the current language.

## Attendance

1. Home > Take Attendance. Verify only Class and Section are selectable and today is selected automatically.
2. Start Class 5 / Section A. Verify each card contains photo, roll number, student name, father’s name and unique Student ID.
3. Mark Present and Absent. Verify buttons are side-by-side, status updates, and each mark advances to the next student.
4. Swipe left/right to change student and correct a previously marked status.
5. Go to Review. Tap a row to change a status; try submit with unmarked students and verify it returns to the first unmarked student.
6. Mark all students, submit, and confirm a demo attendance summary and notification are shown. No server request should be represented as successful.

## Test results and scan

1. Home > Enter Test Results. Class, Section and Subject are dropdowns; Test Name is typed. Try advancing with any missing field.
2. Enter valid marks, then enter obtained marks larger than total or a zero total. Expect validation to prevent progress.
3. Go back and forward among students; verify each student’s own draft marks/remarks remain associated with their unique ID.
4. Open Scan Answer Copy. Confirm camera permission is requested before launching the native scanner. On a native development build, test multiple page scanning, detected/cropped page edges and no hard-coded page limit (within device limitations). Deny permission and verify the app explains the requirement and does not claim a scan succeeded. Cancel scanning and choose fallback camera if needed.
5. Use the in-app camera fallback: capture multiple pages without leaving the camera; verify thumbnails add automatically. Delete a page and verify it disappears.
6. Generate PDF preview and scroll from first page to last. Try Retry and confirm all captured pages and generated PDF are cleared before a new scan.
7. Submit PDF to the student draft; verify the local file URI/page count is attached without any server upload.
8. Complete the marks for every student, inspect Result Review, and submit. Open Previous Results > the new record; confirm average, maximum, highest, lowest, distribution chart, list sort by roll or marks, student detail, and answer-copy share/open behavior.

## Files and profile

1. Edit profile with valid/invalid name, email, mobile and experience values. Save should only update the local demo session.
2. Change Password with empty values, short password, mismatch, and a valid-looking set. Even the valid-looking set must clearly say the real password did not change.
3. Generate a PDF and use Share/Save. Confirm the OS share sheet is available, then cancel it. Confirm temporary print/page images are cleaned after attach/retry as expected.
4. Change the school name/theme/content in `src/data/school-config.json`; run `npm run config:apply`, `npm run config:check`, and verify branding. Icon/splash files need explicit asset replacement when white-labeling.
