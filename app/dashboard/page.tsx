import { redirect } from "next/navigation";
import { isAdmin } from "../lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import styles from "./dashboard.module.css";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardPage() {
  const authorized = await isAdmin();
  if (!authorized) {
    redirect("/dashboard/login");
  }

  const supabase = getSupabase();

  // Fetch real stats from Supabase
  const [papersResult, publishedResult, reviewResult, usersResult, invitationsResult, subscribersResult, proposalsResult] = await Promise.all([
    supabase.from('papers').select('id', { count: 'exact', head: true }),
    supabase.from('papers').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('papers').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('invitations').select('id', { count: 'exact', head: true }).is('accepted_at', null),
    supabase.from('subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const stats = {
    totalPapers: papersResult.count || 0,
    publishedPapers: publishedResult.count || 0,
    pendingReview: reviewResult.count || 0,
    totalUsers: usersResult.count || 0,
    pendingInvitations: invitationsResult.count || 0,
    subscribers: subscribersResult.count || 0,
    pendingProposals: proposalsResult.count || 0,
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
          <p className={styles.statLabel}>Pending Proposals</p>
          <p className={styles.statValue}>{stats.pendingProposals}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Users</p>
          <p className={styles.statValue}>{stats.totalUsers}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending Invitations</p>
          <p className={styles.statValue}>{stats.pendingInvitations}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Subscribers</p>
          <p className={styles.statValue}>{stats.subscribers}</p>
        </div>
      </div>
    </div>
  );
}
