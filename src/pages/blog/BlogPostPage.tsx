import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { getBlogPost } from '../../content/blog/registry';
import { buildFaqPageJsonLd } from '../../lib/seo/faqPageJsonLd';

const proseClass =
  'rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-10 [&_a]:font-semibold [&_a]:text-spice-purple [&_a]:no-underline hover:[&_a]:underline [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-sk-navy sm:[&_h1]:text-4xl [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-sk-navy [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-sk-navy [&_li]:mb-1 [&_li]:text-sk-text-muted [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-sk-text-muted [&_strong]:text-sk-navy [&_table]:mb-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm [&_td]:border [&_td]:border-sk-card-border [&_td]:p-3 [&_td]:text-sk-text-muted [&_th]:border [&_th]:border-sk-card-border [&_th]:bg-sk-purple-light/15 [&_th]:p-3 [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-sk-navy [&_tr:nth-child(even)]:bg-sk-body-bg/80 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-sk-text-muted [&_hr]:my-10 [&_hr]:border-sk-card-border [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-sk-md [&_pre]:border [&_pre]:border-sk-card-border [&_pre]:bg-sk-body-bg [&_pre]:p-4 [&_pre]:text-xs [&_code]:text-sk-navy';

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);

  const html = useMemo(() => {
    if (!post) return '';
    return marked.parse(post.raw, { async: false, gfm: true }) as string;
  }, [post]);

  const structuredData = useMemo(() => {
    if (!post?.faqs.length) return undefined;
    return buildFaqPageJsonLd(post.faqs);
  }, [post]);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-sk-body-bg">
        <SEO title="Post not found | Spice Krewe" description="This blog post could not be found." path="/blog" />
        <Navbar />
        <main className="mx-auto max-w-xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-sk-navy">Post not found</h1>
          <Link to="/blog" className="mt-6 inline-block font-semibold text-spice-purple no-underline hover:underline">
            Back to blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const path = `/blog/${post.slug}`;

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title={post.title}
        description={post.description}
        path={path}
        ogTitle={post.title}
        ogDescription={post.description}
        image={DEFAULT_OG_IMAGE}
        structuredData={structuredData}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sk-gold">Blog</p>
          <p className="mb-6 text-sm text-sk-text-subtle">
            <time dateTime={post.date}>{post.date}</time>
            <span className="mx-2">·</span>
            <span>{post.primaryKeyword}</span>
          </p>
          <article className={proseClass} dangerouslySetInnerHTML={{ __html: html }} />
          <div className="mt-8">
            <Link to="/blog" className="font-semibold text-spice-purple no-underline hover:underline">
              ← All insights
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
