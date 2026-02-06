-- Invoices table for subscription billing
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  
  -- Billing details (copied from subscriber for record-keeping)
  bill_to_name TEXT NOT NULL,
  bill_to_email TEXT NOT NULL,
  bill_to_institution TEXT,
  bill_to_address TEXT,
  bill_to_city TEXT,
  bill_to_state TEXT,
  bill_to_zip TEXT,
  bill_to_country TEXT,
  
  -- Invoice details
  description TEXT NOT NULL,
  subscription_period TEXT, -- e.g., "2026" or "2026-2027"
  category TEXT CHECK (category IN ('college_university', 'nonprofit', 'institution_association', 'government', 'corporate', 'individual')),
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  po_number TEXT, -- Purchase order number from institution
  payment_method TEXT, -- check, wire, credit_card, ach
  payment_reference TEXT, -- check number, transaction ID, etc.
  payment_date DATE,
  
  -- Dates
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT, -- Internal notes
  memo TEXT, -- Notes shown on invoice
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoice line items (for itemized invoices)
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_invoices_subscriber ON invoices(subscriber_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1001;
