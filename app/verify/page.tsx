"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./verify.module.css";

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/generate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate code");
        return;
      }

      // In development, show the code
      if (data.code) {
        setDevCode(data.code);
      }

      setStep("code");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }

      // Redirect to papers on success
      router.push("/papers");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Access Papers</h1>
        <p className={styles.subtitle}>
          Enter your email to receive an access code. No account required.
        </p>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <label className={styles.label}>
              Email Address
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
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Get Access Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className={styles.form}>
            <p className={styles.emailNote}>
              Code sent to <strong>{email}</strong>
            </p>
            
            {devCode && (
              <div className={styles.devCode}>
                <strong>Dev Mode:</strong> Your code is <code>{devCode}</code>
              </div>
            )}

            <label className={styles.label}>
              Access Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={styles.input}
                placeholder="XXXXXX"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setDevCode(null);
              }}
            >
              Use different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
