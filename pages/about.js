import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout
      title="About Us"
      description="Who runs this bilibili video downloader and why it exists."
    >
      <div className="content-page">
        <div className="eyebrow">About</div>
        <h1>About This Project</h1>

        <p>
          Bili Save started as a small weekend project: a way to pull a
          quick mp4 copy of a bilibili video without installing desktop
          software or wrestling with browser extensions. It's built with
          Next.js, runs entirely in the browser plus a couple of lightweight
          serverless functions, and is hosted on Vercel's free tier.
        </p>

        <h2>What we do</h2>
        <p>
          You paste a public bilibili.com or b23.tv link, and the tool looks
          up that video's title, cover image, and an available download
          stream through bilibili's own public web API — the same
          information your browser already loads when you watch the video
          normally. We don't scrape, mirror, or store any video content on
          our own servers; each request is handled live and nothing is kept
          afterward.
        </p>

        <h2>What we don't do</h2>
        <p>
          We're not affiliated with, endorsed by, or connected to Bilibili
          in any way. We don't host a video library, we don't accept
          uploads, and we don't guarantee availability for any given link —
          if a video is private, region-locked, or removed, the tool simply
          can't retrieve it.
        </p>

        <h2>Why it's free</h2>
        <p>
          This is a small, ad-supported hobby project rather than a
          commercial service. There's no account system, no subscription,
          and no data resold to anyone. If something breaks or looks wrong,
          the fastest way to reach us is the{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </Layout>
  );
}

