"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./contact.module.css";
import NatoCaptcha from "../components/NatoCaptcha";

export default function ContactPage() {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Contact Us</h1>
        
        {!captchaVerified ? (
          <div className={styles.captchaSection}>
            <p className={styles.subtitle}>
              Please verify you're human to access the contact form.
            </p>
            <NatoCaptcha onSuccess={() => setCaptchaVerified(true)} />
          </div>
        ) : sent ? (
          <div className={styles.success}>
            <h2>Message Sent</h2>
            <p>Thank you for contacting us. We'll get back to you soon.</p>
            <Link href="/" className={styles.backLink}>
              Return to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.subtitle}>
              For licensing inquiries, general questions, or feedback.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Your name (optional)"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={styles.select}
              >
                <option value="">Select a topic...</option>
                <option value="licensing">Licensing Inquiry</option>
                <option value="subscription">Subscription Question</option>
                <option value="submission">Paper Submission</option>
                <option value="press">Press / Media</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.textarea}
                placeholder="Your message..."
                rows={6}
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={sending || !email.trim() || !message.trim()}
              className={styles.button}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            © 2026 Cognitive Constraint Journal. Free access for all.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/education" className={styles.footerLink}>Education</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
            <Link href="/legal" className={styles.footerLink}>Legal</Link>
            <Link href="/notify" className={styles.footerLink}>Get Notified</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
