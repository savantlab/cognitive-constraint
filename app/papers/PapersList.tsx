"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./papers.module.css";

interface Paper {
  id: string;
  title: string;
  author: string;
  published: string;
  validations: number;
  abstract: string;
}

interface PapersListProps {
  recentPapers: Paper[];
  archivedPapers: Paper[];
}

export default function PapersList({ recentPapers, archivedPapers }: PapersListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filterPapers = (papers: Paper[]) => {
    if (!searchQuery.trim()) return papers;
    
    const query = searchQuery.toLowerCase();
    return papers.filter(
      (paper) =>
        paper.title.toLowerCase().includes(query) ||
        paper.author.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query)
    );
  };

  const filteredRecent = filterPapers(recentPapers);
  const filteredArchived = filterPapers(archivedPapers);
  const hasResults = filteredRecent.length > 0 || filteredArchived.length > 0;

  return (
    <>
      <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search papers by title, author, or abstract..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {!hasResults && searchQuery && (
        <p className={styles.noResults}>No papers found matching "{searchQuery}"</p>
      )}

      {filteredRecent.length > 0 && (
        <div className={styles.papersList}>
          {filteredRecent.map((paper) => (
            <article key={paper.id} className={styles.paper}>
              <div className={styles.paperHeader}>
                <h2 className={styles.paperTitle}>{paper.title}</h2>
                <div className={styles.paperScore}>
                  <span>✓</span> +{paper.validations}
                </div>
              </div>
              <p className={styles.paperMeta}>
                {paper.author} · Published {paper.published} · {paper.validations} validations
              </p>
              <p className={styles.paperAbstract}>{paper.abstract}</p>
              <Link href={`/papers/${paper.id}`} className={styles.readMore}>
                Read paper →
              </Link>
            </article>
          ))}
        </div>
      )}

      {filteredArchived.length > 0 && (
        <>
          <h2 className={styles.archiveTitle}>Archive</h2>
          <div className={styles.papersList}>
            {filteredArchived.map((paper) => (
              <article key={paper.id} className={styles.paper}>
                <div className={styles.paperHeader}>
                  <h2 className={styles.paperTitle}>{paper.title}</h2>
                  <div className={styles.paperScore}>
                    <span>✓</span> +{paper.validations}
                  </div>
                </div>
                <p className={styles.paperMeta}>
                  {paper.author} · Published {paper.published} · {paper.validations} validations
                </p>
                <p className={styles.paperAbstract}>{paper.abstract}</p>
                <Link href={`/papers/${paper.id}`} className={styles.readMore}>
                  Read paper →
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
