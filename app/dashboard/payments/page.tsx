"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Payment {
  id: string;
  user_id: string | null;
  email: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  form_sent_at: string | null;
  form_completed_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface PaymentForm {
  id: string;
  name: string;
  description: string | null;
  url: string;
  required_for: string[];
  is_active: boolean;
}

const TYPE_OPTIONS = ["publication", "peer_review", "replication", "other"];
const STATUS_OPTIONS = ["pending", "form_sent", "form_completed", "processing", "paid", "failed", "cancelled"];

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [forms, setForms] = useState<PaymentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"payments" | "forms">("payments");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    email: "",
    type: "publication",
    amount: "",
    notes: "",
  });
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    url: "",
    required_for: [] as string[],
  });

  const loadPayments = async () => {
    try {
      const params = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/payments${params}`);
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
      }
    } catch {
      console.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async () => {
    try {
      const res = await fetch("/api/admin/payment-forms");
      const data = await res.json();
      if (res.ok) {
        setForms(data.forms || []);
      }
    } catch {
      console.error("Failed to load forms");
    }
  };

  useEffect(() => {
    loadPayments();
    loadForms();
  }, [filter]);

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Status updated to ${newStatus}` });
        loadPayments();
      } else {
        setMessage({ type: "error", text: "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const createPayment = async () => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newPayment.email,
          type: newPayment.type,
          amount: parseFloat(newPayment.amount),
          notes: newPayment.notes,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Payment created" });
        setShowNewPayment(false);
        setNewPayment({ email: "", type: "publication", amount: "", notes: "" });
        loadPayments();
      } else {
        setMessage({ type: "error", text: "Failed to create payment" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create payment" });
    }
  };

  const createForm = async () => {
    try {
      const res = await fetch("/api/admin/payment-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Form created" });
        setShowNewForm(false);
        setNewForm({ name: "", description: "", url: "", required_for: [] });
        loadForms();
      } else {
        setMessage({ type: "error", text: "Failed to create form" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create form" });
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm("Delete this form?")) return;
    try {
      const res = await fetch(`/api/admin/payment-forms/${formId}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Form deleted" });
        loadForms();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete form" });
    }
  };

  const sendFormEmail = async (paymentId: string, email: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/send-form`, {
        method: "POST",
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Form link sent to ${email}` });
        loadPayments();
      } else {
        setMessage({ type: "error", text: "Failed to send form" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send form" });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return styles.badgePublished;
      case "processing":
      case "form_completed":
        return styles.badgeReview;
      case "failed":
      case "cancelled":
        return styles.badgeDisputed;
      default:
        return styles.badgeDraft;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  const statusCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    form_sent: payments.filter((p) => p.status === "form_sent").length,
    processing: payments.filter((p) => p.status === "processing").length,
    paid: payments.filter((p) => p.status === "paid").length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Payments</h1>
        <p className={styles.pageDescription}>Track payments and manage required forms</p>
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

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("payments")}
          className={styles.actionButton}
          style={{
            background: activeTab === "payments" ? "var(--foreground)" : "transparent",
            color: activeTab === "payments" ? "var(--background)" : "var(--foreground)",
            border: "none",
          }}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={styles.actionButton}
          style={{
            background: activeTab === "forms" ? "var(--foreground)" : "transparent",
            color: activeTab === "forms" ? "var(--background)" : "var(--foreground)",
            border: "none",
          }}
        >
          Forms
        </button>
      </div>

      {activeTab === "payments" && (
        <>
          {/* Filter tabs and new payment button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["all", "pending", "form_sent", "processing", "paid"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={styles.actionButton}
                  style={{
                    background: filter === status ? "var(--foreground)" : "var(--background)",
                    color: filter === status ? "var(--background)" : "var(--foreground)",
                  }}
                >
                  {status.replace("_", " ")} ({statusCounts[status as keyof typeof statusCounts] || 0})
                </button>
              ))}
            </div>
            <button className={styles.primaryButton} onClick={() => setShowNewPayment(true)}>
              + New Payment
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : payments.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No payments found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{payment.type.replace("_", " ")}</td>
                    <td>{formatCurrency(payment.amount, payment.currency)}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        {payment.status === "pending" && (
                          <button
                            className={styles.actionButton}
                            onClick={() => sendFormEmail(payment.id, payment.email)}
                          >
                            Send Form
                          </button>
                        )}
                        <select
                          className={styles.actionButton}
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                          style={{ cursor: "pointer" }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === "forms" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
            <button className={styles.primaryButton} onClick={() => setShowNewForm(true)}>
              + Add Form
            </button>
          </div>

          {forms.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No forms configured. Add a form to get started.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Required For</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <strong>{form.name}</strong>
                      {form.description && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{form.description}</p>}
                    </td>
                    <td>
                      <a href={form.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                        {form.url.length > 40 ? form.url.substring(0, 40) + "..." : form.url}
                      </a>
                    </td>
                    <td>
                      {form.required_for.map((type) => (
                        <span key={type} className={`${styles.badge} ${styles.badgeDraft}`} style={{ marginRight: "0.25rem" }}>
                          {type}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${form.is_active ? styles.badgePublished : styles.badgeDraft}`}>
                        {form.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionButton}
                        onClick={() => deleteForm(form.id)}
                        style={{ color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* New Payment Modal */}
      {showNewPayment && (
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
          onClick={() => setShowNewPayment(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "450px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>New Payment</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={newPayment.email}
                onChange={(e) => setNewPayment({ ...newPayment, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select
                className={styles.select}
                value={newPayment.type}
                onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Amount (USD)</label>
              <input
                type="number"
                className={styles.input}
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                placeholder="100.00"
                step="0.01"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <input
                type="text"
                className={styles.input}
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Paper title, review ID, etc."
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className={styles.primaryButton} onClick={createPayment}>
                Create Payment
              </button>
              <button className={styles.actionButton} onClick={() => setShowNewPayment(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Form Modal */}
      {showNewForm && (
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
          onClick={() => setShowNewForm(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              padding: "2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "450px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Add Payment Form</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Form Name</label>
              <input
                type="text"
                className={styles.input}
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="W-9 Tax Form"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <input
                type="text"
                className={styles.input}
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                placeholder="Required for US payments over $600"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Form URL</label>
              <input
                type="url"
                className={styles.input}
                value={newForm.url}
                onChange={(e) => setNewForm({ ...newForm, url: e.target.value })}
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Required For</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {TYPE_OPTIONS.map((type) => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={newForm.required_for.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewForm({ ...newForm, required_for: [...newForm.required_for, type] });
                        } else {
                          setNewForm({ ...newForm, required_for: newForm.required_for.filter((t) => t !== type) });
                        }
                      }}
                    />
                    <span style={{ textTransform: "capitalize" }}>{type.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className={styles.primaryButton} onClick={createForm}>
                Add Form
              </button>
              <button className={styles.actionButton} onClick={() => setShowNewForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
