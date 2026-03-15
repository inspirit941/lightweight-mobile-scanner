
# Android Document Scanner MVP

Android-first document scanner built with Expo development builds and a native Android scanner plugin. The flow is single scan to review to PDF to share.

## Prerequisites (Android only)

- Node.js (LTS recommended)
- JDK (17+)
- Android Studio with Android SDKs installed
- Android emulator or a physical Android device

## Setup

1. Install dependencies.

```bash
npm install
```

2. Generate native Android project files.

```bash
npx expo prebuild --platform android --no-install
```

## Build and install (local)

1. Build and run a local release build on a connected device or emulator.

```bash
npx expo run:android --variant release
```

2. If you need the APK for manual install, use the output at `android/app/build/outputs/apk/release/app-release.apk`.

## Manual verification checklist (Android device)

- Native scanner launch opens and returns a corrected scan.
- Perspective correction is applied before the review screen.
- Single-page flow keeps only one page per scan session.
- Both presets render and can be selected: `Original` and `B&W Scan`.
- PDF generation completes and saves a non-empty PDF locally.
- Share action opens the native share sheet for the generated PDF.

## Out of scope

- iOS workflows or builds
- Expo Go runtime
- Any capture or export features beyond the Android single-page flow described above
