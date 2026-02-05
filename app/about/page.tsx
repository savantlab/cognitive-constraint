import Link from "next/link";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Quality Over Quantity</h1>
      </main>

      <section className={styles.mission}>
        <div className={styles.missionInner}>
          <h2 className={styles.missionTitle}>One Problem At A Time</h2>
          <p className={styles.missionText}>
            Cognitive Constraint is an unprecedented academic publication that has taken novel steps to massive mistakes made in the field of cognitive science including the miscategorization of mental rotation and unproven psychometrics. We see the landscape as a frontier in need of better organization and a more rigorous approach to any methodology applied to real human beings.
          </p>
          <p className={styles.missionText}>
            Dissemination of novel innovation in an area of research requires taking ingenious directive and ruthless commitment to the strategy. Fastidious attention to details, patterns, and the ability to recognize mistakes must be impervious. We want to reshape the psychological landscape forever and make permanent policy supportive moves toward a better future of the mind of society for everyone. We are 100% against pseudoscientific precedent governing the perception of human behavioral science. It currently abounds. We do not build careers on counterfeit like virtually every institution involved in Psychology has been built upon and with, and we do not expect the polluted ecosystem to cede to us in one day. Rome wasn't built in a day, but it didn't fall in a single day either.
          </p>
        </div>
      </section>

      <section className={styles.consulting}>
        <div className={styles.consultingInner}>
          <h2 className={styles.consultingTitle}>Consulting Services</h2>
          <p className={styles.consultingText}>
            Advancing the status quo is hard. You might be in need of experts who are on the cutting edge. See our <Link href="/services" className={styles.consultingLink}>services</Link> section.
          </p>
        </div>
      </section>

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
