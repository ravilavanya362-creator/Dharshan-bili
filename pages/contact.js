import { useState } from "react";
import Layout from "../components/Layout";
import { InstagramIcon, ThreadsIcon, MailIcon } from "../components/Icons";

const CONTACT_EMAIL = "pavanibevara045@gmail.com";
const INSTAGRAM_URL =
  "https://www.instagram.com/_.pavi.rls________?igsi=MXFwdTd0ZTY0am4xbw==";
const THREADS_URL = "https://www.threads.com/@_.pavi.rls________";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${form.name || "site visitor"}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <Layout
      title="Contact"
      description="Get in touch about a bug, a takedown request, or general feedback."
    >
      <div className="content-page">
        <div className="eyebrow">Contact</div>
        <h1>Get in Touch</h1>
        <p>
          Questions, bug reports, or copyright concerns — reach us directly
          at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or use
          the form below, which opens a pre-filled email in your mail app.
        </p>

        <div className="creator-links" style={{ justifyContent: "flex-start", margin: "16px 0 28px" }}>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="creator-link">
            <InstagramIcon /> Instagram
          </a>
          <a href={THREADS_URL} target="_blank" rel="noreferrer" className="creator-link">
            <ThreadsIcon /> Threads
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="creator-link">
            <MailIcon /> Email
          </a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} value={form.message} onChange={handleChange} required />
          </label>
          <button type="submit">Send message</button>
        </form>
      </div>
    </Layout>
  );
}
