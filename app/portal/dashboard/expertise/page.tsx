"use client";

import { useState, useEffect } from "react";
import styles from "../../../dashboard/dashboard.module.css";

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
  "History of Psychology",
  "Mathematics",
  "Psychometrics",
  "Other",
];

interface Expertise {
  research_areas: string[];
  keywords: string[];
  h_index: number | null;
  publications_count: number | null;
  years_experience: number | null;
  institution: string | null;
  availability_status: string;
  max_concurrent_reviews: number;
  bio: string | null;
}

export default function ExpertisePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [researchAreas, setResearchAreas] = useState<string[]>([]);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState("");
  const [publicationsCount, setPublicationsCount] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [institution, setInstitution] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [maxConcurrentReviews, setMaxConcurrentReviews] = useState("3");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchExpertise();
  }, []);

  const fetchExpertise = async () => {
    try {
      const res = await fetch("/api/portal/expertise");
      const data = await res.json();

      if (data.expertise) {
        const e = data.expertise as Expertise;
        setResearchAreas(e.research_areas || []);
        setKeywords(e.keywords || []);
        setHIndex(e.h_index?.toString() || "");
        setPublicationsCount(e.publications_count?.toString() || "");
        setYearsExperience(e.years_experience?.toString() || "");
        setInstitution(e.institution || "");
        setAvailabilityStatus(e.availability_status || "available");
        setMaxConcurrentReviews(e.max_concurrent_reviews?.toString() || "3");
        setBio(e.bio || "");
      }
    } catch (err) {
      setError("Failed to load expertise profile");
    } finally {
      setLoading(false);
    }
  };

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

  const toggleResearchArea = (area: string) => {
    if (researchAreas.includes(area)) {
      setResearchAreas(researchAreas.filter((a) => a !== area));
    } else {
      setResearchAreas([...researchAreas, area]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/portal/expertise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchAreas,
          keywords,
          hIndex: hIndex ? parseInt(hIndex) : null,
          publicationsCount: publicationsCount ? parseInt(publicationsCount) : null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          institution: institution || null,
          availabilityStatus,
          maxConcurrentReviews: parseInt(maxConcurrentReviews) || 3,
          bio: bio || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Expertise profile saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Reviewer Expertise</h1>
        <p className={styles.pageDescription}>
          Set your research areas and expertise to help us match you with relevant papers.
        </p>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "#22c55e", marginBottom: "1rem" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
          {/* Left Column */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Research Areas</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Select all areas that match your expertise.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {RESEARCH_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleResearchArea(area)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "20px",
                    border: researchAreas.includes(area)
                      ? "2px solid var(--foreground)"
                      : "1px solid var(--border)",
                    background: researchAreas.includes(area) ? "var(--foreground)" : "transparent",
                    color: researchAreas.includes(area) ? "var(--background)" : "var(--foreground)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {area}
                </button>
              ))}
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
              <label className={styles.label}>Keywords</label>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Add specific topics, methods, or theories you specialize in.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  className={styles.input}
                  placeholder="e.g., working memory, fMRI, Bayesian inference"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className={styles.actionButton}
                >
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
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "var(--muted)",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
              <label className={styles.label}>Brief Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={styles.input}
                rows={4}
                placeholder="Describe your research focus and expertise..."
              />
            </div>
          </div>

          {/* Right Column */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Academic Profile</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={styles.input}
                placeholder="University or organization"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>h-index</label>
                <input
                  type="number"
                  value={hIndex}
                  onChange={(e) => setHIndex(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., 15"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Publications</label>
                <input
                  type="number"
                  value={publicationsCount}
                  onChange={(e) => setPublicationsCount(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Years of Experience</label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={styles.input}
                placeholder="e.g., 10"
                min="0"
              />
            </div>

            <h2 style={{ fontSize: "1.125rem", marginTop: "2rem", marginBottom: "1rem" }}>
              Availability
            </h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Current Availability</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className={styles.select}
              >
                <option value="available">Available for reviews</option>
                <option value="limited">Limited availability</option>
                <option value="unavailable">Not available</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Max Concurrent Reviews</label>
              <select
                value={maxConcurrentReviews}
                onChange={(e) => setMaxConcurrentReviews(e.target.value)}
                className={styles.select}
              >
                <option value="1">1 paper at a time</option>
                <option value="2">Up to 2 papers</option>
                <option value="3">Up to 3 papers</option>
                <option value="5">Up to 5 papers</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button type="submit" className={styles.primaryButton} disabled={saving}>
            {saving ? "Saving..." : "Save Expertise Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
