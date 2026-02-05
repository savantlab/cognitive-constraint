-- Fix RLS policies to use subquery pattern for better performance
-- This prevents re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Authors can view own papers" ON papers;
DROP POLICY IF EXISTS "Authors can create papers" ON papers;
DROP POLICY IF EXISTS "Authors can update own papers" ON papers;
DROP POLICY IF EXISTS "Authenticated users can create validations" ON validations;
DROP POLICY IF EXISTS "Authenticated users can create replications" ON replications;

-- Recreate with optimized subquery pattern
CREATE POLICY "Authors can view own papers"
  ON papers FOR SELECT
  USING ((select auth.uid())::text = author_id::text);

CREATE POLICY "Authors can create papers"
  ON papers FOR INSERT
  WITH CHECK ((select auth.uid())::text = author_id::text);

CREATE POLICY "Authors can update own papers"
  ON papers FOR UPDATE
  USING ((select auth.uid())::text = author_id::text);

CREATE POLICY "Authenticated users can create validations"
  ON validations FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create replications"
  ON replications FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);
