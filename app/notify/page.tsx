'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './notify.module.css';

export default function NotifyPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name: name || null,
          source: 'notify_page',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/" className={styles.backLink}>
          ← Back to home
        </Link>
        
        <h1 className={styles.title}>Stay Updated</h1>
        
        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>You're on the list!</h2>
            <p className={styles.successText}>
              We'll notify you when new research is published.
            </p>
            <Link href="/papers" className={styles.button}>
              Browse Papers
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>
              Get notified when we publish new research in Psychology and Behavioral Science.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                Email Address *
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </label>

              <label className={styles.label}>
                Name (optional)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="Your name"
                  disabled={loading}
                />
              </label>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Subscribing...' : 'Notify Me'}
              </button>
            </form>

            <p className={styles.privacy}>
              We respect your privacy. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
