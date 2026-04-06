import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";
import { isRateLimited, getClientIp } from "../../lib/rateLimit";

type FunnelBody = {
  sessionId?: string;
  step?: string;
  action?: string;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`funnel:${ip}`, 200, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "too_many_requests" },
      { status: 429 },
    );
  }

  let body: FunnelBody;
  try {
    body = (await req.json()) as FunnelBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const step = typeof body.step === "string" ? body.step.slice(0, 120) : "";
  const action = typeof body.action === "string" ? body.action.slice(0, 64) : "";

  if (!sessionId || !step || !action) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) {
    if (process.env.NODE_ENV === "development") {
      console.log("[funnel] Supabase 없음 — 로그만", { sessionId, step, action });
    }
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await sb.from("survey_funnel").insert({
    session_id: sessionId,
    step,
    action,
  });

  if (error) {
    console.error("[funnel] insert 실패:", error.code, error.message, error.details);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, success: true });
}
