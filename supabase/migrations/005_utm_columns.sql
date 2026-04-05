-- 광고 UTM 추적 (survey_responses / waitlist)

ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS utm_source TEXT;

ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS utm_medium TEXT;

ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS utm_source TEXT;

ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS utm_medium TEXT;

ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
