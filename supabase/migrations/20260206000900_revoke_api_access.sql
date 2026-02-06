-- Revoke direct API access from admin-only tables
-- These tables should only be accessed via service_role (backend APIs)
-- This is more secure than RLS policies with USING(false)

-- Drop the problematic policies that use USING(false)
DROP POLICY IF EXISTS "Service role only" ON page_views;
DROP POLICY IF EXISTS "Service role only" ON readers;
DROP POLICY IF EXISTS "Service role only" ON reader_sessions;
DROP POLICY IF EXISTS "Service role only" ON daily_stats;
DROP POLICY IF EXISTS "Service role only" ON subscribers;
DROP POLICY IF EXISTS "Service role only" ON invoices;
DROP POLICY IF EXISTS "Service role only" ON invoice_items;
DROP POLICY IF EXISTS "Service role only" ON contact_messages;
DROP POLICY IF EXISTS "Service role only" ON payments;
DROP POLICY IF EXISTS "Service role only" ON email_blasts;
DROP POLICY IF EXISTS "Service role only" ON paper_reviewers;
DROP POLICY IF EXISTS "Service role only" ON users;
DROP POLICY IF EXISTS "Service role only" ON invitations;
DROP POLICY IF EXISTS "Service role only" ON access_codes;

-- Revoke all permissions from anon and authenticated roles on admin tables
-- service_role retains full access as superuser

REVOKE ALL ON page_views FROM anon, authenticated;
REVOKE ALL ON readers FROM anon, authenticated;
REVOKE ALL ON reader_sessions FROM anon, authenticated;
REVOKE ALL ON daily_stats FROM anon, authenticated;
REVOKE ALL ON subscribers FROM anon, authenticated;
REVOKE ALL ON invoices FROM anon, authenticated;
REVOKE ALL ON invoice_items FROM anon, authenticated;
REVOKE ALL ON contact_messages FROM anon, authenticated;
REVOKE ALL ON payments FROM anon, authenticated;
REVOKE ALL ON email_blasts FROM anon, authenticated;
REVOKE ALL ON paper_reviewers FROM anon, authenticated;
REVOKE ALL ON users FROM anon, authenticated;
REVOKE ALL ON invitations FROM anon, authenticated;
REVOKE ALL ON access_codes FROM anon, authenticated;

-- Disable RLS on these tables since we're using REVOKE instead
-- (RLS without policies can cause issues)
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE readers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reader_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_blasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE paper_reviewers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes DISABLE ROW LEVEL SECURITY;

-- Keep RLS on papers with proper policy
-- Papers table stays with RLS for public read of published papers
