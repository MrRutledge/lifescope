# LifeScope — Digital Life Dashboard

An Android-first mobile app that gives you a unified view of how you spend your time — digitally and physically. Built with Expo and React Native.

---

## Features

- **Overview** — daily snapshot of screen time, steps, sleep, and heart rate at a glance
- **Screen Time** — weekly bar chart, breakdown by app category, and top apps list
- **Health** — ring progress for steps/sleep/activity, weekly trends, and a hydration tracker you can log manually with a custom daily goal
- **Calendar** — time breakdown by event type and a full view of today's events
- **Trends** — week-over-week comparison (screen time, sleep, steps, active minutes) and 30-day averages
- **Health Connect** — tap one button to connect real data from Samsung Health, Google Fit, or any app that syncs to Android Health Connect. No API keys required.
- **Sample data** — works out of the box with 30 days of realistic generated data. No account or login needed.
- **Dark / light mode** — follows your system preference automatically

---

## Screenshots

| Overview | Screen Time | Health | Calendar | Trends |
|----------|-------------|--------|----------|--------|
| Daily summary with key metrics | Weekly usage chart and category breakdown | Ring charts, sleep bars, hydration tracker | Event schedule and time breakdown | Week-over-week deltas and 30-day trends |

---

## Tech Stack

- [Expo](https://expo.dev) (SDK 54, managed workflow)
- [Expo Router](https://expo.github.io/router) — file-based navigation
- [React Native](https://reactnative.dev) 0.81
- [React Native Health Connect](https://github.com/matinzd/react-native-health-connect) — Android Health Connect integration
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — local hydration and health cache
- [React Native SVG](https://github.com/software-mansion/react-native-svg) — ring progress charts
- [Inter font](https://fonts.google.com/specimen/Inter) via `@expo-google-fonts/inter`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

### Install dependencies

```bash
pnpm install
```

### Run locally

```bash
pnpm start
```

Scan the QR code with **Expo Go** on your Android phone, or press `a` to open on a connected Android device/emulator.

> **Note:** Android Health Connect requires a custom development build (see below). Expo Go will run the app with sample data only.

---

## Building for Android

This app uses native modules (Health Connect) that require a custom build. Use [EAS Build](https://docs.expo.dev/build/introduction/):

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. Build a preview APK (shareable)

```bash
eas build --platform android --profile preview
```

This produces a downloadable `.apk` you can install directly on any Android device.

### 3. Build a production release (for Play Store)

```bash
eas build --platform android --profile production
```

This produces an `.aab` (Android App Bundle) for Play Store submission.

---

## Health Connect

On Android 9+, users can tap **"Allow"** on the Health tab to connect their health data. The app will request read access for:

- Steps
- Sleep
- Heart rate
- Calories burned

Data comes from any app that syncs to Android Health Connect — including **Samsung Health**, **Google Fit**, **Fitbit**, and more.

On Android 13 and older, users may need to install the [Health Connect app](https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata) from the Play Store first.

Health Connect is not available on iOS or web — the app falls back to sample data on those platforms.

---

## Project Structure

```
app/
  (tabs)/
    index.tsx        # Overview screen
    screentime.tsx   # Screen Time screen
    health.tsx       # Health screen
    calendar.tsx     # Calendar screen
    trends.tsx       # Trends screen
  _layout.tsx        # Root layout and providers

components/          # Reusable UI components
constants/           # Color tokens and theme
context/             # React context (HealthContext)
data/
  sampleData.ts      # 30-day seeded sample data engine
  healthConnectService.ts  # Health Connect data fetching
hooks/
  useColors.ts       # Theme-aware color hook
  useHealthConnect.ts # Health Connect permissions and state
  useHydration.ts    # Hydration tracking with AsyncStorage
```

---

## Sample Data

The app ships with a deterministic 30-day data engine in `data/sampleData.ts`. All values are generated from a seeded random number system — no real personal data is included. This means the app is safe to open source and works for anyone without any setup.

---

## License

MIT — free to use, modify, and distribute.
