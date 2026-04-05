-- ═══════════════════════════════════════════════════════════════════
-- RLS 정책 재설정 (insert 실패 / RLS 의심 시)
-- Supabase Dashboard → SQL Editor 에서 이 파일 전체를 실행하세요.
-- 실행 전 백업 권장. anon API insert 가 다시 동작해야 합니다.
-- ═══════════════════════════════════════════════════════════════════

-- 신규 정책 이름(재실행 대비 선삭제)
DROP POLICY IF EXISTS "public insert waitlist" ON waitlist;
DROP POLICY IF EXISTS "public insert survey" ON survey_responses;

-- 기존 정책 삭제 (001_rls.sql 등)
DROP POLICY IF EXISTS "anyone can insert waitlist" ON waitlist;
DROP POLICY IF EXISTS "anyone can insert survey" ON survey_responses;
DROP POLICY IF EXISTS "auth users can read waitlist" ON waitlist;
DROP POLICY IF EXISTS "auth users can read survey" ON survey_responses;

-- RLS 비활성화 후 재활성화
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 새 정책 (Next.js API에서 anon 키로 insert 할 때 필요)
CREATE POLICY "public insert waitlist"
ON waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "public insert survey"
ON survey_responses FOR INSERT
TO anon, authenticated
WITH CHECK (true);
