"use client";

import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import styles from "../home.module.css";

export default function FreeAccessSection() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.sectionInner}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle}>
            Free Access: A New Publishing Paradigm
          </h2>
        </ScrollReveal>
        
        <div className={styles.freeAccessContent}>
          <ScrollReveal className={styles.freeAccessBlock} delay={0.1}>
            <h3 className={styles.freeAccessHeading}>Reading is Free</h3>
            <p className={styles.freeAccessText}>
              Access is the default and open to anyone. We restrict bots 
              from scraping with key generation authentication. No password required. No account necessary.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className={styles.freeAccessBlock} delay={0.2}>
            <h3 className={styles.freeAccessHeading}>We Aren't Beholden To Citation Count</h3>
            <p className={styles.freeAccessText}>
              You need us to cite you, but you cannot cite these papers unless you are getting published here. 
              We don't want the continuance of pseudoscience to be associated with our work. Read here, cite here. 
              The nature of the relationship has changed. You may see our legal agreement <Link href="/legal" className={styles.inlineLink}>here</Link>.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className={styles.freeAccessBlock} delay={0.3}>
            <h3 className={styles.freeAccessHeading}>Humans Excel Here</h3>
            <p className={styles.freeAccessText}>
              The freedom to use technology should progress Science via humans recognizing patterns 
              and rapidly augmenting shifts for maximum impact. Prolonging flawed and ill-posed 
              research is no longer an option. We are not competing to be good at pseudoscience and we do not believe it should be a viable career trajectory. 
              It absolutely should not be guiding policy, hiring, and public education. All writing we publish is done by real people communicating their solutions in their own original voice(s).
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
