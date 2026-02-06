"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../../dashboard/dashboard.module.css";

interface Proposal {
  id: string;
  title: string;
  abstract: string;
  research_area: string;
  status: string;
  funding_amount: number | null;
  submitted_at: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
  revision_requested: "Revision Requested",
};

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  submitted: "#3b82f6",
  under_review: "#8b5cf6",
  accepted: "#22c55e",
  rejected: "#ef4444",
  revision_requested: "#f59e0b",
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/portal/proposals");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch proposals");
      }

      setProposals(data.proposals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
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
            <h1 className={styles.pageTitle}>My Proposals</h1>
            <p className={styles.pageDescription}>
              Submit paper proposals for review. Accepted proposals receive funding for full publication.
            </p>
          </div>
          <Link href="/portal/dashboard/proposals/new" className={styles.primaryButton}>
            New Proposal
          </Link>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

      {proposals.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>No proposals yet</h3>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Submit a proposal to have your research considered for publication.
          </p>
          <Link href="/portal/dashboard/proposals/new" className={styles.primaryButton}>
            Submit Your First Proposal
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0 }}>{proposal.title}</h3>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        background: `${statusColors[proposal.status]}20`,
                        color: statusColors[proposal.status],
                      }}
                    >
                      {statusLabels[proposal.status] || proposal.status}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    {proposal.research_area}
                  </p>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.85rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {proposal.abstract}
                  </p>
                </div>
                <div style={{ textAlign: "right", marginLeft: "1rem" }}>
                  {proposal.funding_amount && (
                    <p style={{ fontWeight: 600, color: "#22c55e" }}>
                      ${proposal.funding_amount.toLocaleString()} granted
                    </p>
                  )}
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {proposal.submitted_at
                      ? `Submitted ${new Date(proposal.submitted_at).toLocaleDateString()}`
                      : `Created ${new Date(proposal.created_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {proposal.status === "accepted" && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "rgba(34, 197, 94, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                  }}
                >
                  🎉 Your proposal has been accepted! You can now{" "}
                  <Link href="/portal/dashboard/submissions/new" style={{ color: "#22c55e", fontWeight: 500 }}>
                    submit your full paper
                  </Link>
                  .
                </div>
              )}

              {proposal.status === "revision_requested" && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "rgba(245, 158, 11, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                  }}
                >
                  Revisions requested. Check your messages for editor feedback.
                </div>
              )}

              {proposal.status === "draft" && (
                <div style={{ marginTop: "1rem" }}>
                  <Link
                    href={`/portal/dashboard/proposals/${proposal.id}/edit`}
                    className={styles.actionButton}
                  >
                    Continue Editing
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
