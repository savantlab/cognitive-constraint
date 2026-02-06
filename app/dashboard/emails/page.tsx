"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface EmailBlast {
  id: string;
  subject: string;
  html_content: string;
  recipient_type: string;
  custom_emails: string[] | null;
  paper_id: string | null;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface Paper {
  id: string;
  title: string;
  status: string;
}

const RECIPIENT_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "reviewers", label: "Reviewers Only" },
  { value: "authors", label: "Authors Only" },
  { value: "custom", label: "Custom List" },
];

export default function EmailBlastsPage() {
  const [blasts, setBlasts] = useState<EmailBlast[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showNewBlast, setShowNewBlast] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [newBlast, setNewBlast] = useState({
    subject: "",
    html_content: "",
    recipient_type: "all",
    custom_emails: "",
    paper_id: "",
    scheduled_for: "",
  });

  const loadBlasts = async () => {
    try {
      const res = await fetch("/api/admin/email-blasts");
      const data = await res.json();
      if (res.ok) {
        setBlasts(data.blasts || []);
      }
    } catch {
      console.error("Failed to load email blasts");
    } finally {
      setLoading(false);
    }
  };

  const loadPapers = async () => {
    try {
      const res = await fetch("/api/admin/papers?status=PUBLISHED");
      const data = await res.json();
      if (res.ok) {
        setPapers(data.papers || []);
      }
    } catch {
      console.error("Failed to load papers");
    }
  };

  useEffect(() => {
    loadBlasts();
    loadPapers();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setNewBlast({ ...newBlast, html_content: text });
    setMessage({ type: "success", text: "HTML file loaded" });
  };

  const createBlast = async (sendNow: boolean = false) => {
    try {
      const payload = {
        subject: newBlast.subject,
        html_content: newBlast.html_content,
        recipient_type: newBlast.recipient_type,
        custom_emails: newBlast.recipient_type === "custom" 
          ? newBlast.custom_emails.split(",").map(e => e.trim()).filter(Boolean)
          : null,
        paper_id: newBlast.paper_id || null,
        scheduled_for: newBlast.scheduled_for || null,
        status: sendNow ? "sending" : (newBlast.scheduled_for ? "scheduled" : "draft"),
      };

      const res = await fetch("/api/admin/email-blasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (sendNow) {
          // Trigger send
          await fetch(`/api/admin/email-blasts/${data.blast.id}/send`, { method: "POST" });
          setMessage({ type: "success", text: "Email blast is being sent" });
        } else {
          setMessage({ type: "success", text: newBlast.scheduled_for ? "Email scheduled" : "Draft saved" });
        }
        setShowNewBlast(false);
        setNewBlast({ subject: "", html_content: "", recipient_type: "all", custom_emails: "", paper_id: "", scheduled_for: "" });
        loadBlasts();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create email blast" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create email blast" });
    }
  };

  const sendBlast = async (blastId: string) => {
    if (!confirm("Send this email blast now?")) return;

    try {
      const res = await fetch(`/api/admin/email-blasts/${blastId}/send`, { method: "POST" });
      if (res.ok) {
        setMessage({ type: "success", text: "Email blast is being sent" });
        loadBlasts();
      } else {
        setMessage({ type: "error", text: "Failed to send blast" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send blast" });
    }
  };

  const deleteBlast = async (blastId: string) => {
    if (!confirm("Delete this email blast?")) return;

    try {
      const res = await fetch(`/api/admin/email-blasts/${blastId}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Email blast deleted" });
        loadBlasts();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete blast" });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "sent":
        return styles.badgePublished;
      case "sending":
      case "scheduled":
        return styles.badgeReview;
      case "failed":
        return styles.badgeDisputed;
      default:
        return styles.badgeDraft;
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Email Blasts</h1>
        <p className={styles.pageDescription}>Send announcements and paper notifications</p>
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button className={styles.primaryButton} onClick={() => setShowNewBlast(true)}>
          + New Email Blast
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : blasts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No email blasts yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Recipients</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Sent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blasts.map((blast) => (
              <tr key={blast.id}>
                <td>
                  <strong>{blast.subject}</strong>
                </td>
                <td style={{ textTransform: "capitalize" }}>
                  {blast.recipient_type === "custom" 
                    ? `Custom (${blast.custom_emails?.length || 0})`
                    : blast.recipient_type.replace("_", " ")}
                </td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadgeClass(blast.status)}`}>
                    {blast.status}
                  </span>
                  {blast.status === "sent" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                      {blast.sent_count}/{blast.recipient_count}
                    </span>
                  )}
                </td>
                <td>
                  {blast.scheduled_for 
                    ? new Date(blast.scheduled_for).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {blast.sent_at 
                    ? new Date(blast.sent_at).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => setPreviewHtml(blast.html_content)}
                    >
                      Preview
                    </button>
                    {(blast.status === "draft" || blast.status === "scheduled") && (
                      <button
                        className={styles.actionButton}
                        onClick={() => sendBlast(blast.id)}
                      >
                        Send Now
                      </button>
                    )}
                    {blast.status !== "sending" && (
                      <button
                        className={styles.actionButton}
                        onClick={() => deleteBlast(blast.id)}
                        style={{ color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* New Blast Modal */}
      {showNewBlast && (
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
            padding: "2rem",
          }}
          onClick={() => setShowNewBlast(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>New Email Blast</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Subject</label>
              <input
                type="text"
                className={styles.input}
                value={newBlast.subject}
                onChange={(e) => setNewBlast({ ...newBlast, subject: e.target.value })}
                placeholder="New Paper Published: Title Here"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>HTML Content</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className={styles.actionButton} style={{ cursor: "pointer", display: "inline-block" }}>
                  Upload HTML File
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {newBlast.html_content && (
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    ✓ HTML loaded ({newBlast.html_content.length} chars)
                  </span>
                )}
              </div>
              <textarea
                className={styles.input}
                value={newBlast.html_content}
                onChange={(e) => setNewBlast({ ...newBlast, html_content: e.target.value })}
                placeholder="<html>...</html> or upload a file"
                rows={6}
                style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Recipients</label>
              <select
                className={styles.select}
                value={newBlast.recipient_type}
                onChange={(e) => setNewBlast({ ...newBlast, recipient_type: e.target.value })}
              >
                {RECIPIENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {newBlast.recipient_type === "custom" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Addresses (comma-separated)</label>
                <textarea
                  className={styles.input}
                  value={newBlast.custom_emails}
                  onChange={(e) => setNewBlast({ ...newBlast, custom_emails: e.target.value })}
                  placeholder="user1@example.com, user2@example.com"
                  rows={3}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Link to Paper (optional)</label>
              <select
                className={styles.select}
                value={newBlast.paper_id}
                onChange={(e) => setNewBlast({ ...newBlast, paper_id: e.target.value })}
              >
                <option value="">No paper link</option>
                {papers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Schedule Send (optional)</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={newBlast.scheduled_for}
                onChange={(e) => setNewBlast({ ...newBlast, scheduled_for: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <button 
                className={styles.primaryButton} 
                onClick={() => createBlast(true)}
                disabled={!newBlast.subject || !newBlast.html_content}
              >
                Send Now
              </button>
              <button 
                className={styles.actionButton} 
                onClick={() => createBlast(false)}
                disabled={!newBlast.subject || !newBlast.html_content}
              >
                {newBlast.scheduled_for ? "Schedule" : "Save Draft"}
              </button>
              <button className={styles.actionButton} onClick={() => setShowNewBlast(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewHtml && (
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
            padding: "2rem",
          }}
          onClick={() => setPreviewHtml(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Email Preview</strong>
              <button 
                onClick={() => setPreviewHtml(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              style={{ width: "100%", height: "70vh", border: "none" }}
              title="Email Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
