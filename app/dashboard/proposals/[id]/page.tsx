"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import styles from "../../dashboard.module.css";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  institution: string;
}

interface MatchedReviewer {
  id: string;
  user: User;
  research_areas: string[];
  keywords: string[];
  h_index: number | null;
  years_experience: number | null;
  match_score: number;
  match_reasons: string[];
  has_capacity: boolean;
}

interface Proposal {
  id: string;
  title: string;
  abstract: string;
  methodology_summary: string | null;
  expected_contribution: string | null;
  research_area: string;
  keywords: string[];
  estimated_length: string | null;
  status: string;
  funding_amount: number | null;
  admin_notes: string | null;
  submitted_at: string | null;
  author: Author;
}

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "revision_requested", label: "Request Revision" },
  { value: "accepted", label: "Accept" },
  { value: "rejected", label: "Reject" },
];

export default function ProposalReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [matchedReviewers, setMatchedReviewers] = useState<MatchedReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/admin/proposals/${id}`);
      const data = await res.json();
      setProposal(data.proposal);
      setMatchedReviewers(data.matchedReviewers || []);
      setStatus(data.proposal?.status || "");
      setFundingAmount(data.proposal?.funding_amount?.toString() || "");
      setAdminNotes(data.proposal?.admin_notes || "");
    } catch (err) {
      console.error("Error fetching proposal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/proposals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          fundingAmount: fundingAmount ? parseFloat(fundingAmount) : null,
          adminNotes,
        }),
      });

      if (res.ok) {
        setSuccess("Proposal updated successfully");
        await fetchProposal();
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignReviewer = async (reviewerId: string, isLead: boolean = false) => {
    setAssigning(reviewerId);
    try {
      const res = await fetch(`/api/admin/proposals/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId, isLeadEditor: isLead }),
      });

      if (res.ok) {
        setSuccess("Reviewer assigned and communication thread created");
        await fetchProposal();
      } else {
        const data = await res.json();
        console.error("Assignment failed:", data.error);
      }
    } catch (err) {
      console.error("Error assigning reviewer:", err);
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  if (!proposal) {
    return <div className={styles.main}>Proposal not found</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link
          href="/dashboard/proposals"
          style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem", display: "block" }}
        >
          ← Back to proposals
        </Link>
        <h1 className={styles.pageTitle}>{proposal.title}</h1>
        <p className={styles.pageDescription}>
          By {proposal.author?.name} ({proposal.author?.email})
        </p>
      </div>

      {success && <p style={{ color: "#22c55e", marginBottom: "1rem" }}>{success}</p>}

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "2fr 1fr" }}>
        {/* Proposal Details */}
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
            <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Proposal Details</h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                Research Area
              </h3>
              <p>{proposal.research_area}</p>
            </div>

            {proposal.keywords?.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Keywords
                </h3>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {proposal.keywords.map((k) => (
                    <span
                      key={k}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "var(--background)",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                Abstract
              </h3>
              <p style={{ lineHeight: 1.7 }}>{proposal.abstract}</p>
            </div>

            {proposal.methodology_summary && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Methodology
                </h3>
                <p style={{ lineHeight: 1.7 }}>{proposal.methodology_summary}</p>
              </div>
            )}

            {proposal.expected_contribution && (
              <div>
                <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Expected Contribution
                </h3>
                <p style={{ lineHeight: 1.7 }}>{proposal.expected_contribution}</p>
              </div>
            )}
          </div>

          {/* Matched Reviewers */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Matched Reviewers ({matchedReviewers.length})
            </h2>

            {matchedReviewers.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>
                No reviewers with matching expertise found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {matchedReviewers.slice(0, 10).map((reviewer) => (
                  <div
                    key={reviewer.id}
                    style={{
                      padding: "1rem",
                      background: "var(--background)",
                      borderRadius: "6px",
                      border: reviewer.match_score >= 40 ? "2px solid #22c55e" : "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {reviewer.user?.name || reviewer.user?.email}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                          {reviewer.user?.institution || reviewer.user?.email}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          background: reviewer.match_score >= 40 ? "#22c55e" : reviewer.match_score >= 20 ? "#f59e0b" : "#6b7280",
                          color: "white",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {reviewer.match_score}% match
                      </div>
                    </div>

                    {reviewer.match_reasons.length > 0 && (
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {reviewer.match_reasons.map((reason, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.5rem",
                              background: "var(--surface)",
                              borderRadius: "4px",
                              color: "var(--muted)",
                            }}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {!reviewer.has_capacity && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#ef4444" }}>
                        ⚠️ Currently at review capacity
                      </div>
                    )}

                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                      <button
                        className={styles.actionButton}
                        style={{ fontSize: "0.85rem" }}
                        onClick={() => handleAssignReviewer(reviewer.user.id, false)}
                        disabled={assigning === reviewer.user.id}
                      >
                        {assigning === reviewer.user.id ? "Assigning..." : "Assign as Reviewer"}
                      </button>
                      <button
                        className={styles.primaryButton}
                        style={{ fontSize: "0.85rem" }}
                        onClick={() => handleAssignReviewer(reviewer.user.id, true)}
                        disabled={assigning === reviewer.user.id}
                      >
                        {assigning === reviewer.user.id ? "..." : "Lead Editor"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Panel */}
        <div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
              position: "sticky",
              top: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Review Decision</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {status === "accepted" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Funding Amount ($)</label>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={styles.input}
                rows={4}
                placeholder="Internal notes about this proposal..."
              />
            </div>

            <button
              onClick={handleSave}
              className={styles.primaryButton}
              disabled={saving}
              style={{ width: "100%" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {proposal.estimated_length && (
              <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--background)", borderRadius: "6px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Estimated length: {proposal.estimated_length}
                </p>
                {proposal.submitted_at && (
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                    Submitted: {new Date(proposal.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
