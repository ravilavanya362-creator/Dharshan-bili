import Layout from "../components/Layout";

export default function Copyright() {
  return (
    <Layout
      title="Copyright / DMCA Policy"
      description="How to submit a copyright takedown request for this site."
    >
      <div className="content-page">
        <div className="eyebrow">Legal</div>
        <h1>Copyright / DMCA Policy</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <p>
          We respect the intellectual property rights of others and expect
          users of this Service to do the same. This page explains our
          approach to copyright and how rights holders can request that
          access to specific content be disabled.
        </p>

        <h2>1. We Don't Host Video Files</h2>
        <p>
          This Service does not store, mirror, or host any video content on
          its own servers. Each request simply looks up publicly available
          metadata from bilibili.com's own systems and relays a link to
          that video's existing stream, live and on demand. We do not
          maintain a searchable library or archive of videos.
        </p>

        <h2>2. Responsibility for Downloaded Content</h2>
        <p>
          Users are solely responsible for ensuring they have the right to
          download and keep a copy of any video they retrieve through this
          Service. Our{" "}
          <a href="/terms">Terms of Service</a> require that users only
          download content they own or have explicit permission to save.
        </p>

        <h2>3. Submitting a Takedown Request</h2>
        <p>
          If you are a copyright holder (or authorized to act on one's
          behalf) and believe this Service is facilitating access to your
          copyrighted work without authorization, you can request that we
          block lookups for the specific video in question. Please include:
        </p>
        <ul>
          <li>Your name and contact information;</li>
          <li>
            A description of the copyrighted work you believe is affected;
          </li>
          <li>The specific bilibili.com or b23.tv link in question;</li>
          <li>
            A statement that you have a good-faith belief the use is
            unauthorized, and that the information in your request is
            accurate.
          </li>
        </ul>
        <p>
          Send this information via the <a href="/contact">contact page</a>.
          We will review valid requests and take reasonable steps to
          prevent the Service from resolving the specified link.
        </p>

        <h2>4. Repeat Access Requests</h2>
        <p>
          We reserve the right to restrict access to the Service for anyone
          who repeatedly submits requests involving content they don't have
          rights to download.
        </p>
      </div>
    </Layout>
  );
}
