import Layout from "../components/Layout";

export default function Disclaimer() {
  return (
    <Layout
      title="Disclaimer"
      description="General disclaimer about accuracy, availability, and use of Bili Save."
    >
      <div className="content-page">
        <div className="eyebrow">Legal</div>
        <h1>Disclaimer</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <p>
          The information and functionality provided on Bili Save are for
          general, personal use only. While we aim to keep the tool working
          reliably, everything on this site is offered without guarantees
          of any kind.
        </p>

        <h2>1. No Guarantee of Availability</h2>
        <p>
          Bili Save depends on bilibili's own public systems to look up
          video information. We don't control that service, and we can't
          guarantee it will always be reachable, that any specific video
          link will resolve, or that download quality will meet a
          particular standard.
        </p>

        <h2>2. Not Affiliated with Bilibili</h2>
        <p>
          Bili Save is an independent, unofficial tool. We are not
          affiliated with, endorsed by, or connected to Bilibili or its
          parent company in any way. "Bilibili" and related marks belong to
          their respective owners.
        </p>

        <h2>3. User Responsibility</h2>
        <p>
          You are responsible for how you use any content retrieved through
          this site. Only download videos you own or have clear permission
          to save, and follow the platform's terms of service and
          applicable copyright law. See our{" "}
          <a href="/copyright">Copyright / DMCA policy</a> for how to report
          a concern.
        </p>

        <h2>4. External Links</h2>
        <p>
          This site may link to external resources, including our own
          social profiles and support email. We aren't responsible for the
          content or practices of any third-party site you visit from here.
        </p>

        <h2>5. Changes</h2>
        <p>
          This disclaimer may be updated from time to time; the date above
          reflects the latest revision.
        </p>
      </div>
    </Layout>
  );
}

