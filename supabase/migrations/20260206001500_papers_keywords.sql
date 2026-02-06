-- Add keywords, research area, and authors list to papers table
ALTER TABLE papers ADD COLUMN IF NOT EXISTS research_area TEXT;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE papers ADD COLUMN IF NOT EXISTS authors_list TEXT[];

-- Add index for research area filtering
CREATE INDEX IF NOT EXISTS idx_papers_research_area ON papers(research_area);
