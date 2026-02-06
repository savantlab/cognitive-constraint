import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "../../dashboard/dashboard.module.css";
import LogoutButton from "./LogoutButton";

interface PortalSession {
  email: string;
  role: string;
  institution: string;
}

export default async function PortalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const isAuthor = session.role === "author";

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/portal/dashboard" className={styles.logo}>
            CCJ Portal
          </Link>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            {session.email}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>
            {session.role} {session.institution ? `· ${session.institution}` : ""}
          </p>
        </div>

        <nav className={styles.nav}>
          <Link href="/portal/dashboard" className={styles.navLink}>
            Overview
          </Link>
          {isReviewer && (
            <>
              <Link href="/portal/dashboard/reviews" className={styles.navLink}>
                Review Queue
              </Link>
              <Link href="/portal/dashboard/expertise" className={styles.navLink}>
                My Expertise
              </Link>
            </>
          )}
          <Link href="/portal/dashboard/proposals" className={styles.navLink}>
            Proposals
          </Link>
          <Link href="/portal/dashboard/messages" className={styles.navLink}>
            Messages
          </Link>
          {(isAuthor || isReviewer) && (
            <>
              <Link href="/portal/dashboard/submissions" className={styles.navLink}>
                My Submissions
              </Link>
              <Link href="/portal/dashboard/revisions" className={styles.navLink}>
                Revisions
              </Link>
            </>
          )}
          <Link href="/portal/dashboard/payments" className={styles.navLink}>
            Payments
          </Link>
          <Link href="/portal/dashboard/profile" className={styles.navLink}>
            Profile
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to Journal
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
