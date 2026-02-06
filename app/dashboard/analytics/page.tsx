'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

interface Reader {
  id: string;
  email: string;
  firstAccess: string;
  lastAccess: string;
  accessCount: number;
  papersViewed: number;
  deviceType: string;
}

interface InvitedUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ChartData {
  date: string;
  views: number;
  uniqueVisitors: number;
  newReaders: number;
}

interface AnalyticsData {
  summary: {
    totalReaders: number;
    totalInvitedUsers: number;
    totalInvitations: number;
    acceptedInvitations: number;
    pendingInvitations: number;
  };
  chartData: ChartData[];
  readers: Reader[];
  invitedUsers: InvitedUser[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'readers' | 'invited'>('readers');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Simple bar chart renderer
  const renderChart = () => {
    if (!data?.chartData.length) {
      return <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No traffic data yet</p>;
    }

    const maxViews = Math.max(...data.chartData.map(d => d.views), 1);
    const chartHeight = 160;

    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '500px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '2px', 
            height: `${chartHeight}px`, 
            borderBottom: '1px solid var(--border)',
            position: 'relative',
          }}>
            {/* Grid lines */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ borderTop: '1px dashed var(--border)' }} />
              ))}
            </div>
            {data.chartData.map((day, i) => {
              const height = (day.views / maxViews) * chartHeight;
              return (
                <div
                  key={i}
                  style={{ flex: 1, position: 'relative', zIndex: 1 }}
                  title={`${formatDate(day.date)}: ${day.views} views`}
                >
                  <div
                    style={{
                      height: day.views > 0 ? `${Math.max(height, 3)}px` : '2px',
                      minWidth: '4px',
                      margin: '0 auto',
                      borderRadius: '2px 2px 0 0',
                      background: day.views > 0 ? 'var(--foreground)' : 'var(--border)',
                      transition: 'background 0.2s',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            <span>{data.chartData[0] && formatDate(data.chartData[0].date)}</span>
            <span>{data.chartData.at(-1) && formatDate(data.chartData.at(-1)!.date)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageDescription}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Analytics</h1>
        </div>
        <div style={{
          padding: '1rem',
          borderRadius: '6px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className={styles.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageDescription}>
            {data?.summary.totalReaders || 0} readers · {data?.summary.totalInvitedUsers || 0} invited users
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className={styles.select}
          style={{ width: 'auto' }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>End-User Readers</p>
          <p className={styles.statValue}>{data?.summary.totalReaders || 0}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Invited Users</p>
          <p className={styles.statValue}>{data?.summary.totalInvitedUsers || 0}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Invitations Sent</p>
          <p className={styles.statValue}>{data?.summary.totalInvitations || 0}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{data?.summary.pendingInvitations || 0}</p>
        </div>
      </div>

      {/* Traffic Chart */}
      <div style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border)', 
        borderRadius: '8px', 
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
          Page Views
        </h2>
        {renderChart()}
      </div>

      {/* User Groups - Tab buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('readers')}
          className={styles.actionButton}
          style={{
            background: activeTab === 'readers' ? 'var(--foreground)' : 'var(--background)',
            color: activeTab === 'readers' ? 'var(--background)' : 'var(--foreground)',
          }}
        >
          End-User Readers ({data?.readers.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('invited')}
          className={styles.actionButton}
          style={{
            background: activeTab === 'invited' ? 'var(--foreground)' : 'var(--background)',
            color: activeTab === 'invited' ? 'var(--background)' : 'var(--foreground)',
          }}
        >
          Invited Users ({data?.invitedUsers.length || 0})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'readers' && (
        <>
          {data?.readers.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No readers yet</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>First Access</th>
                  <th>Last Access</th>
                  <th>Visits</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {data?.readers.map((reader) => (
                  <tr key={reader.id}>
                    <td style={{ fontWeight: 500 }}>{reader.email}</td>
                    <td>{formatDateTime(reader.firstAccess)}</td>
                    <td>{formatDateTime(reader.lastAccess)}</td>
                    <td>
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                      }}>
                        {reader.accessCount}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{reader.deviceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === 'invited' && (
        <>
          {data?.invitedUsers.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No invited users yet</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.invitedUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.email}</td>
                    <td>
                      <span style={{
                        background: user.role === 'reviewer' 
                          ? 'rgba(147, 51, 234, 0.1)' 
                          : user.role === 'author'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(156, 163, 175, 0.1)',
                        color: user.role === 'reviewer' 
                          ? '#9333ea' 
                          : user.role === 'author'
                          ? '#22c55e'
                          : '#6b7280',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
