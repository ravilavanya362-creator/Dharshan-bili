import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { InstagramIcon, ThreadsIcon, MailIcon } from './Icons';

const INSTAGRAM_URL = "https://www.instagram.com/_.pavi.rls________?igsi=MXFwdTd0ZTY0am4xbw==";
const THREADS_URL = "https://www.threads.com/@_.pavi.rls________";
const SUPPORT_EMAIL = "pavanibevara045@gmail.com";
const SITE_URL = "https://bilisave.com";
const SITE_NAME = "Bili Save";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  description:
    "Paste a bilibili.com or b23.tv link and get high quality MP4 downloads free and fast.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Layout({ children, title, description }) {
  const router = useRouter();
  const canonicalUrl = `${SITE_URL}${router.asPath.split('?')[0]}`;

  const pageTitle = title
    ? `${title} — Bili Save`
    : "Bili Save — High Quality Bilibili Video Downloader";

  const pageDescription = description || "Paste a bilibili.com or b23.tv link and get high quality MP4 downloads free and fast.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ff0844" />
        <link rel="icon" href="/logo2.png" />
    <link rel="canonical" href={canonicalUrl} />

<meta
  property="og:url"
  content={canonicalUrl}
  key="og:url"
/>

        {/* Google Search Console Exact Verification Tag */}
        <meta name="google-site-verification" content="zWtLQz8tYG0SPObePG6iU54FO8Ol3uiKkY5wbpo8m_Y" />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} key="og:site_name" />
        <meta property="og:title" content={pageTitle} key="og:title" />
        <meta property="og:description" content={pageDescription} key="og:description" />
        <meta property="og:image" content={`${SITE_URL}/logo2.png`} key="og:image" />
        <meta property="og:type" content="website" key="og:type" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" key="twitter:card" />
        <meta name="twitter:title" content={pageTitle} key="twitter:title" />
        <meta name="twitter:description" content={pageDescription} key="twitter:description" />
        <meta name="twitter:image" content={`${SITE_URL}/logo2.png`} key="twitter:image" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </Head>

      <header className="site-header">
        <div className="site-header-inner">

          {/* Brand: logo + wordmark, side by side, big and clear */}
          <Link href="/" className="brand-stack">
            <span className="brand-icon">
              <img src="/logo2.png" alt="Bili Save" />
            </span>
            <span className="brand-logo-text">
              <span className="brand-name-main">bili</span>
              <span className="brand-name-accent">save</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="nav-group">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/about" className="nav-link">About</Link>
          </nav>

        </div>
      </header>

      <main>{children}</main>

      {/* ReelsDownloader Style Creator / Connect Section */}
      <div className="container" style={{ marginTop: '40px', marginBottom: '20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          maxWidth: '520px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'inline-block',
            background: '#fff1f2',
            color: '#ff0844',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            border: '1px solid #ffe4e6'
          }}>
            Connect with Creator
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '2px solid #ffffff'
            }}>
              🎨
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                Dharshan Studio
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, margin: 0 }}>
                Creative Design & Tech Labs
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}>
              <InstagramIcon size={16} /> Instagram
            </a>
            
            <a href={THREADS_URL} target="_blank" rel="noreferrer" style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}>
              <ThreadsIcon size={16} /> Threads
            </a>

            <a href={`mailto:${SUPPORT_EMAIL}`} style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}>
              <MailIcon size={16} /> Support
            </a>
          </div>
        </div>
      </div>

      {/* Footer Section with All Legal Links */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-nav">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/copyright">DMCA Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
          <div className="footer-copy">
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              Disclaimer: Bili Save is not affiliated with, endorsed, or sponsored by Bilibili. We do not host any media on our servers; all files are fetched directly from publicly available third-party sources.
            </p>
            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              © {new Date().getFullYear()} Bili Save by Dharshan Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
              }


    
