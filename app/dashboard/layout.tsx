import { redirect } from "next/navigation";
import { isAdmin } from "../lib/admin-auth";
import Link from "next/link";
import styles from "./dashboard.module.css";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorized = await isAdmin();

  // Don't wrap login page with dashboard layout
  if (!authorized) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            CCJ Admin
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>
            Overview
          </Link>
          <Link href="/dashboard/papers" className={styles.navLink}>
            Papers
          </Link>
          <Link href="/dashboard/proposals" className={styles.navLink}>
            Proposals
          </Link>
          <Link href="/dashboard/invitations" className={styles.navLink}>
            Invitations
          </Link>
          <Link href="/dashboard/users" className={styles.navLink}>
            Users
          </Link>
          <Link href="/dashboard/payments" className={styles.navLink}>
            Payments
          </Link>
          <Link href="/dashboard/emails" className={styles.navLink}>
            Emails
          </Link>
          <Link href="/dashboard/analytics" className={styles.navLink}>
            Analytics
          </Link>
          <Link href="/dashboard/subscriptions" className={styles.navLink}>
            Subscriptions
          </Link>
          <Link href="/dashboard/invoices" className={styles.navLink}>
            Invoices
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to site
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
