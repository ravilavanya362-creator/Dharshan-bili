import Layout from "../components/Layout";

export default function Terms() {
  return (
    <Layout
      title="Terms of Service"
      description="The rules for using this bilibili video downloader tool."
    >
      <div className="content-page">
        <div className="eyebrow">Legal</div>
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <p>
          Please read these Terms of Service ("Terms") carefully before
          using this website (the "Service"). By using the Service, you
          agree to be bound by these Terms.
        </p>

        <h2>1. Purpose of the Service</h2>
        <p>
          This Service lets you look up publicly available bilibili.com
          video metadata and retrieve a direct video file for that content.
          It is intended for personal, non-commercial use — for example,
          saving a copy of your own uploaded content, or content you have
          explicit permission to download.
        </p>

        <h2>2. Acceptable Use</h2>
        <p>You agree that you will not use the Service to:</p>
        <ul>
          <li>
            Download, copy, or redistribute content you do not own and do
            not have permission to save;
          </li>
          <li>
            Violate Bilibili's own Terms of Service or any applicable
            copyright, trademark, or other intellectual property law;
          </li>
          <li>
            Attempt to overload, disrupt, or reverse-engineer the Service
            or the third-party APIs it relies on;
          </li>
          <li>
            Use the Service for any commercial redistribution or resale of
            downloaded content.
          </li>
        </ul>

        <h2>3. No Affiliation</h2>
        <p>
          This Service is an independent project and is not affiliated
          with, sponsored by, or endorsed by Bilibili or its parent
          company. All trademarks, logos, and video content accessed
          through this Service remain the property of their respective
          owners.
        </p>

        <h2>4. No Warranty</h2>
        <p>
          The Service is provided "as is" and "as available," without
          warranties of any kind. We do not guarantee that any particular
          video link will resolve successfully, that download quality will
          meet any particular standard, or that the Service will be
          available at all times.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, or consequential damages arising from your
          use of the Service, including any consequences of downloading
          content in violation of a third party's rights or a platform's
          terms of service. You are solely responsible for ensuring your
          use of downloaded content complies with applicable law.
        </p>

        <h2>6. Copyright Complaints</h2>
        <p>
          If you believe content accessible through this Service infringes
          your copyright, see our{" "}
          <a href="/copyright">Copyright / DMCA policy</a> for how to
          submit a takedown request.
        </p>

        <h2>7. Changes to the Service or Terms</h2>
        <p>
          We may modify or discontinue the Service at any time, and may
          update these Terms periodically. Continued use of the Service
          after changes are posted constitutes acceptance of the revised
          Terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about these Terms can be sent through the{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </Layout>
  );
}
