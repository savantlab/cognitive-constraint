-- Clean up RLS policies to fix remaining issues

-- 1. Drop orphaned policies on tables where we disabled RLS
DROP POLICY IF EXISTS "Allow insert access codes" ON access_codes;
DROP POLICY IF EXISTS "Allow select access codes" ON access_codes;
DROP POLICY IF EXISTS "Allow update access codes" ON access_codes;
DROP POLICY IF EXISTS "Allow delete access codes" ON access_codes;

DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Allow insert users" ON users;
DROP POLICY IF EXISTS "Allow update users" ON users;

DROP POLICY IF EXISTS "Allow select invitations" ON invitations;
DROP POLICY IF EXISTS "Allow insert invitations" ON invitations;
DROP POLICY IF EXISTS "Allow update invitations" ON invitations;
DROP POLICY IF EXISTS "Allow delete invitations" ON invitations;

-- 2. Fix duplicate/multiple permissive policies on papers
-- Keep only the role-specific policies, drop the generic ones
DROP POLICY IF EXISTS "Public can read published papers" ON papers;
DROP POLICY IF EXISTS "Authors can create papers" ON papers;
DROP POLICY IF EXISTS "Authors can update own papers" ON papers;

-- 3. Revoke permissions on tables that had policies removed
REVOKE ALL ON access_codes FROM anon, authenticated;
REVOKE ALL ON users FROM anon, authenticated;
REVOKE ALL ON invitations FROM anon, authenticated;

-- 4. Handle payment_forms and user_payment_info tables (no RLS)
REVOKE ALL ON payment_forms FROM anon, authenticated;
REVOKE ALL ON user_payment_info FROM anon, authenticated;

-- 5. Clean up authors, validations, replications - these need proper policies
-- For now, revoke public access and disable RLS since they're admin-managed
DROP POLICY IF EXISTS "Authors are viewable by everyone" ON authors;
DROP POLICY IF EXISTS "Validations are viewable by everyone" ON validations;
DROP POLICY IF EXISTS "Authenticated users can create validations" ON validations;
DROP POLICY IF EXISTS "Replications are viewable by everyone" ON replications;
DROP POLICY IF EXISTS "Authenticated users can create replications" ON replications;

ALTER TABLE authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE replications DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON authors FROM anon, authenticated;
REVOKE ALL ON validations FROM anon, authenticated;
REVOKE ALL ON replications FROM anon, authenticated;

-- 6. Papers table - keep RLS enabled with clean policies
-- Already has good policies: "Anon can view published papers" and "Authenticated can view published or own papers"
