#!/usr/bin/env bash
# Monitor Logcat for "Failed to fetch" and related WebView/network errors.
# Usage: Run this script, then open the Spice Krewe app on the emulator and use it for 30–60 seconds.

set -e
ADB="${LOCALAPPDATA}/Android/Sdk/platform-tools/adb.exe"
if [[ ! -x "$ADB" ]]; then
  echo "adb not found at $ADB. Set ANDROID_HOME or fix path."
  exit 1
fi

echo "Clearing Logcat..."
"$ADB" logcat -c

echo "Monitoring for 60 seconds. Open the Spice Krewe app now..."
echo "Filtering: Failed to fetch | vite | favicon | ERR_ | net:: | 404 | Capacitor"
echo "---"

timeout 60 "$ADB" logcat -v time 2>&1 | grep -i -E "failed to fetch|vite\.svg|favicon\.svg|ERR_|net::|404|fetch.*fail|Capacitor/Console|chromium.*Failed|Uncaught" || true

echo "---"
echo "Monitoring ended. If no lines appeared above, no matching errors were seen in this window."
