import Link from "next/link";
import { Metadata } from "next";
import styles from "./paper.module.css";
import ShareButtons from "./ShareButtons";
import ValidateButton from "./ValidateButton";

// This would come from Supabase in production
const getPaper = (id: string) => papers[id] || null;

const papers: Record<string, {
  id: string;
  title: string;
  author: string;
  published: string;
  validations: number;
  abstract: string;
  keywords: string[];
  topics: string[];
  content: string;
}> = {
  "1": {
    id: "1",
    title: "De Finibus Bonorum et Malorum: Limites Cognitionis Humanae",
    author: "Marcus Tullius Cicero",
    published: "Jan 15, 2026",
    validations: 3,
    abstract: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    keywords: ["cognitive limits", "bounded rationality", "decision theory", "mental models"],
    topics: ["Cognitive Psychology", "Philosophy of Mind"],
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  "2": {
    id: "2",
    title: "Meditationes de Prima Philosophia Computatrali",
    author: "Marcus Aurelius",
    published: "Jan 20, 2026",
    validations: 5,
    abstract: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    keywords: ["computational theory", "formal systems", "proof theory", "algorithmic reasoning"],
    topics: ["Computational Cognition", "Mathematical Psychology"],
    content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  "3": {
    id: "3",
    title: "Epistulae Morales ad Lucilium: Cognitionis Fundamenta",
    author: "Lucius Annaeus Seneca",
    published: "Jan 25, 2026",
    validations: 2,
    abstract: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    keywords: ["moral cognition", "ethical reasoning", "virtue theory", "practical wisdom"],
    topics: ["Moral Psychology", "Ethics"],
    content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
  },
  "4": {
    id: "4",
    title: "De Rerum Natura: Perceptio et Realitas",
    author: "Titus Lucretius Carus",
    published: "Jan 28, 2026",
    validations: 4,
    abstract: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    keywords: ["perception", "reality modeling", "sensory processing", "phenomenology"],
    topics: ["Perceptual Psychology", "Cognitive Science"],
    content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const paper = getPaper(id);

  if (!paper) {
    return {
      title: "Paper not found | Cognitive Constraint Journal",
    };
  }

  return {
    title: `${paper.title} | Cognitive Constraint Journal`,
    description: paper.abstract,
    openGraph: {
      title: paper.title,
      description: paper.abstract,
      type: "article",
      authors: [paper.author],
      publishedTime: paper.published,
      siteName: "Cognitive Constraint Journal",
    },
    twitter: {
      card: "summary_large_image",
      title: paper.title,
      description: paper.abstract,
    },
  };
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = papers[id];

  if (!paper) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>
            Cognitive Constraint Journal
          </Link>
        </header>
        <main className={styles.main}>
          <h1 className={styles.title}>Paper not found</h1>
          <Link href="/papers" className={styles.backLink}>← Back to papers</Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Cognitive Constraint Journal
        </Link>
      </header>

      <main className={styles.main}>
        <Link href="/papers" className={styles.backLink}>← Back to papers</Link>
        
        <article className={styles.paper}>
          <header className={styles.paperHeader}>
            <h1 className={styles.paperTitle}>{paper.title}</h1>
            <div className={styles.paperMeta}>
              <span>{paper.author}</span>
              <span>·</span>
              <span>Published {paper.published}</span>
              <span>·</span>
              <span className={styles.validations}>✓ {paper.validations} validations</span>
            </div>
          </header>

          <section className={styles.abstract}>
            <h2>Abstract</h2>
            <p>{paper.abstract}</p>
          </section>

          <section className={styles.keywords}>
            <h2>Keywords</h2>
            <div className={styles.keywordsList}>
              {paper.keywords.map((keyword, i) => (
                <span key={i} className={styles.keyword}>{keyword}</span>
              ))}
            </div>
          </section>

          <section className={styles.topics}>
            <h2>Topics</h2>
            <div className={styles.topicsList}>
              {paper.topics.map((topic, i) => (
                <span key={i} className={styles.topic}>{topic}</span>
              ))}
            </div>
          </section>

          <section className={styles.validation}>
            <h2>Validate This Paper</h2>
            <p className={styles.validationText}>
              If you have independently verified the findings in this paper, add your validation.
            </p>
            <ValidateButton paperId={paper.id} currentValidations={paper.validations} />
          </section>

          <section className={styles.share}>
            <h2>Share</h2>
            <ShareButtons title={paper.title} />
          </section>

          <section className={styles.content}>
            {paper.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </section>
        </article>
      </main>
    </div>
  );
}
