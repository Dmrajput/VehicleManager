# Vehicle Manager

A modern, production-style mobile app that helps bike & car owners manage **vehicles, fuel, services, expenses and renewal reminders**.

- **Frontend:** React Native (Expo) + JavaScript + React Navigation v7 + React Native Paper + Zustand + Axios
- **Backend:** Node.js + Express + MongoDB (Mongoose) + JWT auth (OTP based)
- **Extras:** Expo Notifications (30/15/7/1-day reminders), AdMob hook points, AsyncStorage caching, charts

```
VehicleManager/
├── backend/      Node + Express + MongoDB REST API
└── mobile/       Expo React Native app
```

---

## 1. Prerequisites

- Node.js 18+ (you have v22)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- Expo Go app on your phone, or an Android/iOS emulator

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env       # then edit values (Windows: copy .env.example .env)
npm run seed               # optional: creates a demo user + sample data
npm run dev                # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

> **OTP in dev mode:** With `OTP_DEV_MODE=true`, the login/register response includes
> a `devOtp` field and the app pre-fills it automatically — no SMS provider needed.
> For production, plug an SMS gateway into `authController.js` and set `OTP_DEV_MODE=false`.

### API summary

| Module    | Endpoints |
|-----------|-----------|
| Auth      | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify-otp` |
| Vehicles  | `POST/GET /api/vehicle`, `GET/PUT/DELETE /api/vehicle/:id` |
| Fuel      | `POST/GET /api/fuel`, `DELETE /api/fuel/:id` |
| Service   | `POST/GET /api/service`, `DELETE /api/service/:id` |
| Reminders | `GET /api/reminders` |
| User      | `GET/PUT /api/user/profile`, `GET /api/user/dashboard`, `GET /api/user/expenses` |

All routes except auth require `Authorization: Bearer <token>`.

---

## 3. Mobile setup

```bash
cd mobile
npm install
npm start            # = npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator) or scan the QR with Expo Go.

### Pointing the app at your backend

The API base URL is resolved in `src/constants/index.js`:

- **Android emulator** → `http://10.0.2.2:5000/api` (default, host loopback)
- **iOS simulator** → `http://localhost:5000/api`
- **Physical device (Expo Go)** → use your computer's LAN IP, e.g.:

```bash
# from the mobile/ folder
EXPO_PUBLIC_API_URL=http://192.168.1.50:5000/api npm start
```

(or set `extra.apiBaseUrl` in `app.json`).

---

## 4. App flow

Splash → Login/Signup (OTP) → Dashboard → Vehicles / Expenses / Profile.

Bottom tabs: **Home · Vehicles · Expenses · Profile**. Add Vehicle / Add Fuel /
Add Service / Vehicle Details are pushed as modal-style stack screens.

---

## 5. Notifications

`src/services/notifications.js` schedules local reminders at **30, 15, 7 and 1 day**
before each renewal date. They re-sync from the server every time the Home screen loads.

---

## 6. AdMob

Real banner/interstitial/rewarded ads need `react-native-google-mobile-ads`, which
requires a **custom dev client / EAS build** (it does not run in Expo Go). The app
ships with:

- `src/components/AdBanner.js` — banner placeholder (swap with a real `<BannerAd />`)
- `src/hooks/useInterstitialAd.js` — counts actions and fires every 5th action

Test unit IDs live in `src/constants/index.js` under `ADMOB`. Replace with your real IDs.

To enable real ads:

```bash
npx expo install react-native-google-mobile-ads
# add android/ios app IDs to app.json, then build a dev client:
npx expo run:android   # or eas build
```

---

## 7. Tech notes

- **State:** Zustand stores in `src/store` (`authStore`, `vehicleStore`)
- **Caching/offline:** JWT + last user cached in AsyncStorage; lists refresh on focus + pull-to-refresh
- **UI:** rounded 16px cards, soft shadows, gradient headers, skeleton loaders, empty/error states
- **Pagination:** fuel & service list endpoints accept `?page=&limit=`

Demo login after seeding: mobile **9999999999** (use the `devOtp` shown in the response).
