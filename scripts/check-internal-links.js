/**
 * Validates internal links in MDX + TSX against App routes + blog slugs.
 * Run: node scripts/check-internal-links.js (exit 1 if any unknown route).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/** Known exceptions (query strings or dynamic patterns — documented for operators). */
const WHITELIST_PREFIXES = ['/talent?verified=true', '/talent?location=Memphis'];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function collectFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) collectFiles(full, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

function extractRoutesFromApp(appSource) {
  const routes = new Set();
  const re = /<Route\s+path="([^"]+)"/g;
  let m;
  while ((m = re.exec(appSource)) !== null) {
    routes.add(m[1]);
  }
  return routes;
}

function extractBlogSlugsFromDisk() {
  const dir = path.join(ROOT, 'src', 'content', 'blog');
  const slugs = new Set();
  if (!fs.existsSync(dir)) return slugs;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.mdx')) continue;
    slugs.add(name.replace(/\.mdx$/i, ''));
  }
  return slugs;
}

function extractLinksFromMdx(text) {
  const out = [];
  const paren = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = paren.exec(text)) !== null) {
    const href = m[2].trim();
    if (href.startsWith('/')) out.push(href);
  }
  const hrefRe = /href="(\/[^"]*)"/g;
  while ((m = hrefRe.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function extractLinksFromTsx(text) {
  const out = [];
  const toRe = /to="(\/[^"]*)"/g;
  let m;
  while ((m = toRe.exec(text)) !== null) {
    out.push(m[1]);
  }
  const hrefRe = /href="(\/[^"]*)"/g;
  while ((m = hrefRe.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function stripHashQuery(href) {
  const q = href.indexOf('?');
  const h = href.indexOf('#');
  let end = href.length;
  if (q >= 0) end = Math.min(end, q);
  if (h >= 0) end = Math.min(end, h);
  return href.slice(0, end);
}

function pathMatchesRoute(pathOnly, routePattern) {
  if (!routePattern.includes(':')) {
    return pathOnly === routePattern;
  }
  const pr = routePattern.split('/').filter(Boolean);
  const pp = pathOnly.split('/').filter(Boolean);
  if (pr.length !== pp.length) return false;
  for (let i = 0; i < pr.length; i++) {
    if (pr[i].startsWith(':')) continue;
    if (pr[i] !== pp[i]) return false;
  }
  return true;
}

function isQueryWhitelisted(href) {
  return WHITELIST_PREFIXES.some((p) => href === p || href.startsWith(`${p}&`));
}

function isKnownRoute(pathOnly, knownSet) {
  if (knownSet.has(pathOnly)) return true;
  for (const r of knownSet) {
    if (pathMatchesRoute(pathOnly, r)) return true;
  }
  return false;
}

function main() {
  const appPath = path.join(ROOT, 'src', 'App.tsx');
  const appSource = readUtf8(appPath);

  const routePatterns = [...extractRoutesFromApp(appSource)];
  const blogSlugs = extractBlogSlugsFromDisk();
  for (const s of blogSlugs) {
    routePatterns.push(`/blog/${s}`);
  }

  const known = new Set(routePatterns);

  const mdxFiles = collectFiles(path.join(ROOT, 'src', 'content', 'blog'), ['.mdx']);
  const tsxPages = collectFiles(path.join(ROOT, 'src', 'pages'), ['.tsx']);
  const tsxComponents = collectFiles(path.join(ROOT, 'src', 'components'), ['.tsx']);

  let failed = false;

  const checkFile = (filePath, links) => {
    const rel = path.relative(ROOT, filePath);
    for (const href of links) {
      if (!href.startsWith('/')) continue;
      if (isQueryWhitelisted(href)) {
        console.log(`✓ ${rel} → ${href} (whitelist)`);
        continue;
      }
      const clean = stripHashQuery(href);
      if (isKnownRoute(clean, known)) {
        console.log(`✓ ${rel} → ${href}`);
        continue;
      }
      if (clean.startsWith('/talent/') && clean.split('/').length === 3) {
        console.log(`✓ ${rel} → ${href} (dynamic /talent/:id)`);
        continue;
      }
      if (clean.startsWith('/blog/') && clean.split('/').length === 3) {
        console.log(`✓ ${rel} → ${href} (dynamic /blog/:slug)`);
        continue;
      }
      if (clean.startsWith('/hire/') && clean.split('/').length === 3) {
        console.log(`✓ ${rel} → ${href} (dynamic /hire/:specialty)`);
        continue;
      }
      console.log(`✗ ${rel} → ${href}`);
      failed = true;
    }
  };

  for (const f of mdxFiles) {
    checkFile(f, extractLinksFromMdx(readUtf8(f)));
  }
  for (const f of tsxPages) {
    checkFile(f, extractLinksFromTsx(readUtf8(f)));
  }
  for (const f of tsxComponents) {
    checkFile(f, extractLinksFromTsx(readUtf8(f)));
  }

  if (failed) {
    console.error('check-internal-links: unknown routes detected.');
    process.exit(1);
  }
  process.exit(0);
}

main();
