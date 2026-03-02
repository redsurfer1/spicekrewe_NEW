# Signed Android App Bundle (AAB) for Play Store

## 1. Configure release signing

Edit **`android/gradle.properties`** and set your keystore path, alias, and passwords (replace the placeholders):

```properties
# Use your actual keystore path (absolute or relative to the android folder)
RELEASE_STORE_FILE=C:/path/to/your/release.keystore
RELEASE_KEY_ALIAS=your-key-alias
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_PASSWORD=your_key_password
```

- **RELEASE_STORE_FILE:** Full path to your `.jks` or `.keystore` file, or a path relative to the `android` project root (e.g. `app/release.keystore`).
- **RELEASE_KEY_ALIAS:** The key alias you use for this app (e.g. the one you chose when creating the keystore).
- **RELEASE_STORE_PASSWORD** / **RELEASE_KEY_PASSWORD:** The keystore and key passwords.

Do not commit real passwords to version control. Prefer environment variables or a local `gradle.properties` that is gitignored.

---

## 2. Verify key validity (optional)

Play requires the signing key to be valid long enough (e.g. beyond **October 22, 2033**). Check with:

```bash
keytool -list -v -keystore "C:\path\to\your\release.keystore"
```

In the output, find **"Valid from ... until ..."**. The "until" date must be after October 22, 2033. If it is not, create a new keystore with a longer validity (e.g. `-validity 10000` in days).

---

## 3. Build the signed AAB

From the **`android`** directory (with `JAVA_HOME` set if needed):

```bash
# Windows (Git Bash) – set Java if needed
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
./gradlew bundleRelease
```

On success, the signed AAB is at:

**`android/app/build/outputs/bundle/release/app-release.aab`**

Upload this file to Play Console (Release → Production or Testing → Create new release → Upload).

---

## 4. Summary

| Item | Action |
|------|--------|
| **Keystore path** | Set `RELEASE_STORE_FILE` in `gradle.properties` (replace `[INSERT PATH TO KEYSTORE]`). |
| **Alias** | Set `RELEASE_KEY_ALIAS` in `gradle.properties` (replace `[INSERT ALIAS]`). |
| **Key validity** | Run `keytool -list -v -keystore <path>` and confirm "Valid until" is after October 22, 2033. |
| **Output AAB** | `android/app/build/outputs/bundle/release/app-release.aab` |
