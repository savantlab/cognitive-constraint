-- Proposals table - authors submit proposals before full papers
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  methodology_summary TEXT,
  expected_contribution TEXT,
  research_area TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  estimated_length TEXT, -- e.g., '5000-8000 words'
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'revision_requested')),
  funding_amount DECIMAL(10, 2), -- granted if accepted
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviewer expertise - for matching reviewers to papers
CREATE TABLE reviewer_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  research_areas TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  h_index INTEGER,
  publications_count INTEGER,
  years_experience INTEGER,
  institution TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'unavailable')),
  max_concurrent_reviews INTEGER DEFAULT 3,
  current_reviews_count INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review threads - for editor-author communication
CREATE TABLE review_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_id, reviewer_id)
);

-- Review messages - messages within threads
CREATE TABLE review_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES review_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('reviewer', 'author')),
  sender_id UUID NOT NULL, -- references users.id or authors.id depending on sender_type
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'feedback' CHECK (message_type IN ('feedback', 'question', 'revision_request', 'response', 'general')),
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper revisions - track revision history
CREATE TABLE paper_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT, -- author's description of changes
  reviewer_notes TEXT, -- reviewer feedback on this revision
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'in_review', 'approved', 'needs_changes', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_id, version_number)
);

-- Modify papers table
ALTER TABLE papers ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS current_revision_id UUID REFERENCES paper_revisions(id) ON DELETE SET NULL;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS assigned_editor_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add more statuses to papers
ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_status_check;
ALTER TABLE papers ADD CONSTRAINT papers_status_check 
  CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'REVISION_SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'DISPUTED'));

-- Modify paper_reviewers to support editor role
ALTER TABLE paper_reviewers ADD COLUMN IF NOT EXISTS is_lead_editor BOOLEAN DEFAULT false;
ALTER TABLE paper_reviewers ADD COLUMN IF NOT EXISTS can_communicate BOOLEAN DEFAULT true;
ALTER TABLE paper_reviewers ADD COLUMN IF NOT EXISTS recommendation TEXT CHECK (recommendation IS NULL OR recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject'));

-- Indexes
CREATE INDEX idx_proposals_author ON proposals(author_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_research_area ON proposals(research_area);
CREATE INDEX idx_reviewer_expertise_user ON reviewer_expertise(user_id);
CREATE INDEX idx_reviewer_expertise_areas ON reviewer_expertise USING GIN(research_areas);
CREATE INDEX idx_reviewer_expertise_keywords ON reviewer_expertise USING GIN(keywords);
CREATE INDEX idx_review_threads_paper ON review_threads(paper_id);
CREATE INDEX idx_review_threads_reviewer ON review_threads(reviewer_id);
CREATE INDEX idx_review_messages_thread ON review_messages(thread_id);
CREATE INDEX idx_paper_revisions_paper ON paper_revisions(paper_id);

-- RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_revisions ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for now, tighten in production)
CREATE POLICY "Allow all on proposals" ON proposals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on reviewer_expertise" ON reviewer_expertise FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on review_threads" ON review_threads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on review_messages" ON review_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on paper_revisions" ON paper_revisions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
