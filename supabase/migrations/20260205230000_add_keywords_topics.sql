-- Add keywords and topics to papers table
ALTER TABLE papers ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE papers ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';
