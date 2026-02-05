"use client";

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
              Access is the default and open to anyone with an email address. We restrict bots 
              from scraping with key generation authentication. No password required. No account necessary.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className={styles.freeAccessBlock} delay={0.2}>
            <h3 className={styles.freeAccessHeading}>We Aren't Beholden To Citation Count</h3>
            <p className={styles.freeAccessText}>
              You need us to cite you, but you cannot cite these papers unless you are getting published here. 
              We don't want the continuance of pseudoscience to be associated with our work. Read here, cite here. 
              The nature of the relationship has changed.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className={styles.freeAccessBlock} delay={0.3}>
            <h3 className={styles.freeAccessHeading}>Humans Excel Here</h3>
            <p className={styles.freeAccessText}>
              The freedom to use technology should progress Science via humans recognizing patterns 
              and rapidly augmenting shifts for maximum impact. Prolonging flawed and ill-posed 
              research is no longer an option.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
