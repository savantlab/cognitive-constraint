"use client";

import { useState, useEffect } from "react";
import styles from "../../../dashboard/dashboard.module.css";

interface Payment {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
}

interface PaymentInfo {
  payment_method: string | null;
  venmo_handle: string | null;
  paypal_email: string | null;
  cashapp_tag: string | null;
  zelle_email: string | null;
  payment_details: {
    mailing_address?: string;
    routing_number?: string;
    account_number?: string;
    bank_name?: string;
    account_type?: string;
  } | null;
  tax_form_completed: boolean;
  w9_completed: boolean;
}

const paymentMethods = [
  { value: "venmo", label: "Venmo", icon: "💸" },
  { value: "paypal", label: "PayPal", icon: "🅿️" },
  { value: "cashapp", label: "Cash App", icon: "💵" },
  { value: "zelle", label: "Zelle", icon: "⚡" },
  { value: "wire_transfer", label: "Wire Transfer", icon: "🏦" },
  { value: "check", label: "Check", icon: "📮" },
];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  form_sent: "Form Sent",
  form_completed: "Ready",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  form_sent: "#3b82f6",
  form_completed: "#8b5cf6",
  processing: "#3b82f6",
  paid: "#22c55e",
  failed: "#ef4444",
  cancelled: "#6b7280",
};

const typeLabels: Record<string, string> = {
  publication: "Publication",
  peer_review: "Peer Review",
  replication: "Replication",
  other: "Other",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [venmoHandle, setVenmoHandle] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cashappTag, setCashappTag] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");
  const [wireTransfer, setWireTransfer] = useState({
    bank_name: "",
    routing_number: "",
    account_number: "",
    account_type: "checking",
  });
  const [mailingAddress, setMailingAddress] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/portal/payments");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch payments");
      }

      setPayments(data.payments || []);
      setPaymentInfo(data.paymentInfo);
      setTotalEarned(data.totalEarned);
      setPendingPayments(data.pendingPayments);

      // Populate form with existing data
      if (data.paymentInfo) {
        setSelectedMethod(data.paymentInfo.payment_method || "");
        setVenmoHandle(data.paymentInfo.venmo_handle || "");
        setPaypalEmail(data.paymentInfo.paypal_email || "");
        setCashappTag(data.paymentInfo.cashapp_tag || "");
        setZelleEmail(data.paymentInfo.zelle_email || "");
        if (data.paymentInfo.payment_details) {
          if (data.paymentInfo.payment_method === "wire_transfer") {
            setWireTransfer({
              bank_name: data.paymentInfo.payment_details.bank_name || "",
              routing_number: data.paymentInfo.payment_details.routing_number || "",
              account_number: data.paymentInfo.payment_details.account_number || "",
              account_type: data.paymentInfo.payment_details.account_type || "checking",
            });
          } else if (data.paymentInfo.payment_method === "check") {
            setMailingAddress(data.paymentInfo.payment_details.mailing_address || "");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/portal/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: selectedMethod || null,
          venmoHandle: venmoHandle || null,
          paypalEmail: paypalEmail || null,
          cashappTag: cashappTag || null,
          zelleEmail: zelleEmail || null,
          wireTransfer: selectedMethod === "wire_transfer" ? wireTransfer : null,
          mailingAddress: selectedMethod === "check" ? mailingAddress : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save payment method");
      }

      setSuccess("Payment method saved successfully");
      await fetchPayments();
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
        <h1 className={styles.pageTitle}>Payments & Payouts</h1>
        <p className={styles.pageDescription}>
          Track your earnings and manage payout preferences.
        </p>
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "#22c55e", marginBottom: "1rem" }}>{success}</p>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Earned</p>
          <p className={styles.statValue}>${totalEarned.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Payouts</p>
          <p className={styles.statValue}>${pendingPayments.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Payment Method</p>
          <p className={styles.statValue} style={{ fontSize: "1.25rem" }}>
            {selectedMethod
              ? paymentMethods.find((m) => m.value === selectedMethod)?.label || "—"
              : "Not Set"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr", marginTop: "2rem" }}>
        {/* Payment Method Form */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Payout Method</h2>
          
          <form onSubmit={handleSavePaymentMethod}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Payment Method</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    style={{
                      padding: "0.75rem",
                      border: selectedMethod === method.value 
                        ? "2px solid var(--foreground)" 
                        : "1px solid var(--border)",
                      borderRadius: "6px",
                      background: selectedMethod === method.value 
                        ? "var(--background)" 
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod === "venmo" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Venmo Username</label>
                <input
                  type="text"
                  value={venmoHandle}
                  onChange={(e) => setVenmoHandle(e.target.value)}
                  className={styles.input}
                  placeholder="@username"
                />
              </div>
            )}

            {selectedMethod === "paypal" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>PayPal Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@email.com"
                />
              </div>
            )}

            {selectedMethod === "cashapp" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Cash App Tag</label>
                <input
                  type="text"
                  value={cashappTag}
                  onChange={(e) => setCashappTag(e.target.value)}
                  className={styles.input}
                  placeholder="$cashtag"
                />
              </div>
            )}

            {selectedMethod === "zelle" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Zelle Email or Phone</label>
                <input
                  type="text"
                  value={zelleEmail}
                  onChange={(e) => setZelleEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@email.com or phone"
                />
              </div>
            )}

            {selectedMethod === "wire_transfer" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bank Name</label>
                  <input
                    type="text"
                    value={wireTransfer.bank_name}
                    onChange={(e) => setWireTransfer({ ...wireTransfer, bank_name: e.target.value })}
                    className={styles.input}
                    placeholder="Bank of America"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Routing Number</label>
                  <input
                    type="text"
                    value={wireTransfer.routing_number}
                    onChange={(e) => setWireTransfer({ ...wireTransfer, routing_number: e.target.value })}
                    className={styles.input}
                    placeholder="9 digits"
                    maxLength={9}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Account Number</label>
                  <input
                    type="text"
                    value={wireTransfer.account_number}
                    onChange={(e) => setWireTransfer({ ...wireTransfer, account_number: e.target.value })}
                    className={styles.input}
                    placeholder="Account number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Account Type</label>
                  <select
                    value={wireTransfer.account_type}
                    onChange={(e) => setWireTransfer({ ...wireTransfer, account_type: e.target.value })}
                    className={styles.select}
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </>
            )}

            {selectedMethod === "check" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Mailing Address</label>
                <textarea
                  value={mailingAddress}
                  onChange={(e) => setMailingAddress(e.target.value)}
                  className={styles.input}
                  rows={3}
                  placeholder="123 Main St&#10;City, State ZIP"
                />
              </div>
            )}

            {selectedMethod && (
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
                style={{ marginTop: "1rem" }}
              >
                {saving ? "Saving..." : "Save Payment Method"}
              </button>
            )}
          </form>
        </div>

        {/* Payment History */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Payment History</h2>
          
          {payments.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No payments yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    padding: "1rem",
                    background: "var(--background)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 500 }}>
                      {typeLabels[payment.type] || payment.type}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600 }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        background: `${statusColors[payment.status]}20`,
                        color: statusColors[payment.status],
                      }}
                    >
                      {statusLabels[payment.status] || payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tax Info Notice */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Tax Information</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          For payments exceeding $600/year, you may be required to complete a W-9 form. 
          We&apos;ll notify you if additional documentation is needed.
        </p>
      </div>
    </div>
  );
}
