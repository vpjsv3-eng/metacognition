-- Add source column to waitlist
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'nadocoding_page';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure RLS is enabled
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
