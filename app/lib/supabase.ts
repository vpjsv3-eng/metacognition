import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 사이드 전용 - 클라이언트 코드에서 절대 import 하지 마세요.
// API 라우트에서만 사용 → SUPABASE_URL / SUPABASE_KEY (Vercel)
// 또는 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 폴백.
// 클라이언트 컴포넌트에서 직접 insert 하지 않음 → NEXT_PUBLIC_ 키 불필요.
let _client: SupabaseClient | null = null;
let _envLogged = false;

function logSupabaseEnv(): void {
  if (_envLogged) return;
  _envLogged = true;
  console.log("[Supabase] SUPABASE_URL:", process.env.SUPABASE_URL ?? "(unset)");
  console.log(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(unset)",
  );
  console.log("[Supabase] SUPABASE_KEY 존재:", !!process.env.SUPABASE_KEY);
  console.log(
    "[Supabase] SUPABASE_ANON_KEY 존재:",
    !!process.env.SUPABASE_ANON_KEY,
  );
  console.log(
    "[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY 존재:",
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  logSupabaseEnv();

  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const effectiveUrl = url ?? "(none)";
  const hasKey = !!key;
  console.log("[Supabase] resolved URL set:", effectiveUrl !== "(none)");
  console.log("[Supabase] resolved KEY set:", hasKey);
  if (!url || !key) {
    console.warn(
      "[Supabase] 클라이언트 생성 안 함 — URL 또는 KEY 없음. Vercel에 SUPABASE_URL·SUPABASE_KEY(anon) 설정 확인.",
    );
    return null;
  }

  _client = createClient(url, key);
  return _client;
}
