-- Update payment_method check to include more options
ALTER TABLE user_payment_info 
DROP CONSTRAINT IF EXISTS user_payment_info_payment_method_check;

-- Add payment method constraint with all supported methods
ALTER TABLE user_payment_info 
ADD CONSTRAINT user_payment_info_payment_method_check 
CHECK (payment_method IS NULL OR payment_method IN ('venmo', 'paypal', 'cashapp', 'wire_transfer', 'check', 'zelle'));

-- Add columns for specific payment identifiers
ALTER TABLE user_payment_info ADD COLUMN IF NOT EXISTS venmo_handle TEXT;
ALTER TABLE user_payment_info ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE user_payment_info ADD COLUMN IF NOT EXISTS cashapp_tag TEXT;
ALTER TABLE user_payment_info ADD COLUMN IF NOT EXISTS zelle_email TEXT;

-- For wire transfer and check, we'll use the existing payment_details JSONB
-- Wire: { routing_number, account_number, bank_name, account_type }
-- Check: { mailing_address }
