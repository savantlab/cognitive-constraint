import Link from "next/link";
import styles from "./services.module.css";

export default function ServicesPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Services</h1>
        
        <div className={styles.content}>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            © 2026 Cognitive Constraint Journal. Free access for all.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
