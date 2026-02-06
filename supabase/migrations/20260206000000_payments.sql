-- Payments table to track payments to users
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('publication', 'peer_review', 'replication', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'form_sent', 'form_completed', 'processing', 'paid', 'failed', 'cancelled')),
  reference_id UUID, -- paper_id for publication, validation_id for review, etc.
  reference_type TEXT, -- 'paper', 'validation', 'replication'
  notes TEXT,
  form_sent_at TIMESTAMPTZ,
  form_completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment forms table to track required forms
CREATE TABLE payment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  required_for TEXT[] NOT NULL DEFAULT '{}', -- ['publication', 'peer_review', etc.]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User payment info - tracks which forms they've completed
CREATE TABLE user_payment_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  payment_method TEXT, -- 'paypal', 'bank_transfer', 'check', etc.
  payment_details JSONB, -- encrypted/hashed payment info
  tax_form_completed BOOLEAN DEFAULT false,
  w9_completed BOOLEAN DEFAULT false,
  forms_completed UUID[] DEFAULT '{}', -- array of payment_form ids
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_user_payment_info_email ON user_payment_info(email);
