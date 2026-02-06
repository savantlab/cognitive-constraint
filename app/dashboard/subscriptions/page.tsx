'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

type SubscriberCategory = 'college_university' | 'nonprofit' | 'institution_association' | 'government' | 'corporate' | 'individual' | 'publisher';

const CATEGORY_LABELS: Record<SubscriberCategory, string> = {
  college_university: 'College/University',
  nonprofit: 'Non-Profit',
  institution_association: 'Institution/Association',
  government: 'Government',
  corporate: 'Corporate',
  individual: 'Individual',
  publisher: 'Publisher',
};

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  institution: string | null;
  category: SubscriberCategory | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string | null;
}

export default function SubscriptionsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newCategory, setNewCategory] = useState<SubscriberCategory | ''>('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, [filter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers?status=${filter}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscriber = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          name: newName || null,
          institution: newInstitution || null,
          category: newCategory || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewEmail('');
        setNewName('');
        setNewInstitution('');
        setNewCategory('');
        fetchSubscribers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add subscriber');
      }
    } catch (err) {
      alert('Failed to add subscriber');
    } finally {
      setAdding(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchSubscribers();
    } catch (err) {
      alert('Failed to update subscriber');
    }
  };

  const updateCategory = async (id: string, category: SubscriberCategory) => {
    try {
      await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      fetchSubscribers();
    } catch (err) {
      alert('Failed to update category');
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (err) {
      alert('Failed to delete subscriber');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;
  const bouncedCount = subscribers.filter(s => s.status === 'bounced').length;

  const statusCounts = {
    all: subscribers.length,
    active: activeCount,
    unsubscribed: unsubscribedCount,
    bounced: bouncedCount,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Subscribers</h1>
        <p className={styles.pageDescription}>
          {activeCount} active · {unsubscribedCount} unsubscribed · {bouncedCount} bounced
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

      {/* Header with filters and add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['all', 'active', 'unsubscribed', 'bounced'] as const).map((status) => (
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
          onClick={() => setShowAddModal(true)}
          className={styles.primaryButton}
        >
          + Add Subscriber
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : subscribers.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No subscribers found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Institution</th>
              <th>Category</th>
              <th>Subscribed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 500 }}>{sub.email}</td>
                <td>{sub.name || '—'}</td>
                <td>{sub.institution || '—'}</td>
                <td>
                  <select
                    value={sub.category || ''}
                    onChange={(e) => updateCategory(sub.id, e.target.value as SubscriberCategory)}
                    className={styles.select}
                    style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                  >
                    <option value="">Select...</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
                <td>{formatDate(sub.subscribed_at)}</td>
                <td>
                  <select
                    value={sub.status}
                    onChange={(e) => updateStatus(sub.id, e.target.value)}
                    className={styles.select}
                    style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                  >
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => deleteSubscriber(sub.id)}
                    className={styles.actionButton}
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div
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
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
              width: '100%',
              maxWidth: '450px',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
              Add Subscriber
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={styles.input}
                placeholder="email@example.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={styles.input}
                placeholder="Optional"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Institution</label>
              <input
                type="text"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                className={styles.input}
                placeholder="Optional"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SubscriberCategory)}
                className={styles.select}
              >
                <option value="">Select category...</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowAddModal(false)}
                className={styles.actionButton}
              >
                Cancel
              </button>
              <button
                onClick={addSubscriber}
                disabled={adding || !newEmail.trim()}
                className={styles.primaryButton}
              >
                {adding ? 'Adding...' : 'Add Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
