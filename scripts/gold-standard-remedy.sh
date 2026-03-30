#!/usr/bin/env bash
#
# Spice Krewe — Gold Standard remedy (non-destructive verification + guardrails).
# Run from repository root: bash scripts/gold-standard-remedy.sh
# Exit 0 only if all local checks pass. Does NOT apply SQL to Supabase or change cloud config.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== Spice Krewe Gold Standard remedy (verify) =="
echo "Root: $ROOT"
echo

if [[ ! -f package.json ]]; then
  echo "ERROR: package.json not found — run from spicekrewe_NEW root."
  exit 1
fi

echo "→ npm ci (clean install for reproducible audit)"
npm ci

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo
  echo "→ Production build (verify:content + MDX/registry validation in prebuild)"
  # Dummy public env so CI parity; override with real secrets locally if needed.
  export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-https://example.supabase.co}"
  export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-anon-placeholder}"
  export VITE_STRIPE_PUBLIC_KEY="${VITE_STRIPE_PUBLIC_KEY:-pk_test_placeholder}"
  npm run build
  if [[ ! -f dist/sitemap.xml ]]; then
    echo "ERROR: dist/sitemap.xml missing after build."
    exit 1
  fi
  echo "  ✓ dist/sitemap.xml present"
else
  echo
  echo "(SKIP_BUILD=1 — skipped vite build)"
  echo "→ Content registry (MDX) validation"
  npm run verify:content
fi

echo
echo "→ Final pass: TypeScript + internal links (Gold Standard signal)"
npm run typecheck
npm run check-links

echo
echo "== Verification complete (exit 0) =="
echo
echo "Manual / platform follow-ups (not automated here):"
echo "  1. Apply all supabase/migrations/*.sql via supabase db push or SQL editor."
echo "  2. Enable MFA for Supabase Dashboard + restrict service role key rotation."
echo "  3. Replace shared admin password with SSO/MFA-backed identity (SOC2 CC6)."
echo "  4. Wire Edge Function failures to Supabase Log Drains / SIEM (ISO 27001 A.16)."
echo "  5. Complete Supabase Auth MFA for admin UI (client stub: session_mfa_verified)."
echo
