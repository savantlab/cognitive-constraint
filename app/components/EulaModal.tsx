"use client";

import { useState } from "react";
import styles from "./EulaModal.module.css";

interface EulaModalProps {
  onAccept: () => void;
}

export default function EulaModal({ onAccept }: EulaModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>End User License Agreement (EULA) & Terms of Access</h1>
        
        <p className={styles.notice}>
          <strong>NOTICE:</strong> This is a legally binding agreement. By solving the CAPTCHA and accessing 
          the research materials (the "Work") contained herein, you agree to be bound by the following terms. 
          If you do not agree, do not proceed.
        </p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. THE "HUMAN-ONLY" ACCESS GATE</h2>
            <p>Access to this Work is protected by a Technical Protection Measure (TPM) in the form of a CAPTCHA.</p>
            <ul>
              <li><strong>Anti-Scraping:</strong> Automated access, crawling, or "scraping" by bots, AI training models, or indexers is strictly prohibited.</li>
              <li><strong>Circumvention:</strong> Any attempt to bypass this gate constitutes a violation of the Digital Millennium Copyright Act (DMCA) or equivalent international intellectual property laws.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. INDIVIDUAL VS. ORGANIZATIONAL USE</h2>
            <ul>
              <li><strong>Individual License:</strong> Natural persons, including students, are granted a free, non-exclusive, non-transferable license to read and access the Work for personal use and Fair Use purposes only (as defined in Section 3).</li>
              <li><strong>Educational Restriction:</strong> Use of the Work within a University, College, or other educational institution—including but not limited to classroom instruction, inclusion in syllabi, or upload to a Learning Management System (LMS)—is strictly prohibited without a paid Educational Site License.</li>
              <li><strong>Institutional Restriction:</strong> Use by associations, think tanks, research institutes, or similar organizations requires a paid Institutional License.</li>
              <li><strong>Corporate Restriction:</strong> Use by for-profit companies, corporations, or commercial entities requires a paid Corporate License.</li>
              <li><strong>Non-Profit Restriction:</strong> Use by non-profit organizations (501(c)(3) or equivalent) requires a paid Non-Profit License.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. CITATION & FAIR USE</h2>
            <p><strong>Fair Use Recognized:</strong> This EULA acknowledges the doctrine of Fair Use under 17 U.S.C. § 107. The following are explicitly permitted without additional license:</p>
            <ul>
              <li>Brief quotation for purposes of criticism, commentary, or news reporting</li>
              <li>Personal social media posts by individuals (including academics using personal accounts for personal commentary)</li>
              <li>Non-commercial discussion and review</li>
              <li>Use in television programs and films for entertainment purposes</li>
            </ul>
            <p><strong>Curriculum Restriction:</strong> The Work may NOT be incorporated into educational curriculum, syllabi, course materials, or assigned reading lists at any college, university, or educational institution without a paid Educational Site License. This includes:</p>
            <ul>
              <li>Upload to Learning Management Systems (Canvas, Blackboard, Moodle, etc.)</li>
              <li>Distribution via course reserves (physical or digital)</li>
              <li>Required or recommended reading assignments</li>
              <li>Lecture materials or slides incorporating substantial portions of the Work</li>
            </ul>
            <p><strong>Faculty/Staff Limitation:</strong> College and university employees acting in their professional capacity (teaching, research conducted under institutional auspices) must obtain an Educational Site License. Personal, non-institutional research by academics remains permitted under the Individual License.</p>
            <p><strong>Publisher Restriction:</strong> Academic publishing companies may NOT publish works (books, edited volumes, journals, etc.) containing citations to or substantial references of this Work without a paid Publisher License. This restriction applies to all commercial peer-reviewed publications other than this Journal. Authors seeking to cite this Work in externally published materials must ensure their publisher holds a valid Publisher License.</p>
            <p><strong>In-House Citation Preference:</strong> Formal scholarly citation is permitted and encouraged within this Journal and its affiliated publications without additional licensing.</p>
          </section>

          <section className={styles.section}>
            <h2>4. REDISTRIBUTION</h2>
            <p>You may share the PDF file with other individuals for personal use, provided that the file remains intact, including this EULA and all original headers/footers. You may not host this file on public repositories (e.g., ResearchGate, SSRN) or commercial websites.</p>
          </section>

          <section className={styles.section}>
            <h2>5. TERMINATION & ENFORCEMENT</h2>
            <p>Violation of any terms in this EULA terminates your license to the Work. The Publisher reserves the right to pursue legal remedies for unauthorized educational, institutional, or publisher use.</p>
          </section>
        </div>

        <div className={styles.footer}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>I have read and agree to the Terms of Access</span>
          </label>
          <button
            className={styles.button}
            disabled={!agreed}
            onClick={onAccept}
          >
            Continue to Verification
          </button>
        </div>
      </div>
    </div>
  );
}
