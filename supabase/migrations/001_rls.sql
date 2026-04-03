-- ═══════════════════════════════════════════════════
-- Row Level Security (RLS) 설정
-- Supabase SQL Editor에서 이 파일 내용을 실행하세요.
-- ═══════════════════════════════════════════════════

-- survey_responses 테이블 RLS 활성화
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- waitlist 테이블 RLS 활성화
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- INSERT: anon 포함 누구나 가능 (설문 응답 저장용)
CREATE POLICY "anyone can insert survey"
ON survey_responses FOR INSERT TO anon WITH CHECK (true);

-- INSERT: anon 포함 누구나 가능 (사전 신청용)
CREATE POLICY "anyone can insert waitlist"
ON waitlist FOR INSERT TO anon WITH CHECK (true);

-- SELECT: 인증된 사용자만 가능
CREATE POLICY "auth users can read survey"
ON survey_responses FOR SELECT TO authenticated USING (true);

-- SELECT: 인증된 사용자만 가능
CREATE POLICY "auth users can read waitlist"
ON waitlist FOR SELECT TO authenticated USING (true);
