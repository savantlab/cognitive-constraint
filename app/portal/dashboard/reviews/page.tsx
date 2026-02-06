"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../dashboard/dashboard.module.css";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  status: string;
  created_at: string;
}

interface Assignment {
  id: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  review_id: string | null;
  paper: Paper;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    content: "",
    recommendation: "minor_revisions",
    confidenceLevel: "medium",
    isAnonymous: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/portal/reviews");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/reviews/${selectedPaper.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Refresh assignments and close form
      await fetchAssignments();
      setSelectedPaper(null);
      setReviewForm({
        content: "",
        recommendation: "minor_revisions",
        confidenceLevel: "medium",
        isAnonymous: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async (paperId: string) => {
    setStartingChat(paperId);
    try {
      const res = await fetch("/api/portal/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId }),
      });

      if (res.ok) {
        router.push("/portal/dashboard/messages");
      } else {
        const data = await res.json();
        setError(data.error || "Could not start conversation");
      }
    } catch {
      setError("Failed to start conversation");
    } finally {
      setStartingChat(null);
    }
  };

  const pendingReviews = assignments.filter((a) => a.status !== "completed");
  const completedReviews = assignments.filter((a) => a.status === "completed");

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Review Queue</h1>
        <p className={styles.pageDescription}>
          Papers assigned to you for peer review.
        </p>
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
      )}

      {/* Review Form Modal */}
      {selectedPaper && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "700px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>{selectedPaper.title}</h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              {selectedPaper.abstract}
            </p>

            <form onSubmit={handleSubmitReview}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Review</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, content: e.target.value })
                  }
                  className={styles.input}
                  rows={8}
                  placeholder="Provide detailed feedback on the paper's methodology, findings, and clarity..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recommendation</label>
                <select
                  value={reviewForm.recommendation}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      recommendation: e.target.value,
                    })
                  }
                  className={styles.select}
                >
                  <option value="accept">Accept</option>
                  <option value="minor_revisions">Minor Revisions</option>
                  <option value="major_revisions">Major Revisions</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confidence Level</label>
                <select
                  value={reviewForm.confidenceLevel}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      confidenceLevel: e.target.value,
                    })
                  }
                  className={styles.select}
                >
                  <option value="low">
                    Low - Outside my area of expertise
                  </option>
                  <option value="medium">
                    Medium - Familiar with the topic
                  </option>
                  <option value="high">High - Expert in this area</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={reviewForm.isAnonymous}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        isAnonymous: e.target.checked,
                      })
                    }
                  />
                  Submit anonymously
                </label>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setSelectedPaper(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Reviews */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Pending Reviews ({pendingReviews.length})
        </h2>

        {pendingReviews.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            No papers pending review. Check back later!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingReviews.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: "0.5rem" }}>
                      {assignment.paper.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.9rem",
                        marginBottom: "0.75rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {assignment.paper.abstract}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Invited:{" "}
                      {new Date(assignment.invited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                    <button
                      className={styles.primaryButton}
                      onClick={() => setSelectedPaper(assignment.paper)}
                    >
                      Write Review
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleStartChat(assignment.paper.id)}
                      disabled={startingChat === assignment.paper.id}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {startingChat === assignment.paper.id ? "..." : "Message Author"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Reviews */}
      {completedReviews.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Completed Reviews ({completedReviews.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {completedReviews.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  opacity: 0.7,
                }}
              >
                <h3 style={{ marginBottom: "0.5rem" }}>
                  {assignment.paper.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Completed:{" "}
                  {assignment.completed_at
                    ? new Date(assignment.completed_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
