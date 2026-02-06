-- Enable RLS on all tables and restrict public API access
-- Service role (used by backend) bypasses RLS automatically

-- Analytics tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE readers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Contact messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Email blasts
ALTER TABLE email_blasts ENABLE ROW LEVEL SECURITY;

-- Paper reviewers
ALTER TABLE paper_reviewers ENABLE ROW LEVEL SECURITY;

-- Users and invitations
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Access codes
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Papers (if not already enabled)
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to papers" ON papers;

-- Create restrictive policies (service role bypasses these)
-- Papers: allow public to read published papers only
CREATE POLICY "Public can read published papers" ON papers
  FOR SELECT USING (status = 'published');

-- All admin/sensitive tables: no public access (service role only)
-- page_views
CREATE POLICY "Service role only" ON page_views
  FOR ALL USING (false);

-- readers
CREATE POLICY "Service role only" ON readers
  FOR ALL USING (false);

-- reader_sessions
CREATE POLICY "Service role only" ON reader_sessions
  FOR ALL USING (false);

-- daily_stats
CREATE POLICY "Service role only" ON daily_stats
  FOR ALL USING (false);

-- subscribers
CREATE POLICY "Service role only" ON subscribers
  FOR ALL USING (false);

-- invoices
CREATE POLICY "Service role only" ON invoices
  FOR ALL USING (false);

-- invoice_items
CREATE POLICY "Service role only" ON invoice_items
  FOR ALL USING (false);

-- contact_messages
CREATE POLICY "Service role only" ON contact_messages
  FOR ALL USING (false);

-- payments
CREATE POLICY "Service role only" ON payments
  FOR ALL USING (false);

-- email_blasts
CREATE POLICY "Service role only" ON email_blasts
  FOR ALL USING (false);

-- paper_reviewers
CREATE POLICY "Service role only" ON paper_reviewers
  FOR ALL USING (false);

-- users
CREATE POLICY "Service role only" ON users
  FOR ALL USING (false);

-- invitations
CREATE POLICY "Service role only" ON invitations
  FOR ALL USING (false);

-- access_codes
CREATE POLICY "Service role only" ON access_codes
  FOR ALL USING (false);
