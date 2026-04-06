-- ═══════════════════════════════════════════════════════════════════
-- 설문 이탈 / 퍼널 로그
-- Supabase SQL Editor에서 실행하거나 마이그레이션으로 적용
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS survey_funnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  step TEXT,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE survey_funnel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public insert funnel" ON survey_funnel;

CREATE POLICY "public insert funnel"
ON survey_funnel FOR INSERT
TO anon, authenticated
WITH CHECK (true);
