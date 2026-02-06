-- Readers table - end users who access papers (separate from reviewers/authors)
CREATE TABLE readers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_access_at TIMESTAMPTZ DEFAULT NOW(),
  last_access_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  papers_viewed INTEGER DEFAULT 0,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views for analytics
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  reader_id UUID REFERENCES readers(id) ON DELETE SET NULL,
  reader_email TEXT,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- hashed IP for privacy
  country TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reader sessions for tracking login activity
CREATE TABLE reader_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID REFERENCES readers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  pages_viewed INTEGER DEFAULT 0,
  ip_hash TEXT,
  user_agent TEXT,
  device_type TEXT
);

-- Daily stats aggregation for faster queries
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_readers INTEGER DEFAULT 0,
  paper_views INTEGER DEFAULT 0,
  auth_requests INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_readers_email ON readers(email);
CREATE INDEX idx_readers_last_access ON readers(last_access_at);
CREATE INDEX idx_page_views_created ON page_views(created_at);
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_reader ON page_views(reader_id);
CREATE INDEX idx_page_views_paper ON page_views(paper_id);
CREATE INDEX idx_reader_sessions_reader ON reader_sessions(reader_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
