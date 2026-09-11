import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import { getAllPosts } from "../../lib/posts";
import { renderContent } from "../../lib/markdown-lite";

const SITE_URL = "https://www.bilisave.com";
export default function BlogPost({ post, related }) {
  if (!post) return null;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const publishedDate = new Date(post.date).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: publishedDate,
    dateModified: publishedDate,
    author: { "@type": "Organization", name: "Dharshan Design and Tech Labs" },
    publisher: { "@type": "Organization", name: "Bili Save" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": SITE_URL
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": `${SITE_URL}/blog`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": post.title,
      "item": url
    }
  ]
};
  return (
    <Layout title={post.title} description={post.excerpt}>
      <Head>
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" key="og:type" />
        <meta property="og:title" content={post.title} key="og:title" />
        <meta property="og:description" content={post.excerpt} key="og:description" />
        <meta property="og:url" content={url} />
        {post.keywords && <meta name="keywords" content={post.keywords.join(", ")} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
          <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(breadcrumbJsonLd)
  }}
/>
      </Head>

      <article className="content-page post-article">
        <div className="post-article-thumb" style={{ background: post.gradient }}>
          <div className="thumb-visual">
            <div className="thumb-top-row">
              {post.category && <span className="thumb-tag">{post.category}</span>}
              <div className="thumb-icon-badge">
                <span>{post.emoji}</span>
              </div>
            </div>
            {post.tagline && (
              <div className="thumb-heading">
                <p className="thumb-title">{post.tagline}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/blog">Blog</Link>{" "}
          <span>/</span> <span>{post.title}</span>
        </nav>

        <div className="article-meta-row">
          <span className="post-date">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.readTime && (
            <>
              <span className="meta-dot">•</span>
              <span className="post-date">{post.readTime}</span>
            </>
          )}
        </div>

        <h1>{post.title}</h1>
        <p className="article-excerpt">{post.excerpt}</p>

        <div className="article-body">{renderContent(post.content)}</div>

        <div className="article-cta">
          <p>Ready to save a video?</p>
          <Link href="/#top" className="btn-main article-cta-btn">
            Try the Downloader
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div className="container">
          <section className="related-section">
            <h2 className="related-title">Related reading</h2>
            <div className="post-list post-list-compact">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                  <div className="post-thumb" style={{ background: p.gradient }}>
                    <div className="thumb-visual">
                      <div className="thumb-top-row">
                        {p.category && <span className="thumb-tag">{p.category}</span>}
                        <div className="thumb-icon-badge">
                          <span>{p.emoji}</span>
                        </div>
                      </div>
                      {p.tagline && (
                        <div className="thumb-heading">
                          <p className="thumb-title">{p.tagline}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="post-card-body">
                    <span className="post-date">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === params.slug) || null;
  const related = post
    ? posts.filter((p) => p.slug !== post.slug).slice(0, 2)
    : [];
  return { props: { post, related } };
  }


          
