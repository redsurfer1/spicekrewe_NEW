import matter from 'gray-matter';
import { MEMPHIS_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/memphisVoiceFaq';
import { NASHVILLE_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/nashvilleVoiceFaq';
import { NEW_ORLEANS_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/newOrleansVoiceFaq';

export type BlogFaqItem = { question: string; answer: string };

export type BlogPostEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  primaryKeyword: string;
  excerpt: string;
  raw: string;
  faqs: BlogFaqItem[];
};

type Frontmatter = {
  slug?: string;
  title?: string;
  description?: string;
  date?: string;
  primaryKeyword?: string;
  excerpt?: string;
};

/**
 * FAQPage JSON-LD sources — keyed by slug; body + SEO metadata live in each `.mdx` frontmatter.
 * G9 (SSOT): City hire posts (`memphis|nashville|new-orleans-culinary-talent`) MUST use only
 * `src/lib/seo/*VoiceFaq.ts` — do not duplicate those FAQs inline here.
 */
const FAQ_BY_SLUG: Record<string, BlogFaqItem[]> = {
  'recipe-development-costs': [
    {
      question: 'How much does recipe testing cost for a small food brand?',
      answer:
        'Pilot testing often starts with 20–60 hours of R&D at $150–$190/hr SK Verified rates plus ingredient or lab fees. Cap rounds in your brief to keep costs predictable.',
    },
    {
      question: 'How long does recipe development take?',
      answer:
        'A single controlled recipe may take 3–7 days; CPG-scale programs with documentation and trials often take 4–12 weeks.',
    },
    {
      question: 'What is an on-demand recipe development service for brands?',
      answer:
        'You engage credentialed developers per project—post a brief, receive a technical scope, and match to SK Verified talent in about 48 hours.',
    },
    {
      question: 'How do I build a food brand content calendar with a recipe developer?',
      answer:
        'Align deliverables (still vs motion), dietary notes, and brand voice in one brief so batches land before photography and social dates.',
    },
  ],
  'food-stylist-cost': [
    {
      question: 'What are food stylist rates for editorial vs advertising?',
      answer:
        'Editorial days often fall near $400–$800 nationally; advertising-heavy shoots can exceed $1,000/day before licensing. SK Verified stylists publish hourly anchors like $150/hr.',
    },
    {
      question: 'Food stylist vs food photographer—which do I need?',
      answer:
        'Stylists own the plate, props, and timing; photographers own capture. Premium campaigns usually hire both.',
    },
    {
      question: 'What does a food stylist do for a brand shoot?',
      answer:
        'They execute the creative brief on-set, manage food integrity across frames, and keep the schedule edible-safe.',
    },
    {
      question: 'How do I hire a food stylist for an e-commerce shoot?',
      answer:
        'Brief SKUs, reference crops, surfaces, and file specs so the stylist batches PDP-ready frames efficiently.',
    },
  ],
  'private-chef-cost': [
    {
      question: 'How much to hire a private chef for one night?',
      answer:
        'Labor often ranges $800–$3,500+ for a single evening before groceries, depending on menu, headcount, and travel.',
    },
    {
      question: 'What is the difference between a personal chef and a private chef?',
      answer:
        'Private chef usually means an on-site event; personal chef often implies recurring meal prep—define format in your brief.',
    },
    {
      question: 'Personal chef vs private chef—how do costs differ?',
      answer:
        'Private events concentrate hours into one night; personal-chef programs spread cost across weekly visits.',
    },
    {
      question: 'How much do freelance chefs charge per hour?',
      answer:
        'SK Verified anchors on Spice Krewe are $150–$190/hr across Marcus Johnson, Aisha Thompson, Dana Nguyen, and Rafael Cruz.',
    },
  ],
  'sk-verified': [
    {
      question: 'What is a vetted culinary professional marketplace?',
      answer:
        'A platform that reviews work and references before listing talent—Spice Krewe uses SK Verified gating for that purpose.',
    },
    {
      question: 'Is there a culinary freelancer platform with vetting?',
      answer: 'Yes—Spice Krewe combines SK Verified review with structured briefs and AI-assisted matching.',
    },
    {
      question: 'What questions should I ask before hiring a food consultant?',
      answer:
        'Ask about deliverables, revisions, IP, timeline, expenses, and co-packer handoff format before you sign.',
    },
  ],
  'how-ai-matches-chefs': [
    {
      question: 'How do I vet a freelance chef before hiring?',
      answer:
        'Start with SK Verified profiles, request samples, and align IP and revisions in writing—see our SK Verified explainer post.',
    },
    {
      question: 'What questions should I ask before hiring a food consultant?',
      answer: 'Clarify documentation format, trial attendance, and how scope changes affect pricing.',
    },
    {
      question: 'What is an SK verified culinary professional?',
      answer:
        'A Spice Krewe talent profile that passed portfolio, reference, and rate validation—read the dedicated SK Verified article for detail.',
    },
  ],
  'culinary-consultant-guide': [
    {
      question: 'Freelance food consultant vs consulting firm?',
      answer:
        'Firms sell retainers and bundled teams; freelancers sell scoped projects. Spice Krewe adds SK Verified review to freelance speed.',
    },
    {
      question: 'What is a culinary R&D consultant for a food brand?',
      answer:
        'A partner who converts brand intent into bench formulas, documentation, and co-packer-ready handoffs.',
    },
    {
      question: 'Food product development consultant for a small brand?',
      answer:
        'Small brands often buy one pilot SKU plus docs, using $150–$190/hr SK Verified anchors as a budgeting baseline.',
    },
  ],
  'culinex-alternative': [
    {
      question: 'What is the best CuliNEX alternative for a small food brand?',
      answer:
        'Prioritize vetted food product development with per-project terms, a TRD-style scope artifact, and co-packer-ready documentation—not just creative decks.',
    },
    {
      question: 'How does on-demand culinary R&D differ from a monthly retainer?',
      answer:
        'On-demand ties spend to defined deliverables and timelines; retainers buy ongoing access—better for always-on innovation than for lumpy SKU pipelines.',
    },
    {
      question: 'Can I hire a research chef with no retainer?',
      answer:
        'Yes—scoped briefs can route to research-chef-level talent without standing monthly fees when IP, revisions, and handoff formats are explicit.',
    },
    {
      question: 'Why choose SK Verified talent over unvetted freelance boards?',
      answer:
        'SK Verified reduces search risk via portfolio and reference review, rate validation against published anchors, and B2B-friendly governance.',
    },
    {
      question: 'What is a TRD in food R&D?',
      answer:
        'A Technical Requirements Document states deliverables, constraints, and handoff formats so bench work aligns with production before costly rework.',
    },
  ],
  'memphis-culinary-talent': [...MEMPHIS_VOICE_SEARCH_FAQ_ITEMS],
  'nashville-culinary-talent': [...NASHVILLE_VOICE_SEARCH_FAQ_ITEMS],
  'new-orleans-culinary-talent': [...NEW_ORLEANS_VOICE_SEARCH_FAQ_ITEMS],
};

const rawModules = import.meta.glob<string>('./*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function slugFromPath(path: string): string {
  const base = path.split('/').pop() ?? path;
  return base.replace(/\.mdx$/i, '');
}

const SLUG_RE = /^[a-z0-9-]+$/;

type BlogPostWithPath = { path: string; entry: BlogPostEntry };

/**
 * Build-time validation for MDX frontmatter (SEO contract).
 * Passing example: slug `recipe-development-costs`, title ≤60 chars, description ≤155, excerpt ≤300.
 * Failing example: slug `Bad_Slug` → throws `MDX validation failed: ./foo.mdx — slug: must match /^[a-z0-9-]+$/`.
 */
function validateBlogPosts(items: BlogPostWithPath[]): void {
  const slugCounts = new Map<string, string[]>();
  for (const { path, entry } of items) {
    const list = slugCounts.get(entry.slug) ?? [];
    list.push(path);
    slugCounts.set(entry.slug, list);
  }

  for (const { path, entry } of items) {
    const filename = path.replace(/^\.\//, '');
    const req: Array<[keyof BlogPostEntry | 'slug', string | undefined]> = [
      ['slug', entry.slug],
      ['title', entry.title],
      ['description', entry.description],
      ['date', entry.date],
      ['primaryKeyword', entry.primaryKeyword],
      ['excerpt', entry.excerpt],
    ];
    for (const [field, val] of req) {
      if (typeof val !== 'string' || val.trim() === '') {
        throw new Error(`MDX validation failed: ${filename} — ${String(field)}: required (non-empty string)`);
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

function buildBlogPosts(): BlogPostEntry[] {
  const withPath: BlogPostWithPath[] = [];

  for (const path of Object.keys(rawModules)) {
    const fileRaw = rawModules[path];
    const { data, content } = matter(fileRaw);
    const fm = data as Frontmatter;
    const slug = (fm.slug ?? slugFromPath(path)).trim();

    const entry: BlogPostEntry = {
      slug,
      title: typeof fm.title === 'string' ? fm.title : '',
      description: typeof fm.description === 'string' ? fm.description : '',
      date: typeof fm.date === 'string' ? fm.date : '',
      primaryKeyword: typeof fm.primaryKeyword === 'string' ? fm.primaryKeyword : '',
      excerpt: typeof fm.excerpt === 'string' ? fm.excerpt : '',
      raw: content.replace(/^\s+/, ''),
      faqs: FAQ_BY_SLUG[slug] ?? [],
    };

    withPath.push({ path, entry });
  }

  validateBlogPosts(withPath);

  return withPath
    .map((w) => w.entry)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const BLOG_POSTS: BlogPostEntry[] = buildBlogPosts();

const bySlug = new Map(BLOG_POSTS.map((p) => [p.slug, p]));

export function getBlogPost(slug: string): BlogPostEntry | undefined {
  return bySlug.get(slug);
}

export function listBlogPosts(): BlogPostEntry[] {
  return [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
