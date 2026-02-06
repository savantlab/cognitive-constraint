import { Metadata } from "next";
import Link from "next/link";
import styles from "./education.module.css";

export const metadata: Metadata = {
  title: "Education",
  description: "Free online courses in cognitive science and psychology. Rigorous education to address the fallout from decades of flawed methodology.",
};

export default function EducationPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <span className={styles.badge}>Coming Soon</span>
          <h1 className={styles.title}>Education</h1>
          <p className={styles.description}>
            The fallout from our work is massive. Decades of flawed methodology in cognitive science 
            and psychology require more than correction—they require re-education.
          </p>
          <p className={styles.description}>
            We are developing free online course content to help researchers, students, and 
            practitioners understand where the field went wrong and how to move forward with rigor.
          </p>
          <div className={styles.cta}>
            <Link href="/notify" className={styles.button}>
              Get Notified When We Launch
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            © 2026 Cognitive Constraint Journal. Free access for all.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/education" className={styles.footerLink}>Education</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
            <Link href="/legal" className={styles.footerLink}>Legal</Link>
            <Link href="/notify" className={styles.footerLink}>Get Notified</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
