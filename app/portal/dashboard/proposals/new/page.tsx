"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../../../dashboard/dashboard.module.css";

const RESEARCH_AREAS = [
  "Cognitive Psychology",
  "Neuroscience",
  "Behavioral Economics",
  "Social Psychology",
  "Developmental Psychology",
  "Clinical Psychology",
  "Educational Psychology",
  "Perception & Attention",
  "Memory & Learning",
  "Decision Making",
  "Language & Communication",
  "Emotion & Motivation",
  "Consciousness",
  "Artificial Intelligence",
  "Human-Computer Interaction",
  "Philosophy of Mind",
  "Methodology & Statistics",
  "Other",
];

const ESTIMATED_LENGTHS = [
  "3,000 - 5,000 words",
  "5,000 - 8,000 words",
  "8,000 - 12,000 words",
  "12,000+ words",
];

export default function NewProposalPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [methodologySummary, setMethodologySummary] = useState("");
  const [expectedContribution, setExpectedContribution] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [estimatedLength, setEstimatedLength] = useState("");

  const handleAddKeyword = () => {
    const keyword = keywordsInput.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeywordsInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setError("");

    if (!title || !abstract || !researchArea) {
      setError("Please fill in title, abstract, and research area.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          abstract,
          methodologySummary,
          expectedContribution,
          researchArea,
          keywords,
          estimatedLength,
          isDraft,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit proposal");
      }

      router.push("/portal/dashboard/proposals");
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
          href="/portal/dashboard/proposals"
          style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem", display: "block" }}
        >
          ← Back to proposals
        </Link>
        <h1 className={styles.pageTitle}>Submit a Proposal</h1>
        <p className={styles.pageDescription}>
          Propose your research for consideration. Accepted proposals receive funding for full publication and peer review.
        </p>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "2fr 1fr" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "2rem",
          }}
        >
          <div className={styles.formGroup}>
            <label className={styles.label}>Proposal Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="A clear, descriptive title for your research"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Abstract *</label>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className={styles.input}
              rows={5}
              placeholder="Summarize your research question, approach, and expected findings (250-400 words)"
            />
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              {abstract.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Methodology Summary</label>
            <textarea
              value={methodologySummary}
              onChange={(e) => setMethodologySummary(e.target.value)}
              className={styles.input}
              rows={4}
              placeholder="Briefly describe your research methodology, data sources, and analytical approach"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Expected Contribution</label>
            <textarea
              value={expectedContribution}
              onChange={(e) => setExpectedContribution(e.target.value)}
              className={styles.input}
              rows={3}
              placeholder="What novel contribution will this research make to the field?"
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className={styles.primaryButton}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className={styles.actionButton}
              disabled={submitting}
            >
              Save as Draft
            </button>
          </div>
        </div>

        <div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Research Area *</label>
              <select
                value={researchArea}
                onChange={(e) => setResearchArea(e.target.value)}
                className={styles.select}
              >
                <option value="">Select a research area</option>
                {RESEARCH_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Keywords</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  className={styles.input}
                  placeholder="Add keyword"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddKeyword} className={styles.actionButton}>
                  Add
                </button>
              </div>
              {keywords.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--muted)" }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estimated Paper Length</label>
              <select
                value={estimatedLength}
                onChange={(e) => setEstimatedLength(e.target.value)}
                className={styles.select}
              >
                <option value="">Select estimated length</option>
                {ESTIMATED_LENGTHS.map((length) => (
                  <option key={length} value={length}>
                    {length}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>What Happens Next?</h3>
            <ol style={{ color: "var(--muted)", fontSize: "0.9rem", paddingLeft: "1.25rem", lineHeight: 1.7 }}>
              <li>Your proposal is reviewed by our editorial team</li>
              <li>If promising, we match you with expert reviewers</li>
              <li>You may receive feedback or revision requests</li>
              <li>Accepted proposals receive funding for publication</li>
              <li>You submit your full paper for peer review</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
