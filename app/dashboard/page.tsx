import styles from "./dashboard.module.css";

export default function DashboardPage() {
  // These would come from Supabase in production
  const stats = {
    totalPapers: 8,
    publishedPapers: 4,
    pendingReview: 2,
    totalUsers: 12,
    pendingInvitations: 45,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageDescription}>
          Overview of Cognitive Constraint Journal
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Papers</p>
          <p className={styles.statValue}>{stats.totalPapers}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Published</p>
          <p className={styles.statValue}>{stats.publishedPapers}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Review</p>
          <p className={styles.statValue}>{stats.pendingReview}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Users</p>
          <p className={styles.statValue}>{stats.totalUsers}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Invitations</p>
          <p className={styles.statValue}>{stats.pendingInvitations}</p>
        </div>
      </div>
    </div>
  );
}
