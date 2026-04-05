import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 사이드 전용 - 클라이언트 코드에서 절대 import 하지 마세요.
// .env.local 예시:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_KEY=<anon public key>
// (NEXT_PUBLIC_SUPABASE_* 이름만 써 둔 경우에도 아래 폴백으로 읽습니다.)
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}
