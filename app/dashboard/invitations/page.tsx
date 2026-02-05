"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Invitation {
  id: string;
  email: string;
  institution: string;
  role: string;
  invited_at: string;
  invite_sent_at: string | null;
  accepted_at: string | null;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/invitations/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Successfully imported ${data.count} invitations` });
        loadInvitations();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload file" });
    } finally {
      setUploading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      if (res.ok) {
        setInvitations(data.invitations || []);
      }
    } catch {
      console.error("Failed to load invitations");
    }
  };

  const sendInvites = async () => {
    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/invitations/send", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Sent ${data.sent} invitation emails` });
        loadInvitations();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send invites" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send invites" });
    } finally {
      setSending(false);
    }
  };

  // Load invitations on mount
  useEffect(() => {
    loadInvitations();
  }, []);

  const pendingCount = invitations.filter((i) => !i.invite_sent_at).length;
  const sentCount = invitations.filter((i) => i.invite_sent_at && !i.accepted_at).length;
  const acceptedCount = invitations.filter((i) => i.accepted_at).length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Invitations</h1>
        <p className={styles.pageDescription}>
          Upload university email lists and send invitations
        </p>
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
          <p className={styles.statLabel}>Total Invitations</p>
          <p className={styles.statValue}>{invitations.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Send</p>
          <p className={styles.statValue}>{pendingCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Sent</p>
          <p className={styles.statValue}>{sentCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Accepted</p>
          <p className={styles.statValue}>{acceptedCount}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <label className={styles.uploadArea} style={{ flex: 1, cursor: "pointer" }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <div className={styles.uploadIcon}>📄</div>
          <p className={styles.uploadText}>
            {uploading ? "Uploading..." : "Upload CSV"}
          </p>
          <p className={styles.uploadHint}>
            CSV format: email, institution, role (reviewer/author)
          </p>
        </label>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <button
            className={styles.primaryButton}
            onClick={sendInvites}
            disabled={sending || pendingCount === 0}
          >
            {sending ? "Sending..." : `Send ${pendingCount} Invites`}
          </button>
        </div>
      </div>

      {invitations.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Institution</th>
              <th>Role</th>
              <th>Status</th>
              <th>Invited</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td>{invitation.email}</td>
                <td>{invitation.institution || "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{invitation.role}</td>
                <td>
                  {invitation.accepted_at ? (
                    <span className={`${styles.badge} ${styles.badgePublished}`}>Accepted</span>
                  ) : invitation.invite_sent_at ? (
                    <span className={`${styles.badge} ${styles.badgeReview}`}>Sent</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeDraft}`}>Pending</span>
                  )}
                </td>
                <td>{new Date(invitation.invited_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
