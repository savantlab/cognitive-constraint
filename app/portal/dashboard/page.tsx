import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "../../dashboard/dashboard.module.css";

interface PortalSession {
  email: string;
  role: string;
  institution: string;
}

export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const portalCookie = cookieStore.get("ccj_portal");

  if (!portalCookie) {
    redirect("/portal");
  }

  let session: PortalSession;
  try {
    session = JSON.parse(portalCookie.value);
  } catch {
    redirect("/portal");
  }

  const isReviewer = session.role === "reviewer";

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Welcome to the Portal</h1>
        <p className={styles.pageDescription}>
          {isReviewer
            ? "Review submissions and contribute to open science."
            : "Submit your research for peer review."}
        </p>
      </div>

      <div className={styles.statsGrid}>
        {isReviewer && (
          <>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Pending Reviews</p>
              <p className={styles.statValue}>0</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Completed Reviews</p>
              <p className={styles.statValue}>0</p>
            </div>
          </>
        )}
        <div className={styles.statCard}>
          <p className={styles.statLabel}>My Submissions</p>
          <p className={styles.statValue}>0</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Published Papers</p>
          <p className={styles.statValue}>0</p>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {isReviewer && (
            <a href="/portal/dashboard/reviews" className={styles.primaryButton}>
              View Review Queue
            </a>
          )}
          <a href="/portal/dashboard/submissions" className={styles.actionButton}>
            {isReviewer ? "My Submissions" : "Submit a Paper"}
          </a>
        </div>
      </div>

      <div style={{ marginTop: "3rem", padding: "1.5rem", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>About Your Role</h3>
        {isReviewer ? (
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            As a reviewer, you have been invited to evaluate submissions for the Cognitive Constraint Journal. 
            Your role is to provide constructive feedback and help maintain the quality of our open-access publications. 
            You can also submit your own research for peer review.
          </p>
        ) : (
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            As an author, you can submit your research for peer review by the Cognitive Constraint Journal community.
            Your submissions will be reviewed by our invited reviewers before publication.
          </p>
        )}
      </div>
    </div>
  );
}
