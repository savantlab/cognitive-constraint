import { redirect } from "next/navigation";
import { isAdmin } from "../lib/admin-auth";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorized = await isAdmin();

  if (!authorized) {
    redirect("/verify?redirect=/dashboard");
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
          <Link href="/dashboard/invitations" className={styles.navLink}>
            Invitations
          </Link>
          <Link href="/dashboard/users" className={styles.navLink}>
            Users
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to site
          </Link>
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
