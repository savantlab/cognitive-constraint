'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
type SubscriberCategory = 'college_university' | 'nonprofit' | 'institution_association' | 'government' | 'corporate' | 'individual';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const CATEGORY_LABELS: Record<SubscriberCategory, string> = {
  college_university: 'College/University',
  nonprofit: 'Non-Profit',
  institution_association: 'Institution/Association',
  government: 'Government',
  corporate: 'Corporate',
  individual: 'Individual',
};

interface Invoice {
  id: string;
  invoice_number: string;
  subscriber_id: string | null;
  bill_to_name: string;
  bill_to_email: string;
  bill_to_institution: string | null;
  description: string;
  subscription_period: string | null;
  category: SubscriberCategory | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  po_number: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  issue_date: string;
  due_date: string;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  institution: string | null;
  category: SubscriberCategory | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create form state
  const [selectedSubscriber, setSelectedSubscriber] = useState('');
  const [billToName, setBillToName] = useState('');
  const [billToEmail, setBillToEmail] = useState('');
  const [billToInstitution, setBillToInstitution] = useState('');
  const [description, setDescription] = useState('Annual Subscription');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState<SubscriberCategory | ''>('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [creating, setCreating] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [poNumber, setPoNumber] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchSubscribers();
  }, [filter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices?status=${filter}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers?status=active');
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    }
  };

  const handleSubscriberSelect = (subscriberId: string) => {
    setSelectedSubscriber(subscriberId);
    const sub = subscribers.find(s => s.id === subscriberId);
    if (sub) {
      setBillToName(sub.name || '');
      setBillToEmail(sub.email);
      setBillToInstitution(sub.institution || '');
      setCategory(sub.category || '');
    }
  };

  const createInvoice = async () => {
    if (!billToName || !billToEmail || !amount) {
      setMessage({ type: 'error', text: 'Please fill in required fields' });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber_id: selectedSubscriber || null,
          bill_to_name: billToName,
          bill_to_email: billToEmail,
          bill_to_institution: billToInstitution,
          description,
          subscription_period: subscriptionPeriod,
          category: category || null,
          amount: parseFloat(amount),
          memo,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Invoice created' });
        resetCreateForm();
        setShowCreateModal(false);
        fetchInvoices();
      } else {
        setMessage({ type: 'error', text: 'Failed to create invoice' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create invoice' });
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedSubscriber('');
    setBillToName('');
    setBillToEmail('');
    setBillToInstitution('');
    setDescription('Annual Subscription');
    setSubscriptionPeriod(new Date().getFullYear().toString());
    setCategory('');
    setAmount('');
    setMemo('');
  };

  const sendInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${id}/send`, { method: 'POST' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Invoice sent' });
        fetchInvoices();
      } else {
        setMessage({ type: 'error', text: 'Failed to send invoice' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send invoice' });
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPoNumber(invoice.po_number || '');
    setPaymentMethod(invoice.payment_method || '');
    setPaymentReference(invoice.payment_reference || '');
    setShowPaymentModal(true);
  };

  const recordPayment = async () => {
    if (!selectedInvoice) return;
    try {
      const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          po_number: poNumber,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Payment recorded' });
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        setMessage({ type: 'error', text: 'Failed to record payment' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record payment' });
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete invoice' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'sent':
      case 'viewed':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'overdue':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'cancelled':
        return { background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
      default:
        return { background: 'rgba(156, 163, 175, 0.1)', color: '#6b7280' };
    }
  };

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  const totalOutstanding = invoices
    .filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <p className={styles.pageDescription}>
          {formatCurrency(totalOutstanding)} outstanding · {formatCurrency(totalPaid)} paid
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '6px',
            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Header with filters and create button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={styles.actionButton}
              style={{
                background: filter === status ? 'var(--foreground)' : 'var(--background)',
                color: filter === status ? 'var(--background)' : 'var(--foreground)',
                textTransform: 'capitalize',
              }}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={styles.primaryButton}
        >
          + Create Invoice
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : invoices.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No invoices found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Bill To</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ fontWeight: 500 }}>{invoice.invoice_number}</td>
                <td>
                  <div>{invoice.bill_to_name}</div>
                  {invoice.bill_to_institution && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {invoice.bill_to_institution}
                    </div>
                  )}
                </td>
                <td>
                  <div>{invoice.description}</div>
                  {invoice.subscription_period && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {invoice.subscription_period}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 500 }}>{formatCurrency(Number(invoice.amount), invoice.currency)}</td>
                <td>{formatDate(invoice.due_date)}</td>
                <td>
                  <span
                    style={{
                      ...getStatusStyle(invoice.status),
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                    }}
                  >
                    {STATUS_LABELS[invoice.status]}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => sendInvoice(invoice.id)}
                        className={styles.actionButton}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Send
                      </button>
                    )}
                    {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                      <button
                        onClick={() => openPaymentModal(invoice)}
                        className={styles.actionButton}
                        style={{ fontSize: '0.85rem', borderColor: '#22c55e', color: '#22c55e' }}
                      >
                        Record Payment
                      </button>
                    )}
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className={styles.actionButton}
                        style={{ fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div
          onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
              width: '100%',
              maxWidth: '550px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
              Create Invoice
            </h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Select Subscriber (optional)</label>
              <select
                value={selectedSubscriber}
                onChange={(e) => handleSubscriberSelect(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Manual entry --</option>
                {subscribers.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name || sub.email} {sub.institution ? `(${sub.institution})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  value={billToName}
                  onChange={(e) => setBillToName(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  value={billToEmail}
                  onChange={(e) => setBillToEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Institution</label>
              <input
                type="text"
                value={billToInstitution}
                onChange={(e) => setBillToInstitution(e.target.value)}
                className={styles.input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubscriberCategory)}
                  className={styles.select}
                >
                  <option value="">Select...</option>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subscription Period</label>
                <input
                  type="text"
                  value={subscriptionPeriod}
                  onChange={(e) => setSubscriptionPeriod(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., 2026"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Amount (USD) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Memo (shown on invoice)</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className={styles.input}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                className={styles.actionButton}
              >
                Cancel
              </button>
              <button
                onClick={createInvoice}
                disabled={creating || !billToName || !billToEmail || !amount}
                className={styles.primaryButton}
              >
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div
          onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
              width: '100%',
              maxWidth: '450px',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
              Record Payment
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Invoice {selectedInvoice.invoice_number} · {formatCurrency(Number(selectedInvoice.amount))}
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>PO Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className={styles.input}
                placeholder="Purchase order number"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.select}
              >
                <option value="">Select...</option>
                <option value="check">Check</option>
                <option value="wire">Wire Transfer</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Reference # (check number, transaction ID, etc.)</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className={styles.input}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                className={styles.actionButton}
              >
                Cancel
              </button>
              <button
                onClick={recordPayment}
                className={styles.primaryButton}
                style={{ background: '#22c55e' }}
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
