"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../../../dashboard/dashboard.module.css";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    content: "",
    researchArea: "",
    keywords: "",
    authors: "",
  });

  const researchAreas = [
    "Cognitive Psychology",
    "Neuroscience",
    "Behavioral Economics",
    "Decision Making",
    "Memory & Learning",
    "Attention & Perception",
    "Language & Communication",
    "Social Cognition",
    "Developmental Psychology",
    "Computational Modeling",
    "Clinical Psychology",
    "History of Psychology",
    "Psychometrics",
    "Other",
  ];
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit paper");
      }

      router.push("/portal/dashboard/submissions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link
          href="/portal/dashboard/submissions"
          style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem", display: "block" }}
        >
          ← Back to submissions
        </Link>
        <h1 className={styles.pageTitle}>Submit a Paper</h1>
        <p className={styles.pageDescription}>
          Submit your research for peer review by the Cognitive Constraint Journal community.
        </p>
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "2rem",
        }}
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>Paper Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={styles.input}
            placeholder="Enter the title of your paper"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Authors *</label>
          <textarea
            value={form.authors}
            onChange={(e) => setForm({ ...form, authors: e.target.value })}
            className={styles.input}
            rows={3}
            placeholder="John Smith (University of Example)&#10;Jane Doe (Research Institute)&#10;Bob Johnson (Example Lab)"
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            List each author on a separate line. Include affiliations in parentheses.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Abstract *</label>
          <textarea
            value={form.abstract}
            onChange={(e) => setForm({ ...form, abstract: e.target.value })}
            className={styles.input}
            rows={4}
            placeholder="Provide a brief summary of your paper (200-300 words recommended)"
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            {form.abstract.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Research Area *</label>
          <select
            value={form.researchArea}
            onChange={(e) => setForm({ ...form, researchArea: e.target.value })}
            className={styles.select}
            required
          >
            <option value="">Select a research area</option>
            {researchAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Keywords *</label>
          <input
            type="text"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className={styles.input}
            placeholder="e.g., working memory, cognitive load, attention span"
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            Enter 3-5 keywords separated by commas. These help match your paper with appropriate reviewers.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Full Content *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={styles.input}
            rows={20}
            placeholder="Enter the full content of your paper. You can use Markdown formatting."
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            Markdown formatting supported. Include sections like Introduction, Methods, Results, Discussion, and References.
          </p>
        </div>

        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Submission Guidelines</h3>
          <ul style={{ color: "var(--muted)", fontSize: "0.9rem", paddingLeft: "1.25rem", lineHeight: 1.6 }}>
            <li>Papers should present original research or analysis</li>
            <li>Include clear methodology and reproducible findings</li>
            <li>Cite all sources appropriately</li>
            <li>Your submission will be reviewed by invited peer reviewers</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
          <Link href="/portal/dashboard/submissions" className={styles.actionButton}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
