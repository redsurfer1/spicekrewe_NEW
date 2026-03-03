/**
 * Generates the official social sharing image (og-image.png) at 1200x630.
 * Run from project root: node scripts/generate-og-image.js
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
const SPICE_PURPLE = '#4d2f91';
const SPICE_BLUE = '#0078cd';
const LOGO_PATH = path.join(ROOT, 'public/assets/images/brand/SpiceKrewe_Logo_Transparent_background.png');
const OUTPUT_PATH = path.join(ROOT, 'public/og-image.png');

async function main() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient (left to right: Spice Purple → Spice Blue)
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, SPICE_PURPLE);
  gradient.addColorStop(1, SPICE_BLUE);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Load and draw logo centered with padding
  const logo = await loadImage(LOGO_PATH);
  const maxLogoWidth = WIDTH - PADDING * 2;
  const maxLogoHeight = HEIGHT - PADDING * 2;
  const scale = Math.min(maxLogoWidth / logo.width, maxLogoHeight / logo.height);
  const logoWidth = Math.round(logo.width * scale);
  const logoHeight = Math.round(logo.height * scale);
  const x = (WIDTH - logoWidth) / 2;
  const y = (HEIGHT - logoHeight) / 2;

  ctx.drawImage(logo, x, y, logoWidth, logoHeight);

  // Export to PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log('Created:', OUTPUT_PATH);
}

main().catch((err) => {
  console.error('Error generating og-image:', err.message);
  process.exit(1);
});
