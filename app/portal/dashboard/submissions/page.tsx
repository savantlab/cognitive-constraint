"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../../dashboard/dashboard.module.css";

interface Submission {
  id: string;
  title: string;
  abstract: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  validation_score: number;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  PUBLISHED: "Published",
  DISPUTED: "Disputed",
};

const statusClasses: Record<string, string | undefined> = {
  DRAFT: styles.badgeDraft,
  SUBMITTED: styles.badgeReview,
  UNDER_REVIEW: styles.badgeReview,
  PUBLISHED: styles.badgePublished,
  DISPUTED: styles.badgeDisputed,
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/portal/submissions");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className={styles.pageTitle}>My Submissions</h1>
            <p className={styles.pageDescription}>
              Track the status of your submitted papers.
            </p>
          </div>
          <Link href="/portal/dashboard/submissions/new" className={styles.primaryButton}>
            Submit New Paper
          </Link>
        </div>
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
      )}

      {submissions.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            You haven't submitted any papers yet.
          </p>
          <Link href="/portal/dashboard/submissions/new" className={styles.primaryButton}>
            Submit Your First Paper
          </Link>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Validation Score</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>
                  <div>
                    <strong>{submission.title}</strong>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                        marginTop: "0.25rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {submission.abstract}
                    </p>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${statusClasses[submission.status] || ""}`}>
                    {statusLabels[submission.status] || submission.status}
                  </span>
                </td>
                <td>{submission.validation_score}</td>
                <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleStartChat(submission.id)}
                    className={styles.actionButton}
                    disabled={startingChat === submission.id}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {startingChat === submission.id ? "..." : "Message Editor"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
