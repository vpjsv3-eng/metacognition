-- Supabase SQL Editor에서 실행해 INSERT 정책 존재 여부를 확인합니다.
-- (PostgreSQL의 CREATE POLICY에는 IF NOT EXISTS가 없습니다. 중복 시 DROP 후 재생성하세요.)

SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('survey_responses', 'waitlist')
ORDER BY tablename, policyname;

-- 아래는 INSERT 정책이 없을 때만 실행합니다.
-- 이미 동일 이름 정책이 있으면: DROP POLICY "anyone can insert survey" ON survey_responses;

-- CREATE POLICY "anyone can insert survey"
-- ON survey_responses FOR INSERT TO anon
-- WITH CHECK (true);

-- CREATE POLICY "anyone can insert waitlist"
-- ON waitlist FOR INSERT TO anon
-- WITH CHECK (true);
