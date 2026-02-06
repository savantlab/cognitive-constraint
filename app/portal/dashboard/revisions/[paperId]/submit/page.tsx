"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../../../dashboard/dashboard.module.css";

interface Props {
  params: Promise<{ paperId: string }>;
}

export default function SubmitRevisionPage({ params }: Props) {
  const { paperId } = use(params);
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paperTitle, setPaperTitle] = useState("Loading...");

  useEffect(() => {
    // Fetch paper info
    const fetchPaper = async () => {
      try {
        const res = await fetch(`/api/portal/revisions?paperId=${paperId}`);
        const data = await res.json();
        if (data.revisions && data.revisions.length > 0) {
          setPaperTitle(data.revisions[0].papers?.title || "Unknown Paper");
        } else {
          setPaperTitle("Paper Not Found");
        }
      } catch {
        setPaperTitle("Error Loading Paper");
      }
    };
    fetchPaper();
  }, [paperId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fileUrl.trim()) {
      setError("Please provide a file URL for your revision");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          fileUrl,
          coverLetter: coverLetter || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit revision");
        return;
      }

      router.push("/portal/dashboard/revisions");
    } catch (err) {
      console.error("Error submitting revision:", err);
      setError("Failed to submit revision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Submit Revision</h1>
        <p className={styles.pageDescription}>{paperTitle}</p>
      </div>

      <div
        style={{
          maxWidth: "600px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "2rem",
        }}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              Document URL *
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className={styles.input}
              placeholder="https://..."
              required
            />
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              Upload your document to a cloud service (Google Drive, Dropbox, etc.) and paste the
              link here.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              Cover Letter / Response to Reviewers
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className={styles.input}
              rows={8}
              placeholder="Describe the changes you made in response to reviewer feedback..."
              style={{ resize: "vertical" }}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              Explain how you addressed each point of feedback from the reviewers.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Revision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
