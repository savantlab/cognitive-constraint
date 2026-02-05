"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../verify/verify.module.css";

export default function PortalPage() {
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
      // First check if email is invited
      const checkRes = await fetch("/api/portal/check-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setError(checkData.error || "This email is not invited to the portal");
        setLoading(false);
        return;
      }

      // Email is invited, generate auth code
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
      const res = await fetch("/api/portal/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }

      // Redirect to portal dashboard on success
      router.push("/portal/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reviewer & Author Portal</h1>
        <p className={styles.subtitle}>
          Sign in with your invited email address to access the portal.
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
                placeholder="you@university.edu"
                required
                disabled={loading}
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Checking..." : "Continue"}
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
              {loading ? "Verifying..." : "Sign In"}
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
