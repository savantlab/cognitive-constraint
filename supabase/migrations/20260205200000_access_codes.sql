-- Access codes for passwordless authentication
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  verified BOOLEAN DEFAULT FALSE
);

-- Index for quick lookups
CREATE INDEX idx_access_codes_email ON access_codes(email);
CREATE INDEX idx_access_codes_code ON access_codes(code);

-- Clean up expired codes automatically (optional - can be done via cron)
-- This just ensures we don't accumulate stale data

-- RLS policies
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon (for generating codes)
CREATE POLICY "Allow insert access codes" ON access_codes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow select for verification (anon can verify their own code)
CREATE POLICY "Allow select access codes" ON access_codes
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow update for marking as verified
CREATE POLICY "Allow update access codes" ON access_codes
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow delete for cleanup
CREATE POLICY "Allow delete access codes" ON access_codes
  FOR DELETE TO anon, authenticated
  USING (true);
