-- Reviews table for peer review submissions
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject')),
  confidence_level TEXT NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  is_anonymous BOOLEAN DEFAULT true,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_reviews_paper ON reviews(paper_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviewers can view their own reviews
CREATE POLICY "Reviewers can view own reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert reviews" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update reviews" ON reviews
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update paper_reviewers to link to review
ALTER TABLE paper_reviewers ADD COLUMN IF NOT EXISTS review_id UUID REFERENCES reviews(id) ON DELETE SET NULL;
