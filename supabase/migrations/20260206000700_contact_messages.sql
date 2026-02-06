-- Contact form messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

-- Index for listing unread messages
CREATE INDEX idx_contact_messages_read ON contact_messages(read_at);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
