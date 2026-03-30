import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { listBlogPosts } from '../../content/blog/registry';

const BLOG_TITLE = 'Culinary talent insights — Spice Krewe blog';
const BLOG_DESCRIPTION =
  'Pricing guides, hiring tips, and food industry insights from the SK Verified talent network.';

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title={BLOG_TITLE}
        description={BLOG_DESCRIPTION}
        path="/blog"
        ogTitle={BLOG_TITLE}
        ogDescription={BLOG_DESCRIPTION}
        image={DEFAULT_OG_IMAGE}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-3 text-3xl font-bold text-sk-navy sm:text-4xl">Culinary talent insights</h1>
          <p className="mb-10 text-lg text-sk-text-muted">{BLOG_DESCRIPTION}</p>
          <ul className="m-0 list-none space-y-6 p-0">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <time className="text-xs font-semibold uppercase tracking-wide text-sk-gold" dateTime={post.date}>
                    {post.date}
                  </time>
                  <h2 className="mt-2 text-xl font-bold text-sk-navy">
                    <Link to={`/blog/${post.slug}`} className="text-inherit no-underline hover:text-spice-purple">
                      {post.title.replace(' | Spice Krewe', '')}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-sk-text-subtle">Primary topic: {post.primaryKeyword}</p>
                  <p className="mt-3 text-sm leading-relaxed text-sk-text-muted">{post.excerpt}</p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-spice-purple no-underline hover:underline"
                  >
                    Read guide
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
