-- Paper reviewers whitelist - tracks which reviewers are assigned to each paper
CREATE TABLE paper_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_email TEXT NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'completed')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_id, reviewer_email)
);

-- Index for finding reviewers by paper
CREATE INDEX idx_paper_reviewers_paper ON paper_reviewers(paper_id);
CREATE INDEX idx_paper_reviewers_email ON paper_reviewers(reviewer_email);
CREATE INDEX idx_paper_reviewers_status ON paper_reviewers(status);
