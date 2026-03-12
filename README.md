<div align="center">
<img src="assets/icon.png" width="120" alt="Waxwing logo" />

# Waxwing

A Starling Bank account viewer for Android, built for small "dumbphone" devices. Supports touch and D-pad/keypad navigation.

[<img src="https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/badge_obtainium.png" alt="Get it on Obtainium" height="60">](http://apps.obtainium.imranr.dev/redirect.html?r=obtainium://add/https://github.com/jakenvac/waxwing)

![Platform Support](https://img.shields.io/badge/platform-Android-green)
![React Native](https://img.shields.io/badge/React%20Native-0.83.2-61dafb)
![Expo](https://img.shields.io/badge/Expo-~55.0.6-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)

</div>

## ⚠️ Use at your own risk

This app was vibe coded and **deals directly with your banking credentials** (Starling Personal Access Tokens). Use it at your own risk. No warranty is provided, express or implied.

A core goal of this app is to **never enable money to leave your bank account**. Moving money between your main balance and savings goals (within the same account) is supported and intentional, but sending money to any external account or payee is not a feature and never will be.

Your tokens are stored encrypted on-device using the Android Keystore via `expo-secure-store`. They are never transmitted anywhere other than directly to the official Starling Bank API (`https://api.starlingbank.com`).

## Features

- View balances across multiple Starling accounts (one Personal Access Token per account)
- Transaction feed with debit/credit colouring and relative timestamps
- Savings goals — view balances, progress, and transaction history
- Move money between your main balance and savings goals
- Supports small screens (480×640 minimum) and D-pad/keypad navigation
- Dark purple theme optimised for low-power displays

## Installation

### Option 1: Obtainium (Recommended)

[Obtainium](https://github.com/ImranR98/Obtainium) installs and auto-updates apps directly from GitHub releases.

1. Install Obtainium from [F-Droid](https://f-droid.org/packages/dev.imranr.obtainium.fdroid/) or [GitHub](https://github.com/ImranR98/Obtainium/releases)
2. Tap the badge above on your Android device, or add `https://github.com/jakenvac/waxwing` manually in Obtainium

### Option 2: Direct APK

1. Go to the [Releases page](https://github.com/jakenvac/waxwing/releases)
2. Download the latest `waxwing-vX.X.X.X.apk`
3. Install on your Android device (you may need to enable "Install from Unknown Sources")

Nightly builds are also available on the releases page.

## Setup

1. Generate a Personal Access Token from the [Starling Bank developer dashboard](https://developer.starlingbank.com/personal/token)
2. Open Waxwing and tap the add account button
3. Paste your token — the app will verify it and link your account

One token = one account. Add multiple tokens to view multiple accounts.

## Security notes

- Tokens are stored using `expo-secure-store` backed by the Android Keystore
- The app communicates only with `https://api.starlingbank.com`
- No analytics, no telemetry, no third-party SDKs

## For developers

### Prerequisites

- Node.js 18+ and npm
- Android Studio with SDK 23+

### Setup

```bash
git clone https://github.com/jakenvac/waxwing.git
cd waxwing
npm install
npm run android
```

First run will take several minutes while Expo builds the native Android app locally.

### Type checking

```bash
npx tsc --noEmit
```

### Building a signed release

The project uses a custom Expo config plugin (`plugins/withAndroidSigning.js`) to configure release signing. CI expects the following GitHub Actions secrets:

| Secret | Description |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.keystore` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

Releases are triggered by pushing a `v*` tag. Nightly builds run at 2 AM UTC daily.

## License

MIT
