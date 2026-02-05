-- Optimize RLS policies by targeting specific roles
-- This prevents multiple permissive policies for the same role/action

-- Drop overlapping policies
DROP POLICY IF EXISTS "Authors can view own papers" ON papers;
DROP POLICY IF EXISTS "Published papers are viewable by everyone" ON papers;

-- Public policy for anon - only published/disputed papers
CREATE POLICY "Anon can view published papers"
  ON papers FOR SELECT
  TO anon
  USING (status IN ('PUBLISHED', 'DISPUTED'));

-- Authenticated users can see published papers AND their own
CREATE POLICY "Authenticated can view published or own papers"
  ON papers FOR SELECT
  TO authenticated
  USING (
    status IN ('PUBLISHED', 'DISPUTED') 
    OR (select auth.uid())::text = author_id::text
  );
