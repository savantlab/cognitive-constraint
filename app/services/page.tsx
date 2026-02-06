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
          <section className={styles.section}>
            <p className={styles.text}>
              Invalidating IQ scoring as a psychometric is going to accrue monumental implications and not only pushback, 
              but assertive action against the system that engaged in the wrongdoing and poor assumptions. 
              We can provide whitepapers, expert witness testimony, and educational materials as consultancy.
            </p>
            <p className={styles.text}>
              Please feel free to <Link href="/contact" className={styles.link}>contact us</Link> with further inquiries, questions, and concerns.
            </p>
          </section>
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
