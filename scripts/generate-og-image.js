/**
 * Generates the official social sharing image (og-image.png) at 1200x630.
 * Run from project root: node scripts/generate-og-image.js
 * Prebuild must never fail the main build — errors fall back to og-image-fallback.png when present.
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 100;

/** Read hex from src/index.css :root (node-canvas needs resolved colors, not var()). */
function readCssHexVar(cssPath, varName) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const re = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*#([0-9a-fA-F]{6})`);
  const m = css.match(re);
  if (!m) throw new Error(`Missing ${varName} hex in ${cssPath}`);
  return `#${m[1]}`;
}

const INDEX_CSS = path.join(ROOT, 'src/index.css');
const LOGO_PATH = path.join(ROOT, 'public/assets/images/brand/SpiceKrewe_Logo_Transparent_background.png');
const OUTPUT_PATH = path.join(ROOT, 'public/og-image.png');
const FALLBACK_PATH = path.join(ROOT, 'public/og-image-fallback.png');

function copyFallbackIfPresent() {
  try {
    if (fs.existsSync(FALLBACK_PATH)) {
      fs.copyFileSync(FALLBACK_PATH, OUTPUT_PATH);
      console.warn('[generate-og-image] Using fallback copy:', FALLBACK_PATH, '→', OUTPUT_PATH);
    } else {
      console.warn('[generate-og-image] No og-image-fallback.png found; skipping copy.');
    }
  } catch (e) {
    console.warn('[generate-og-image] Fallback copy failed:', e instanceof Error ? e.message : e);
  }
}

async function main() {
  const SPICE_PURPLE = readCssHexVar(INDEX_CSS, '--sk-purple');
  const SPICE_BLUE = readCssHexVar(INDEX_CSS, '--sk-blue');

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, SPICE_PURPLE);
  gradient.addColorStop(1, SPICE_BLUE);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const logo = await loadImage(LOGO_PATH);
  const maxLogoWidth = WIDTH - PADDING * 2;
  const maxLogoHeight = HEIGHT - PADDING * 2;
  const scale = Math.min(maxLogoWidth / logo.width, maxLogoHeight / logo.height);
  const logoWidth = Math.round(logo.width * scale);
  const logoHeight = Math.round(logo.height * scale);
  const x = (WIDTH - logoWidth) / 2;
  const y = (HEIGHT - logoHeight) / 2;

  ctx.drawImage(logo, x, y, logoWidth, logoHeight);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log('Created:', OUTPUT_PATH);
}

try {
  await main();
} catch (err) {
  console.warn('[generate-og-image] Generation failed (non-fatal for build):', err instanceof Error ? err.message : err);
  copyFallbackIfPresent();
}
process.exit(0);
