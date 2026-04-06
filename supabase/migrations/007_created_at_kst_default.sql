-- ═══════════════════════════════════════════════════════════════════
-- created_at 기본값 (요청: Asia/Seoul 기준)
-- timestamptz 컬럼에 (NOW() AT TIME ZONE 'Asia/Seoul')만 쓰면
-- "timestamp without time zone" 이 되어 타입 불일치가 날 수 있어,
-- 서울 벽시각을 timestamptz로 넣는 형태로 통일합니다.
-- (동일 시각은 now()와 같음 — 저장은 UTC epoch로 유지됨)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE survey_responses
  ALTER COLUMN created_at SET DEFAULT (
    (NOW() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul'
  );

ALTER TABLE waitlist
  ALTER COLUMN created_at SET DEFAULT (
    (NOW() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul'
  );

-- 조회 시 KST 문자열 예:
--   SELECT created_at AT TIME ZONE 'Asia/Seoul' AS created_at_kst FROM survey_responses;
