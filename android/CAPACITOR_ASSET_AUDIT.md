# Capacitor Android Asset Audit

**Project:** Spice Krewe  
**Date:** 2025-03-02  
**Android project path:** `C:\Users\jwill\Desktop\Site Data\Spice Krewe Brand\project\android`

---

## 1. Web output (project root)

**Location:** `C:\Users\jwill\Desktop\Site Data\Spice Krewe Brand\project\dist`

| Item | Type | Present |
|------|------|---------|
| `index.html` | file | ✅ Yes |
| `favicon.svg` | file | ✅ Yes |
| `assets/index-BWwuBKEX.css` | file | ✅ Yes |
| `assets/index-Y5TgQwfA.js` | file | ✅ Yes |

**Conclusion:** The main web build folder exists and contains `index.html` and the built assets. This is the correct Vite output directory (`dist`).

---

## 2. Android assets (where the WebView loads from)

**Location:** `android/app/src/main/assets/public`

| Item | Type | Present |
|------|------|---------|
| `index.html` | file | ✅ Yes |
| `favicon.svg` | file | ✅ Yes |
| `assets/index-BWwuBKEX.css` | file | ✅ Yes |
| `assets/index-Y5TgQwfA.js` | file | ✅ Yes |
| `cordova.js` | file | ✅ (injected by Capacitor) |
| `cordova_plugins.js` | file | ✅ (injected by Capacitor) |

**Conclusion:** The Android asset directory exists and contains the same core files as the web build. Capacitor expects assets in `app/src/main/assets/public` (see `Bridge.DEFAULT_WEB_ASSET_DIR = "public"`). Structure is correct.

---

## 3. Compare and verify

| File | In `dist/` | In `android/.../assets/public/` | Match |
|------|------------|----------------------------------|-------|
| `index.html` | ✅ | ✅ | ✅ |
| `favicon.svg` | ✅ | ✅ | ✅ |
| `assets/index-BWwuBKEX.css` | ✅ | ✅ | ✅ |
| `assets/index-Y5TgQwfA.js` | ✅ | ✅ | ✅ |

**Disconnect found:** The **content** of `index.html` in both places references a resource that does **not** exist:

- **Reference:** `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`
- **Actual file:** Only `favicon.svg` exists in both `dist/` and `android/.../public/`.
- **Result:** The browser/WebView requests `/vite.svg`, which is not present, and Logcat can show a **Failed to fetch** (or 404) for that URL. This does not prevent the app from loading; it only affects the favicon.

**Recommendation:** In the **source** `index.html` (project root), change the favicon from `/vite.svg` to `/favicon.svg` (or ensure `vite.svg` exists in `public/` and is copied to `dist`). Then run `npm run build` and `npx cap sync` again so the Android assets stay in sync.

---

## 4. Config verification

**File:** `android/app/src/main/assets/capacitor.config.json`

```json
{
  "appId": "com.spicekrewe.app",
  "appName": "Spice Krewe",
  "webDir": "dist"
}
```

- **Purpose of `webDir`:** Used by the Capacitor CLI when running `npx cap sync` / `npx cap copy` to know which folder (relative to the **project root**) to copy into the native project. It does **not** tell the Android runtime where to read files from.
- **Android runtime behavior:** The Capacitor Bridge uses the default asset directory `"public"` (i.e. `app/src/main/assets/public`) when loading the app. So the WebView loads from `assets/public`, which is exactly where `cap sync` copies the contents of `dist/`.
- **Conclusion:** The config correctly points to the expected web directory (`dist`). The sync process copies `dist` → `android/app/src/main/assets/public`, which matches what Android Studio and the WebView expect.

---

## Summary

| Check | Status |
|-------|--------|
| Web output (`dist`) has `index.html` and assets | ✅ Pass |
| Android assets in `app/src/main/assets/public` | ✅ Pass |
| Files in `public` match `dist` | ✅ Pass (with one broken link in HTML) |
| `capacitor.config.json` points to expected web dir | ✅ Pass |

**Likely cause of "Failed to fetch" in Logcat:** The favicon request to `/vite.svg` fails because only `favicon.svg` exists. Fix the favicon reference in the source `index.html` and rebuild/sync. If you still see "Failed to fetch" after that, the next place to check is runtime network requests (e.g. Supabase or other APIs) and any related CORS or network security configuration.
