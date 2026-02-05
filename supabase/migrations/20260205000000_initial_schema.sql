-- Cognitive Constraint Journal Schema
-- Authors table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  orcid TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Papers table
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'DISPUTED')),
  validation_score INTEGER DEFAULT 0,
  doi TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validations table
CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('MATHEMATICAL_PROOF', 'COMPUTATIONAL_REPLICATION', 'EXPERT_REVIEW', 'REFUTATION_ATTEMPT')),
  result TEXT NOT NULL CHECK (result IN ('CONFIRMED', 'DISPUTED', 'FAILED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Replications table
CREATE TABLE replications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  replicator_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  code_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_papers_status ON papers(status);
CREATE INDEX idx_papers_author ON papers(author_id);
CREATE INDEX idx_papers_slug ON papers(slug);
CREATE INDEX idx_validations_paper ON validations(paper_id);
CREATE INDEX idx_replications_paper ON replications(paper_id);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE replications ENABLE ROW LEVEL SECURITY;

-- Public read access for published papers
CREATE POLICY "Published papers are viewable by everyone"
  ON papers FOR SELECT
  USING (status = 'PUBLISHED' OR status = 'DISPUTED');

-- Authors can view their own drafts
CREATE POLICY "Authors can view own papers"
  ON papers FOR SELECT
  USING (auth.uid()::text = author_id::text);

-- Authors can insert papers
CREATE POLICY "Authors can create papers"
  ON papers FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

-- Authors can update their own papers
CREATE POLICY "Authors can update own papers"
  ON papers FOR UPDATE
  USING (auth.uid()::text = author_id::text);

-- Public read access for authors
CREATE POLICY "Authors are viewable by everyone"
  ON authors FOR SELECT
  USING (true);

-- Public read access for validations
CREATE POLICY "Validations are viewable by everyone"
  ON validations FOR SELECT
  USING (true);

-- Authenticated users can create validations
CREATE POLICY "Authenticated users can create validations"
  ON validations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Public read access for replications
CREATE POLICY "Replications are viewable by everyone"
  ON replications FOR SELECT
  USING (true);

-- Authenticated users can create replications
CREATE POLICY "Authenticated users can create replications"
  ON replications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable pg_graphql extension
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- Grant access to anon and authenticated roles
GRANT SELECT ON authors TO anon, authenticated;
GRANT SELECT ON papers TO anon, authenticated;
GRANT SELECT ON validations TO anon, authenticated;
GRANT SELECT ON replications TO anon, authenticated;

GRANT INSERT, UPDATE ON papers TO authenticated;
GRANT INSERT ON validations TO authenticated;
GRANT INSERT ON replications TO authenticated;
GRANT INSERT, UPDATE ON authors TO authenticated;
