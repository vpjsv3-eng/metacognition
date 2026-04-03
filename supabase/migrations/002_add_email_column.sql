-- ═══════════════════════════════════════════════════
-- survey_responses 테이블에 email 컬럼 추가
-- Supabase SQL Editor에서 이 파일 내용을 실행하세요.
-- ═══════════════════════════════════════════════════

-- email 컬럼이 없으면 추가
ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS email TEXT;

-- 인덱스 추가 (이메일로 조회 시 성능 향상)
CREATE INDEX IF NOT EXISTS idx_survey_responses_email
ON survey_responses (email);
