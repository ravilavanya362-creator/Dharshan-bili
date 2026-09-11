import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy"
      description="How this site handles data, cookies, and third-party advertising."
    >
      <div className="content-page">
        <div className="eyebrow">Legal</div>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <p>
          This Privacy Policy explains what information this website
          ("we," "us," or "this site") collects, how it's used, and the
          choices you have. By using this site, you agree to the practices
          described below.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We don't require an account, and we don't ask you to submit
          personal information to use the video downloader tool itself. The
          link you paste into the tool is sent to our server only to look
          up that video's public metadata and stream URL, and is not stored
          after your request completes.
        </p>
        <p>
          If you use the contact form, the name, email, and message you
          provide are sent directly to our email address via your own mail
          client — we don't store a separate copy on our servers.
        </p>

        <h2>2. Cookies and Similar Technologies</h2>
        <p>
          This site itself does not set tracking cookies. However, if
          advertising is displayed on this site (see Section 3), our
          advertising partners may set cookies or similar identifiers in
          your browser to serve and measure ads.
        </p>

        <h2>3. Third-Party Advertising</h2>
        <p>
          This site may display advertisements served by third-party
          advertising networks, such as Google AdSense. These networks may
          use cookies, web beacons, or similar technologies to collect
          information about your visits to this and other websites, in
          order to provide advertisements about goods and services that may
          interest you.
        </p>
        <p>
          Google's use of advertising cookies enables it and its partners
          to serve ads based on your visits to this site and/or other sites
          on the Internet. You may opt out of personalized advertising by
          visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noreferrer"
          >
            Google Ads Settings
          </a>
          , or generally at{" "}
          <a
            href="https://www.aboutads.info/choices"
            target="_blank"
            rel="noreferrer"
          >
            aboutads.info
          </a>
          .
        </p>

        <h2>4. Server Logs</h2>
        <p>
          Like most websites, our hosting provider (Vercel) automatically
          logs standard technical information for security and performance
          purposes, such as IP address, browser type, and request
          timestamps. We don't use these logs to identify individual
          visitors.
        </p>

        <h2>5. Third-Party Content</h2>
        <p>
          When you use the downloader tool, requests are made to
          bilibili.com's public API on your behalf to retrieve video
          information. That interaction is subject to Bilibili's own
          privacy practices, which we don't control.
        </p>

        <h2>6. Children's Privacy</h2>
        <p>
          This site is not directed at children under 13, and we do not
          knowingly collect personal information from children.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will
          be posted on this page with an updated "Last updated" date.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          Questions about this policy? Reach out via the{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </Layout>
  );
}
