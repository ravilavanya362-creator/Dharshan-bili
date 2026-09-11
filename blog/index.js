import Link from "next/link";
import Layout from "../../components/Layout";
import { getAllPosts } from "../../lib/posts";

export default function BlogIndex({ posts }) {
  return (
    <Layout
      title="BiliSave Blog - Guides & Tips"
      description="Articles about video quality, streaming formats, and downloading responsibly."
    >
      <div className="content-page" style={{ maxWidth: "860px", padding: "40px 16px 80px" }}>
        
        {/* Sleek Hero Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div className="eyebrow eyebrow-center" style={{ marginBottom: "12px", background: "rgba(255, 8, 68, 0.08)", color: "#ff0844", border: "1px solid rgba(255, 8, 68, 0.15)" }}>
            THE BLOG & GUIDES
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.5rem)", fontWeight: "900", letterSpacing: "-0.03em", marginBottom: "12px", color: "var(--text-main)" }}>
            Everything You Need to Know <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>About Downloading</span>
          </h1>
          <p className="subtitle" style={{ textAlign: "center", margin: "0 auto", fontSize: "1rem", color: "var(--text-muted)", maxWidth: "540px", lineHeight: "1.6" }}>
            Expert guides, quality breakdowns, and safe streaming tips structured for a seamless reading experience.
          </p>
        </div>

        {/* Premium Post Cards Grid */}
        <div className="post-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {posts.map((post, index) => {
            const gradients = [
              "linear-gradient(135deg, #ff0844 0%, #ff4e50 100%)",
              "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
              "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            ];
            const cardBg = post.gradient || gradients[index % gradients.length];

            return (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`} 
                className="post-card"
                style={{ 
                  borderRadius: "24px", 
                  background: "#ffffff",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.01)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none"
                }}
              >
                {/* Visual Gradient Banner Header */}
                <div className="post-thumb" style={{ background: cardBg, height: "150px", position: "relative" }}>
                  <div className="thumb-visual" style={{ padding: "18px 20px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div className="thumb-top-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {post.category ? (
                        <span className="thumb-tag" style={{ background: "rgba(255, 255, 255, 0.22)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.35)", color: "#fff", fontWeight: "800", fontSize: "0.68rem", padding: "5px 12px", borderRadius: "99px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                          {post.category}
                        </span>
                      ) : <span />}
                      <div className="thumb-icon-badge" style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.25)", border: "1px solid rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}>
                        <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>{post.emoji || "📄"}</span>
                      </div>
                    </div>
                    {post.tagline && (
                      <div className="thumb-heading">
                        <p className="thumb-title" style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "700", textShadow: "0 2px 6px rgba(0,0,0,0.25)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                          {post.tagline}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body Information */}
                <div className="post-card-body" style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span className="post-date" style={{ fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {post.readingTime && (
                      <>
                        <span style={{ color: "#cbd5e1" }}>•</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8" }}>{post.readingTime}</span>
                      </>
                    )}
                  </div>

                  <h2 style={{ fontSize: "1.15rem", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--text-main)", marginBottom: "10px", lineHeight: "1.35" }}>
                    {post.title}
                  </h2>

                  <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.excerpt}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                    <span className="post-read-more" style={{ color: "#ff0844", fontWeight: "800", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Read full article 
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { posts: getAllPosts() } };
                  }




              
