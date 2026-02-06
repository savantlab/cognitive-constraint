"use client";

import { useState, useEffect } from "react";
import styles from "../../../dashboard/dashboard.module.css";

interface Profile {
  email: string;
  name: string | null;
  role: string;
  institution: string | null;
  orcid: string | null;
  bio: string | null;
  created_at: string;
  last_login_at: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    institution: "",
    orcid: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/portal/profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      setProfile(data.profile);
      setForm({
        name: data.profile.name || "",
        institution: data.profile.institution || "",
        orcid: data.profile.orcid || "",
        bio: data.profile.bio || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageDescription}>
          Manage your account information and preferences.
        </p>
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "#22c55e", marginBottom: "1rem" }}>{success}</p>
      )}

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 300px" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "2rem",
          }}
        >
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={profile?.email || ""}
              className={styles.input}
              disabled
              style={{ opacity: 0.6 }}
            />
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              Email cannot be changed.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={styles.input}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Institution</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className={styles.input}
              placeholder="University or organization"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ORCID</label>
            <input
              type="text"
              value={form.orcid}
              onChange={(e) => setForm({ ...form, orcid: e.target.value })}
              className={styles.input}
              placeholder="0000-0000-0000-0000"
            />
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              Your ORCID identifier for academic attribution.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className={styles.input}
              rows={4}
              placeholder="Brief biography or research interests"
            />
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Account Info</h3>
            <dl style={{ fontSize: "0.9rem" }}>
              <dt style={{ color: "var(--muted)", marginBottom: "0.25rem" }}>Role</dt>
              <dd style={{ marginBottom: "1rem", textTransform: "capitalize" }}>
                {profile?.role}
              </dd>

              <dt style={{ color: "var(--muted)", marginBottom: "0.25rem" }}>Member Since</dt>
              <dd style={{ marginBottom: "1rem" }}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "—"}
              </dd>

              <dt style={{ color: "var(--muted)", marginBottom: "0.25rem" }}>Last Login</dt>
              <dd>
                {profile?.last_login_at
                  ? new Date(profile.last_login_at).toLocaleDateString()
                  : "—"}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
