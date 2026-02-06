import Link from "next/link";
import styles from "./home.module.css";
import FreeAccessSection from "./components/FreeAccessSection";

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>
            Cognitive Constraint Journal
          </span>
          <input type="checkbox" id="navToggle" className={styles.navToggle} />
          <label htmlFor="navToggle" className={styles.navToggleLabel}>
            <span></span>
            <span></span>
            <span></span>
          </label>
          <nav className={styles.nav}>
            <Link href="/papers" className={styles.navLink}>Papers</Link>
            <Link href="/education" className={styles.navLink}>Education</Link>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
            <Link href="/legal" className={styles.navLink}>Legal</Link>
            <Link href="/notify" className={styles.navLink}>Get Notified</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Advancing Ourselves With Problem Solving
            </h1>
            <p className={styles.heroSubtitle}>
              Paradigm shifting requires a new publication model. We introduce Free Access with limited citation rights.
            </p>
            <div className={styles.heroCta}>
              <Link href="/papers" className={styles.ctaPrimary}>
                Browse Papers
              </Link>
              <Link href="/about" className={styles.ctaSecondary}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Mission / Why This Journal */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">
            Cognitive Constraint Is For Radical Hard Science
          </h2>
          <p className={styles.sectionSubtitle} data-aos="fade-up" data-aos-delay="150">
            Our solutions live here and nowhere else. We also offer generous compensation for publishing under our groundbreaking work.
          </p>
          <p className={styles.sectionTagline} data-aos="fade-up" data-aos-delay="300">
            End the exploitation.
          </p>
        </div>
      </section>

      {/* Section Image with Text */}
      <section className={styles.sectionImage}>
        <div className={styles.sectionImageInner}>
          <div className={styles.sectionImageText}>
            <p>
              Psychology, Cognitive Science, and converging disciplines deserve proof. 
              We are formally proving and revealing with technology what is currently 
              taken for granted and being applied to real people by the use of 
              unconstrained models, drifted concepts, and mathematically unsound arguments.
            </p>
            <p className={styles.sectionImageHighlight}>
              We are board wiping soft science.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Free Access Explained */}
      <FreeAccessSection />

      {/* Section Image 2 */}
      <section className={styles.sectionImage2}>
        <div className={styles.sectionImage2Inner}>
          <div className={styles.sectionImage2Text}>
            <p>Subscriptions are currently limited and invite-only.</p>
          </div>
        </div>
      </section>


      {/* Footer */}
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
    </>
  );
}
