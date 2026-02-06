-- Add category field to subscribers
ALTER TABLE subscribers 
ADD COLUMN category TEXT CHECK (category IN ('college_university', 'nonprofit', 'institution_association', 'government', 'corporate', 'individual'));

-- Index for filtering by category
CREATE INDEX idx_subscribers_category ON subscribers(category);
