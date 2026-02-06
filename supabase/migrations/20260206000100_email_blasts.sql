-- Email blasts table
CREATE TABLE email_blasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  recipient_type TEXT NOT NULL DEFAULT 'all' CHECK (recipient_type IN ('all', 'reviewers', 'authors', 'custom')),
  custom_emails TEXT[], -- for custom recipient lists
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL, -- optional link to paper
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Index for finding scheduled blasts
CREATE INDEX idx_email_blasts_scheduled ON email_blasts(status, scheduled_for) WHERE status = 'scheduled';
