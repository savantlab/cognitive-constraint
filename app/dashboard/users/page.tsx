"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface User {
  id: string;
  email: string;
  role: string;
  name: string | null;
  institution: string | null;
  created_at: string;
}

const ROLE_OPTIONS = ["reviewer", "author", "admin"];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = async () => {
    try {
      const params = filter === "all" ? "" : `?role=${filter}`;
      const res = await fetch(`/api/admin/users${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Role updated to ${newRole}` });
        loadUsers();
      } else {
        setMessage({ type: "error", text: "Failed to update role" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update role" });
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "User deleted" });
        loadUsers();
      } else {
        setMessage({ type: "error", text: "Failed to delete user" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete user" });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return styles.badgeDisputed;
      case "reviewer":
        return styles.badgeReview;
      case "author":
        return styles.badgePublished;
      default:
        return styles.badgeDraft;
    }
  };

  const roleCounts = {
    all: users.length,
    reviewer: users.filter((u) => u.role === "reviewer").length,
    author: users.filter((u) => u.role === "author").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Users</h1>
        <p className={styles.pageDescription}>Manage registered users and their roles</p>
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

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["all", ...ROLE_OPTIONS].map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={styles.actionButton}
            style={{
              background: filter === role ? "var(--foreground)" : "var(--background)",
              color: filter === role ? "var(--background)" : "var(--foreground)",
              textTransform: "capitalize",
            }}
          >
            {role === "all" ? "All" : role} ({roleCounts[role as keyof typeof roleCounts] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No users found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Institution</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name || "—"}</td>
                <td>{user.institution || "—"}</td>
                <td>
                  <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <select
                      className={styles.actionButton}
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      style={{ cursor: "pointer", textTransform: "capitalize" }}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role} style={{ textTransform: "capitalize" }}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.actionButton}
                      onClick={() => deleteUser(user.id, user.email)}
                      style={{ color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
