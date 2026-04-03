import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 사이드 전용 - 클라이언트 코드에서 절대 import 하지 마세요.
// ⚠️ Vercel 배포 시 SUPABASE_URL, SUPABASE_KEY를 환경변수에 추가하세요.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}
