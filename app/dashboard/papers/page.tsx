"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Paper {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  status: string;
  validation_score: number;
  keywords: string[] | null;
  topics: string[] | null;
  created_at: string;
  published_at: string | null;
  authors: Author;
}

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "DISPUTED"];

export default function PapersManagementPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadPapers = async () => {
    try {
      const params = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/papers${params}`);
      const data = await res.json();
      if (res.ok) {
        setPapers(data.papers || []);
      }
    } catch {
      console.error("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [filter]);

  const updateStatus = async (paperId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/papers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paperId, status: newStatus }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Status updated to ${newStatus}` });
        loadPapers();
      } else {
        setMessage({ type: "error", text: "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const savePaper = async () => {
    if (!editingPaper) return;

    try {
      const res = await fetch("/api/papers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPaper.id,
          status: editingPaper.status,
          keywords: editingPaper.keywords,
          topics: editingPaper.topics,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Paper updated" });
        setEditingPaper(null);
        loadPapers();
      } else {
        setMessage({ type: "error", text: "Failed to update paper" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update paper" });
    }
  };

  const deletePaper = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;

    try {
      const res = await fetch(`/api/admin/papers/${paperId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Paper deleted" });
        loadPapers();
      } else {
        setMessage({ type: "error", text: "Failed to delete paper" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete paper" });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return styles.badgePublished;
      case "UNDER_REVIEW":
        return styles.badgeReview;
      case "DISPUTED":
        return styles.badgeDisputed;
      default:
        return styles.badgeDraft;
    }
  };

  const statusCounts = {
    all: papers.length,
    DRAFT: papers.filter((p) => p.status === "DRAFT").length,
    SUBMITTED: papers.filter((p) => p.status === "SUBMITTED").length,
    UNDER_REVIEW: papers.filter((p) => p.status === "UNDER_REVIEW").length,
    PUBLISHED: papers.filter((p) => p.status === "PUBLISHED").length,
    DISPUTED: papers.filter((p) => p.status === "DISPUTED").length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Papers</h1>
        <p className={styles.pageDescription}>Manage submissions and publications</p>
      </div>

      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            borderRadius: "6px",
            background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: message.type === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["all", ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={styles.actionButton}
            style={{
              background: filter === status ? "var(--foreground)" : "var(--background)",
              color: filter === status ? "var(--background)" : "var(--foreground)",
            }}
          >
            {status === "all" ? "All" : status.replace("_", " ")} ({statusCounts[status as keyof typeof statusCounts] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : papers.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No papers found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Score</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id}>
                <td>
                  <a href={`/papers/${paper.id}`} target="_blank" style={{ color: "var(--foreground)" }}>
                    {paper.title}
                  </a>
                </td>
                <td>{paper.authors?.name || "Unknown"}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadgeClass(paper.status)}`}>
                    {paper.status}
                  </span>
                </td>
                <td>{paper.validation_score}</td>
                <td>{new Date(paper.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <a
                      href={`/dashboard/papers/${paper.id}/reviewers`}
                      className={styles.actionButton}
                    >
                      Reviewers
                    </a>
                    <button
                      className={styles.actionButton}
                      onClick={() => setEditingPaper(paper)}
                    >
                      Edit
                    </button>
                    <select
                      className={styles.actionButton}
                      value={paper.status}
                      onChange={(e) => updateStatus(paper.id, e.target.value)}
                      style={{ cursor: "pointer" }}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.actionButton}
                      onClick={() => deletePaper(paper.id)}
                      style={{ color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editingPaper && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingPaper(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Edit Paper</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <p style={{ color: "var(--muted)" }}>{editingPaper.title}</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={editingPaper.status}
                onChange={(e) => setEditingPaper({ ...editingPaper, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Keywords (comma-separated)</label>
              <input
                type="text"
                className={styles.input}
                value={editingPaper.keywords?.join(", ") || ""}
                onChange={(e) =>
                  setEditingPaper({
                    ...editingPaper,
                    keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                  })
                }
                placeholder="cognitive, psychology, research"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Topics (comma-separated)</label>
              <input
                type="text"
                className={styles.input}
                value={editingPaper.topics?.join(", ") || ""}
                onChange={(e) =>
                  setEditingPaper({
                    ...editingPaper,
                    topics: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="Mental Rotation, Psychometrics"
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className={styles.primaryButton} onClick={savePaper}>
                Save Changes
              </button>
              <button className={styles.actionButton} onClick={() => setEditingPaper(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
