#!/usr/bin/env node
/**
 * G11: Mirrors src/content/blog/registry.ts MDX validation without importing Vite-only glob.
 * Fails the build if frontmatter or slug rules break.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mdxDir = path.join(root, 'src/content/blog');

const SLUG_RE = /^[a-z0-9-]+$/;

function slugFromFilename(file) {
  return path.basename(file, '.mdx');
}

function validateBlogPosts(items) {
  const slugCounts = new Map();
  for (const { path: p, entry } of items) {
    const list = slugCounts.get(entry.slug) ?? [];
    list.push(p);
    slugCounts.set(entry.slug, list);
  }

  for (const { path: p, entry } of items) {
    const filename = p.replace(/^\.\//, '');
    const req = [
      ['slug', entry.slug],
      ['title', entry.title],
      ['description', entry.description],
      ['date', entry.date],
      ['primaryKeyword', entry.primaryKeyword],
      ['excerpt', entry.excerpt],
    ];
    for (const [field, val] of req) {
      if (typeof val !== 'string' || val.trim() === '') {
        throw new Error(`MDX validation failed: ${filename} — ${field}: required (non-empty string)`);
      }
    }
    if (!SLUG_RE.test(entry.slug)) {
      throw new Error(
        `MDX validation failed: ${filename} — slug: must be lowercase letters, digits, and hyphens only`,
      );
    }
    if (entry.title.length > 60) {
      throw new Error(`MDX validation failed: ${filename} — title: exceeds 60 characters`);
    }
    if (entry.description.length > 155) {
      throw new Error(`MDX validation failed: ${filename} — description: exceeds 155 characters`);
    }
    if (entry.excerpt.length > 300) {
      throw new Error(`MDX validation failed: ${filename} — excerpt: exceeds 300 characters`);
    }
  }

  for (const [slug, paths] of slugCounts) {
    if (paths.length > 1) {
      throw new Error(
        `MDX validation failed: ${paths[0] ?? slug} — slug: duplicate slug "${slug}" (also in ${paths.slice(1).join(', ')})`,
      );
    }
  }
}

if (!fs.existsSync(mdxDir)) {
  console.error('verify-blog-registry: missing', mdxDir);
  process.exit(1);
}

const files = fs.readdirSync(mdxDir).filter((f) => f.endsWith('.mdx'));
const items = [];

for (const f of files) {
  const rel = `./${f}`;
  const full = path.join(mdxDir, f);
  const raw = fs.readFileSync(full, 'utf8');
  const { data } = matter(raw);
  const fm = data;
  const slug = (typeof fm.slug === 'string' ? fm.slug : slugFromFilename(f)).trim();
  items.push({
    path: rel,
    entry: {
      slug,
      title: typeof fm.title === 'string' ? fm.title : '',
      description: typeof fm.description === 'string' ? fm.description : '',
      date: typeof fm.date === 'string' ? fm.date : '',
      primaryKeyword: typeof fm.primaryKeyword === 'string' ? fm.primaryKeyword : '',
      excerpt: typeof fm.excerpt === 'string' ? fm.excerpt : '',
    },
  });
}

try {
  validateBlogPosts(items);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}

console.log('verify-blog-registry: OK (%d posts)', items.length);
