"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../dashboard.module.css";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Proposal {
  id: string;
  title: string;
  abstract: string;
  research_area: string;
  keywords: string[];
  status: string;
  funding_amount: number | null;
  submitted_at: string | null;
  created_at: string;
  author: Author;
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

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/admin/proposals");
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["submitted", "under_review"].includes(p.status);
    return p.status === filter;
  });

  const counts = {
    all: proposals.length,
    pending: proposals.filter((p) => ["submitted", "under_review"].includes(p.status)).length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Proposals</h1>
        <p className={styles.pageDescription}>
          Review paper proposals and match with expert reviewers.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Proposals</p>
          <p className={styles.statValue}>{counts.all}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Review</p>
          <p className={styles.statValue}>{counts.pending}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Accepted</p>
          <p className={styles.statValue}>{counts.accepted}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Rejected</p>
          <p className={styles.statValue}>{counts.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: filter === f.value ? "2px solid var(--foreground)" : "1px solid var(--border)",
              background: filter === f.value ? "var(--foreground)" : "transparent",
              color: filter === f.value ? "var(--background)" : "var(--foreground)",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No proposals found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Research Area</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProposals.map((proposal) => (
              <tr key={proposal.id}>
                <td>
                  <strong>{proposal.title}</strong>
                  {proposal.keywords?.length > 0 && (
                    <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                      {proposal.keywords.slice(0, 3).map((k) => (
                        <span
                          key={k}
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.125rem 0.375rem",
                            background: "var(--background)",
                            borderRadius: "3px",
                            color: "var(--muted)",
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <div>{proposal.author?.name || "—"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {proposal.author?.email}
                  </div>
                </td>
                <td>{proposal.research_area}</td>
                <td>
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
                </td>
                <td>
                  {proposal.submitted_at
                    ? new Date(proposal.submitted_at).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <Link
                    href={`/dashboard/proposals/${proposal.id}`}
                    className={styles.actionButton}
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
