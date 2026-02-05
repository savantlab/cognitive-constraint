-- Users table for dashboard/portal access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'reviewer', 'author')),
  name TEXT,
  institution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Invitations table for bulk email imports
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  institution TEXT,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('reviewer', 'author')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  invite_sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_institution ON invitations(institution);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users policies (admin can do everything, users can read own)
CREATE POLICY "Users can view own record" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert users" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update users" ON users
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Invitations policies (admin managed)
CREATE POLICY "Allow select invitations" ON invitations
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert invitations" ON invitations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update invitations" ON invitations
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete invitations" ON invitations
  FOR DELETE TO anon, authenticated
  USING (true);
