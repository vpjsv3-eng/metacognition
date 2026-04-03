import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";

// ⚠️ Vercel 배포 시 SUPABASE_URL, SUPABASE_KEY를 환경변수에 추가하세요.

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      phone: string;
      surveyId?: string;
      timestamp: string;
    };
    const { name, phone, surveyId, timestamp } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "이름과 전화번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    // Supabase 저장
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("waitlist").insert({
        name: name.trim(),
        phone: phone.trim(),
        survey_id: surveyId || null,
      });

      if (error) {
        console.error("[Supabase waitlist 저장 실패]", error);
      }
    } else {
      // Supabase 미설정 시 콘솔 로그
      console.log("[나도코딩 1기 사전신청]", { name, phone, surveyId, timestamp });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
