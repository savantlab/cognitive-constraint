import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "../lib/auth";
import Link from "next/link";
import styles from "./papers.module.css";
import PapersList from "./PapersList";

export const metadata: Metadata = {
  title: "Papers",
  description: "Browse peer-reviewed publications in cognitive science and psychology. Free access for individual readers.",
};

export default async function PapersPage() {
  // TODO: Re-enable auth before production
  // const authenticated = await isAuthenticated();
  // if (!authenticated) {
  //   redirect("/verify");
  // }

  // Recent papers - these would come from Supabase
  const recentPapers = [
    {
      id: "1",
      title: "De Finibus Bonorum et Malorum: Limites Cognitionis Humanae",
      author: "Marcus Tullius Cicero",
      published: "Jan 15, 2026",
      validations: 3,
      abstract: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: "2",
      title: "Meditationes de Prima Philosophia Computatrali",
      author: "Marcus Aurelius",
      published: "Jan 20, 2026",
      validations: 5,
      abstract: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      id: "3",
      title: "Epistulae Morales ad Lucilium: Cognitionis Fundamenta",
      author: "Lucius Annaeus Seneca",
      published: "Jan 25, 2026",
      validations: 2,
      abstract: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      id: "4",
      title: "De Rerum Natura: Perceptio et Realitas",
      author: "Titus Lucretius Carus",
      published: "Jan 28, 2026",
      validations: 4,
      abstract: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

  // Archived papers - older publications
  const archivedPapers = [
    {
      id: "5",
      title: "Principia Mathematica Cognitionis",
      author: "Gaius Plinius Secundus",
      published: "Dec 10, 2025",
      validations: 8,
      abstract: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    },
    {
      id: "6",
      title: "De Anima et Machina: Tractatus Novus",
      author: "Publius Vergilius Maro",
      published: "Nov 22, 2025",
      validations: 6,
      abstract: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur.",
    },
    {
      id: "7",
      title: "Ethica Computatralis: Fundamenta",
      author: "Quintus Horatius Flaccus",
      published: "Oct 15, 2025",
      validations: 4,
      abstract: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.",
    },
    {
      id: "8",
      title: "Naturalis Historia Mentis",
      author: "Titus Livius",
      published: "Sep 5, 2025",
      validations: 7,
      abstract: "Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit.",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Recent Publications</h1>
        
        <PapersList recentPapers={recentPapers} archivedPapers={archivedPapers} />
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
