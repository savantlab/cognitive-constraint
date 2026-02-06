"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import styles from "../../../dashboard.module.css";

interface Paper {
  id: string;
  title: string;
  status: string;
}

interface Reviewer {
  id: string;
  paper_id: string;
  reviewer_email: string;
  reviewer_id: string | null;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  review_notes: string | null;
}

interface AvailableReviewer {
  email: string;
  name: string | null;
  institution: string | null;
}

export default function PaperReviewersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: paperId } = use(params);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [availableReviewers, setAvailableReviewers] = useState<AvailableReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddReviewer, setShowAddReviewer] = useState(false);
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const loadData = async () => {
    try {
      // Load paper
      const paperRes = await fetch(`/api/admin/papers/${paperId}`);
      const paperData = await paperRes.json();
      if (paperRes.ok) {
        setPaper(paperData.paper);
      }

      // Load assigned reviewers
      const reviewersRes = await fetch(`/api/admin/papers/${paperId}/reviewers`);
      const reviewersData = await reviewersRes.json();
      if (reviewersRes.ok) {
        setReviewers(reviewersData.reviewers || []);
      }

      // Load available reviewers (users with reviewer role)
      const availableRes = await fetch("/api/admin/users?role=reviewer");
      const availableData = await availableRes.json();
      if (availableRes.ok) {
        setAvailableReviewers(availableData.users || []);
      }
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [paperId]);

  const addReviewers = async () => {
    const emails = newReviewerEmail
      ? [newReviewerEmail.toLowerCase().trim(), ...selectedReviewers]
      : selectedReviewers;

    if (emails.length === 0) {
      setMessage({ type: "error", text: "Please select or enter at least one reviewer" });
      return;
    }

    try {
      const res = await fetch(`/api/admin/papers/${paperId}/reviewers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Added ${emails.length} reviewer(s)` });
        setShowAddReviewer(false);
        setNewReviewerEmail("");
        setSelectedReviewers([]);
        loadData();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to add reviewers" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add reviewers" });
    }
  };

  const sendInvite = async (reviewerId: string, email: string) => {
    try {
      const res = await fetch(`/api/admin/papers/${paperId}/reviewers/${reviewerId}/invite`, {
        method: "POST",
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Invitation sent to ${email}` });
        loadData();
      } else {
        setMessage({ type: "error", text: "Failed to send invitation" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send invitation" });
    }
  };

  const sendAllInvites = async () => {
    const pendingReviewers = reviewers.filter(r => r.status === "invited" && !r.accepted_at);
    if (pendingReviewers.length === 0) {
      setMessage({ type: "error", text: "No pending invitations to send" });
      return;
    }

    try {
      const res = await fetch(`/api/admin/papers/${paperId}/reviewers/invite-all`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Sent ${data.sent} invitations` });
        loadData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send invitations" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send invitations" });
    }
  };

  const removeReviewer = async (reviewerId: string) => {
    if (!confirm("Remove this reviewer?")) return;

    try {
      const res = await fetch(`/api/admin/papers/${paperId}/reviewers/${reviewerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Reviewer removed" });
        loadData();
      } else {
        setMessage({ type: "error", text: "Failed to remove reviewer" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove reviewer" });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return styles.badgePublished;
      case "accepted":
        return styles.badgeReview;
      case "declined":
        return styles.badgeDisputed;
      default:
        return styles.badgeDraft;
    }
  };

  const assignedEmails = new Set(reviewers.map(r => r.reviewer_email));
  const unassignedReviewers = availableReviewers.filter(r => !assignedEmails.has(r.email));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!paper) {
    return <div>Paper not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard/papers" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          ← Back to Papers
        </Link>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Reviewers</h1>
        <p className={styles.pageDescription}>{paper.title}</p>
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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Assigned</p>
          <p className={styles.statValue}>{reviewers.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Accepted</p>
          <p className={styles.statValue}>{reviewers.filter(r => r.status === "accepted").length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{reviewers.filter(r => r.status === "completed").length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{reviewers.filter(r => r.status === "invited").length}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className={styles.primaryButton} onClick={() => setShowAddReviewer(true)}>
          + Add Reviewers
        </button>
        {reviewers.some(r => r.status === "invited") && (
          <button className={styles.actionButton} onClick={sendAllInvites}>
            Send All Invites
          </button>
        )}
      </div>

      {reviewers.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No reviewers assigned yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Invited</th>
              <th>Accepted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviewers.map((reviewer) => (
              <tr key={reviewer.id}>
                <td>{reviewer.reviewer_email}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadgeClass(reviewer.status)}`}>
                    {reviewer.status}
                  </span>
                </td>
                <td>{new Date(reviewer.invited_at).toLocaleDateString()}</td>
                <td>{reviewer.accepted_at ? new Date(reviewer.accepted_at).toLocaleDateString() : "—"}</td>
                <td>
                  <div className={styles.actions}>
                    {reviewer.status === "invited" && (
                      <button
                        className={styles.actionButton}
                        onClick={() => sendInvite(reviewer.id, reviewer.reviewer_email)}
                      >
                        Send Invite
                      </button>
                    )}
                    <button
                      className={styles.actionButton}
                      onClick={() => removeReviewer(reviewer.id)}
                      style={{ color: "#ef4444" }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Reviewers Modal */}
      {showAddReviewer && (
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
          onClick={() => setShowAddReviewer(false)}
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
            <h2 style={{ marginBottom: "1.5rem" }}>Add Reviewers</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Add by Email</label>
              <input
                type="email"
                className={styles.input}
                value={newReviewerEmail}
                onChange={(e) => setNewReviewerEmail(e.target.value)}
                placeholder="reviewer@university.edu"
              />
            </div>

            {unassignedReviewers.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Or Select from Reviewers</label>
                <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  {unassignedReviewers.map((reviewer) => (
                    <label
                      key={reviewer.email}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReviewers.includes(reviewer.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviewers([...selectedReviewers, reviewer.email]);
                          } else {
                            setSelectedReviewers(selectedReviewers.filter(r => r !== reviewer.email));
                          }
                        }}
                      />
                      <div>
                        <div>{reviewer.email}</div>
                        {(reviewer.name || reviewer.institution) && (
                          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                            {reviewer.name}{reviewer.name && reviewer.institution && " · "}{reviewer.institution}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className={styles.primaryButton} onClick={addReviewers}>
                Add {(newReviewerEmail ? 1 : 0) + selectedReviewers.length} Reviewer(s)
              </button>
              <button className={styles.actionButton} onClick={() => setShowAddReviewer(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
