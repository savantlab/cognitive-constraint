"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../../dashboard/dashboard.module.css";

interface Paper {
  id: string;
  title: string;
}

interface Revision {
  id: string;
  paper_id: string;
  version_number: number;
  file_url: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  reviewer_feedback: string | null;
  papers: Paper;
}

export default function RevisionsPage() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const res = await fetch("/api/portal/revisions");
      const data = await res.json();
      setRevisions(data.revisions || []);
    } catch (err) {
      console.error("Error fetching revisions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group revisions by paper
  const paperGroups = revisions.reduce(
    (acc, rev) => {
      const paperId = rev.paper_id;
      if (!acc[paperId]) {
        acc[paperId] = {
          paper: rev.papers,
          revisions: [],
        };
      }
      acc[paperId].revisions.push(rev);
      return acc;
    },
    {} as Record<string, { paper: Paper; revisions: Revision[] }>
  );

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; color: string }> = {
      submitted: { bg: "#3b82f6", color: "white" },
      under_review: { bg: "#f59e0b", color: "white" },
      revision_requested: { bg: "#ef4444", color: "white" },
      approved: { bg: "#10b981", color: "white" },
      rejected: { bg: "#6b7280", color: "white" },
    };
    const style = statusStyles[status] || { bg: "#6b7280", color: "white" };

    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: "0.25rem 0.75rem",
          borderRadius: "4px",
          fontSize: "0.75rem",
          textTransform: "capitalize",
        }}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Paper Revisions</h1>
        <p className={styles.pageDescription}>
          Track revision history and feedback for your papers.
        </p>
      </div>

      {Object.keys(paperGroups).length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)" }}>No revisions found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {Object.entries(paperGroups).map(([paperId, { paper, revisions }]) => (
            <div
              key={paperId}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {/* Paper Header */}
              <button
                onClick={() => setSelectedPaper(selectedPaper === paperId ? null : paperId)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "1rem 1.5rem",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    selectedPaper === paperId ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>{paper.title}</h3>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    {revisions.length} revision{revisions.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span style={{ fontSize: "1.25rem", color: "var(--muted)" }}>
                  {selectedPaper === paperId ? "−" : "+"}
                </span>
              </button>

              {/* Revisions List */}
              {selectedPaper === paperId && (
                <div style={{ padding: "1rem 1.5rem" }}>
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: "1rem",
                        background: "var(--background)",
                        borderRadius: "6px",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600 }}>Version {rev.version_number}</span>
                          <span
                            style={{
                              marginLeft: "1rem",
                              fontSize: "0.85rem",
                              color: "var(--muted)",
                            }}
                          >
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {getStatusBadge(rev.status)}
                      </div>

                      {rev.cover_letter && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--muted)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Cover Letter:
                          </p>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>{rev.cover_letter}</p>
                        </div>
                      )}

                      {rev.reviewer_feedback && (
                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "0.75rem",
                            borderRadius: "4px",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#92400e",
                              marginBottom: "0.25rem",
                              fontWeight: 500,
                            }}
                          >
                            Reviewer Feedback:
                          </p>
                          <p style={{ fontSize: "0.9rem", margin: 0, color: "#78350f" }}>
                            {rev.reviewer_feedback}
                          </p>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        {rev.file_url && (
                          <a
                            href={rev.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.85rem",
                              color: "#3b82f6",
                              textDecoration: "none",
                            }}
                          >
                            View Document →
                          </a>
                        )}
                        <Link
                          href={`/portal/dashboard/revisions/${paperId}/submit`}
                          style={{
                            fontSize: "0.85rem",
                            color: "#3b82f6",
                            textDecoration: "none",
                          }}
                        >
                          Submit New Revision →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
