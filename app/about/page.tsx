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

      <section className={styles.ethics}>
        <div className={styles.ethicsInner}>
          <h2 className={styles.ethicsTitle}>We Adhere To COPE</h2>
          <p className={styles.ethicsText}>
            Cognitive Constraint is pushing the limits of academic publishing in every conceivable way, yet we still believe in integrity. We want to only publish the most original and relevant work in Psychology and Behavioral Science. We pay our peer reviewers to be brutally honest unlike virtually all other academic publications which rely on quantity of submissions to stay in business. This model has been revised two-fold. We pay for published work which means if it isn't our standard, we don't want to publish it. Cognitive Constraint authors are not beholden to citation counts either. In this more traditional publishing business model the peer review process can work as it is intended and without the expectation that the reviewer simply comply with the status quo. Learn more about publication ethics at <a href="https://publicationethics.org/guidance/guideline/ethical-guidelines-peer-reviewers/plain-text" target="_blank" rel="noopener noreferrer" className={styles.ethicsLink}>COPE (Committee on Publication Ethics)</a>.
          </p>
        </div>
      </section>

      <section className={styles.legal}>
        <div className={styles.legalInner}>
          <h2 className={styles.legalTitle}>The Legal Frontier</h2>
          <p className={styles.legalText}>
            Radically altering the landscape is more than challenging. It requires out-of-the-box adaptations that are not expected. Cognitive Constraint will always be completely free for the individual user to access, read, and share within non-commercial usage and Fair Use clauses. To implement this model we require that every other type of user pay their tier fees or operate under a specific <Link href="/legal" className={styles.legalLink}>license</Link>. Advancing the status quo is hard. You might be in need of experts who are on the cutting edge. See our <Link href="/services" className={styles.legalLink}>services</Link> section.
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
            <Link href="/legal" className={styles.footerLink}>Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
